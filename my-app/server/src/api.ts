import { db } from "./db";
import { getAuth, upload } from "./actions";
import JSZip from "jszip";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import XLSX from "xlsx";

// Maintenance: bulk cleanup for schemas and applications
// Техническое обслуживание - массовая очистка схем и приложений//
export async function clearAllProcessSchemasAndApplications() {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  // Delete applications first to satisfy FK constraints
  const deletedApps = await db.serviceApplication.deleteMany({});
  const deletedSchemas = await db.processSchema.deleteMany({});

  return {
    deletedApplications: deletedApps.count,
    deletedSchemas: deletedSchemas.count,
    message: `Удалено заявок: ${deletedApps.count}, схем: ${deletedSchemas.count}`,
  };
}

// получение информации о текущем пользователе
export async function getCurrentUser() {
  const auth = await getAuth();
  if (auth.status === "unauthenticated") {
    return null;
  }

  return await db.user.findUnique({
    where: { id: auth.userId },
  });
}

//Обновление текущего авторизованного пользователя правами администратора
export async function setUserAsAdmin() {
  const { userId } = await getAuth({ required: true });
  return await db.user.update({
    where: { id: userId },
    data: { isAdmin: true },
  });
}

// Управление проектами.
// Получение списка проектов
export async function listProjects() {
  const { userId } = await getAuth({ required: true });
  return await db.project.findMany({
    where: { ownerId: userId },
    include: {
      owner: {
        select: { name: true, username: true },
      },
      _count: {
        select: { Document: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}


//Создание проекта
//Конструкция для передачи набора обязательных и необязательных параметров input
export async function createProject(input: {
  name: string;
  description?: string;
}) {
  const { userId } = await getAuth({ required: true });
// создание проекта
  return await db.project.create({
    data: {
      name: input.name,
      description: input.description,
      ownerId: userId,
    },
    include: {
      owner: {
        select: { name: true, username: true },
      },
    },
  });
}

//Обновление проекта 
export async function updateProject(input: {
  id: string;
  name?: string;
  description?: string;
  status?: string;
}) {
  const { userId } = await getAuth({ required: true });
  const { id, ...updateData } = input;

  // Проверка прав доступа к данному проекту 
  // Запрос в бд c поиском первого найденного проекта с данными правами
  const project = await db.project.findFirst({
    where: { id, ownerId: userId },
  });

  if (!project) {
    throw new Error("Проект не найден или у вас нет прав доступа");
  }

  // Обновление информации о базе данных
  return await db.project.update({
    where: { id },
    data: updateData,
    include: {
      owner: {
        select: { name: true, username: true },
      },
    },
  });
}


//Удаление проекта
export async function deleteProject(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  // Проверка прав
  const project = await db.project.findFirst({
    where: { id: input.id, ownerId: userId },
  });

  if (!project) {
    throw new Error("Проект не найден или у вас нет прав доступа");
  }

  return await db.project.delete({
    where: { id: input.id },
  });
}

// Менеджмент документов ? не работает
// ВОЗМОЖНО НЕ ПОНАДОБИТСЯ ДАННАЯ ФУНКЦИЯ
export async function listDocuments(input: { projectId: string }) {
  const { userId } = await getAuth({ required: true });

  // Verify project access
  const project = await db.project.findFirst({
    where: { id: input.projectId, ownerId: userId },
  });

  if (!project) {
    throw new Error("Проект не найден или у вас нет прав доступа");
  }

  return await db.document.findMany({
    where: { projectId: input.projectId },
    include: {
      uploader: {
        select: { name: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Загрузка документов ? не работает
// ВОЗМОЖНО НЕ ПОНАДОБИТСЯ ДАННАЯ ФУНКЦИЯ
export async function uploadDocument(input: {
  name: string;
  fileBase64: string;
  projectId: string;
}) {
  const { userId } = await getAuth({ required: true });

  // Verify project access
  const project = await db.project.findFirst({
    where: { id: input.projectId, ownerId: userId },
  });

  if (!project) {
    throw new Error("Проект не найден или у вас нет прав доступа");
  }

  // Upload file (this would be implemented with actual file upload)
  const fileUrl = `https://example.com/documents/${Date.now()}-${input.name}`;

  return await db.document.create({
    data: {
      name: input.name,
      fileUrl,
      projectId: input.projectId,
      uploadedBy: userId,
    },
    include: {
      uploader: {
        select: { name: true, username: true },
      },
    },
  });
}

// Удаление документов ? Не работает
// ВОЗМОЖНО НЕ ПОНАДОБИТСЯ ДАННАЯ ФУНКЦИЯ
export async function deleteDocument(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  // Verify ownership through project
  const document = await db.document.findFirst({
    where: {
      id: input.id,
      project: { ownerId: userId },
    },
  });

  if (!document) {
    throw new Error("Документ не найден или у вас нет прав доступа");
  }

  return await db.document.delete({
    where: { id: input.id },
  });
}

// Сервис запроса доступа к заявке!
// пустышка, нет функциональности
export async function createServiceRequest(input: {
  title: string;
  description?: string;
  contractorName: string;
  contractorEmail: string;
  contractorPhone?: string;
  projectId: string;
}) {
  const { userId } = await getAuth({ required: true });

  // Verify project access
  const project = await db.project.findFirst({
    where: { id: input.projectId, ownerId: userId },
  });

  if (!project) {
    throw new Error("Проект не найден или у вас нет прав доступа");
  }

  return await db.serviceRequest.create({
    data: {
      title: input.title,
      description: input.description,
      contractorName: input.contractorName,
      contractorEmail: input.contractorEmail,
      contractorPhone: input.contractorPhone,
      projectId: input.projectId,
      requestedBy: userId,
    },
    include: {
      project: {
        select: { name: true },
      },
      requester: {
        select: { name: true, username: true },
      },
    },
  });
}

// перечень заявок на доступ
// функционал не работает
export async function listServiceRequests(input?: { projectId?: string }) {
  const { userId } = await getAuth({ required: true });

  const whereClause: any = {
    project: { ownerId: userId },
  };

  if (input?.projectId) {
    whereClause.projectId = input.projectId;
  }

  return await db.serviceRequest.findMany({
    where: whereClause,
    include: {
      project: {
        select: { name: true },
      },
      requester: {
        select: { name: true, username: true },
      },
      approver: {
        select: { name: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

//Функционал обновление запроса статуса
//ПУСТЫШКА
export async function updateServiceRequestStatus(input: {
  id: string;
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}) {
  const { userId } = await getAuth({ required: true });

  // Verify the user owns the project associated with this request
  const serviceRequest = await db.serviceRequest.findFirst({
    where: {
      id: input.id,
      project: { ownerId: userId },
    },
  });

  if (!serviceRequest) {
    throw new Error("Заявка не найдена или у вас нет прав доступа");
  }

  const updateData: any = {
    status: input.status,
    approvedBy: userId,
    approvedAt: new Date(),
  };

  if (input.status === "REJECTED" && input.rejectionReason) {
    updateData.rejectionReason = input.rejectionReason;
  }

  return await db.serviceRequest.update({
    where: { id: input.id },
    data: updateData,
    include: {
      project: {
        select: { name: true },
      },
      requester: {
        select: { name: true, username: true },
      },
      approver: {
        select: { name: true, username: true },
      },
    },
  });
}

//Функция удаления запроса на доступ к проекту
//ПУСТЫШКАААА
export async function deleteServiceRequest(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  // Verify ownership through project
  const serviceRequest = await db.serviceRequest.findFirst({
    where: {
      id: input.id,
      project: { ownerId: userId },
    },
  });

  if (!serviceRequest) {
    throw new Error("Заявка не найдена или у вас нет прав доступа");
  }

  return await db.serviceRequest.delete({
    where: { id: input.id },
  });
}

// Service Administration - Business Processes
// Не используется 

// export async function createBusinessProcess(input: {
//   name: string;
//   description?: string;
//   order?: number;
//   isDefault?: boolean;
// }) {
//   const { userId } = await getAuth({ required: true });

//   // Check if user is service admin
//   const user = await db.user.findUnique({
//     where: { id: userId },
//     select: { isServiceAdmin: true, isAdmin: true },
//   });

//   if (!user?.isServiceAdmin && !user?.isAdmin) {
//     throw new Error(
//       "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
//     );
//   }

//   return await db.businessProcess.create({
//     data: {
//       name: input.name,
//       description: input.description,
//       order: input.order || 0,
//       isDefault: input.isDefault || false,
//     },
//   });
// }

// Аналогично предыдущему функция не используется!
// export async function listBusinessProcesses() {
//   const { userId } = await getAuth({ required: true });

//   const user = await db.user.findUnique({
//     where: { id: userId },
//     select: { isServiceAdmin: true, isAdmin: true },
//   });

//   if (!user?.isServiceAdmin && !user?.isAdmin) {
//     throw new Error(
//       "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
//     );
//   }

//   return await db.businessProcess.findMany({
//     orderBy: { order: "asc" },
//     select: {
//       id: true,
//       name: true,
//       description: true,
//       order: true,
//       isDefault: true,
//       createdAt: true,
//     },
//   });
// }

// Аналогично предыдущему функция не используется!
// export async function updateBusinessProcess(input: {
//   id: string;
//   name?: string;
//   description?: string;
//   order?: number;
//   isDefault?: boolean;
// }) {
//   const { userId } = await getAuth({ required: true });

//   const user = await db.user.findUnique({
//     where: { id: userId },
//     select: { isServiceAdmin: true, isAdmin: true },
//   });

//   if (!user?.isServiceAdmin && !user?.isAdmin) {
//     throw new Error(
//       "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
//     );
//   }

//   const { id, ...updateData } = input;
//   return await db.businessProcess.update({
//     where: { id },
//     data: updateData,
//   });
// }

//Аналогично предыдущему функция не используется!
// export async function deleteBusinessProcess(input: { id: string }) {
//   const { userId } = await getAuth({ required: true });

//   const user = await db.user.findUnique({
//     where: { id: userId },
//     select: { isServiceAdmin: true, isAdmin: true },
//   });

//   if (!user?.isServiceAdmin && !user?.isAdmin) {
//     throw new Error(
//       "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
//     );
//   }

//   return await db.businessProcess.delete({
//     where: { id: input.id },
//   });
// }

// Service Administration - Service Categories
// Создание категории услуги
// связанная функция App.tsx - CreateServiceCategoryDialog
export async function createServiceCategory(input: {
  name: string;
  description?: string;
  parentId?: string;
  order?: number;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.serviceCategory.create({
    data: {
      name: input.name,
      description: input.description,
      parentId: input.parentId,
      order: input.order || 0,
    },
    include: {
      parent: { select: { name: true } },
      children: { select: { id: true, name: true } },
    },
  });
}


//
export async function listServiceCategories() {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.serviceCategory.findMany({
    include: {
      parent: { select: { name: true } },
      children: { select: { id: true, name: true } },
      _count: { select: { services: true } },
    },
    orderBy: { order: "asc" },
  });
}

// скорее всего пустая функция
// НАДО ПРОВЕРИТЬ
export async function updateServiceCategory(input: {
  id: string;
  name?: string;
  description?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const { id, ...updateData } = input;
  return await db.serviceCategory.update({
    where: { id },
    data: updateData,
    include: {
      parent: { select: { name: true } },
      children: { select: { id: true, name: true } },
    },
  });
}


//СКОРЕЕ ВСЕГО ФУНКЦИЯ НЕ ОПРЕДЕЛЕНА В КОДЕ
// НАДО ПРОВРЕИТЬ РАБОТОСПОСОБНОСТЬ
export async function deleteServiceCategory(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  // Check if category has children or services
  const category = await db.serviceCategory.findUnique({
    where: { id: input.id },
    include: {
      children: true,
      services: true,
    },
  });

  if (category?.children.length || category?.services.length) {
    throw new Error(
      "Нельзя удалить категорию, которая содержит подкатегории или услуги",
    );
  }

  return await db.serviceCategory.delete({
    where: { id: input.id },
  });
}

// Service Administration - Services
// Создание услуги
// связанная функция App.tsx - CreateServiceDialog
export async function createService(input: {
  name: string;
  description?: string;
  categoryId: string;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.service.create({
    data: {
      name: input.name,
      description: input.description,
      categoryId: input.categoryId,
    },
    include: {
      category: { select: { name: true } },
    },
  });
}

// Получаем информацию о текущем списке услуг
export async function listServices(input?: { categoryId?: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const whereClause: any = {};
  if (input?.categoryId) {
    whereClause.categoryId = input.categoryId;
  }

  return await db.service.findMany({
    where: whereClause,
    include: {
      category: { select: { name: true } },
      _count: { select: { ServiceRequest: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}


// ТРЕБУЕТСЯ ПРОВЕРКА ФУНКЦИИ
export async function updateService(input: {
  id: string;
  name?: string;
  description?: string;
  categoryId?: string;
  isActive?: boolean;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const { id, ...updateData } = input;
  return await db.service.update({
    where: { id },
    data: updateData,
    include: {
      category: { select: { name: true } },
    },
  });
}


// Функция пустышка
// Проверка и требуется удаление
export async function deleteService(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  // Check if service has active requests
  const activeRequests = await db.serviceRequest.count({
    where: {
      serviceId: input.id,
      status: "PENDING",
    },
  });

  if (activeRequests > 0) {
    throw new Error("Нельзя удалить услугу с активными заявками");
  }

  return await db.service.delete({
    where: { id: input.id },
  });
}

// User Administration
// Наделение пользователя правами доступа. проверить на наличие задублированности
export async function setUserAsServiceAdmin(input: { userId: string }) {
  const { userId: currentUserId } = await getAuth({ required: true });

  const currentUser = await db.user.findUnique({
    where: { id: currentUserId },
    select: { isAdmin: true, isServiceAdmin: true },
  });

  if (!currentUser?.isAdmin && !currentUser?.isServiceAdmin) {
    throw new Error("Недостаточно прав доступа");
  }

  return await db.user.update({
    where: { id: input.userId },
    data: { isServiceAdmin: true },
  });
}

export async function removeServiceAdminRole(input: { userId: string }) {
  const { userId: currentUserId } = await getAuth({ required: true });

  const currentUser = await db.user.findUnique({
    where: { id: currentUserId },
    select: { isAdmin: true, isServiceAdmin: true },
  });

  if (!currentUser?.isAdmin && !currentUser?.isServiceAdmin) {
    throw new Error("Недостаточно прав доступа");
  }

  return await db.user.update({
    where: { id: input.userId },
    data: { isServiceAdmin: false },
  });
}

// Enhanced Service Request management with service linking
export async function updateServiceRequestWithService(input: {
  id: string;
  status: "APPROVED" | "REJECTED";
  serviceId?: string;
  rejectionReason?: string;
}) {
  const { userId } = await getAuth({ required: true });

  const serviceRequest = await db.serviceRequest.findFirst({
    where: {
      id: input.id,
      project: { ownerId: userId },
    },
  });

  if (!serviceRequest) {
    throw new Error("Заявка не найдена или у вас нет прав доступа");
  }

  const updateData: any = {
    status: input.status,
    approvedBy: userId,
  };

  if (input.status === "APPROVED" && input.serviceId) {
    updateData.serviceId = input.serviceId;
  }

  if (input.status === "REJECTED" && input.rejectionReason) {
    updateData.rejectionReason = input.rejectionReason;
  }

  return await db.serviceRequest.update({
    where: { id: input.id },
    data: updateData,
    include: {
      project: { select: { name: true } },
      requester: { select: { name: true, username: true } },
      approver: { select: { name: true, username: true } },
      service: { select: { name: true, category: { select: { name: true } } } },
    },
  });
}

// Dashboard statistics
export async function getDashboardStats() {
  const { userId } = await getAuth({ required: true });

  const [projectCount, documentCount, activeProjects, pendingRequests] =
    await Promise.all([
      db.project.count({ where: { ownerId: userId } }),
      db.document.count({
        where: {
          project: { ownerId: userId },
        },
      }),
      db.project.count({
        where: {
          ownerId: userId,
          status: "ACTIVE",
        },
      }),
      db.serviceRequest.count({
        where: {
          project: { ownerId: userId },
          status: "PENDING",
        },
      }),
    ]);

  return {
    totalProjects: projectCount,
    totalDocuments: documentCount,
    activeProjects,
    pendingRequests,
  };
}

// Service Admin Dashboard Stats
export async function getServiceAdminStats() {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const [
    businessProcessCount,
    serviceCategoryCount,
    serviceCount,
    totalRequests,
  ] = await Promise.all([
    db.businessProcess.count(),
    db.serviceCategory.count({ where: { isActive: true } }),
    db.service.count({ where: { isActive: true } }),
    db.serviceRequest.count(),
  ]);

  return {
    businessProcessCount,
    serviceCategoryCount,
    serviceCount,
    totalRequests,
  };
}

// Process Schema Validation
export async function validateProcessSchema(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const schema = await db.processSchema.findUnique({
    where: { id: input.id },
    include: {
      elements: true,
      connections: {
        include: {
          source: true,
          target: true,
        },
      },
    },
  });

  if (!schema) {
    throw new Error("Схема процесса не найдена");
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Проверка наличия начального элемента
  const startElements = schema.elements.filter(
    (el) => el.elementType === "START",
  );
  if (startElements.length === 0) {
    errors.push("Схема должна содержать элемент START (Начало)");
  } else if (startElements.length > 1) {
    warnings.push(
      "Схема содержит несколько элементов START. Рекомендуется оставить только один",
    );
  }

  // Проверка наличия конечного элемента
  const endElements = schema.elements.filter((el) => el.elementType === "END");
  if (endElements.length === 0) {
    errors.push("Схема должна содержать хотя бы один элемент END (Конец)");
  }

  // Проверка связанности элементов
  if (schema.elements.length > 1) {
    const connectedElements = new Set<string>();

    // Добавляем все элементы, которые участвуют в соединениях
    schema.connections.forEach((conn) => {
      connectedElements.add(conn.sourceId);
      connectedElements.add(conn.targetId);
    });

    // Проверяем, что все элементы (кроме изолированных START/END) связаны
    const isolatedElements = schema.elements.filter(
      (el) =>
        !connectedElements.has(el.id) &&
        el.elementType !== "START" &&
        el.elementType !== "END",
    );

    if (isolatedElements.length > 0) {
      warnings.push(
        `Найдены изолированные элементы: ${isolatedElements.map((el) => el.name).join(", ")}`,
      );
    }

    // Проверка наличия хотя бы одного пути START -> END
    if (startElements.length > 0 && endElements.length > 0) {
      const reachableFromStart = new Set<string>();
      const queue = [...startElements.map((el) => el.id)];

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (reachableFromStart.has(currentId)) continue;

        reachableFromStart.add(currentId);

        // Добавляем все элементы, достижимые из текущего
        const outgoingConnections = schema.connections.filter(
          (conn) => conn.sourceId === currentId,
        );
        outgoingConnections.forEach((conn) => {
          if (!reachableFromStart.has(conn.targetId)) {
            queue.push(conn.targetId);
          }
        });
      }

      const anyEndReachable = endElements.some((el) =>
        reachableFromStart.has(el.id),
      );
      if (!anyEndReachable) {
        errors.push(
          "В схеме отсутствует путь от START к END. Добавьте связи, чтобы хотя бы одна последовательность доходила до Конца.",
        );
      }

      // Предупреждение о недостижимых END, но не блокируем публикацию
      const unreachableEndElements = endElements.filter(
        (el) => !reachableFromStart.has(el.id),
      );
      if (unreachableEndElements.length > 0) {
        warnings.push(
          `Элементы END недостижимы от START: ${unreachableEndElements.map((el) => el.name).join(", ")}`,
        );
      }
    }
  }

  // Проверка циклических зависимостей (упрощенная). Циклы — предупреждение, а не ошибка
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const hasCycle = (elementId: string): boolean => {
    if (recursionStack.has(elementId)) {
      return true; // Найден цикл
    }
    if (visited.has(elementId)) {
      return false;
    }

    visited.add(elementId);
    recursionStack.add(elementId);

    const outgoingConnections = schema.connections.filter(
      (conn) => conn.sourceId === elementId,
    );
    for (const conn of outgoingConnections) {
      if (hasCycle(conn.targetId)) {
        return true;
      }
    }

    recursionStack.delete(elementId);
    return false;
  };

  let cycleDetected = false;
  for (const element of schema.elements) {
    if (!visited.has(element.id) && hasCycle(element.id)) {
      cycleDetected = true;
      break;
    }
  }
  if (cycleDetected) {
    warnings.push(
      "Обнаружены циклические зависимости в схеме. Публикация разрешена, если есть путь от START к END.",
    );
  }

  // Доп. правило: для процесса с переходом 'Согласовано/отклонено' требуется блок Решение и ветки
  try {
    const transitions = await db.processTransition.findMany({
      where: { elementId: { in: schema.elements.map((e) => e.id) } },
      select: { elementId: true, condition: true, transitionType: true },
    });

    const byElement = new Map<string, string[]>();
    for (const tr of transitions) {
      const arr = byElement.get(tr.elementId) ?? [];
      arr.push(tr.condition);
      byElement.set(tr.elementId, arr);
    }

    const processWithApprove = schema.elements.filter(
      (el) =>
        el.elementType === "PROCESS" &&
        (byElement
          .get(el.id)
          ?.some((c) =>
            ["approved_or_rejected", "approved", "rejected"].includes(c),
          ) ??
          false),
    );

    for (const proc of processWithApprove) {
      // Найти прямой DECISION после процесса
      const decisionTargets = schema.connections
        .filter((c) => c.sourceId === proc.id)
        .map((c) => schema.elements.find((e) => e.id === c.targetId))
        .filter(
          (e) => e && e.elementType === "DECISION",
        ) as typeof schema.elements;

      if (decisionTargets.length === 0) {
        errors.push(
          `Для процесса "${proc.name}" требуется добавить следующий блок 'Решение' и настроить ветки`,
        );
        continue;
      }

      // Проверить наличие веток с подписями
      let hasApproved = false;
      let hasRejected = false;
      for (const dec of decisionTargets) {
        const outs = schema.connections.filter((c) => c.sourceId === dec.id);
        if (outs.some((o) => (o.label || "").trim() === "Согласовано")) {
          hasApproved = true;
        }
        if (outs.some((o) => (o.label || "").trim() === "Отклонено")) {
          hasRejected = true;
        }
      }
      if (!hasApproved) {
        errors.push(
          `Для процесса "${proc.name}" отсутствует ветка 'Согласовано' из блока 'Решение'`,
        );
      }
      if (!hasRejected) {
        errors.push(
          `Для процесса "${proc.name}" отсутствует ветка 'Отклонено' из блока 'Решение'`,
        );
      }
    }

    // Доп. правило: если у процесса есть переход типа 'Резолюция', должен существовать ещё один переход любого другого типа
    {
      const typesByElement = new Map<string, string[]>();
      for (const tr of transitions as any[]) {
        const arr = typesByElement.get(tr.elementId) ?? [];
        arr.push((tr.transitionType as string) || "next");
        typesByElement.set(tr.elementId, arr);
      }
      for (const el of schema.elements.filter(
        (e) => e.elementType === "PROCESS",
      )) {
        const types = typesByElement.get(el.id) || [];
        const hasResolution = types.some((t) => t === "resolution");
        if (hasResolution) {
          const hasOther = types.some((t) => t && t !== "resolution");
          if (!hasOther) {
            errors.push(
              `Для процесса "${el.name}" добавлен переход типа 'Резолюция', но отсутствует дополнительный переход с другим типом. Добавьте ещё одно условие перехода.`,
            );
          }
        }
      }
    }
  } catch {
    // Валидация не должна падать, если не удалось загрузить переходы
    warnings.push(
      "Не удалось проверить условия переходов. Попробуйте ещё раз.",
    );
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    elementsCount: schema.elements.length,
    connectionsCount: schema.connections.length,
  };
}

export async function publishProcessSchema(input: {
  id: string;
  unpublishOthers?: boolean;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  // Сначала валидируем схему
  const validation = await validateProcessSchema({ id: input.id });

  if (!validation.isValid) {
    throw new Error(
      `Нельзя опубликовать схему с ошибками: ${validation.errors.join(", ")}`,
    );
  }

  // Опционально снять публикацию с других версий той же схемы
  if (input.unpublishOthers) {
    const base = await db.processSchema.findUnique({
      where: { id: input.id },
      select: { name: true, serviceId: true, isTemplate: true },
    });
    if (base) {
      await db.processSchema.updateMany({
        where: {
          isActive: true,
          name: base.name,
          isTemplate: base.isTemplate,
          serviceId: base.serviceId ?? null,
          id: { not: input.id },
          isPublished: true,
        },
        data: { isPublished: false },
      });
    }
  }

  // Публикуем текущую схему
  const updated = await db.processSchema.update({
    where: { id: input.id },
    data: { isPublished: true },
    include: {
      service: { select: { name: true } },
      _count: {
        select: { elements: true, connections: true },
      },
    },
  });

  // Вернуть предупреждения, чтобы показать их пользователю после публикации
  return { ...updated, warnings: validation.warnings } as any;
}

export async function unpublishProcessSchema(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processSchema.update({
    where: { id: input.id },
    data: { isPublished: false },
    include: {
      service: { select: { name: true } },
    },
  });
}

// Process Schema Management
export async function listSchemaVersions(input: { id: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const base = await db.processSchema.findUnique({
    where: { id: input.id },
    select: { name: true, serviceId: true, isTemplate: true },
  });
  if (!base) return [];

  const versions = await db.processSchema.findMany({
    where: {
      name: base.name,
      isTemplate: base.isTemplate,
      serviceId: base.serviceId ?? null,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      version: true,
      versionLabel: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ version: "desc" }, { createdAt: "desc" }],
  });
  return versions;
}

export async function getSchemaDeletionInfo(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const schema = await db.processSchema.findUnique({
    where: { id: input.id },
    select: { isPublished: true },
  });

  if (!schema) {
    throw new Error("Схема процесса не найдена");
  }

  const applicationsCount = await db.serviceApplication.count({
    where: { schemaId: input.id },
  });

  return { isPublished: !!schema.isPublished, applicationsCount };
}

export async function createProcessSchema(input: {
  name: string;
  description?: string;
  serviceId?: string;
  isTemplate?: boolean;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processSchema.create({
    data: {
      name: input.name,
      description: input.description,
      serviceId: input.serviceId,
      isTemplate: input.isTemplate || false,
    },
    include: {
      service: { select: { name: true } },
      elements: true,
      connections: true,
    },
  });
}

export async function listProcessSchemas(input?: { serviceId?: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const whereClause: any = { isActive: true };
  if (input?.serviceId) {
    whereClause.serviceId = input.serviceId;
  }

  return await db.processSchema.findMany({
    where: whereClause,
    include: {
      service: { select: { name: true } },
      _count: {
        select: { elements: true, connections: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProcessSchema(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processSchema.findUnique({
    where: { id: input.id },
    include: {
      service: { select: { name: true } },
      elements: {
        include: {
          businessProcess: { select: { name: true } },
          transitions: { select: { id: true, name: true, condition: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      connections: {
        include: {
          source: { select: { name: true } },
          target: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function updateProcessSchema(input: {
  id: string;
  name?: string;
  description?: string;
  serviceId?: string;
  isActive?: boolean;
  versionLabel?: string | null;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const { id, ...updateData } = input;
  return await db.processSchema.update({
    where: { id },
    data: updateData,
    include: {
      service: { select: { name: true } },
    },
  });
}

export async function deleteProcessSchema(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processSchema.delete({
    where: { id: input.id },
  });
}

// Versioning: bump version for a schema (typically on save for drafts)
export async function bumpProcessSchemaVersion(input: { id: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const current = await db.processSchema.findUnique({
    where: { id: input.id },
  });
  if (!current) throw new Error("Схема процесса не найдена");
  const updated = await db.processSchema.update({
    where: { id: input.id },
    data: { version: (current.version ?? 1) + 1 },
    include: { service: { select: { name: true } } },
  });
  return updated;
}

// Process Schema Elements Management
export async function createProcessSchemaElement(input: {
  schemaId: string;
  elementType: string;
  name: string;
  description?: string;
  businessProcessId?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  properties?: any;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const created = await db.processSchemaElement.create({
    data: {
      schemaId: input.schemaId,
      elementType: input.elementType,
      name: input.name,
      description: input.description,
      businessProcessId: input.businessProcessId,
      positionX: input.positionX || 0,
      positionY: input.positionY || 0,
      width: input.width || 120,
      height: input.height || 60,
      properties: input.properties ? JSON.stringify(input.properties) : null,
    },
    include: {
      businessProcess: { select: { name: true } },
    },
  });

  // Автосоздание блока "Решение" и связь ПРОЦЕСС → РЕШЕНИЕ при создании элемента типа PROCESS
  try {
    if (input.elementType === "PROCESS") {
      const posX = (created.positionX ?? 0) + (created.width ?? 120) + 120;
      const posY = created.positionY ?? 0;

      const decision = await db.processSchemaElement.create({
        data: {
          schemaId: created.schemaId,
          elementType: "DECISION",
          name: "Решение",
          description: null,
          positionX: posX,
          positionY: posY,
          width: 120,
          height: 60,
          properties: JSON.stringify({ needsConfiguration: true }),
        },
      });

      await db.processConnection.create({
        data: {
          schemaId: created.schemaId,
          sourceId: created.id,
          targetId: decision.id,
          connectionType: "sequence",
        },
      });
    }
  } catch (e) {
    console.error(
      "Failed to auto-create DECISION on PROCESS create",
      (e as Error)?.message,
    );
  }

  return created;
}

export async function updateProcessSchemaElement(input: {
  id: string;
  name?: string;
  description?: string;
  businessProcessId?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  properties?: any;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const { id, properties, ...updateData } = input;
  const finalUpdateData: any = { ...updateData };

  if (properties !== undefined) {
    finalUpdateData.properties = properties ? JSON.stringify(properties) : null;
  }

  return await db.processSchemaElement.update({
    where: { id },
    data: finalUpdateData,
    include: {
      businessProcess: { select: { name: true } },
    },
  });
}

export async function deleteProcessSchemaElement(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processSchemaElement.delete({
    where: { id: input.id },
  });
}

// Copy a single PROCESS element with all its components; create a child linked to parent
export async function copyProcessElement(input: { elementId: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const element = await db.processSchemaElement.findUnique({
    where: { id: input.elementId },
    include: {
      schema: true,
      requisites: { include: { approvalStages: true } },
      checklists: true,
      roles: true,
      transitions: true,
      notifications: true,
    },
  });
  if (!element) throw new Error("Элемент процесса не найден");

  // Prepare properties with parent link
  let props: any = {};
  try {
    props = element.properties ? (JSON.parse(element.properties) as any) : {};
  } catch {
    props = {};
  }
  const childProps = {
    ...props,
    parentElementId: element.id,
    parentElementName: element.name,
    fullyInherited: true,
  };

  const newElement = await db.processSchemaElement.create({
    data: {
      schemaId: element.schemaId,
      elementType: element.elementType,
      name: `${element.name} (копия)`,
      description: element.description,
      businessProcessId: element.businessProcessId,
      positionX: (element.positionX ?? 0) + 40,
      positionY: (element.positionY ?? 0) + 40,
      width: element.width,
      height: element.height,
      properties: JSON.stringify(childProps),
    },
  });

  // Copy requisites with stages
  for (const req of element.requisites) {
    // mark as inherited from parent element in validation JSON
    let inheritedValidation: any = {};
    try {
      inheritedValidation = req.validation
        ? JSON.parse(req.validation as string)
        : {};
    } catch {
      inheritedValidation = {};
    }
    inheritedValidation.inherited = true;
    inheritedValidation.inheritedFromElementId = element.id;
    inheritedValidation.inheritedFromElementName = element.name;

    const newReq = await db.processRequisite.create({
      data: {
        elementId: newElement.id,
        name: req.name,
        label: req.label,
        fieldType: req.fieldType,
        isRequired: req.isRequired,
        placeholder: req.placeholder,
        options: req.options,
        allowMultiple: req.allowMultiple,
        validation: JSON.stringify(inheritedValidation),
        order: req.order,
      },
    });
    for (const st of req.approvalStages) {
      await db.approvalStage.create({
        data: {
          requisiteId: newReq.id,
          name: st.name,
          description: st.description,
          order: st.order,
          isRequired: st.isRequired,
          approverRole: st.approverRole,
          department: st.department,
          executionType: st.executionType,
          deadlineDays: st.deadlineDays,
        },
      });
    }
  }

  // Copy checklists
  for (const ch of element.checklists) {
    await db.processChecklist.create({
      data: {
        elementId: newElement.id,
        name: ch.name,
        description: ch.description,
        isRequired: ch.isRequired,
        fileTypes: ch.fileTypes,
        maxFileSize: ch.maxFileSize,
        allowDocuments: ch.allowDocuments,
        allowComments: ch.allowComments,
        order: ch.order,
      },
    });
  }

  // Copy roles
  for (const r of element.roles) {
    await db.processRole.create({
      data: {
        elementId: newElement.id,
        name: r.name,
        roleType: r.roleType,
        description: r.description,
        isRequired: r.isRequired,
        canEdit: r.canEdit,
        canApprove: r.canApprove,
        canReject: r.canReject,
        canRegister: r.canRegister,
        order: r.order,
      },
    });
  }

  // Copy transitions
  for (const t of element.transitions) {
    await db.processTransition.create({
      data: {
        elementId: newElement.id,
        name: t.name,
        condition: t.condition,
        targetState: t.targetState,
        description: t.description,
        isDefault: t.isDefault,
        order: t.order,
      },
    });
  }

  // Copy notifications
  for (const n of element.notifications) {
    await db.processNotification.create({
      data: {
        elementId: newElement.id,
        name: n.name,
        trigger: n.trigger,
        template: n.template,
        recipients: n.recipients,
        isActive: n.isActive,
        order: n.order,
      },
    });
  }

  return newElement;
}

// Create an inherited PROCESS element to the right of the parent and connect with an arrow
export async function inheritProcessElement(input: { elementId: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const parent = await db.processSchemaElement.findUnique({
    where: { id: input.elementId },
  });
  if (!parent) throw new Error("Элемент процесса не найден");

  const child = await copyProcessElement({ elementId: input.elementId });

  // Place child to the right of the parent with a reasonable gap
  const nextX = (parent.positionX ?? 0) + (parent.width ?? 120) + 120;
  const nextY = parent.positionY ?? 0;
  const placedChild = await db.processSchemaElement.update({
    where: { id: child.id },
    data: { positionX: nextX, positionY: nextY },
  });

  // Create a connection from parent to child
  const connection = await db.processConnection.create({
    data: {
      schemaId: parent.schemaId,
      sourceId: parent.id,
      targetId: placedChild.id,
      connectionType: "sequence",
    },
  });

  return { element: placedChild, connection };
}

// Delete a requisite on the parent and cascade delete inherited copies on children
export async function deleteRequisiteCascade(input: {
  parentElementId: string;
  parentRequisiteId: string;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const parentReq = await db.processRequisite.findUnique({
    where: { id: input.parentRequisiteId },
  });
  if (!parentReq) throw new Error("Реквизит не найден");

  // find children
  const children = await listChildElements({
    parentElementId: input.parentElementId,
  });

  // delete child requisites that are inherited from this parent
  let deletedChildren = 0;
  for (const ch of children) {
    const childReqs = await db.processRequisite.findMany({
      where: { elementId: ch.id },
    });
    for (const cr of childReqs) {
      let meta: any = {};
      try {
        meta = cr.validation ? JSON.parse(cr.validation as string) : {};
      } catch {
        meta = {};
      }
      if (
        meta?.inherited &&
        meta?.inheritedFromElementId === input.parentElementId &&
        cr.name === parentReq.name
      ) {
        await db.processRequisite.delete({ where: { id: cr.id } });
        deletedChildren++;
      }
    }
  }

  // delete parent requisite last
  await db.processRequisite.delete({ where: { id: input.parentRequisiteId } });
  return { deletedChildren };
}

// Update a requisite on the parent and cascade updates to inherited copies on children
export async function updateRequisiteCascade(input: {
  parentElementId: string;
  parentRequisiteId: string;
  data: {
    name?: string;
    label?: string;
    fieldType?: string;
    isRequired?: boolean;
    placeholder?: string;
    options?: any;
    allowMultiple?: boolean;
    validation?: any;
    order?: number;
  };
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const parentReq = await db.processRequisite.findUnique({
    where: { id: input.parentRequisiteId },
  });
  if (!parentReq) throw new Error("Реквизит не найден");

  const patch: any = { ...input.data };
  if (patch.options !== undefined)
    patch.options = patch.options ? JSON.stringify(patch.options) : null;
  if (patch.validation !== undefined)
    patch.validation = patch.validation
      ? JSON.stringify(patch.validation)
      : null;

  const updatedParent = await db.processRequisite.update({
    where: { id: input.parentRequisiteId },
    data: patch,
  });

  const children = await listChildElements({
    parentElementId: input.parentElementId,
  });
  let updatedChildren = 0;
  for (const ch of children) {
    const childReqs = await db.processRequisite.findMany({
      where: { elementId: ch.id },
    });
    for (const cr of childReqs) {
      let meta: any = {};
      try {
        meta = cr.validation ? JSON.parse(cr.validation as string) : {};
      } catch {
        meta = {};
      }
      if (
        meta?.inherited &&
        meta?.inheritedFromElementId === input.parentElementId &&
        cr.name === parentReq.name
      ) {
        const childPatch: any = { ...patch };
        // keep inherited flags
        if (childPatch.validation !== undefined) {
          try {
            const existingRaw = cr.validation
              ? JSON.parse(cr.validation as string)
              : {};
            const incomingRaw = JSON.parse(childPatch.validation as string);
            const existing =
              existingRaw && typeof existingRaw === "object"
                ? (existingRaw as Record<string, any>)
                : {};
            const incoming =
              incomingRaw && typeof incomingRaw === "object"
                ? (incomingRaw as Record<string, any>)
                : {};
            childPatch.validation = JSON.stringify({
              ...existing,
              ...incoming,
              inherited: true,
              inheritedFromElementId: input.parentElementId,
            });
          } catch {
            childPatch.validation = cr.validation;
          }
        }
        await db.processRequisite.update({
          where: { id: cr.id },
          data: childPatch,
        });
        updatedChildren++;
      }
    }
  }

  return { updatedParent, updatedChildren };
}

// List direct child elements that inherit from a given parent element (by properties.parentElementId)
export async function listChildElements(input: { parentElementId: string }) {
  const pattern = `"parentElementId":"${input.parentElementId}`;
  const children = await db.processSchemaElement.findMany({
    where: { properties: { contains: pattern } },
    select: { id: true, name: true, schemaId: true, properties: true },
    orderBy: { createdAt: "asc" },
  });
  return children;
}

// Sync children (copies) from the current parent element state
export async function syncChildElementsFromParent(input: {
  parentElementId: string;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const parent = await db.processSchemaElement.findUnique({
    where: { id: input.parentElementId },
    include: {
      requisites: { include: { approvalStages: true } },
      checklists: true,
      roles: true,
      transitions: true,
      notifications: true,
    },
  });
  if (!parent) throw new Error("Родительский элемент не найден");

  // Find children by properties substring match
  const pattern = `"parentElementId":"${input.parentElementId}`;
  const children = await db.processSchemaElement.findMany({
    where: {
      properties: { contains: pattern },
    },
  });

  for (const child of children) {
    // Overwrite core fields (keep parent link in properties)
    let childProps: any = {};
    try {
      childProps = child.properties ? JSON.parse(child.properties) : {};
    } catch {
      childProps = {};
    }
    childProps.printForm = (() => {
      try {
        const pprops = parent.properties
          ? JSON.parse(parent.properties as string)
          : ({} as any);
        return pprops.printForm ?? undefined;
      } catch {
        return undefined;
      }
    })();
    // keep parent element name in sync
    childProps.parentElementName = parent.name;
    childProps.fullyInherited = true;

    await db.processSchemaElement.update({
      where: { id: child.id },
      data: {
        name: parent.name,
        description: parent.description,
        properties: JSON.stringify(childProps),
      },
    });

    // Clear previous components
    await db.processRequisite.deleteMany({ where: { elementId: child.id } });
    await db.processChecklist.deleteMany({ where: { elementId: child.id } });
    await db.processRole.deleteMany({ where: { elementId: child.id } });
    await db.processTransition.deleteMany({ where: { elementId: child.id } });
    await db.processNotification.deleteMany({ where: { elementId: child.id } });

    // Recreate from parent
    for (const req of parent.requisites) {
      // mark as inherited on sync
      let inheritedValidation: any = {};
      try {
        inheritedValidation = req.validation
          ? JSON.parse(req.validation as string)
          : {};
      } catch {
        inheritedValidation = {};
      }
      inheritedValidation.inherited = true;
      inheritedValidation.inheritedFromElementId = parent.id;
      inheritedValidation.inheritedFromElementName = parent.name;

      const newReq = await db.processRequisite.create({
        data: {
          elementId: child.id,
          name: req.name,
          label: req.label,
          fieldType: req.fieldType,
          isRequired: req.isRequired,
          placeholder: req.placeholder,
          options: req.options,
          allowMultiple: req.allowMultiple,
          validation: JSON.stringify(inheritedValidation),
          order: req.order,
        },
      });
      for (const st of req.approvalStages) {
        await db.approvalStage.create({
          data: {
            requisiteId: newReq.id,
            name: st.name,
            description: st.description,
            order: st.order,
            isRequired: st.isRequired,
            approverRole: st.approverRole,
            department: st.department,
            executionType: st.executionType,
            deadlineDays: st.deadlineDays,
          },
        });
      }
    }

    for (const ch of parent.checklists) {
      await db.processChecklist.create({
        data: {
          elementId: child.id,
          name: ch.name,
          description: ch.description,
          isRequired: ch.isRequired,
          fileTypes: ch.fileTypes,
          maxFileSize: ch.maxFileSize,
          allowDocuments: ch.allowDocuments,
          allowComments: ch.allowComments,
          order: ch.order,
        },
      });
    }

    for (const r of parent.roles) {
      await db.processRole.create({
        data: {
          elementId: child.id,
          name: r.name,
          roleType: r.roleType,
          description: r.description,
          isRequired: r.isRequired,
          canEdit: r.canEdit,
          canApprove: r.canApprove,
          canReject: r.canReject,
          canRegister: r.canRegister,
          order: r.order,
        },
      });
    }

    for (const t of parent.transitions) {
      await db.processTransition.create({
        data: {
          elementId: child.id,
          name: t.name,
          condition: t.condition,
          targetState: t.targetState,
          description: t.description,
          isDefault: t.isDefault,
          order: t.order,
        },
      });
    }

    for (const n of parent.notifications) {
      await db.processNotification.create({
        data: {
          elementId: child.id,
          name: n.name,
          trigger: n.trigger,
          template: n.template,
          recipients: n.recipients,
          isActive: n.isActive,
          order: n.order,
        },
      });
    }
  }

  return { updatedChildren: children.map((c) => c.id) };
}

// Process Connections Management
export async function createProcessConnection(input: {
  schemaId: string;
  sourceId: string;
  targetId: string;
  connectionType?: string;
  condition?: string;
  label?: string;
  points?: any;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  // Fetch source/target to enforce gateway rules
  const [sourceEl, targetEl] = await Promise.all([
    db.processSchemaElement.findUnique({ where: { id: input.sourceId } }),
    db.processSchemaElement.findUnique({ where: { id: input.targetId } }),
  ]);

  if (!sourceEl || !targetEl) {
    throw new Error("Элемент(ы) не найдены");
  }

  // Rule 1: Process can only go to Decision; Decision can only go to Process. Also: if source is PROCESS with transition approved_or_rejected, target must be DECISION
  if (sourceEl.elementType === "PROCESS") {
    // запрещаем прямые связи PROCESS -> PROCESS/END
    if (
      targetEl.elementType !== "DECISION" &&
      targetEl.elementType !== "DECISION2"
    ) {
      const hasApproveReject = await db.processTransition.count({
        where: {
          elementId: sourceEl.id,
          condition: { in: ["approved_or_rejected", "approved", "rejected"] },
        },
      });
      throw new Error(
        hasApproveReject > 0
          ? "Для процесса с условием 'Согласовано/отклонено' необходимо использовать промежуточный блок 'Решение'"
          : "Процесс должен быть соединен с блоком 'Решение'",
      );
    }
  }

  // Запрет DECISION -> DECISION/END, разрешаем только DECISION -> PROCESS
  if (
    sourceEl.elementType === "DECISION" ||
    sourceEl.elementType === "DECISION2"
  ) {
    if (targetEl.elementType !== "PROCESS") {
      throw new Error(
        "Из блока 'Решение' можно соединять только с элементом 'Процесс'",
      );
    }
  }

  // Rule 2: If source is DECISION, enforce labels only when the DECISION is used after an approve/reject process
  if (sourceEl.elementType === "DECISION") {
    // Determine if any predecessor PROCESS of this DECISION has approve/reject transitions
    const incoming = await db.processConnection.findMany({
      where: { targetId: sourceEl.id, schemaId: input.schemaId },
      select: { sourceId: true },
    });
    const predecessorIds = Array.from(new Set(incoming.map((i) => i.sourceId)));
    let requiresStrictLabels = false;
    if (predecessorIds.length > 0) {
      const predecessors = await db.processSchemaElement.findMany({
        where: { id: { in: predecessorIds } },
        select: { id: true, elementType: true },
      });
      const processIds = predecessors
        .filter((p) => p.elementType === "PROCESS")
        .map((p) => p.id);
      if (processIds.length > 0) {
        const cnt = await db.processTransition.count({
          where: {
            elementId: { in: processIds },
            condition: { in: ["approved_or_rejected", "approved", "rejected"] },
          },
        });
        requiresStrictLabels = cnt > 0;
      }
    }

    if (requiresStrictLabels) {
      const label = (input.label || "").trim();
      if (!label) {
        throw new Error(
          "Выберите ветку перехода: 'Согласовано' или 'Отклонено'",
        );
      }
      const allowed = ["Согласовано", "Отклонено"];
      if (!allowed.includes(label)) {
        throw new Error(
          "Недопустимая ветка. Допустимо: 'Согласовано' или 'Отклонено'",
        );
      }
    }
  }

  return await db.processConnection.create({
    data: {
      schemaId: input.schemaId,
      sourceId: input.sourceId,
      targetId: input.targetId,
      connectionType: input.connectionType || "sequence",
      condition: input.condition,
      label: input.label,
      points: input.points ? JSON.stringify(input.points) : null,
    },
    include: {
      source: { select: { name: true } },
      target: { select: { name: true } },
    },
  });
}

export async function updateProcessConnection(input: {
  id: string;
  connectionType?: string;
  condition?: string;
  label?: string;
  points?: any;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const { id, points, ...updateData } = input;
  const finalUpdateData: any = { ...updateData };

  if (points !== undefined) {
    finalUpdateData.points = points ? JSON.stringify(points) : null;
  }

  return await db.processConnection.update({
    where: { id },
    data: finalUpdateData,
    include: {
      source: { select: { name: true } },
      target: { select: { name: true } },
    },
  });
}

export async function deleteProcessConnection(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processConnection.delete({
    where: { id: input.id },
  });
}

// Process Requisites Management
export async function reorderProcessRequisites(input: {
  elementId: string;
  orderedIds: string[];
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const existing = await db.processRequisite.findMany({
    where: { elementId: input.elementId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((r) => r.id));
  // Validate that all ids belong to this element and length matches existing set (strict reorder)
  if (
    existing.length !== input.orderedIds.length ||
    input.orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new Error("Неверный список реквизитов для перестановки");
  }

  // Update orders in a single batch (sequential to preserve order values deterministically)
  for (let i = 0; i < input.orderedIds.length; i++) {
    const id = input.orderedIds[i]!;
    await db.processRequisite.update({ where: { id }, data: { order: i } });
  }

  return { updated: input.orderedIds.length };
}

export async function createProcessRequisite(input: {
  elementId: string;
  name: string;
  label: string;
  fieldType: string;
  isRequired?: boolean;
  placeholder?: string;
  options?: any;
  allowMultiple?: boolean;
  validation?: any;
  order?: number;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const created = await db.processRequisite.create({
    data: {
      elementId: input.elementId,
      name: input.name,
      label: input.label,
      fieldType: input.fieldType,
      isRequired: input.isRequired || false,
      placeholder: input.placeholder,
      options: input.options ? JSON.stringify(input.options) : null,
      allowMultiple: input.allowMultiple ?? false,
      validation: input.validation ? JSON.stringify(input.validation) : null,
      order: input.order || 0,
    },
  });

  // If an approval requisite is added, mark the PROCESS and ensure a DECISION block exists to the right
  try {
    if (input.fieldType === "approval") {
      const element = await db.processSchemaElement.findUnique({
        where: { id: input.elementId },
      });
      if (element) {
        // Mark element as having an approval requisite (for UI overlay)
        let props: any = {};
        try {
          props = element.properties
            ? (JSON.parse(element.properties as unknown as string) as any)
            : {};
        } catch {
          props = {};
        }
        if (!props.hasApprovalRequisite) {
          props.hasApprovalRequisite = true;
          await db.processSchemaElement.update({
            where: { id: element.id },
            data: { properties: JSON.stringify(props) },
          });
        }

        // Ensure a DECISION node is connected after this PROCESS
        const existing = await db.processConnection.findMany({
          where: { sourceId: element.id },
          include: { target: true },
        });
        const hasDecision = existing.some(
          (c) => c.target?.elementType === "DECISION",
        );
        if (!hasDecision) {
          const posX = (element.positionX ?? 0) + (element.width ?? 120) + 120;
          const posY = element.positionY ?? 0;
          const decision = await db.processSchemaElement.create({
            data: {
              schemaId: element.schemaId,
              elementType: "DECISION",
              name: "Решение",
              description: null,
              positionX: posX,
              positionY: posY,
              width: 120,
              height: 60,
              properties: JSON.stringify({ needsConfiguration: true }),
            },
          });
          await db.processConnection.create({
            data: {
              schemaId: element.schemaId,
              sourceId: element.id,
              targetId: decision.id,
              connectionType: "sequence",
            },
          });
        }
      }
    }
  } catch (e) {
    console.error(
      "Failed to auto-create DECISION on approval requisite",
      (e as Error)?.message,
    );
  }

  return created;
}

export async function listProcessRequisites(input: { elementId: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processRequisite.findMany({
    where: { elementId: input.elementId },
    include: {
      approvalStages: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });
}

export async function updateProcessRequisite(input: {
  id: string;
  name?: string;
  label?: string;
  fieldType?: string;
  isRequired?: boolean;
  placeholder?: string;
  options?: any;
  allowMultiple?: boolean;
  validation?: any;
  order?: number;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const { id, options, validation, ...updateData } = input;
  const finalUpdateData: any = { ...updateData };

  if (options !== undefined) {
    finalUpdateData.options = options ? JSON.stringify(options) : null;
  }
  if (validation !== undefined) {
    finalUpdateData.validation = validation ? JSON.stringify(validation) : null;
  }

  return await db.processRequisite.update({
    where: { id },
    data: finalUpdateData,
  });
}

export async function deleteProcessRequisite(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processRequisite.delete({
    where: { id: input.id },
  });
}

// Process Checklists Management
export async function reorderProcessChecklists(input: {
  elementId: string;
  orderedIds: string[];
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const existing = await db.processChecklist.findMany({
    where: { elementId: input.elementId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((r) => r.id));
  if (
    existing.length !== input.orderedIds.length ||
    input.orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new Error("Неверный список пунктов чек-листа для перестановки");
  }
  for (let i = 0; i < input.orderedIds.length; i++) {
    const id = input.orderedIds[i]!;
    await db.processChecklist.update({ where: { id }, data: { order: i } });
  }
  return { updated: input.orderedIds.length };
}

export async function exportProcessChecklistToExcel(input: {
  elementId: string;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const list = await db.processChecklist.findMany({
    where: { elementId: input.elementId },
    orderBy: { order: "asc" },
  });

  const rows = list.map((c, idx) => ({
    Name: c.name,
    Description: c.description ?? "",
    Required: !!c.isRequired,
    AllowDocuments: !!c.allowDocuments,
    AllowComments: !!c.allowComments,
    FileTypes: (() => {
      try {
        return c.fileTypes
          ? (JSON.parse(c.fileTypes as string) as string[]).join(", ")
          : "";
      } catch {
        return c.fileTypes ?? "";
      }
    })(),
    MaxFileSizeMB: c.maxFileSize ?? "",
    Order: c.order ?? idx,
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows, {
    header: [
      "Name",
      "Description",
      "Required",
      "AllowDocuments",
      "AllowComments",
      "FileTypes",
      "MaxFileSizeMB",
      "Order",
    ],
  });
  XLSX.utils.book_append_sheet(wb, ws, "Checklist");
  const buffer: Buffer = XLSX.write(wb, {
    type: "buffer",
    bookType: "xlsx",
  }) as Buffer;
  const b64 = buffer.toString("base64");
  const url = await upload({
    bufferOrBase64: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${b64}`,
    fileName: `checklist-${input.elementId}-${Date.now()}.xlsx`,
  });
  return { url, count: list.length };
}

export async function importProcessChecklistFromExcel(input: {
  elementId: string;
  base64: string;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const base64 = (() => {
    const commaIdx = input.base64.indexOf(",");
    return commaIdx >= 0 ? input.base64.slice(commaIdx + 1) : input.base64;
  })();
  const buf = Buffer.from(base64, "base64");
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("В файле не найдены листы");
  const ws = wb.Sheets[sheetName]!;
  const rawRows: Array<Record<string, any>> = XLSX.utils.sheet_to_json(ws, {
    defval: "",
  });

  const normKey = (s: string) => s.toLowerCase().trim();
  const toBool = (v: any) => {
    const t = String(v).trim().toLowerCase();
    return ["true", "1", "да", "yes", "y", "истина"].includes(t);
  };
  const toInt = (v: any) => {
    const n = parseInt(String(v).trim());
    return Number.isFinite(n) ? n : null;
  };
  const parseTypes = (v: any) => {
    if (!v) return null;
    const arr = String(v)
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return arr.length ? JSON.stringify(arr) : null;
  };

  const data = rawRows.map((r, idx) => {
    // Accept both EN and RU headers
    const get = (keys: string[]) => {
      for (const k of keys) {
        const found = Object.keys(r).find((kk) => normKey(kk) === normKey(k));
        if (found) return (r as any)[found];
      }
      return "";
    };
    const name = get(["Name", "Название", "Наименование"]);
    const description = get(["Description", "Описание"]);
    const required = get(["Required", "Обязательный", "Обязателен"]);
    const allowDocs = get([
      "AllowDocuments",
      "РазрешитьДокументы",
      "Документы",
    ]);
    const allowComments = get(["AllowComments", "Комментарии"]);
    const fileTypes = get(["FileTypes", "ТипыФайлов", "Форматы"]);
    const maxFileSize = get(["MaxFileSizeMB", "МаксРазмерМБ", "МаксРазмер"]);
    const order = get(["Order", "Порядок"]);

    return {
      elementId: input.elementId,
      name: String(name || `Документ ${idx + 1}`),
      description: description ? String(description) : null,
      isRequired: toBool(required),
      allowDocuments: allowDocs === "" ? true : toBool(allowDocs),
      allowComments: allowComments === "" ? true : toBool(allowComments),
      fileTypes: parseTypes(fileTypes),
      maxFileSize: toInt(maxFileSize) ?? undefined,
      order: toInt(order) ?? idx,
    };
  });

  // Replace existing checklist with imported set
  await db.processChecklist.deleteMany({
    where: { elementId: input.elementId },
  });
  if (data.length > 0) {
    // create sequentially to respect JSON string fields
    for (const d of data) {
      await db.processChecklist.create({ data: d });
    }
  }
  return { imported: data.length };
}

export async function createProcessChecklist(input: {
  elementId: string;
  name: string;
  description?: string;
  isRequired?: boolean;
  fileTypes?: string[];
  maxFileSize?: number;
  allowDocuments?: boolean;
  allowComments?: boolean;
  order?: number;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processChecklist.create({
    data: {
      elementId: input.elementId,
      name: input.name,
      description: input.description,
      isRequired: input.isRequired !== undefined ? input.isRequired : true,
      fileTypes: input.fileTypes ? JSON.stringify(input.fileTypes) : null,
      maxFileSize: input.maxFileSize,
      allowDocuments:
        input.allowDocuments !== undefined ? input.allowDocuments : true,
      allowComments:
        input.allowComments !== undefined ? input.allowComments : true,
      order: input.order || 0,
    },
  });
}

export async function listProcessChecklists(input: { elementId: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processChecklist.findMany({
    where: { elementId: input.elementId },
    orderBy: { order: "asc" },
  });
}

// List checklists from previous (left-linked) processes
export async function listPreviousChecklists(input: { elementId: string }) {
  const prev = await listPreviousProcesses({ elementId: input.elementId });
  const results: Array<{
    elementId: string;
    elementName: string;
    checklist: any;
  }> = [];
  for (const p of prev) {
    const rows = await db.processChecklist.findMany({
      where: { elementId: p.id },
      orderBy: { order: "asc" },
    });
    for (const r of rows) {
      results.push({ elementId: p.id, elementName: p.name, checklist: r });
    }
  }
  return results;
}

// Inherit or copy checklist from a previous process
export async function inheritChecklistFromPrevious(input: {
  sourceElementId: string;
  checklistId: string;
  targetElementId: string;
  mode: "inherit" | "copy";
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin)
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );

  const source = await db.processSchemaElement.findUnique({
    where: { id: input.sourceElementId },
  });
  if (!source) throw new Error("Источник не найден");

  const row = await db.processChecklist.findUnique({
    where: { id: input.checklistId },
  });
  if (!row) throw new Error("Пункт чек-листа не найден");

  let meta: any = null;
  if (input.mode !== "copy") {
    meta = JSON.stringify({
      inherited: true,
      inheritedFromElementId: source.id,
      inheritedFromElementName: source.name,
    });
  }

  const created = await db.processChecklist.create({
    data: {
      elementId: input.targetElementId,
      name: row.name,
      description: row.description,
      isRequired: row.isRequired,
      fileTypes: row.fileTypes,
      maxFileSize: row.maxFileSize,
      allowDocuments: row.allowDocuments,
      allowComments: row.allowComments,
      order: row.order,
      meta,
    },
  });

  return created;
}

// Break inheritance for a checklist row in child process
export async function breakChecklistInheritance(input: {
  targetChecklistId: string;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin)
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );

  const r = await db.processChecklist.findUnique({
    where: { id: input.targetChecklistId },
  });
  if (!r) throw new Error("Пункт чек-листа не найден");

  const updated = await db.processChecklist.update({
    where: { id: input.targetChecklistId },
    data: { meta: null },
  });

  return updated;
}

export async function updateProcessChecklist(input: {
  id: string;
  name?: string;
  description?: string;
  isRequired?: boolean;
  fileTypes?: string[];
  maxFileSize?: number;
  allowDocuments?: boolean;
  allowComments?: boolean;
  order?: number;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const { id, fileTypes, ...updateData } = input;
  const finalUpdateData: any = { ...updateData };

  if (fileTypes !== undefined) {
    finalUpdateData.fileTypes = fileTypes ? JSON.stringify(fileTypes) : null;
  }

  return await db.processChecklist.update({
    where: { id },
    data: finalUpdateData,
  });
}

export async function deleteProcessChecklist(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processChecklist.delete({
    where: { id: input.id },
  });
}

// List previous (left) processes connected into the given element
export async function listPreviousProcesses(input: { elementId: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  // Traverse the entire upstream chain (all ancestors), not just the direct parents
  const visited = new Set<string>([input.elementId]);
  let frontier: string[] = [input.elementId];
  const processResults: any[] = [];
  const seenProcessIds = new Set<string>();

  while (frontier.length > 0) {
    const connections = await db.processConnection.findMany({
      where: { targetId: { in: frontier } },
      include: { source: true },
      orderBy: { createdAt: "asc" },
    });

    const nextFrontier: string[] = [];

    for (const c of connections) {
      const src: any = c.source;
      if (!src) continue;

      // Record processes for selection, but continue traversal through any element types
      if (src.elementType === "PROCESS" && !seenProcessIds.has(src.id)) {
        seenProcessIds.add(src.id);
        processResults.push(src);
      }

      if (!visited.has(src.id)) {
        visited.add(src.id);
        nextFrontier.push(src.id);
      }
    }

    frontier = nextFrontier;
  }

  return processResults.map((e) => ({
    id: e.id,
    name: e.name,
    schemaId: e.schemaId,
  }));
}

// List requisites from previous processes
export async function listPreviousRequisites(input: { elementId: string }) {
  const prev = await listPreviousProcesses({ elementId: input.elementId });
  const results: Array<{
    elementId: string;
    elementName: string;
    requisite: any;
  }> = [];
  for (const p of prev) {
    const reqs = await db.processRequisite.findMany({
      where: { elementId: p.id },
      include: { approvalStages: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });
    for (const r of reqs) {
      results.push({ elementId: p.id, elementName: p.name, requisite: r });
    }
  }
  return results;
}

// Inherit or copy a requisite from a previous process into target element
export async function inheritRequisiteFromPrevious(input: {
  sourceElementId: string;
  targetElementId: string;
  requisiteId: string;
  mode?: "inherit" | "copy";
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin)
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );

  const source = await db.processSchemaElement.findUnique({
    where: { id: input.sourceElementId },
  });
  if (!source) throw new Error("Источник не найден");
  const r = await db.processRequisite.findUnique({
    where: { id: input.requisiteId },
    include: { approvalStages: true },
  });
  if (!r) throw new Error("Реквизит не найден");

  let validation: any = undefined;
  if (input.mode !== "copy") {
    // inherit by marking validation
    let existing: any = {};
    try {
      existing = r.validation ? JSON.parse(r.validation as string) : {};
    } catch {
      existing = {};
    }
    existing.inherited = true;
    existing.inheritedFromElementId = source.id;
    existing.inheritedFromElementName = source.name;
    validation = JSON.stringify(existing);
  }

  const created = await db.processRequisite.create({
    data: {
      elementId: input.targetElementId,
      name: r.name,
      label: r.label,
      fieldType: r.fieldType,
      isRequired: r.isRequired,
      placeholder: r.placeholder,
      options: r.options,
      allowMultiple: r.allowMultiple,
      validation: validation ?? r.validation,
      order: r.order,
    },
  });

  // If this is an approval requisite, copy approval stages and ensure UI markers
  if (r.fieldType === "approval") {
    try {
      // Copy stages
      if (Array.isArray((r as any).approvalStages)) {
        for (const st of (r as any).approvalStages) {
          await db.approvalStage.create({
            data: {
              requisiteId: created.id,
              name: st.name,
              description: st.description,
              order: st.order ?? 0,
              isRequired: st.isRequired ?? true,
              approverRole: st.approverRole,
              department: st.department,
              executionType: st.executionType ?? "sequential",
              deadlineDays: st.deadlineDays ?? null,
            },
          });
        }
      }

      // Mark target element props.hasApprovalRequisite and ensure DECISION exists
      const element = await db.processSchemaElement.findUnique({
        where: { id: input.targetElementId },
      });
      if (element) {
        let props: any = {};
        try {
          props = element.properties
            ? (JSON.parse(element.properties as unknown as string) as any)
            : {};
        } catch {
          props = {};
        }
        if (!props.hasApprovalRequisite) {
          props.hasApprovalRequisite = true;
          await db.processSchemaElement.update({
            where: { id: element.id },
            data: { properties: JSON.stringify(props) },
          });
        }

        const existing = await db.processConnection.findMany({
          where: { sourceId: element.id },
          include: { target: true },
        });
        const hasDecision = existing.some(
          (c) => c.target?.elementType === "DECISION",
        );
        if (!hasDecision) {
          const posX = (element.positionX ?? 0) + (element.width ?? 120) + 120;
          const posY = element.positionY ?? 0;
          const decision = await db.processSchemaElement.create({
            data: {
              schemaId: element.schemaId,
              elementType: "DECISION",
              name: "Решение",
              description: null,
              positionX: posX,
              positionY: posY,
              width: 120,
              height: 60,
              properties: JSON.stringify({ needsConfiguration: true }),
            },
          });
          await db.processConnection.create({
            data: {
              schemaId: element.schemaId,
              sourceId: element.id,
              targetId: decision.id,
              connectionType: "sequence",
            },
          });
        }
      }
    } catch (e) {
      console.error(
        "Failed to finalize approval inheritance",
        (e as Error)?.message,
      );
    }
  }

  return created;
}

// Break inheritance for a requisite in the target element (make it independent)
export async function breakRequisiteInheritance(input: {
  targetRequisiteId: string;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin)
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  const req = await db.processRequisite.findUnique({
    where: { id: input.targetRequisiteId },
  });
  if (!req) throw new Error("Реквизит не найден");
  let v: any = {};
  try {
    v = req.validation ? JSON.parse(req.validation as string) : {};
  } catch {
    v = {};
  }
  delete v.inherited;
  delete v.inheritedFromElementId;
  delete v.inheritedFromElementName;
  const updated = await db.processRequisite.update({
    where: { id: input.targetRequisiteId },
    data: { validation: Object.keys(v).length ? JSON.stringify(v) : null },
  });
  return updated;
}

// List print forms from previous processes
export async function listPreviousPrintForms(input: { elementId: string }) {
  const prev = await listPreviousProcesses({ elementId: input.elementId });
  const out: Array<{ elementId: string; elementName: string; form: any }> = [];
  for (const p of prev) {
    const el = await db.processSchemaElement.findUnique({
      where: { id: p.id },
    });
    if (!el) continue;
    let props: any = {};
    try {
      props = el.properties ? JSON.parse(el.properties as string) : {};
    } catch {
      props = {};
    }
    const forms: any[] = Array.isArray(props.printForms)
      ? props.printForms
      : props.printForm
        ? [props.printForm]
        : [];
    for (const f of forms) {
      out.push({ elementId: p.id, elementName: p.name, form: f });
    }
  }
  return out;
}

// Inherit or copy a print form from previous element
export async function inheritPrintFormFromPrevious(input: {
  sourceElementId: string;
  targetElementId: string;
  printFormId: string;
  mode?: "inherit" | "copy";
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin)
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );

  const source = await db.processSchemaElement.findUnique({
    where: { id: input.sourceElementId },
  });
  const target = await db.processSchemaElement.findUnique({
    where: { id: input.targetElementId },
  });
  if (!source || !target) throw new Error("Элемент не найден");

  let sProps: any = {};
  let tProps: any = {};
  try {
    sProps = source.properties ? JSON.parse(source.properties as string) : {};
  } catch {
    sProps = {};
  }
  try {
    tProps = target.properties ? JSON.parse(target.properties as string) : {};
  } catch {
    tProps = {};
  }

  const forms: any[] = Array.isArray(sProps.printForms)
    ? sProps.printForms
    : sProps.printForm
      ? [sProps.printForm]
      : [];
  const src = forms.find((f) => f?.id === input.printFormId);
  if (!src) throw new Error("Печатная форма не найдена");

  if (!Array.isArray(tProps.printForms)) {
    tProps.printForms = tProps.printForm ? [tProps.printForm] : [];
  }
  const newEntry = { ...src };
  if (input.mode !== "copy") {
    newEntry.inherited = true;
    newEntry.inheritedFromElementId = source.id;
    newEntry.inheritedFromElementName = source.name;
  } else {
    delete newEntry.inherited;
    delete newEntry.inheritedFromElementId;
    delete newEntry.inheritedFromElementName;
  }
  // ensure unique id
  newEntry.id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  tProps.printForms.push(newEntry);
  tProps.printForm = newEntry;

  await db.processSchemaElement.update({
    where: { id: target.id },
    data: { properties: JSON.stringify(tProps) },
  });
  return newEntry;
}

export async function breakPrintFormInheritance(input: {
  targetElementId: string;
  printFormId: string;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin)
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  const el = await db.processSchemaElement.findUnique({
    where: { id: input.targetElementId },
  });
  if (!el) throw new Error("Элемент не найден");
  let props: any = {};
  try {
    props = el.properties ? JSON.parse(el.properties as string) : {};
  } catch {
    props = {};
  }
  const forms: any[] = Array.isArray(props.printForms)
    ? props.printForms
    : props.printForm
      ? [props.printForm]
      : [];
  props.printForms = forms.map((f) =>
    f?.id === input.printFormId
      ? {
          ...f,
          inherited: false,
          inheritedFromElementId: undefined,
          inheritedFromElementName: undefined,
        }
      : f,
  );
  if (props.printForm && props.printForm.id === input.printFormId) {
    props.printForm = {
      ...props.printForm,
      inherited: false,
      inheritedFromElementId: undefined,
      inheritedFromElementName: undefined,
    };
  }
  await db.processSchemaElement.update({
    where: { id: input.targetElementId },
    data: { properties: JSON.stringify(props) },
  });
  return { ok: true };
}

// Apply a checklist template (set of items) to a process element (append or replace)
export async function applyChecklistTemplateToElement(input: {
  elementId: string;
  templateId: string;
  mode?: "append" | "replace";
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const element = await db.processSchemaElement.findUnique({
    where: { id: input.elementId },
    select: { id: true },
  });
  if (!element) throw new Error("Элемент процесса не найден");

  const template = await db.checklistTemplate.findUnique({
    where: { id: input.templateId },
    select: { id: true },
  });
  if (!template) throw new Error("Шаблон чек-листа не найден");

  const items = await db.checklistTemplateItem.findMany({
    where: { templateId: input.templateId },
    orderBy: { order: "asc" },
  });

  const mode = input.mode ?? "append";
  let offset = 0;
  if (mode === "replace") {
    await db.processChecklist.deleteMany({
      where: { elementId: input.elementId },
    });
  } else {
    const existingMax = await db.processChecklist.findFirst({
      where: { elementId: input.elementId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    offset = (existingMax?.order ?? -1) + 1;
  }

  if (items.length === 0) return { created: 0 };

  // createMany for performance
  await db.processChecklist.createMany({
    data: items.map((it, idx) => ({
      elementId: input.elementId,
      name: it.name,
      description: it.description,
      isRequired: it.isRequired,
      allowDocuments: it.allowDocuments,
      allowComments: it.allowComments,
      fileTypes: it.fileTypes ?? null,
      maxFileSize: it.maxFileSize ?? null,
      order: (it.order ?? idx) + offset,
    })),
  });

  const created = items.length;
  return { created };
}

// Create a checklist template from the current set of checklist items on a process element
export async function createChecklistTemplateFromElement(input: {
  elementId: string;
  label: string;
  description?: string;
  order?: number;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const element = await db.processSchemaElement.findUnique({
    where: { id: input.elementId },
    select: { id: true },
  });
  if (!element) throw new Error("Элемент процесса не найден");

  const rows = await db.processChecklist.findMany({
    where: { elementId: input.elementId },
    orderBy: { order: "asc" },
  });

  const template = await db.checklistTemplate.create({
    data: {
      label: input.label,
      description: input.description,
      isRequired: rows.length > 0 ? rows.every((r) => r.isRequired) : true, // агрегированное поле не критично
      allowDocuments:
        rows.length > 0 ? rows.some((r) => r.allowDocuments) : true,
      allowComments: rows.length > 0 ? rows.some((r) => r.allowComments) : true,
      order: input.order ?? 0,
    },
  });

  if (rows.length > 0) {
    // batch copy to items
    await db.checklistTemplateItem.createMany({
      data: rows.map((r, idx) => ({
        templateId: template.id,
        name: r.name,
        description: r.description ?? null,
        isRequired: r.isRequired,
        allowDocuments: r.allowDocuments,
        allowComments: r.allowComments,
        fileTypes: r.fileTypes ?? null,
        maxFileSize: r.maxFileSize ?? null,
        order: r.order ?? idx,
      })),
    });
  }

  return { id: template.id };
}

// Process Roles Management
export async function createProcessRole(input: {
  elementId: string;
  name: string;
  roleType: string;
  description?: string;
  isRequired?: boolean;
  canEdit?: boolean;
  canApprove?: boolean;
  canReject?: boolean;
  canRegister?: boolean;
  order?: number;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  // Prevent duplicate roleType per element
  const dup = await db.processRole.count({
    where: { elementId: input.elementId, roleType: input.roleType },
  });
  if (dup > 0) {
    throw new Error("Роль с таким типом уже добавлена для этого процесса");
  }

  return await db.processRole.create({
    data: {
      elementId: input.elementId,
      name: input.name,
      roleType: input.roleType,
      description: input.description,
      isRequired: input.isRequired !== undefined ? input.isRequired : true,
      canEdit: input.canEdit || false,
      canApprove: input.canApprove || false,
      canReject: input.canReject || false,
      canRegister: input.canRegister || false,
      order: input.order || 0,
    },
  });
}

export async function listProcessRoles(input: { elementId: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processRole.findMany({
    where: { elementId: input.elementId },
    orderBy: { order: "asc" },
  });
}

// Публичный просмотр настроенных ролей для элемента процесса (без требования прав администратора)
export async function listElementRolesPublic(input: { elementId: string }) {
  try {
    return await db.processRole.findMany({
      where: { elementId: input.elementId },
      select: {
        id: true,
        roleType: true,
        canEdit: true,
        canApprove: true,
        canRegister: true,
        order: true,
      },
      orderBy: { order: "asc" },
    });
  } catch (e) {
    console.error("listElementRolesPublic error", e);
    throw new Error("Не удалось загрузить настройки ролей для этапа");
  }
}

export async function updateProcessRole(input: {
  id: string;
  name?: string;
  roleType?: string;
  description?: string;
  isRequired?: boolean;
  canEdit?: boolean;
  canApprove?: boolean;
  canReject?: boolean;
  canRegister?: boolean;
  order?: number;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const { id, ...updateData } = input;
  return await db.processRole.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteProcessRole(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processRole.delete({
    where: { id: input.id },
  });
}

// Role Templates Management
export async function createRoleTemplate(input: {
  name: string;
  description?: string;
  roleType: string;
  canEdit?: boolean;
  canApprove?: boolean;
  canRegister?: boolean;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  return await db.roleTemplate.create({
    data: {
      name: input.name,
      description: input.description,
      roleType: input.roleType,
      canEdit: input.canEdit ?? false,
      canApprove: input.canApprove ?? false,
      canRegister: input.canRegister ?? false,
    },
  });
}

export async function listRoleTemplates(input?: { query?: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const where: any = { isActive: true };
  if (input?.query) {
    where.name = { startsWith: input.query };
  }
  return await db.roleTemplate.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
}

// Role Types dictionary API
export async function listRoleTypes() {
  await getAuth({ required: true });
  return await db.roleType.findMany({ orderBy: { createdAt: "asc" } });
}

export async function createRoleType(input: { code: string; name?: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const code = (input.code || "").trim().toLowerCase();
  if (!code) throw new Error("code is required");
  const name = (input.name || input.code).trim();
  return await db.roleType.upsert({
    where: { code },
    update: { name },
    create: { code, name },
  });
}

export async function deleteRoleType(input: { id: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  await db.roleType.delete({ where: { id: input.id } });
  return { ok: true };
}

// Seed defaults once
export async function _seedDefaultRoleTypes() {
  const defaults = [
    { code: "applicant", name: "Заявитель" },
    { code: "executor", name: "Исполнитель" },
    { code: "approver", name: "Согласующий" },
    { code: "observer", name: "Наблюдатель" },
  ];
  await Promise.all(
    defaults.map((d) =>
      db.roleType.upsert({
        where: { code: d.code },
        update: { name: d.name },
        create: { code: d.code, name: d.name },
      }),
    ),
  );
  return { ok: true };
}

// Transition Templates API
export async function createDecisionTemplateFromElement(input: {
  elementId: string;
  name?: string;
  description?: string;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const element = await db.processSchemaElement.findUnique({
    where: { id: input.elementId },
  });
  if (!element) throw new Error("Элемент процесса не найден");
  if (element.elementType !== "DECISION") {
    throw new Error("Шаблон можно сохранить только из элемента типа 'Решение'");
  }

  const outgoing = await db.processConnection.findMany({
    where: { sourceId: element.id },
    orderBy: { createdAt: "asc" },
  });
  const branches = await Promise.all(
    outgoing.map(async (c) => {
      let cond: any = {};
      try {
        cond = c.condition ? (JSON.parse(c.condition as string) as any) : {};
      } catch {}
      const target = await db.processSchemaElement.findUnique({
        where: { id: c.targetId },
        select: { elementType: true, name: true },
      });
      return {
        connectionId: c.id,
        label: c.label || null,
        targetType: target?.elementType || null,
        targetName: target?.name || null,
        condition: cond,
      };
    }),
  );

  let props: any = {};
  try {
    props = element.properties
      ? (JSON.parse(element.properties as string) as any)
      : {};
  } catch {}

  const config = { properties: props, branches };
  const name = input.name?.trim() || "Типовое Решение";
  const description = input.description;

  const existing = await db.decisionTemplate.findFirst({
    where: { name, isActive: true },
  });
  if (existing) {
    const updated = await db.decisionTemplate.update({
      where: { id: existing.id },
      data: {
        description: description ?? existing.description,
        config: JSON.stringify(config),
      },
    });
    return { id: updated.id };
  } else {
    const created = await db.decisionTemplate.create({
      data: {
        name,
        description: description ?? null,
        config: JSON.stringify(config),
        isActive: true,
      },
    });
    return { id: created.id };
  }
}

export async function createTransitionTemplate(input: {
  name: string;
  description?: string;
  condition: string;
  targetState?: string;
  transitionType?: string;
}) {
  await getAuth({ required: true });
  return await db.transitionTemplate.create({
    data: {
      name: input.name,
      description: input.description,
      condition: input.condition,
      targetState: input.targetState,
      transitionType:
        input.transitionType ||
        (input.condition === "approved_or_rejected"
          ? "approve_or_reject"
          : input.condition === "assigned"
            ? "assign_executor"
            : "next"),
    },
  });
}

export async function listTransitionTemplates(input?: { query?: string }) {
  await getAuth({ required: true });
  const where: any = { isActive: true };
  if (input?.query) {
    where.name = { contains: input.query };
  }
  return await db.transitionTemplate.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
}

export async function updateTransitionTemplate(input: {
  id: string;
  name?: string;
  description?: string;
  condition?: string;
  targetState?: string;
  transitionType?: string;
  isActive?: boolean;
}) {
  await getAuth({ required: true });
  const { id, ...data } = input as any;
  return await db.transitionTemplate.update({ where: { id }, data });
}

export async function deleteTransitionTemplate(input: { id: string }) {
  await getAuth({ required: true });
  return await db.transitionTemplate.update({
    where: { id: input.id },
    data: { isActive: false },
  });
}

// Requisite Templates API
export async function createRequisiteTemplate(input: {
  name: string;
  label: string;
  fieldType: string;
  isRequired?: boolean;
  placeholder?: string;
  options?: any;
  allowMultiple?: boolean;
  validation?: any;
  order?: number;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.requisiteTemplate.create({
    data: {
      name: input.name,
      label: input.label,
      fieldType: input.fieldType,
      isRequired: input.isRequired ?? false,
      placeholder: input.placeholder,
      options: input.options ? JSON.stringify(input.options) : null,
      allowMultiple: input.allowMultiple ?? false,
      validation: input.validation ? JSON.stringify(input.validation) : null,
      order: input.order ?? 0,
    },
  });
}

export async function listRequisiteTemplates(input?: { query?: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const where: any = { isActive: true };
  if (input?.query) {
    where.OR = [
      { name: { contains: input.query } },
      { label: { contains: input.query } },
    ];
  }
  return await db.requisiteTemplate.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
}

export async function updateRequisiteTemplate(input: {
  id: string;
  name?: string;
  label?: string;
  fieldType?: string;
  isRequired?: boolean;
  placeholder?: string;
  options?: any;
  allowMultiple?: boolean;
  validation?: any;
  order?: number;
  isActive?: boolean;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const { id, options, validation, ...rest } = input;
  const data: any = { ...rest };
  if (options !== undefined)
    data.options = options ? JSON.stringify(options) : null;
  if (validation !== undefined)
    data.validation = validation ? JSON.stringify(validation) : null;

  return await db.requisiteTemplate.update({ where: { id }, data });
}

export async function deleteRequisiteTemplate(input: { id: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  // мягкое удаление
  return await db.requisiteTemplate.update({
    where: { id: input.id },
    data: { isActive: false },
  });
}

// Process Transitions Management
export async function createProcessTransition(input: {
  elementId: string;
  name: string;
  condition: string;
  targetState?: string;
  description?: string;
  transitionType?: string;
  isDefault?: boolean;
  order?: number;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  // Enforce allowed types per condition and unique resolution per process element
  const allowedTypesByCondition: Record<string, string[]> = {
    approved_or_rejected: ["approve_or_reject"],
    assigned: [
      "send_for_review",
      "send_for_approval",
      "assign_executor",
      "resolution",
    ],
    filled: ["send_for_review", "send_for_approval", "next"],
  };

  const allowed = allowedTypesByCondition[input.condition] ?? ["next"];
  let finalType =
    input.transitionType ||
    (input.condition === "approved_or_rejected"
      ? "approve_or_reject"
      : input.condition === "assigned"
        ? "assign_executor"
        : input.condition === "filled"
          ? "send_for_review"
          : "next");
  if (!allowed.includes(finalType)) {
    const candidateType = allowed[0] ?? "next";
    finalType = candidateType as string;
  }

  if (finalType === "resolution") {
    const existingResolution = await db.processTransition.count({
      where: { elementId: input.elementId, transitionType: "resolution" },
    });
    if (existingResolution > 0) {
      throw new Error("Резолюция уже добавлена для этого процесса");
    }
  }

  // Determine next order if not provided
  let finalOrder = typeof input.order === "number" ? input.order : undefined;
  if (finalOrder === undefined) {
    const maxOrder = await db.processTransition.aggregate({
      where: { elementId: input.elementId },
      _max: { order: true },
    });
    finalOrder = (maxOrder._max.order ?? -1) + 1;
  }

  const created = await db.processTransition.create({
    data: {
      elementId: input.elementId,
      name: input.name,
      condition: input.condition,
      targetState: input.targetState,
      description: input.description,
      transitionType: finalType,
      isDefault: input.isDefault || false,
      order: finalOrder,
    },
  });

  // Auto-create DECISION node and connect when using approved_or_rejected on a PROCESS
  try {
    if (input.condition === "approved_or_rejected") {
      const element = await db.processSchemaElement.findUnique({
        where: { id: input.elementId },
      });
      if (element?.elementType === "PROCESS") {
        const existing = await db.processConnection.findMany({
          where: { sourceId: element.id },
          include: { target: true },
        });
        const hasDecision = existing.some(
          (c) => c.target?.elementType === "DECISION",
        );
        if (!hasDecision) {
          const posX = (element.positionX ?? 0) + (element.width ?? 120) + 120;
          const posY = element.positionY ?? 0;
          const decision = await db.processSchemaElement.create({
            data: {
              schemaId: element.schemaId,
              elementType: "DECISION",
              name: "Решение",
              description: null,
              positionX: posX,
              positionY: posY,
              width: 120,
              height: 60,
              properties: JSON.stringify({ needsConfiguration: true }),
            },
          });
          await db.processConnection.create({
            data: {
              schemaId: element.schemaId,
              sourceId: element.id,
              targetId: decision.id,
              connectionType: "sequence",
            },
          });
        }
      }
    }
  } catch (e) {
    console.error("Failed to auto-create DECISION", (e as Error)?.message);
  }

  return created;
}

export async function listProcessTransitions(input: { elementId: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processTransition.findMany({
    where: { elementId: input.elementId },
    orderBy: { order: "asc" },
  });
}

// Get info if PROCESS element has DECISION chain connected directly after it
export async function getDecisionChainInfoForProcess(input: {
  elementId: string;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const element = await db.processSchemaElement.findUnique({
    where: { id: input.elementId },
  });
  if (!element) throw new Error("Элемент процесса не найден");
  if (element.elementType !== "PROCESS")
    return {
      hasDecision: false,
      decisionId: null,
      branches: [] as Array<{
        id: string;
        label: string;
        targetId: string | null;
      }>,
    };

  const toConnections = await db.processConnection.findMany({
    where: { sourceId: element.id },
    include: { target: true },
  });
  const decision = toConnections.find(
    (c) => c.target?.elementType === "DECISION",
  );
  if (!decision)
    return {
      hasDecision: false,
      decisionId: null,
      branches: [] as Array<{
        id: string;
        label: string;
        targetId: string | null;
      }>,
    };
  const fromDecision = await db.processConnection.findMany({
    where: { sourceId: decision.targetId },
  });
  return {
    hasDecision: true,
    decisionId: decision.targetId,
    branches: fromDecision.map((c) => ({
      id: c.id,
      label: c.label || "",
      targetId: c.targetId,
    })),
  };
}

export async function updateProcessTransition(input: {
  id: string;
  name?: string;
  condition?: string;
  targetState?: string;
  description?: string;
  transitionType?: string;
  isDefault?: boolean;
  order?: number;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const current = await db.processTransition.findUnique({
    where: { id: input.id },
  });
  if (!current) throw new Error("Переход не найден");

  // If we are switching to approved_or_rejected, ensure DECISION exists and is connected
  try {
    const nextCondition = input.condition ?? current.condition;
    if (
      current.condition !== "approved_or_rejected" &&
      nextCondition === "approved_or_rejected"
    ) {
      const element = await db.processSchemaElement.findUnique({
        where: { id: current.elementId },
      });
      if (element?.elementType === "PROCESS") {
        const existing = await db.processConnection.findMany({
          where: { sourceId: element.id },
          include: { target: true },
        });
        const hasDecision = existing.some(
          (c) => c.target?.elementType === "DECISION",
        );
        if (!hasDecision) {
          const posX = (element.positionX ?? 0) + (element.width ?? 120) + 120;
          const posY = element.positionY ?? 0;
          const decision = await db.processSchemaElement.create({
            data: {
              schemaId: element.schemaId,
              elementType: "DECISION",
              name: "Решение",
              description: null,
              positionX: posX,
              positionY: posY,
              width: 120,
              height: 60,
              properties: JSON.stringify({ needsConfiguration: true }),
            },
          });
          await db.processConnection.create({
            data: {
              schemaId: element.schemaId,
              sourceId: element.id,
              targetId: decision.id,
              connectionType: "sequence",
            },
          });
        }
      }
    }
  } catch (e) {
    console.error("Failed to ensure DECISION on update", (e as Error)?.message);
  }

  const { id, ...updateData } = input;

  // Enforce single resolution per element on update
  const nextType = (updateData.transitionType ??
    current.transitionType) as string;
  if (nextType === "resolution") {
    const othersWithResolution = await db.processTransition.count({
      where: {
        elementId: current.elementId,
        transitionType: "resolution",
        NOT: { id: current.id },
      },
    });
    if (othersWithResolution > 0) {
      throw new Error("В этом процессе уже есть резолюция");
    }
  }

  return await db.processTransition.update({
    where: { id },
    data: updateData,
  });
}

// Safely change transition condition and adjust DECISION connections when needed
export async function updateProcessTransitionWithGraphAdjust(input: {
  id: string;
  name?: string;
  condition?: string;
  targetState?: string;
  description?: string;
  transitionType?: string;
  isDefault?: boolean;
  order?: number;
  adjustDecisionLinks?: boolean; // when switching away from approved_or_rejected, remove related DECISION links
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const current = await db.processTransition.findUnique({
    where: { id: input.id },
  });
  if (!current) throw new Error("Переход не найден");

  const changingAwayFromApproveReject =
    current.condition === "approved_or_rejected" &&
    input.condition &&
    input.condition !== "approved_or_rejected";

  if (changingAwayFromApproveReject && input.adjustDecisionLinks) {
    // Identify DECISION elements directly connected from the PROCESS element that owns this transition
    const element = await db.processSchemaElement.findUnique({
      where: { id: current.elementId },
    });
    if (element?.elementType === "PROCESS") {
      const decisionConnections = await db.processConnection.findMany({
        where: { sourceId: element.id },
        include: { target: true },
      });
      const decisionIds = decisionConnections
        .filter((c) => c.target?.elementType === "DECISION")
        .map((c) => c.targetId);

      if (decisionIds.length > 0) {
        // Remove links from PROCESS -> DECISION and DECISION -> any targets
        await db.processConnection.deleteMany({
          where: {
            OR: [
              { sourceId: element.id, targetId: { in: decisionIds } },
              { sourceId: { in: decisionIds } },
            ],
          },
        });
      }
    }
  }

  // If switching to approved_or_rejected, ensure DECISION exists and is connected
  try {
    const nextCondition = input.condition ?? current.condition;
    if (
      current.condition !== "approved_or_rejected" &&
      nextCondition === "approved_or_rejected"
    ) {
      const element = await db.processSchemaElement.findUnique({
        where: { id: current.elementId },
      });
      if (element?.elementType === "PROCESS") {
        const existing = await db.processConnection.findMany({
          where: { sourceId: element.id },
          include: { target: true },
        });
        const hasDecision = existing.some(
          (c) => c.target?.elementType === "DECISION",
        );
        if (!hasDecision) {
          const posX = (element.positionX ?? 0) + (element.width ?? 120) + 120;
          const posY = element.positionY ?? 0;
          const decision = await db.processSchemaElement.create({
            data: {
              schemaId: element.schemaId,
              elementType: "DECISION",
              name: "Решение",
              description: null,
              positionX: posX,
              positionY: posY,
              width: 120,
              height: 60,
              properties: JSON.stringify({ needsConfiguration: true }),
            },
          });
          await db.processConnection.create({
            data: {
              schemaId: element.schemaId,
              sourceId: element.id,
              targetId: decision.id,
              connectionType: "sequence",
            },
          });
        }
      }
    }
  } catch (e) {
    console.error(
      "Failed to ensure DECISION on updateWithGraph",
      (e as Error)?.message,
    );
  }

  const { id, ...data } = input as any;
  delete (data as any).adjustDecisionLinks;
  return await db.processTransition.update({ where: { id }, data });
}

export async function deleteProcessTransition(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processTransition.delete({
    where: { id: input.id },
  });
}

// Process Notifications Management
export async function createProcessNotification(input: {
  elementId: string;
  name: string;
  trigger: string;
  template: string;
  recipients: string[];
  isActive?: boolean;
  order?: number;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processNotification.create({
    data: {
      elementId: input.elementId,
      name: input.name,
      trigger: input.trigger,
      template: input.template,
      recipients: JSON.stringify(input.recipients),
      isActive: input.isActive !== undefined ? input.isActive : true,
      order: input.order || 0,
    },
  });
}

export async function listProcessNotifications(input: { elementId: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processNotification.findMany({
    where: { elementId: input.elementId },
    orderBy: { order: "asc" },
  });
}

export async function updateProcessNotification(input: {
  id: string;
  name?: string;
  trigger?: string;
  template?: string;
  recipients?: string[];
  isActive?: boolean;
  order?: number;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const { id, recipients, ...updateData } = input;
  const finalUpdateData: any = { ...updateData };

  if (recipients !== undefined) {
    finalUpdateData.recipients = JSON.stringify(recipients);
  }

  return await db.processNotification.update({
    where: { id },
    data: finalUpdateData,
  });
}

export async function deleteProcessNotification(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.processNotification.delete({
    where: { id: input.id },
  });
}

// Print Form Template Management
export async function uploadPrintFormTemplate(input: {
  elementId: string;
  base64: string; // dataURL base64 of the template file (docx/pdf)
  fileName: string;
  mappings?: Array<{ token: string; requisiteName: string }>;
  printFormId?: string; // optional: update an existing print form
  label?: string; // optional display name for the print form
  alsoSaveToLibrary?: boolean; // when true, save/update in global PrintFormTemplate library
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const element = await db.processSchemaElement.findUnique({
    where: { id: input.elementId },
  });
  if (!element) throw new Error("Элемент процесса не найден");

  // Upload file to storage
  const templateUrl = await upload({
    bufferOrBase64: input.base64,
    fileName: input.fileName,
  });

  // Merge into properties.printForms[] (multi-print support) with backward compatibility
  let props: Record<string, any> = {};
  try {
    props = element.properties
      ? (JSON.parse(element.properties as string) as Record<string, any>)
      : {};
  } catch {
    props = {};
  }

  // migrate single printForm to array once (non-destructive)
  const ensureArray = () => {
    if (!Array.isArray((props as any).printForms)) {
      const single = (props as any).printForm;
      (props as any).printForms = single ? [single] : [];
    }
  };
  ensureArray();

  // normalize mappings
  const normalizedMappings = (input.mappings ?? []).map((m) => ({
    token: m.token,
    requisiteName: m.requisiteName,
  }));

  let printForms: any[] = Array.isArray((props as any).printForms)
    ? ((props as any).printForms as any[])
    : [];

  let updatedForm: any;
  if (input.printFormId) {
    // update existing by id
    printForms = printForms.map((pf) => {
      if (pf && pf.id === input.printFormId) {
        updatedForm = {
          ...pf,
          enabled: true,
          templateUrl,
          templateName: input.fileName,
          label: input.label ?? pf.label ?? pf.templateName ?? pf.token ?? "",
          mappings:
            normalizedMappings.length > 0
              ? normalizedMappings
              : (pf.mappings ?? []),
        };
        return updatedForm;
      }
      return pf;
    });
  } else {
    // create new form entry
    const newId = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    updatedForm = {
      id: newId,
      enabled: true,
      templateUrl,
      templateName: input.fileName,
      label: input.label ?? input.fileName,
      mappings: normalizedMappings,
    };
    printForms.push(updatedForm);
  }

  (props as any).printForms = printForms;

  // maintain backward compatibility by mirroring the last updated form into printForm
  (props as any).printForm = updatedForm;

  const updated = await db.processSchemaElement.update({
    where: { id: element.id },
    data: { properties: JSON.stringify(props) },
  });

  // Optionally save into global library
  try {
    if (input.alsoSaveToLibrary) {
      await db.printFormTemplate.create({
        data: {
          label:
            updatedForm.label || updatedForm.templateName || "Печатная форма",
          templateUrl,
          templateName: updatedForm.templateName || input.fileName,
          mappings:
            normalizedMappings && normalizedMappings.length > 0
              ? JSON.stringify(normalizedMappings)
              : null,
        },
      });
    }
  } catch (e) {
    console.error(
      "Failed to save print form into library",
      (e as Error)?.message,
    );
  }

  return {
    elementId: updated.id,
    templateUrl,
    printForm: updatedForm,
  };
}

export async function updatePrintFormConfig(input: {
  elementId: string;
  mappings: Array<{ token: string; requisiteName: string }>;
  enabled?: boolean;
  printFormId?: string; // optional target form id
  label?: string; // optional display name update
  alsoSaveToLibrary?: boolean; // when true, upsert in global PrintFormTemplate (defaults to true)
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const element = await db.processSchemaElement.findUnique({
    where: { id: input.elementId },
  });
  if (!element) throw new Error("Элемент процесса не найден");
  let props: Record<string, any> = {};
  try {
    props = element.properties
      ? (JSON.parse(element.properties as string) as Record<string, any>)
      : {};
  } catch {
    props = {};
  }

  // ensure array exists for multi-print support
  if (!Array.isArray((props as any).printForms)) {
    const single = (props as any).printForm;
    (props as any).printForms = single ? [single] : [];
  }
  const normalizedMappings = (input.mappings ?? []).map((m) => ({
    token: m.token,
    requisiteName: m.requisiteName,
  }));

  // If no id is provided but there is no active form yet, create an empty shell so that Save State can add one without file upload
  if (!input.printFormId && ((props as any).printForms as any[]).length === 0) {
    const shellId = `${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    (props as any).printForms = [
      {
        id: shellId,
        enabled: input.enabled ?? true,
        label: input.label || "Печатная форма",
        templateUrl: null,
        templateName: null,
        mappings: normalizedMappings,
      },
    ];
    (props as any).printForm = (props as any).printForms[0];
  }

  if (input.printFormId) {
    (props as any).printForms = ((props as any).printForms as any[]).map(
      (pf) =>
        pf && pf.id === input.printFormId
          ? {
              ...pf,
              enabled: input.enabled ?? pf.enabled ?? true,
              mappings:
                normalizedMappings.length > 0
                  ? normalizedMappings
                  : (pf.mappings ?? []),
              label: input.label ?? pf.label,
            }
          : pf,
    );
    const active = ((props as any).printForms as any[]).find(
      (pf: any) => pf.id === input.printFormId,
    );
    if (active) (props as any).printForm = active;
  } else {
    // create or update a new entry when no id is provided
    const newId = `${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const newForm = {
      id: newId,
      enabled: input.enabled ?? true,
      label: input.label || "Печатная форма",
      templateUrl: (props as any).printForm?.templateUrl,
      templateName: (props as any).printForm?.templateName,
      mappings: normalizedMappings,
    } as any;
    // push as a new managed form entry
    (props as any).printForms = [
      ...((props as any).printForms as any[]),
      newForm,
    ];
    (props as any).printForm = newForm;
  }

  await db.processSchemaElement.update({
    where: { id: input.elementId },
    data: { properties: JSON.stringify(props) },
  });

  // Save/Update library copy (default true)
  try {
    const shouldSync = input.alsoSaveToLibrary !== false; // default to true
    if (shouldSync) {
      const active = ((props as any).printForms as any[])[
        ((props as any).printForms as any[]).length - 1
      ];
      if (active?.templateUrl) {
        const label = active.label || active.templateName || "Печатная форма";
        const mappingsJson =
          active.mappings && active.mappings.length > 0
            ? JSON.stringify(active.mappings)
            : null;
        // Upsert by templateUrl + templateName
        const existing = await db.printFormTemplate.findFirst({
          where: {
            templateUrl: active.templateUrl,
            templateName: active.templateName || label,
            isActive: true,
          },
        });
        if (existing) {
          await db.printFormTemplate.update({
            where: { id: existing.id },
            data: { label, mappings: mappingsJson },
          });
        } else {
          await db.printFormTemplate.create({
            data: {
              label,
              templateUrl: active.templateUrl,
              templateName: active.templateName || label,
              mappings: mappingsJson,
            },
          });
        }
      }
    }
  } catch (e) {
    console.error("Failed to upsert library print form", (e as Error)?.message);
  }

  return { ok: true };
}

// List Print Forms for element (multi-print support)
export async function listPrintForms(input: { elementId: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const element = await db.processSchemaElement.findUnique({
    where: { id: input.elementId },
  });
  if (!element) throw new Error("Элемент процесса не найден");
  let props: Record<string, any> = {};
  try {
    props = element.properties
      ? (JSON.parse(element.properties as string) as Record<string, any>)
      : {};
  } catch {
    props = {};
  }
  const forms = Array.isArray((props as any).printForms)
    ? ((props as any).printForms as any[])
    : (props as any).printForm
      ? [(props as any).printForm as any]
      : [];
  return forms;
}

export async function reorderPrintForms(input: {
  elementId: string;
  orderedIds: string[];
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const element = await db.processSchemaElement.findUnique({
    where: { id: input.elementId },
  });
  if (!element) throw new Error("Элемент процесса не найден");
  let props: any = {};
  try {
    props = element.properties ? JSON.parse(element.properties as string) : {};
  } catch {
    props = {};
  }
  const current: any[] = Array.isArray(props.printForms)
    ? props.printForms
    : props.printForm
      ? [props.printForm]
      : [];
  const idsSet = new Set(current.map((f) => f?.id));
  if (
    current.length !== input.orderedIds.length ||
    input.orderedIds.some((id) => !idsSet.has(id))
  ) {
    throw new Error("Неверный список печатных форм для перестановки");
  }
  const byId = new Map(current.map((f) => [f.id, f] as const));
  const reordered = input.orderedIds.map((id) => byId.get(id));
  props.printForms = reordered;
  // поддерживаем обратную совместимость: активной считаем первую включенную, иначе первый элемент
  const active = reordered.find((f: any) => f && f.enabled) || reordered[0];
  if (active) props.printForm = active;

  await db.processSchemaElement.update({
    where: { id: input.elementId },
    data: { properties: JSON.stringify(props) },
  });
  return { ok: true };
}

// Global Print Form Templates Library API
export async function listPrintFormTemplates(input?: { query?: string }) {
  await getAuth({ required: true });
  const where: any = { isActive: true };
  if (input?.query) {
    where.OR = [
      { label: { contains: input.query } },
      { templateName: { contains: input.query } },
    ];
  }
  return await db.printFormTemplate.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
}

export async function createPrintFormTemplate(input: {
  label: string;
  templateUrl: string;
  templateName: string;
  mappings?: Array<{ token: string; requisiteName: string }>;
}) {
  await getAuth({ required: true });
  return await db.printFormTemplate.create({
    data: {
      label: input.label,
      templateUrl: input.templateUrl,
      templateName: input.templateName,
      mappings:
        input.mappings && input.mappings.length > 0
          ? JSON.stringify(input.mappings)
          : null,
    },
  });
}

export async function updatePrintFormTemplate(input: {
  id: string;
  label?: string;
  mappings?: Array<{ token: string; requisiteName: string }>;
  isActive?: boolean;
}) {
  await getAuth({ required: true });
  const data: any = {};
  if (input.label !== undefined) data.label = input.label;
  if (input.mappings !== undefined)
    data.mappings = input.mappings ? JSON.stringify(input.mappings) : null;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  return await db.printFormTemplate.update({ where: { id: input.id }, data });
}

export async function deletePrintFormTemplate(input: { id: string }) {
  await getAuth({ required: true });
  return await db.printFormTemplate.update({
    where: { id: input.id },
    data: { isActive: false },
  });
}

// Checklist Templates Library API

// Export draft checklist items (not yet saved as a template) to an Excel file and return a URL
export async function exportChecklistDraftToExcel(input: {
  items: Array<{
    name: string;
    description?: string;
    isRequired?: boolean;
    allowDocuments?: boolean;
    allowComments?: boolean;
    fileTypes?: string[];
    maxFileSize?: number;
    order?: number;
  }>;
}) {
  await getAuth({ required: true });

  const rows = (input.items || []).map((c, idx) => ({
    Name: c.name,
    Description: c.description ?? "",
    Required: !!c.isRequired,
    AllowDocuments: c.allowDocuments ?? true,
    AllowComments: c.allowComments ?? true,
    FileTypes: Array.isArray(c.fileTypes) ? c.fileTypes.join(", ") : "",
    MaxFileSizeMB: typeof c.maxFileSize === "number" ? c.maxFileSize : "",
    Order: typeof c.order === "number" ? c.order : idx,
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows, {
    header: [
      "Name",
      "Description",
      "Required",
      "AllowDocuments",
      "AllowComments",
      "FileTypes",
      "MaxFileSizeMB",
      "Order",
    ],
  });
  XLSX.utils.book_append_sheet(wb, ws, "Checklist Draft");
  const buffer: Buffer = XLSX.write(wb, {
    type: "buffer",
    bookType: "xlsx",
  }) as Buffer;
  const b64 = buffer.toString("base64");
  const url = await upload({
    bufferOrBase64:
      "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," +
      b64,
    fileName: `checklist-draft-${Date.now()}.xlsx`,
  });
  return { url, count: rows.length };
}

// Parse an uploaded Excel file into draft checklist items (client will decide what to do with them)
export async function importChecklistDraftFromExcel(input: { base64: string }) {
  await getAuth({ required: true });

  const base64 = (() => {
    const commaIdx = input.base64.indexOf(",");
    return commaIdx >= 0 ? input.base64.slice(commaIdx + 1) : input.base64;
  })();
  const buf = Buffer.from(base64, "base64");
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("В файле не найдены листы");
  const ws = wb.Sheets[sheetName]!;
  const rawRows: Array<Record<string, any>> = XLSX.utils.sheet_to_json(ws, {
    defval: "",
  });

  const normKey = (s: string) => s.toLowerCase().trim();
  const toBool = (v: any) =>
    ["true", "1", "да", "yes", "y", "истина"].includes(
      String(v).trim().toLowerCase(),
    );
  const toInt = (v: any) => {
    const n = parseInt(String(v).trim());
    return Number.isFinite(n) ? n : null;
  };
  const parseTypes = (v: any) => {
    if (!v) return [] as string[];
    return String(v)
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const items = rawRows.map((r, idx) => {
    const get = (keys: string[]) => {
      for (const k of keys) {
        const found = Object.keys(r).find((kk) => normKey(kk) === normKey(k));
        if (found) return (r as any)[found];
      }
      return "";
    };
    const name = get(["Name", "Название", "Наименование"]);
    const description = get(["Description", "Описание"]);
    const required = get(["Required", "Обязательный", "Обязателен"]);
    const allowDocs = get([
      "AllowDocuments",
      "РазрешитьДокументы",
      "Документы",
    ]);
    const allowComments = get(["AllowComments", "Комментарии"]);
    const fileTypes = get(["FileTypes", "ТипыФайлов", "Форматы"]);
    const maxFileSize = get(["MaxFileSizeMB", "МаксРазмерМБ", "МаксРазмер"]);
    const order = get(["Order", "Порядок"]);

    return {
      name: String(name || `Документ ${idx + 1}`),
      description: description ? String(description) : undefined,
      isRequired: toBool(required),
      allowDocuments: allowDocs === "" ? true : toBool(allowDocs),
      allowComments: allowComments === "" ? true : toBool(allowComments),
      fileTypes: parseTypes(fileTypes),
      maxFileSize: toInt(maxFileSize) ?? undefined,
      order: toInt(order) ?? idx,
    };
  });

  return { items };
}

export async function createChecklistTemplate(input: {
  label: string;
  description?: string;
  isRequired?: boolean;
  allowDocuments?: boolean;
  allowComments?: boolean;
  fileTypes?: string[];
  maxFileSize?: number;
  order?: number;
  items?: Array<{
    name: string;
    description?: string;
    isRequired?: boolean;
    allowDocuments?: boolean;
    allowComments?: boolean;
    fileTypes?: string[];
    maxFileSize?: number;
    order?: number;
  }>;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const template = await db.checklistTemplate.create({
    data: {
      label: input.label,
      description: input.description,
      isRequired: input.isRequired ?? true,
      allowDocuments: input.allowDocuments ?? true,
      allowComments: input.allowComments ?? true,
      fileTypes: input.fileTypes ? JSON.stringify(input.fileTypes) : null,
      maxFileSize: input.maxFileSize,
      order: input.order ?? 0,
    },
  });

  if (Array.isArray(input.items) && input.items.length > 0) {
    await db.checklistTemplateItem.createMany({
      data: input.items.map((it, idx) => ({
        templateId: template.id,
        name: it.name,
        description: it.description ?? null,
        isRequired: it.isRequired ?? true,
        allowDocuments: it.allowDocuments ?? true,
        allowComments: it.allowComments ?? true,
        fileTypes: it.fileTypes ? JSON.stringify(it.fileTypes) : null,
        maxFileSize: typeof it.maxFileSize === "number" ? it.maxFileSize : null,
        order: typeof it.order === "number" ? it.order : idx,
      })),
    });
  }

  return template;
}

export async function listChecklistTemplates(input?: { query?: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const where: any = { isActive: true };
  if (input?.query) where.label = { contains: input.query };
  return await db.checklistTemplate.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      _count: { select: { items: true } },
    },
  });
}

export async function updateChecklistTemplate(input: {
  id: string;
  label?: string;
  description?: string;
  isRequired?: boolean;
  allowDocuments?: boolean;
  allowComments?: boolean;
  fileTypes?: string[] | null;
  maxFileSize?: number | null;
  order?: number;
  isActive?: boolean;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const { id, fileTypes, ...rest } = input;
  const data: any = { ...rest };
  if (fileTypes !== undefined)
    data.fileTypes = fileTypes ? JSON.stringify(fileTypes) : null;
  return await db.checklistTemplate.update({ where: { id }, data });
}

export async function listChecklistTemplateItems(input: {
  templateId: string;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  return await db.checklistTemplateItem.findMany({
    where: { templateId: input.templateId },
    orderBy: { order: "asc" },
  });
}

export async function exportChecklistTemplateToExcel(input: {
  templateId: string;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const items = await db.checklistTemplateItem.findMany({
    where: { templateId: input.templateId },
    orderBy: { order: "asc" },
  });
  const rows = items.map((c, idx) => ({
    Name: c.name,
    Description: c.description ?? "",
    Required: !!c.isRequired,
    AllowDocuments: !!c.allowDocuments,
    AllowComments: !!c.allowComments,
    FileTypes: (() => {
      try {
        return c.fileTypes
          ? (JSON.parse(c.fileTypes as string) as string[]).join(", ")
          : "";
      } catch {
        return c.fileTypes ?? "";
      }
    })(),
    MaxFileSizeMB: c.maxFileSize ?? "",
    Order: c.order ?? idx,
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows, {
    header: [
      "Name",
      "Description",
      "Required",
      "AllowDocuments",
      "AllowComments",
      "FileTypes",
      "MaxFileSizeMB",
      "Order",
    ],
  });
  XLSX.utils.book_append_sheet(wb, ws, "Checklist Template");
  const buffer: Buffer = XLSX.write(wb, {
    type: "buffer",
    bookType: "xlsx",
  }) as Buffer;
  const b64 = buffer.toString("base64");
  const url = await upload({
    bufferOrBase64: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${b64}`,
    fileName: `checklist-template-${input.templateId}-${Date.now()}.xlsx`,
  });
  return { url, count: items.length };
}

export async function importChecklistTemplateFromExcel(input: {
  templateId: string;
  base64: string;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const base64 = (() => {
    const commaIdx = input.base64.indexOf(",");
    return commaIdx >= 0 ? input.base64.slice(commaIdx + 1) : input.base64;
  })();
  const buf = Buffer.from(base64, "base64");
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("В файле не найдены листы");
  const ws = wb.Sheets[sheetName]!;
  const rawRows: Array<Record<string, any>> = XLSX.utils.sheet_to_json(ws, {
    defval: "",
  });
  const normKey = (s: string) => s.toLowerCase().trim();
  const toBool = (v: any) =>
    ["true", "1", "да", "yes", "y", "истина"].includes(
      String(v).trim().toLowerCase(),
    );
  const toInt = (v: any) => {
    const n = parseInt(String(v).trim());
    return Number.isFinite(n) ? n : null;
  };
  const parseTypes = (v: any) => {
    if (!v) return null;
    const arr = String(v)
      .split(/[,\n;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return arr.length ? JSON.stringify(arr) : null;
  };

  const data = rawRows.map((r, idx) => {
    const get = (keys: string[]) => {
      for (const k of keys) {
        const found = Object.keys(r).find((kk) => normKey(kk) === normKey(k));
        if (found) return (r as any)[found];
      }
      return "";
    };
    const name = get(["Name", "Название", "Наименование"]);
    const description = get(["Description", "Описание"]);
    const required = get(["Required", "Обязательный", "Обязателен"]);
    const allowDocs = get([
      "AllowDocuments",
      "РазрешитьДокументы",
      "Документы",
    ]);
    const allowComments = get(["AllowComments", "Комментарии"]);
    const fileTypes = get(["FileTypes", "ТипыФайлов", "Форматы"]);
    const maxFileSize = get(["MaxFileSizeMB", "МаксРазмерМБ", "МаксРазмер"]);
    const order = get(["Order", "Порядок"]);
    return {
      templateId: input.templateId,
      name: String(name || `Документ ${idx + 1}`),
      description: description ? String(description) : null,
      isRequired: toBool(required),
      allowDocuments: allowDocs === "" ? true : toBool(allowDocs),
      allowComments: allowComments === "" ? true : toBool(allowComments),
      fileTypes: parseTypes(fileTypes),
      maxFileSize: toInt(maxFileSize) ?? undefined,
      order: toInt(order) ?? idx,
    };
  });
  await db.checklistTemplateItem.deleteMany({
    where: { templateId: input.templateId },
  });
  if (data.length > 0) {
    for (const d of data) {
      await db.checklistTemplateItem.create({ data: d as any });
    }
  }
  return { imported: data.length };
}

export async function deleteChecklistTemplate(input: { id: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  return await db.checklistTemplate.update({
    where: { id: input.id },
    data: { isActive: false },
  });
}

// Notification Templates Library API
export async function createNotificationTemplate(input: {
  name: string;
  trigger: string;
  template: string;
  recipients: string[];
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  return await db.notificationTemplate.create({
    data: {
      name: input.name,
      trigger: input.trigger,
      template: input.template,
      recipients: JSON.stringify(input.recipients ?? []),
    },
  });
}

export async function listNotificationTemplates(input?: { query?: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const where: any = { isActive: true };
  if (input?.query) where.name = { contains: input.query };
  return await db.notificationTemplate.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}

export async function updateNotificationTemplate(input: {
  id: string;
  name?: string;
  trigger?: string;
  template?: string;
  recipients?: string[] | null;
  isActive?: boolean;
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const { id, recipients, ...rest } = input;
  const data: any = { ...rest };
  if (recipients !== undefined)
    data.recipients = recipients ? JSON.stringify(recipients) : "[]";
  return await db.notificationTemplate.update({ where: { id }, data });
}

export async function deleteNotificationTemplate(input: { id: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  return await db.notificationTemplate.update({
    where: { id: input.id },
    data: { isActive: false },
  });
}

// Generate Print Form for Application
export async function generatePrintFormForApplication(input: {
  applicationId: string;
  elementId: string; // process element with printForm config
  printFormId?: string; // optional: which print form to generate
}): Promise<{ url: string }> {
  const { userId } = await getAuth({ required: true });

  const application = await db.serviceApplication.findFirst({
    where: {
      id: input.applicationId,
      OR: [{ applicantId: userId }, { assignedTo: userId }],
    },
  });
  if (!application) throw new Error("Заявка не найдена или доступ запрещён");

  const element = await db.processSchemaElement.findUnique({
    where: { id: input.elementId },
  });
  if (!element) throw new Error("Элемент процесса не найден");

  // Read printForm config (with multi-print support)
  let props: Record<string, any> = {};
  try {
    props = element.properties
      ? (JSON.parse(element.properties as string) as Record<string, any>)
      : {};
  } catch {
    props = {};
  }

  // Resolve target print form
  let targetForm:
    | {
        enabled?: boolean;
        templateUrl?: string;
        templateName?: string;
        mappings?: Array<{ token: string; requisiteName: string }>;
        id?: string;
        label?: string;
      }
    | undefined;

  const formsArr = Array.isArray((props as any).printForms)
    ? ((props as any).printForms as any[])
    : [];

  if (input.printFormId) {
    targetForm = formsArr.find((pf: any) => pf.id === input.printFormId);
  }
  if (!targetForm) {
    if (formsArr.length > 0) {
      // pick first enabled, else first
      targetForm = formsArr.find((pf: any) => pf.enabled) ?? formsArr[0];
    } else if ((props as any).printForm) {
      targetForm = (props as any).printForm as any;
    }
  }

  if (!targetForm?.enabled || !targetForm?.templateUrl) {
    throw new Error("Для данного процесса не настроена печатная форма");
  }

  // Build mapping token -> value from saved form data
  const mappings: Array<{ token: string; requisiteName: string }> =
    targetForm.mappings ?? [];
  let formData: Record<string, any> = {};
  if (application.formData) {
    try {
      formData = JSON.parse(application.formData) as Record<string, any>;
    } catch {}
  }
  const valueByToken: Record<string, string> = {};
  for (const m of mappings) {
    const v = formData[`byName_${m.requisiteName}`];
    valueByToken[m.token] = v == null ? "" : String(v);
  }

  const templateNameOrUrl = (
    targetForm.templateName ||
    targetForm.templateUrl ||
    ""
  ).toLowerCase();
  const escapeXml = (s: string) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  if (templateNameOrUrl.endsWith(".docx")) {
    try {
      const res = await fetch(targetForm.templateUrl!);
      if (!res.ok) throw new Error("DOCX template download failed");
      const ab = await res.arrayBuffer();

      // Try robust rendering via docxtemplater (handles split runs in Word)
      try {
        const zip = new PizZip(ab);
        // Determine delimiters from the configured tokens (Правила подстановки)
        const tokens = Object.keys(valueByToken);
        const analyze = (t: string) => {
          const m = t.match(/[A-Za-z0-9_.-]/);
          const firstIdx = m ? t.indexOf(m[0]) : 0;
          let lastIdx = -1;
          for (let i = t.length - 1; i >= 0; i--) {
            const ch = t[i] as string;
            if (/[A-Za-z0-9_.-]/.test(ch)) {
              lastIdx = i;
              break;
            }
          }
          const start = t.slice(0, firstIdx);
          const end = lastIdx >= 0 ? t.slice(lastIdx + 1) : "";
          const key = lastIdx >= firstIdx ? t.slice(firstIdx, lastIdx + 1) : t;
          return { start, end, key };
        };
        let startDel = "<";
        let endDel = ">";
        if (tokens.length > 0) {
          const f = analyze(tokens[0]!);
          let consistent = !!(f.start || f.end);
          for (let i = 1; i < tokens.length; i++) {
            const a = analyze(tokens[i]!);
            if (a.start !== f.start || a.end !== f.end) {
              consistent = false;
              break;
            }
          }
          if (consistent) {
            startDel = f.start || startDel;
            endDel = f.end || endDel;
          }
        }

        // Decide whether to use custom delimiters only if all tokens share the same wrapping
        let useDelimiters = false;
        (function decideDelimiters() {
          if (tokens.length === 0) return;
          const f = analyze(tokens[0]!);
          let consistent = !!(f.start || f.end);
          for (let i = 1; i < tokens.length; i++) {
            const a = analyze(tokens[i]!);
            if (a.start !== f.start || a.end !== f.end) {
              consistent = false;
              break;
            }
          }
          if (consistent) {
            startDel = f.start || startDel;
            endDel = f.end || endDel;
            useDelimiters = true;
          }
        })();

        const docOptions: any = { paragraphLoop: true, linebreaks: true };
        if (useDelimiters)
          docOptions.delimiters = { start: startDel, end: endDel };
        const doc = new Docxtemplater(zip, docOptions as any);

        const data: Record<string, string> = {};
        for (const t of tokens) {
          const a = analyze(t);
          const key = a.key;
          data[key] = valueByToken[t] ?? "";
        }

        // Render with robust engine (handles split runs)
        // Use explicit setData + render for maximum compatibility
        (doc as any).setData ? (doc as any).setData(data) : undefined;
        try {
          // Some versions support doc.render(data), but setData + render() is more widely compatible
          if ((doc as any).render.length === 0) {
            (doc as any).render();
          } else {
            (doc as any).render(data);
          }
        } catch (e) {
          throw e;
        }

        // Post-process document.xml to replace any leftover tokens (including XML-escaped)
        try {
          const dz = doc.getZip();
          const fileObj: any = (dz as any).file
            ? (dz as any).file("word/document.xml")
            : undefined;
          if (fileObj) {
            // PizZip exposes asText() on file objects
            let xml: string | undefined;
            try {
              xml = (fileObj.asText && fileObj.asText()) || undefined;
            } catch {
              xml = undefined;
            }
            if (xml !== undefined) {
              for (const [token, val] of Object.entries(valueByToken)) {
                const escToken = token
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/\"/g, "&quot;")
                  .replace(/'/g, "&apos;");
                const escVal = escapeXml(val);
                xml = xml.split(token).join(escVal);
                xml = xml.split(escToken).join(escVal);
              }
              (dz as any).file("word/document.xml", xml);
            }
          }
        } catch {}

        const out = doc.getZip().generate({ type: "uint8array" });
        const b64 = Buffer.from(out).toString("base64");
        const url = await upload({
          bufferOrBase64:
            "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64," +
            b64,
          fileName: `printform-${application.id}-${targetForm?.id ?? "default"}-${Date.now()}.docx`,
        });
        return { url };
      } catch {
        // ignore and fallback to manual replacement

        // If templating fails, fall back to naive replacement inside document.xml
        const zip = await JSZip.loadAsync(ab);
        const docXml = zip.file("word/document.xml");
        if (!docXml) throw new Error("document.xml not found in DOCX");
        let xml = await docXml.async("string");

        for (const [token, val] of Object.entries(valueByToken)) {
          // Replace plain tokens where not split
          xml = xml.split(token).join(escapeXml(val));
          // Replace tokens that may already be XML-escaped inside the DOCX XML
          const tokenAsEntities = token
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
          xml = xml.split(tokenAsEntities).join(escapeXml(val));
        }

        zip.file("word/document.xml", xml);
        const out = await zip.generateAsync({ type: "uint8array" });
        const b64 = Buffer.from(out).toString("base64");
        const url = await upload({
          bufferOrBase64:
            "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64," +
            b64,
          fileName: `printform-${application.id}-${targetForm?.id ?? "default"}-${Date.now()}.docx`,
        });
        return { url };
      }
    } catch (e) {
      console.error("DOCX generation failed", (e as Error)?.message);
      // Fallback below
    }
  }

  // Fallback: generate text summary when not DOCX or on failure
  const lines: string[] = [];
  lines.push(`Template: ${targetForm.templateName ?? targetForm.templateUrl}`);
  lines.push("---- Автозаполнение ----");
  for (const [token, val] of Object.entries(valueByToken)) {
    lines.push(`${token} => ${val}`);
  }
  lines.push("-----------------------");
  const contentBase64 = Buffer.from(lines.join("\n"), "utf-8").toString(
    "base64",
  );
  const url = await upload({
    bufferOrBase64: `data:text/plain;base64,${contentBase64}`,
    fileName: `printform-${application.id}-${targetForm?.id ?? "default"}-${Date.now()}.txt`,
  });
  return { url };
}

// Approval Stages Management
export async function createApprovalStage(input: {
  requisiteId: string;
  name: string;
  description?: string;
  order?: number;
  isRequired?: boolean;
  approverRole?: string;
  department?: string;
  executionType?: string;
  deadlineDays?: number;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.approvalStage.create({
    data: {
      requisiteId: input.requisiteId,
      name: input.name,
      description: input.description,
      order: input.order || 0,
      isRequired: input.isRequired !== undefined ? input.isRequired : true,
      approverRole: input.approverRole,
      department: input.department,
      executionType: input.executionType || "sequential",
      deadlineDays: input.deadlineDays,
    },
  });
}

export async function listApprovalStages(input: { requisiteId: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.approvalStage.findMany({
    where: { requisiteId: input.requisiteId },
    orderBy: { order: "asc" },
  });
}

export async function updateApprovalStage(input: {
  id: string;
  name?: string;
  description?: string;
  order?: number;
  isRequired?: boolean;
  approverRole?: string;
  department?: string;
  executionType?: string;
  deadlineDays?: number;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const { id, ...updateData } = input;

  return await db.approvalStage.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteApprovalStage(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  return await db.approvalStage.delete({
    where: { id: input.id },
  });
}

// File attachments for checklist items in application
export async function attachChecklistFiles(input: {
  applicationId: string;
  elementId: string; // process element owning the checklist item
  checklistId: string; // specific checklist row id
  files: Array<{ base64: string; name: string }>;
  comment?: string;
}) {
  const { userId } = await getAuth({ required: true });

  // Verify ownership or assignment
  const application = await db.serviceApplication.findFirst({
    where: {
      id: input.applicationId,
      OR: [{ applicantId: userId }, { assignedTo: userId }],
    },
  });
  if (!application)
    throw new Error("Заявка не найдена или у вас нет прав доступа");

  // Upload files and collect URLs
  const urls: string[] = [];
  for (const f of input.files) {
    const url = await upload({ bufferOrBase64: f.base64, fileName: f.name });
    urls.push(url);
  }

  // Persist into application.formData under a deterministic key
  let formData: Record<string, any> = {};
  try {
    formData = application.formData
      ? (JSON.parse(application.formData as string) as Record<string, any>)
      : {};
  } catch {
    formData = {};
  }
  const key = `${input.elementId}_checklist_${input.checklistId}_files`;
  const commentKey = `${input.elementId}_comment_${input.checklistId}`;
  const prev: string[] = Array.isArray(formData[key])
    ? (formData[key] as string[])
    : [];
  formData[key] = [...prev, ...urls];
  if (typeof input.comment === "string") formData[commentKey] = input.comment;

  await db.serviceApplication.update({
    where: { id: input.applicationId },
    data: { formData: JSON.stringify(formData) },
  });

  return { uploaded: urls.length, urls };
}

export async function attachPrintFormFile(input: {
  applicationId: string;
  elementId: string;
  requisiteId: string;
  which: "template" | "signed";
  file: { base64: string; name: string };
}) {
  const { userId } = await getAuth({ required: true });
  const application = await db.serviceApplication.findFirst({
    where: {
      id: input.applicationId,
      OR: [{ applicantId: userId }, { assignedTo: userId }],
    },
  });
  if (!application)
    throw new Error("Заявка не найдена или у вас нет прав доступа");

  const url = await upload({
    bufferOrBase64: input.file.base64,
    fileName: input.file.name,
  });

  let formData: Record<string, any> = {};
  try {
    formData = application.formData
      ? (JSON.parse(application.formData as string) as Record<string, any>)
      : {};
  } catch {
    formData = {};
  }

  const baseKey = `${input.elementId}_${input.requisiteId}`;
  const nameKey = `${baseKey}_${input.which}`;
  const urlKey = `${nameKey}_url`;
  formData[nameKey] = input.file.name;
  formData[urlKey] = url;

  await db.serviceApplication.update({
    where: { id: input.applicationId },
    data: { formData: JSON.stringify(formData) },
  });

  return { url };
}

// Attach a signed document for a specific print form (not tied to a requisite field)
export async function attachPrintFormSigned(input: {
  applicationId: string;
  elementId: string;
  printFormId: string;
  file: { base64: string; name: string };
}) {
  const { userId } = await getAuth({ required: true });
  const application = await db.serviceApplication.findFirst({
    where: {
      id: input.applicationId,
      OR: [{ applicantId: userId }, { assignedTo: userId }],
    },
  });
  if (!application)
    throw new Error("Заявка не найдена или у вас нет прав доступа");

  const url = await upload({
    bufferOrBase64: input.file.base64,
    fileName: input.file.name,
  });

  let formData: Record<string, any> = {};
  try {
    formData = application.formData
      ? (JSON.parse(application.formData as string) as Record<string, any>)
      : {};
  } catch {
    formData = {};
  }

  const baseKey = `${input.elementId}_printform_${input.printFormId}`;
  const nameKey = `${baseKey}_signed`;
  const urlKey = `${nameKey}_url`;
  formData[nameKey] = input.file.name;
  formData[urlKey] = url;

  await db.serviceApplication.update({
    where: { id: input.applicationId },
    data: { formData: JSON.stringify(formData) },
  });

  return { url };
}

// Service Applications Management
export async function listPublishedSchemas() {
  await getAuth({ required: true });

  return await db.processSchema.findMany({
    where: {
      isPublished: true,
      isActive: true,
    },
    include: {
      service: { select: { name: true } },
      _count: {
        select: { elements: true, connections: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createServiceApplication(input: {
  title: string;
  description?: string;
  schemaId: string;
  formData?: any;
}) {
  const { userId } = await getAuth({ required: true });

  return await db.serviceApplication.create({
    data: {
      title: input.title,
      description: input.description,
      schemaId: input.schemaId,
      applicantId: userId,
      assignedTo: userId, // первый держатель процесса — заявитель
      formData: input.formData ? JSON.stringify(input.formData) : null,
    },
    include: {
      schema: {
        select: { name: true, service: { select: { name: true } } },
      },
    },
  });
}

export async function listUserServiceApplications() {
  const { userId } = await getAuth({ required: true });

  // Показываем в списке все заявки, где пользователь — заявитель или текущий держатель
  return await db.serviceApplication.findMany({
    where: { OR: [{ applicantId: userId }, { assignedTo: userId }] },
    include: {
      schema: {
        select: {
          name: true,
          service: { select: { name: true } },
          elements: {
            select: {
              id: true,
              name: true,
              elementType: true,
              properties: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getServiceApplication(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  // Load application without access filter first
  const application = await db.serviceApplication.findUnique({
    where: { id: input.id },
    include: {
      schema: {
        select: { name: true, service: { select: { name: true } } },
      },
    },
  });

  if (!application) {
    throw new Error("Заявка не найдена");
  }

  // Access rules:
  // - DRAFT: заявитель или текущий держатель (assignedTo) могут открывать
  // - Прочие статусы: только текущий держатель (assignedTo)
  // - Администраторы услуг и администраторы — всегда могут открывать
  const me = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  const isAdmin = Boolean(me?.isAdmin || me?.isServiceAdmin);

  const isApplicant = application.applicantId === userId;
  const isAssignee = application.assignedTo === userId;
  const isDraft = application.status === "DRAFT";

  const allowed = isAdmin || (isDraft ? isApplicant || isAssignee : isAssignee);

  if (!allowed) {
    throw new Error(
      "Доступ ограничен: заявку может открыть только текущий держатель процесса",
    );
  }

  return application;
}

export async function updateServiceApplication(input: {
  id: string;
  title?: string;
  description?: string;
  formData?: any;
  status?: string;
  currentStage?: string;
}) {
  const { userId } = await getAuth({ required: true });

  // Verify ownership or assignment
  const application = await db.serviceApplication.findFirst({
    where: {
      id: input.id,
      OR: [{ applicantId: userId }, { assignedTo: userId }],
    },
  });

  if (!application) {
    throw new Error("Заявка не найдена или у вас нет прав доступа");
  }

  const { id, formData, ...updateData } = input;
  const finalUpdateData: any = { ...updateData };

  if (formData !== undefined) {
    finalUpdateData.formData = formData ? JSON.stringify(formData) : null;
  }

  return await db.serviceApplication.update({
    where: { id },
    data: finalUpdateData,
    include: {
      schema: {
        select: { name: true, service: { select: { name: true } } },
      },
    },
  });
}

export async function deleteServiceApplication(input: { id: string }) {
  const { userId } = await getAuth({ required: true });

  // Verify ownership
  const application = await db.serviceApplication.findFirst({
    where: { id: input.id, applicantId: userId },
  });

  if (!application) {
    throw new Error("Заявка не найдена или у вас нет прав доступа");
  }

  return await db.serviceApplication.delete({
    where: { id: input.id },
  });
}

// Staff assignment
export async function listAssignableUsers(input?: { query?: string }) {
  const { userId } = await getAuth({ required: true });
  const where: any = {};
  if (input?.query) {
    const q = input.query;
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { username: { contains: q } },
      { handle: { contains: q } },
    ];
  }
  const users = await db.user.findMany({
    where,
    select: { id: true, name: true, email: true, handle: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  const sorted = users.sort((a, b) =>
    a.id === userId ? -1 : b.id === userId ? 1 : 0,
  );
  return sorted;
}

// List users filtered by global role (applicant, executor, approver)
export async function listUsersByRole(input: {
  roleType: string;
  query?: string;
}) {
  const { userId } = await getAuth({ required: true });
  const roleType = input.roleType;
  if (!roleType) throw new Error("roleType is required");
  const whereUser: any = {};
  if (input.query) {
    const q = input.query;
    whereUser.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { username: { contains: q } },
      { handle: { contains: q } },
    ];
  }
  const roles = await db.userRole.findMany({
    where: { roleType },
    select: { userId: true },
  });
  const ids = roles.map((r) => r.userId);
  const users = await db.user.findMany({
    where: { id: { in: ids }, ...whereUser },
    select: { id: true, name: true, email: true, handle: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  const sorted = users.sort((a, b) =>
    a.id === userId ? -1 : b.id === userId ? 1 : 0,
  );
  return sorted;
}

// Seed demo users with roles for quick testing
export async function _seedDemoUsersAndRoles() {
  const demos: Array<{ username: string; name: string; roles: string[] }> = [
    { username: "applicant1", name: "Иванов Алексей", roles: ["applicant"] },
    { username: "applicant2", name: "Сидорова Мария", roles: ["applicant"] },
    { username: "executor1", name: "Петров Иван", roles: ["executor"] },
    { username: "executor2", name: "Смирнова Анна", roles: ["executor"] },
    { username: "approver1", name: "Кузнецов Сергей", roles: ["approver"] },
    { username: "approver2", name: "Орлова Дарья", roles: ["approver"] },
    { username: "approver3", name: "Егоров Павел", roles: ["approver"] },
  ];

  for (const d of demos) {
    let user = await db.user.findUnique({ where: { username: d.username } });
    if (!user) {
      user = await db.user.create({
        data: {
          username: d.username,
          name: d.name,
          email: `${d.username}@example.com`,
        },
      });
    }
    for (const r of d.roles) {
      const existing = await db.userRole.findFirst({
        where: { userId: user.id, roleType: r },
      });
      if (!existing) {
        await db.userRole.create({ data: { userId: user.id, roleType: r } });
      }
    }
  }

  return { created: true };
}

// Seed specific demo users requested by client (runs once)
export async function _seedSpecificDemoUsersDvzhd() {
  const demos: Array<{ username: string; name: string; roles: string[] }> = [
    // Заявитель (applicant)
    {
      username: "sidorov_s_s",
      name: "Сидоров Сидор Сидорович",
      roles: ["applicant"],
    },
    // Исполнители (executor)
    {
      username: "myasnikov_p_p",
      name: "Мясников Петр Петрович",
      roles: ["executor"],
    },
    {
      username: "kolotun_p_p",
      name: "Колотун Петр Петрович",
      roles: ["executor"],
    },
    {
      username: "alexandrov_a_a_exec",
      name: "Александров Александр Александрович",
      roles: ["executor"],
    },
    // Согласующие (approver)
    {
      username: "andrev_v_v",
      name: "Андревв Владимир Владимирович",
      roles: ["approver"],
    },
    {
      username: "anohin_a_a",
      name: "Анохин Антон Антонович",
      roles: ["approver"],
    },
    // Наблюдатель (observer)
    {
      username: "alexandrov_a_a_obs",
      name: "Александров Антон Антонович",
      roles: ["observer"],
    },
  ];

  for (const d of demos) {
    let user = await db.user.findUnique({ where: { username: d.username } });
    if (!user) {
      user = await db.user.create({
        data: {
          username: d.username,
          name: d.name,
          email: `${d.username}@example.com`,
        },
      });
    }
    for (const r of d.roles) {
      const existing = await db.userRole.findFirst({
        where: { userId: user.id, roleType: r },
      });
      if (!existing) {
        await db.userRole.create({ data: { userId: user.id, roleType: r } });
      }
    }
  }

  return { created: true };
}

export async function assignApplicationToUser(input: {
  applicationId: string;
  userId: string;
  targetElementId?: string;
}) {
  const { userId: actorId } = await getAuth({ required: true });

  const app = await db.serviceApplication.findUnique({
    where: { id: input.applicationId },
  });
  if (!app) throw new Error("Заявка не найдена");

  if (app.applicantId !== actorId && app.assignedTo !== actorId) {
    throw new Error("Недостаточно прав для назначения");
  }

  // Verify target user exists
  const target = await db.user.findUnique({ where: { id: input.userId } });
  if (!target) throw new Error("Пользователь не найден");

  // If targetElementId provided, ensure the target user has a compatible role type present in that process roles
  if (input.targetElementId) {
    const roles = await db.processRole.findMany({
      where: { elementId: input.targetElementId },
      select: { roleType: true },
    });
    const allowed = Array.from(new Set(roles.map((r) => r.roleType)));
    if (allowed.length > 0) {
      const userRoles = await db.userRole.findMany({
        where: { userId: input.userId, roleType: { in: allowed } },
        select: { roleType: true },
      });
      if (userRoles.length === 0) {
        throw new Error(
          "Пользователь не подходит по типу роли для следующего процесса",
        );
      }
    }
  }

  const updated = await db.serviceApplication.update({
    where: { id: input.applicationId },
    data: {
      assignedTo: input.userId,
      status: app.status === "DRAFT" ? "IN_PROGRESS" : app.status,
    },
    select: { id: true, assignedTo: true, status: true },
  });

  return updated;
}

// Initialization - Setup admin privileges
export async function _seedInitialAdmin() {
  const adminUser = await db.user.findFirst({
    where: { isAdmin: true },
  });

  if (!adminUser) {
    console.error(
      "Не найден пользователь с правами администратора. Создайте администратора через функцию setUserAsAdmin.",
    );
    return { error: "Администратор не найден" };
  }

  // Создаем предустановленный бизнес-процесс "Формирование заявки на услугу"
  const existingProcess = await db.businessProcess.findFirst({
    where: { name: "Формирование заявки на услугу" },
  });

  if (!existingProcess) {
    const businessProcess = await db.businessProcess.create({
      data: {
        name: "Формирование заявки на услугу",
        description:
          "Универсальный бизнес-процесс для формирования заявки на услугу с тремя основными реквизитами и этапом согласования",
        order: 1,
        isDefault: true,
      },
    });

    console.log(
      "Создан предустановленный бизнес-процесс:",
      businessProcess.name,
    );
  }

  return {
    message: "Инициализация завершена",
    admin: {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
    },
  };
}

// Функция для получения предустановленных настроек бизнес-процесса
export async function getBusinessProcessTemplate(input: { id: string }) {
  await getAuth({ required: true });

  const businessProcess = await db.businessProcess.findUnique({
    where: { id: input.id },
  });

  if (!businessProcess) {
    throw new Error("Бизнес-процесс не найден");
  }

  // Возвращаем предустановленный шаблон для "Формирование заявки на услугу"
  if (businessProcess.name === "Формирование заявки на услугу") {
    return {
      name: businessProcess.name,
      description: businessProcess.description,
      requisites: [
        {
          name: "service_name",
          label: "Наименование услуги",
          fieldType: "text",
          isRequired: true,
          placeholder: "Введите наименование требуемой услуги",
          order: 1,
        },
        {
          name: "service_description",
          label: "Описание услуги",
          fieldType: "textarea",
          isRequired: true,
          placeholder: "Подробно опишите требуемую услугу",
          order: 2,
        },
        {
          name: "deadline",
          label: "Желаемый срок выполнения",
          fieldType: "date",
          isRequired: false,
          placeholder: "Выберите дату",
          order: 3,
        },
        {
          name: "approval_process",
          label: "Процесс согласования",
          fieldType: "approval",
          isRequired: true,
          order: 4,
        },
      ],
    };
  }

  // Для других бизнес-процессов возвращаем базовую структуру
  return {
    name: businessProcess.name,
    description: businessProcess.description,
    requisites: [],
  };
}

// Copy Process Schema with all its elements and connections
export async function copyProcessSchema(input: {
  id: string;
  newName?: string;
}) {
  const { userId } = await getAuth({ required: true });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });

  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  // Get the original schema with all its data
  const originalSchema = await db.processSchema.findUnique({
    where: { id: input.id },
    include: {
      elements: {
        include: {
          requisites: {
            include: {
              approvalStages: true,
            },
          },
          checklists: true,
          roles: true,
          transitions: true,
          notifications: true,
        },
      },
      connections: true,
    },
  });

  if (!originalSchema) {
    throw new Error("Схема процесса не найдена");
  }

  // Create new schema
  const newSchema = await db.processSchema.create({
    data: {
      name: input.newName || `${originalSchema.name} (копия)`,
      description: originalSchema.description,
      serviceId: originalSchema.serviceId,
      isTemplate: originalSchema.isTemplate,
      isPublished: false, // Copy should not be published by default
      version: 1,
    },
    include: {
      service: { select: { name: true } },
    },
  });

  // Map old element IDs to new element IDs for connections
  const elementIdMapping: Record<string, string> = {};

  // Copy elements with their components
  for (const element of originalSchema.elements) {
    const newElement = await db.processSchemaElement.create({
      data: {
        schemaId: newSchema.id,
        elementType: element.elementType,
        name: element.name,
        description: element.description,
        businessProcessId: element.businessProcessId,
        positionX: element.positionX,
        positionY: element.positionY,
        width: element.width,
        height: element.height,
        properties: element.properties,
      },
    });

    elementIdMapping[element.id] = newElement.id;

    // Copy requisites
    for (const requisite of element.requisites) {
      const newRequisite = await db.processRequisite.create({
        data: {
          elementId: newElement.id,
          name: requisite.name,
          label: requisite.label,
          fieldType: requisite.fieldType,
          isRequired: requisite.isRequired,
          placeholder: requisite.placeholder,
          options: requisite.options,
          validation: requisite.validation,
          order: requisite.order,
        },
      });

      // Copy approval stages
      for (const stage of requisite.approvalStages) {
        await db.approvalStage.create({
          data: {
            requisiteId: newRequisite.id,
            name: stage.name,
            description: stage.description,
            order: stage.order,
            isRequired: stage.isRequired,
            approverRole: stage.approverRole,
            department: stage.department,
            executionType: stage.executionType,
            deadlineDays: stage.deadlineDays,
          },
        });
      }
    }

    // Copy checklists
    for (const checklist of element.checklists) {
      await db.processChecklist.create({
        data: {
          elementId: newElement.id,
          name: checklist.name,
          description: checklist.description,
          isRequired: checklist.isRequired,
          fileTypes: checklist.fileTypes,
          maxFileSize: checklist.maxFileSize,
          allowDocuments: checklist.allowDocuments,
          allowComments: checklist.allowComments,
          order: checklist.order,
        },
      });
    }

    // Copy roles
    for (const role of element.roles) {
      await db.processRole.create({
        data: {
          elementId: newElement.id,
          name: role.name,
          roleType: role.roleType,
          description: role.description,
          isRequired: role.isRequired,
          canEdit: role.canEdit,
          canApprove: role.canApprove,
          canReject: role.canReject,
          order: role.order,
        },
      });
    }

    // Copy transitions
    for (const transition of element.transitions) {
      await db.processTransition.create({
        data: {
          elementId: newElement.id,
          name: transition.name,
          condition: transition.condition,
          targetState: transition.targetState,
          description: transition.description,
          isDefault: transition.isDefault,
          order: transition.order,
        },
      });
    }

    // Copy notifications
    for (const notification of element.notifications) {
      await db.processNotification.create({
        data: {
          elementId: newElement.id,
          name: notification.name,
          trigger: notification.trigger,
          template: notification.template,
          recipients: notification.recipients,
          isActive: notification.isActive,
          order: notification.order,
        },
      });
    }
  }

  // Copy connections with updated element IDs
  for (const connection of originalSchema.connections) {
    const newSourceId = elementIdMapping[connection.sourceId];
    const newTargetId = elementIdMapping[connection.targetId];

    if (newSourceId && newTargetId) {
      await db.processConnection.create({
        data: {
          schemaId: newSchema.id,
          sourceId: newSourceId,
          targetId: newTargetId,
          connectionType: connection.connectionType,
          condition: connection.condition,
          label: connection.label,
          points: connection.points,
        },
      });
    }
  }

  return await db.processSchema.findUnique({
    where: { id: newSchema.id },
    include: {
      service: { select: { name: true } },
      _count: {
        select: { elements: true, connections: true },
      },
    },
  });
}

// Create a new editable version from an existing (often published) schema
export async function createSchemaNewVersion(input: { id: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const originalSchema = await db.processSchema.findUnique({
    where: { id: input.id },
    include: {
      elements: {
        include: {
          requisites: { include: { approvalStages: true } },
          checklists: true,
          roles: true,
          transitions: true,
          notifications: true,
        },
      },
      connections: true,
    },
  });
  if (!originalSchema) throw new Error("Схема процесса не найдена");

  const nextVersion = (originalSchema.version ?? 1) + 1;

  const newSchema = await db.processSchema.create({
    data: {
      name: originalSchema.name,
      description: originalSchema.description,
      serviceId: originalSchema.serviceId,
      isTemplate: originalSchema.isTemplate,
      isPublished: false, // new version is a draft
      version: nextVersion,
    },
  });

  const elementIdMapping: Record<string, string> = {};

  for (const element of originalSchema.elements) {
    const newElement = await db.processSchemaElement.create({
      data: {
        schemaId: newSchema.id,
        elementType: element.elementType,
        name: element.name,
        description: element.description,
        businessProcessId: element.businessProcessId,
        positionX: element.positionX,
        positionY: element.positionY,
        width: element.width,
        height: element.height,
        properties: element.properties,
      },
    });
    elementIdMapping[element.id] = newElement.id;

    for (const requisite of element.requisites) {
      const newRequisite = await db.processRequisite.create({
        data: {
          elementId: newElement.id,
          name: requisite.name,
          label: requisite.label,
          fieldType: requisite.fieldType,
          isRequired: requisite.isRequired,
          placeholder: requisite.placeholder,
          options: requisite.options,
          validation: requisite.validation,
          order: requisite.order,
        },
      });
      for (const stage of requisite.approvalStages) {
        await db.approvalStage.create({
          data: {
            requisiteId: newRequisite.id,
            name: stage.name,
            description: stage.description,
            order: stage.order,
            isRequired: stage.isRequired,
            approverRole: stage.approverRole,
            department: stage.department,
            executionType: stage.executionType,
            deadlineDays: stage.deadlineDays,
          },
        });
      }
    }

    for (const checklist of element.checklists) {
      await db.processChecklist.create({
        data: {
          elementId: newElement.id,
          name: checklist.name,
          description: checklist.description,
          isRequired: checklist.isRequired,
          fileTypes: checklist.fileTypes,
          maxFileSize: checklist.maxFileSize,
          allowDocuments: checklist.allowDocuments,
          allowComments: checklist.allowComments,
          order: checklist.order,
        },
      });
    }

    for (const role of element.roles) {
      await db.processRole.create({
        data: {
          elementId: newElement.id,
          name: role.name,
          roleType: role.roleType,
          description: role.description,
          isRequired: role.isRequired,
          canEdit: role.canEdit,
          canApprove: role.canApprove,
          canReject: role.canReject,
          order: role.order,
        },
      });
    }

    for (const transition of element.transitions) {
      await db.processTransition.create({
        data: {
          elementId: newElement.id,
          name: transition.name,
          condition: transition.condition,
          targetState: transition.targetState,
          description: transition.description,
          isDefault: transition.isDefault,
          order: transition.order,
        },
      });
    }

    for (const notification of element.notifications) {
      await db.processNotification.create({
        data: {
          elementId: newElement.id,
          name: notification.name,
          trigger: notification.trigger,
          template: notification.template,
          recipients: notification.recipients,
          isActive: notification.isActive,
          order: notification.order,
        },
      });
    }
  }

  for (const connection of originalSchema.connections) {
    const newSourceId = elementIdMapping[connection.sourceId];
    const newTargetId = elementIdMapping[connection.targetId];
    if (newSourceId && newTargetId) {
      await db.processConnection.create({
        data: {
          schemaId: newSchema.id,
          sourceId: newSourceId,
          targetId: newTargetId,
          connectionType: connection.connectionType,
          condition: connection.condition,
          label: connection.label,
          points: connection.points,
        },
      });
    }
  }

  return await db.processSchema.findUnique({
    where: { id: newSchema.id },
    include: {
      service: { select: { name: true } },
      _count: { select: { elements: true, connections: true } },
    },
  });
}

// Business Process Templates API

export async function createBusinessProcessTemplate(input: {
  name: string;
  description?: string;
  requisites?: {
    name: string;
    label: string;
    fieldType: string;
    isRequired?: boolean;
    placeholder?: string;
    options?: string;
    validation?: string;
    order?: number;
  }[];
}) {
  await getAuth({ required: true });

  const template = await db.businessProcessTemplate.create({
    data: {
      name: input.name,
      description: input.description,
      requisites: {
        create:
          input.requisites?.map((req, index) => ({
            name: req.name,
            label: req.label,
            fieldType: req.fieldType,
            isRequired: req.isRequired ?? false,
            placeholder: req.placeholder,
            options: req.options,
            validation: req.validation,
            order: req.order ?? index,
          })) || [],
      },
    },
    include: {
      requisites: {
        orderBy: { order: "asc" },
      },
    },
  });

  return template;
}

export async function listBusinessProcessTemplates() {
  return await db.businessProcessTemplate.findMany({
    where: {
      isActive: true,
    },
    include: {
      requisites: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });
}

export async function getBusinessProcessTemplateById(input: { id: string }) {
  const template = await db.businessProcessTemplate.findUnique({
    where: { id: input.id },
    include: {
      requisites: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!template) {
    throw new Error("Шаблон бизнес-процесса не найден");
  }

  return template;
}

export async function updateBusinessProcessTemplate(input: {
  id: string;
  name?: string;
  description?: string;
  requisites?: {
    id?: string;
    name: string;
    label: string;
    fieldType: string;
    isRequired?: boolean;
    placeholder?: string;
    options?: string;
    validation?: string;
    order?: number;
  }[];
}) {
  await getAuth({ required: true });

  // Сначала обновляем основные данные шаблона
  await db.businessProcessTemplate.update({
    where: { id: input.id },
    data: {
      name: input.name,
      description: input.description,
    },
  });

  // Если переданы реквизиты, обновляем их
  if (input.requisites) {
    // Удаляем все старые реквизиты
    await db.businessProcessTemplateRequisite.deleteMany({
      where: { templateId: input.id },
    });

    // Создаем новые реквизиты
    if (input.requisites.length > 0) {
      await db.businessProcessTemplateRequisite.createMany({
        data: input.requisites.map((req, index) => ({
          templateId: input.id,
          name: req.name,
          label: req.label,
          fieldType: req.fieldType,
          isRequired: req.isRequired ?? false,
          placeholder: req.placeholder,
          options: req.options,
          validation: req.validation,
          order: req.order ?? index,
        })),
      });
    }
  }

  // Возвращаем обновленный шаблон с реквизитами
  return await db.businessProcessTemplate.findUnique({
    where: { id: input.id },
    include: {
      requisites: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function deleteBusinessProcessTemplate(input: { id: string }) {
  await getAuth({ required: true });

  // Проверяем, существует ли шаблон
  const template = await db.businessProcessTemplate.findUnique({
    where: { id: input.id },
  });

  if (!template) {
    throw new Error("Шаблон бизнес-процесса не найден");
  }

  // Мягкое удаление - помечаем как неактивный
  return await db.businessProcessTemplate.update({
    where: { id: input.id },
    data: { isActive: false },
  });
}

export async function copyBusinessProcessTemplate(input: {
  id: string;
  newName: string;
}) {
  await getAuth({ required: true });

  // Получаем исходный шаблон
  const sourceTemplate = await db.businessProcessTemplate.findUnique({
    where: { id: input.id },
    include: {
      requisites: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!sourceTemplate) {
    throw new Error("Исходный шаблон не найден");
  }

  // Создаем копию шаблона
  const newTemplate = await db.businessProcessTemplate.create({
    data: {
      name: input.newName,
      description: sourceTemplate.description,
      requisites: {
        create: sourceTemplate.requisites.map((req) => ({
          name: req.name,
          label: req.label,
          fieldType: req.fieldType,
          isRequired: req.isRequired,
          placeholder: req.placeholder,
          options: req.options,
          validation: req.validation,
          order: req.order,
        })),
      },
    },
    include: {
      requisites: {
        orderBy: { order: "asc" },
      },
    },
  });

  return newTemplate;
}

// Retrieve a process schema element with minimal fields (including properties)
export async function getProcessSchemaElement(input: { id: string }) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }
  const el = await db.processSchemaElement.findUnique({
    where: { id: input.id },
    select: {
      id: true,
      name: true,
      elementType: true,
      schemaId: true,
      properties: true,
    },
  });
  if (!el) throw new Error("Элемент процесса не найден");
  return el;
}

// Reorder transitions for an element (priority from top to bottom)
export async function reorderProcessTransitions(input: {
  elementId: string;
  orderedIds: string[];
}) {
  const { userId } = await getAuth({ required: true });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isServiceAdmin: true, isAdmin: true },
  });
  if (!user?.isServiceAdmin && !user?.isAdmin) {
    throw new Error(
      "Недостаточно прав доступа. Требуется роль Администратор услуг или Администратор",
    );
  }

  const existing = await db.processTransition.findMany({
    where: { elementId: input.elementId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((t) => t.id));
  for (const id of input.orderedIds) {
    if (!existingIds.has(id)) {
      throw new Error("Недопустимый идентификатор перехода для перестановки");
    }
  }
  await Promise.all(
    input.orderedIds.map((id, index) =>
      db.processTransition.update({ where: { id }, data: { order: index } }),
    ),
  );
  return { success: true };
}

export async function listDocumentationSets(input: {
  decisionElementId: string;
}) {
  try {
    const sets = await db.documentationSet.findMany({
      where: { decisionElementId: input.decisionElementId },
      orderBy: { createdAt: "asc" },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    return sets.map((s) => ({
      id: s.id,
      name: s.name,
      decisionElementId: s.decisionElementId,
      schemaId: s.schemaId,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      items: s.items.map((i) => ({
        id: i.id,
        itemType: i.itemType,
        sourceElementId: i.sourceElementId,
        sourceId: i.sourceId,
        label: i.label,
        order: i.order,
      })),
    }));
  } catch (error) {
    console.error("Не удалось получить комплекты документации:", error);
    throw new Error("Не удалось получить комплекты документации");
  }
}
