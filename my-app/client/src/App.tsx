import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  Navigate,
} from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  Users,
  Settings,
  Plus,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  User,
  Save,
  Workflow,
  Loader2,
  Copy,
  Star,
  FolderOpen,
  BarChart3,
  LogIn,
  Users as UsersIcon,
  GitBranch,
  Bell,
  List,
  FileText as FileIcon,
  Play,
  Square,
  Diamond,
  MousePointer,
  Check,
  Type,
  AlignLeft,
  Hash,
  CheckSquare,
  UserCheck,
  StopCircle,
  ArrowLeft,
  MapPin as MapIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import debounce from "lodash/debounce";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { apiClient } from "~/client/api";
import { useAuth, encodeFileAsBase64DataURL } from "~/client/utils";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  useToast,
} from "~/components/ui";
function LoginScreen() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  React.useEffect(() => {
    if (auth.status === "authenticated") {
      navigate("/dashboard");
    }
  }, [auth.status, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }
    auth.signIn();
  };

  const handleForgotPassword = () => {
    toast({
      title: "Восстановление пароля",
      description: "Инструкции отправлены на ваш email",
    });
  };

  if (auth.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen login-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="bim-header">АСУ BIM</h1>
        </div>

        <Card className="glass-card shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              Для начала работы необходимо авторизироваться в системе под своим
              логином и паролем
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Имя пользователя</Label>
                <Input
                  id="username"
                  placeholder="Логин"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="bg-white/80"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Пароль"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="bg-white/80"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-sm"
                  onClick={handleForgotPassword}
                >
                  Забыли пароль?
                </Button>
              </div>

              <Button type="submit" className="w-full" size="lg">
                <LogIn className="w-4 h-4 mr-2" />
                Войти в систему
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function DashboardScreen() {
  const { data: stats } = useQuery(
    ["dashboardStats"],
    apiClient.getDashboardStats,
  );
  const { data: projects = [] } = useQuery(
    ["projects"],
    apiClient.listProjects,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Панель управления</h1>
        <CreateProjectDialog />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего проектов
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalProjects || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активные проекты
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeProjects || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Документы</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalDocuments || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Недавние проекты</CardTitle>
          <CardDescription>Ваши последние проекты</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {project.description || "Без описания"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      project.status === "ACTIVE" ? "default" : "secondary"
                    }
                  >
                    {project.status === "ACTIVE" ? "Активный" : "Неактивный"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {project._count?.Document || 0} документов
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectsScreen() {
  const { data: projects = [] } = useQuery(
    ["projects"],
    apiClient.listProjects,
  );
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const deleteProjectMutation = useMutation(apiClient.deleteProject, {
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      toast({
        title: "Проект удален",
        description: "Проект успешно удален",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Проекты</h1>
        <CreateProjectDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {project.name}
                <Badge
                  variant={
                    project.status === "ACTIVE" ? "default" : "secondary"
                  }
                >
                  {project.status === "ACTIVE" ? "Активный" : "Неактивный"}
                </Badge>
              </CardTitle>
              <CardDescription>
                {project.description || "Без описания"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Документов: {project._count?.Document || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Создан:{" "}
                {new Date(project.createdAt).toLocaleDateString("ru-RU")}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteProjectMutation.mutate({ id: project.id })}
                disabled={deleteProjectMutation.isLoading}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ServiceRequestsScreen() {
  const { data: requests = [] } = useQuery(["serviceRequests"], () =>
    apiClient.listServiceRequests(),
  );
  const { data: projects = [] } = useQuery(
    ["projects"],
    apiClient.listProjects,
  );
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const updateStatusMutation = useMutation(
    apiClient.updateServiceRequestStatus,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["serviceRequests"]);
        toast({
          title: "Статус обновлен",
          description: "Статус заявки успешно обновлен",
        });
      },
    },
  );

  const deleteRequestMutation = useMutation(apiClient.deleteServiceRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries(["serviceRequests"]);
      toast({
        title: "Заявка удалена",
        description: "Заявка успешно удалена",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Ожидает
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-green-600"
          >
            <CheckCircle className="w-3 h-3" />
            Одобрено
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Отклонено
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Заявки на доступ</h1>
        <CreateServiceRequestDialog projects={projects} />
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {request.title}
                </CardTitle>
                {getStatusBadge(request.status)}
              </div>
              <CardDescription>Проект: {request.project.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Подрядчик:</p>
                    <p className="text-sm text-muted-foreground">
                      {request.contractorName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email:</p>
                    <p className="text-sm text-muted-foreground">
                      {request.contractorEmail}
                    </p>
                  </div>
                  {request.contractorPhone && (
                    <div>
                      <p className="text-sm font-medium">Телефон:</p>
                      <p className="text-sm text-muted-foreground">
                        {request.contractorPhone}
                      </p>
                    </div>
                  )}
                </div>
                {request.description && (
                  <div>
                    <p className="text-sm font-medium">Описание:</p>
                    <p className="text-sm text-muted-foreground">
                      {request.description}
                    </p>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Создано:{" "}
                  {new Date(request.createdAt).toLocaleDateString("ru-RU")}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              {request.status === "PENDING" && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: request.id,
                        status: "APPROVED",
                      })
                    }
                    disabled={updateStatusMutation.isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Одобрить
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: request.id,
                        status: "REJECTED",
                        rejectionReason: "Отклонено администратором",
                      })
                    }
                    disabled={updateStatusMutation.isLoading}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Отклонить
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteRequestMutation.mutate({ id: request.id })}
                disabled={deleteRequestMutation.isLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить
              </Button>
            </CardFooter>
          </Card>
        ))}
        {requests.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Нет заявок на предоставление доступа
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const createProjectMutation = useMutation(apiClient.createProject, {
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      queryClient.invalidateQueries(["dashboardStats"]);
      setOpen(false);
      setFormData({ name: "", description: "" });
      toast({
        title: "Проект создан",
        description: "Новый проект успешно создан",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    createProjectMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Создать проект
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать новый проект</DialogTitle>
          <DialogDescription>
            Введите информацию о новом проекте
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Название проекта</Label>
            <Input
              id="projectName"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Введите название проекта"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectDescription">Описание</Label>
            <Textarea
              id="projectDescription"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Введите описание проекта (необязательно)"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={
                createProjectMutation.isLoading || !formData.name.trim()
              }
            >
              {createProjectMutation.isLoading ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}÷

function CreateServiceRequestDialog({ projects }: { projects: any[] }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contractorName: "",
    contractorEmail: "",
    contractorPhone: "",
    projectId: "",
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const createRequestMutation = useMutation(apiClient.createServiceRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries(["serviceRequests"]);
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        contractorName: "",
        contractorEmail: "",
        contractorPhone: "",
        projectId: "",
      });
      toast({
        title: "Заявка создана",
        description: "Новая заявка успешно создана",
      });
    },
    onError: (error: any) => {
      console.error("Ошибка создания заявки:", error);
      toast({
        title: "Ошибка",
        description: error?.message || "Произошла ошибка при создании заявки",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title.trim() ||
      !formData.contractorName.trim() ||
      !formData.contractorEmail.trim() ||
      !formData.projectId
    ) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }
    createRequestMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Создать заявку
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Создать заявку на доступ</DialogTitle>
          <DialogDescription>
            Заявка на предоставление доступа подрядной организации к проекту
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название заявки *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Введите название заявки"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Проект *</Label>
              <select
                id="project"
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Выберите проект</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractorName">Название подрядчика *</Label>
              <Input
                id="contractorName"
                value={formData.contractorName}
                onChange={(e) =>
                  setFormData({ ...formData, contractorName: e.target.value })
                }
                placeholder="Введите название организации"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractorEmail">Email подрядчика *</Label>
              <Input
                id="contractorEmail"
                type="email"
                value={formData.contractorEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contractorEmail: e.target.value })
                }
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractorPhone">Телефон подрядчика</Label>
            <Input
              id="contractorPhone"
              value={formData.contractorPhone}
              onChange={(e) =>
                setFormData({ ...formData, contractorPhone: e.target.value })
              }
              placeholder="+7 (xxx) xxx-xx-xx"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание заявки</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Дополнительная информация о заявке"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={createRequestMutation.isLoading}>
              {createRequestMutation.isLoading
                ? "Создание..."
                : "Создать заявку"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const routes = [
    { path: "/projects", name: "Проекты", icon: FolderOpen },
    { path: "/dashboard", name: "Панель", icon: BarChart3 },
    { path: "/requests", name: "Заявки", icon: Users },
    { path: "/applications", name: "Мои заявки", icon: FileText },
    { path: "/admin", name: "Админ", icon: Settings },
  ];

  const handleProfile = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar for desktop */}
      {!isMobile && (
        <nav className="sticky top-0 w-64 bg-background border-r p-4 flex flex-col z-20 h-screen">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary">АСУ BIM</h1>
          </div>
          <div className="flex-1 space-y-2">
            {routes.map((route) => {
              const Icon = route.icon;
              const isActive = location.pathname === route.path;
              return (
                <Button
                  key={route.path}
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate(route.path)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {route.name}
                </Button>
              );
            })}
          </div>
          <div className="mt-auto">
            <Button
              variant="outline"
              onClick={handleProfile}
              className="w-full"
            >
              <User className="w-4 h-4 mr-2" />
              Профиль
            </Button>
          </div>
        </nav>
      )}

      {/* Main content */}
      <main
        className={`flex-1 p-4 md:p-8 overflow-auto ${isMobile ? "pb-20" : ""}`}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom tab bar for mobile */}
      {isMobile && (
        <nav className="fixed bottom-4 left-4 right-4 mx-auto max-w-md bg-background border rounded-full shadow-md p-2 flex justify-around z-10 backdrop-blur-md">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = location.pathname === route.path;
            return (
              <Button
                key={route.path}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center text-xs ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => navigate(route.path)}
              >
                <Icon className="h-4 w-4" />
                {route.name}
              </Button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth({ required: true });

  if (auth.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Only handle auth. Let routes decide when to render Layout to prevent duplicates.
  return <>{children}</>;
}

function AdminScreen() {
  const navigate = useNavigate();
  const { data: stats } = useQuery(
    ["serviceAdminStats"],
    apiClient.getServiceAdminStats,
  );

  const { data: serviceCategories = [] } = useQuery(
    ["serviceCategories"],
    apiClient.listServiceCategories,
  );
  const { data: services = [] } = useQuery(["services"], () =>
    apiClient.listServices(),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Администрирование услуг</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Бизнес-процессы
            </CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.businessProcessCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Категории услуг
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.serviceCategoryCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Услуги</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.serviceCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего заявок</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalRequests || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Schemas Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Схемы процессов</CardTitle>
            <CreateProcessSchemaDialog services={services} />
          </div>
          <CardDescription>
            Визуальные схемы бизнес-процессов для услуг
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProcessSchemasList />
        </CardContent>
      </Card>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Standard Process Functions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Стандартные функции бизнес-процесса</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/standard-functions")}
              >
                Открыть
              </Button>
            </div>
            <CardDescription>
              Централизованные шаблоны и настройки, используемые в редакторе
              схем
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Реквизиты формы</li>
              <li>Чек-листы и документы</li>
              <li>Печатная форма</li>
              <li>Роли участников</li>
              <li>Условия перехода</li>
              <li>Уведомления</li>
            </ul>
          </CardContent>
        </Card>

        {/* Service Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Категории услуг</CardTitle>
              <CreateServiceCategoryDialog
                serviceCategories={serviceCategories}
              />
            </div>
            <CardDescription>Иерархический справочник услуг</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {serviceCategories.slice(0, 5).map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {category._count?.services || 0} услуг
                  </span>
                </div>
              ))}
              {serviceCategories.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  И еще {serviceCategories.length - 5}...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Услуги</CardTitle>
              <CreateServiceDialog serviceCategories={serviceCategories} />
            </div>
            <CardDescription>Справочник предоставляемых услуг</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {services.slice(0, 5).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <div>
                      <div className="text-sm">{service.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {service.category?.name}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {service._count?.ServiceRequest || 0} заявок
                  </span>
                </div>
              ))}
              {services.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  И еще {services.length - 5}...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CreateServiceCategoryDialog({
  serviceCategories,
}: {
  serviceCategories: any[];
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    order: 0,
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const createMutation = useMutation(apiClient.createServiceCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(["serviceCategories"]);
      queryClient.invalidateQueries(["serviceAdminStats"]);
      setOpen(false);
      setFormData({ name: "", description: "", parentId: "", order: 0 });
      toast({
        title: "Категория создана",
        description: "Новая категория услуг успешно создана",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать категорию",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    createMutation.mutate({
      ...formData,
      parentId: formData.parentId || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать категорию услуг</DialogTitle>
          <DialogDescription>
            Добавить новую категорию в иерархический справочник услуг
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Название категории</Label>
            <Input
              id="categoryName"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Введите название категории"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryDescription">Описание</Label>
            <Textarea
              id="categoryDescription"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Введите описание категории (необязательно)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentCategory">Родительская категория</Label>
            <select
              id="parentCategory"
              value={formData.parentId}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Корневая категория</option>
              {serviceCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.parent ? `${category.parent.name} → ` : ""}
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryOrder">Порядок сортировки</Label>
            <Input
              id="categoryOrder"
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  order: parseInt(e.target.value) || 0,
                })
              }
              placeholder="0"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isLoading || !formData.name.trim()}
            >
              {createMutation.isLoading ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateServiceDialog({
  serviceCategories,
}: {
  serviceCategories: any[];
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const createMutation = useMutation(apiClient.createService, {
    onSuccess: () => {
      queryClient.invalidateQueries(["services"]);
      queryClient.invalidateQueries(["serviceAdminStats"]);
      setOpen(false);
      setFormData({ name: "", description: "", categoryId: "" });
      toast({
        title: "Услуга создана",
        description: "Новая услуга успешно создана",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать услугу",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.categoryId) return;
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать услугу</DialogTitle>
          <DialogDescription>
            Добавить новую услугу в справочник
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serviceName">Название услуги</Label>
            <Input
              id="serviceName"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Введите название услуги"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceDescription">Описание</Label>
            <Textarea
              id="serviceDescription"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Введите описание услуги (необязательно)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceCategory">Категория услуг *</Label>
            <select
              id="serviceCategory"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Выберите категорию</option>
              {serviceCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.parent ? `${category.parent.name} → ` : ""}
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isLoading ||
                !formData.name.trim() ||
                !formData.categoryId
              }
            >
              {createMutation.isLoading ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BusinessProcessManagementScreen() {
  const navigate = useNavigate();
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const { data: businessProcessTemplates = [] } = useQuery(
    ["businessProcessTemplates"],
    apiClient.listBusinessProcessTemplates,
  );
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const deleteBusinessProcessTemplate = useMutation(
    apiClient.deleteBusinessProcessTemplate,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["businessProcessTemplates"]);
        toast({
          title: "Шаблон бизнес-процесса удален",
          description: "Шаблон бизнес-процесса успешно удален",
        });
      },
    },
  );

  const copyBusinessProcessTemplate = useMutation(
    apiClient.copyBusinessProcessTemplate,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["businessProcessTemplates"]);
        toast({
          title: "Шаблон скопирован",
          description: "Копия шаблона успешно создана",
        });
      },
    },
  );

  if (selectedProcess) {
    return (
      <SimpleBusinessProcessEditor
        processId={selectedProcess}
        onBack={() => setSelectedProcess(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold">
            Управление шаблонами бизнес-процессов
          </h1>
        </div>
        <CreateBusinessProcessDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Справочник шаблонов бизнес-процессов</CardTitle>
          <CardDescription>
            Предустановленные шаблоны бизнес-процессов для автоматической
            загрузки настроек в редакторе схем
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {businessProcessTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Workflow className="w-5 h-5 text-blue-500" />
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Реквизитов: {template.requisites?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProcess(template.id)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newName = prompt(
                        "Введите название для копии:",
                        `${template.name} (копия)`,
                      );
                      if (newName) {
                        copyBusinessProcessTemplate.mutate({
                          id: template.id,
                          newName,
                        });
                      }
                    }}
                    disabled={copyBusinessProcessTemplate.isLoading}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Копировать
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Вы уверены, что хотите удалить этот шаблон бизнес-процесса?",
                        )
                      ) {
                        deleteBusinessProcessTemplate.mutate({
                          id: template.id,
                        });
                      }
                    }}
                    disabled={deleteBusinessProcessTemplate.isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {businessProcessTemplates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Нет созданных шаблонов бизнес-процессов</p>
                <p className="text-sm">
                  Создайте первый шаблон бизнес-процесса для использования в
                  редакторе схем
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateBusinessProcessDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const createBusinessProcessTemplate = useMutation(
    apiClient.createBusinessProcessTemplate,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["businessProcessTemplates"]);
        toast({
          title: "Шаблон бизнес-процесса создан",
          description: "Новый шаблон бизнес-процесса успешно создан",
        });
        setIsOpen(false);
        setName("");
        setDescription("");
      },
      onError: (error: any) => {
        toast({
          title: "Ошибка",
          description:
            error.message || "Не удалось создать шаблон бизнес-процесса",
          variant: "destructive",
        });
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createBusinessProcessTemplate.mutate({
      name: name.trim(),
      description: description.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Создать шаблон
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создание шаблона бизнес-процесса</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название шаблона бизнес-процесса"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите назначение и особенности шаблона"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={createBusinessProcessTemplate.isLoading}
            >
              {createBusinessProcessTemplate.isLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Создать
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateProcessSchemaDialog({ services }: { services: any[] }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    serviceId: "",
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;
  const navigate = useNavigate();

  const createMutation = useMutation(apiClient.createProcessSchema, {
    onSuccess: (schema) => {
      queryClient.invalidateQueries(["processSchemas"]);
      queryClient.invalidateQueries(["serviceAdminStats"]);
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        serviceId: "",
      });
      toast({
        title: "Схема создана",
        description: "Новая схема процесса успешно создана",
      });
      // Переход к редактору
      navigate(`/admin/process-editor/${schema.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать схему",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    createMutation.mutate({
      ...formData,
      serviceId: formData.serviceId || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Создать схему
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать схему процесса</DialogTitle>
          <DialogDescription>
            Создать новую визуальную схему бизнес-процесса
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schemaName">Название схемы</Label>
            <Input
              id="schemaName"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Введите название схемы"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schemaDescription">Описание</Label>
            <Textarea
              id="schemaDescription"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Введите описание схемы (необязательно)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schemaService">Услуга</Label>
            <select
              id="schemaService"
              value={formData.serviceId}
              onChange={(e) =>
                setFormData({ ...formData, serviceId: e.target.value })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Без услуги</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.category?.name})
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isLoading || !formData.name.trim()}
            >
              {createMutation.isLoading ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProcessSchemasList() {
  const { data: schemas = [] } = useQuery(["processSchemas"], () =>
    apiClient.listProcessSchemas(),
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const allSelected =
    schemas.length > 0 && selectedIds.length === schemas.length;
  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === schemas.length ? [] : schemas.map((s: any) => s.id),
    );
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const deleteMutation = useMutation(apiClient.deleteProcessSchema, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processSchemas"]);
      queryClient.invalidateQueries(["serviceAdminStats"]);
      toast({
        title: "Схема удалена",
        description: "Схема процесса успешно удалена",
      });
    },
  });

  const copyMutation = useMutation(apiClient.copyProcessSchema, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processSchemas"]);
      queryClient.invalidateQueries(["serviceAdminStats"]);
      toast({
        title: "Схема скопирована",
        description: "Схема процесса успешно скопирована",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка копирования",
        description:
          error instanceof Error
            ? error.message
            : "Произошла ошибка при копировании схемы",
        variant: "destructive",
      });
    },
  });

  const createNewVersionMutation = useMutation(
    apiClient.createSchemaNewVersion,
    {
      onSuccess: (newSchema) => {
        queryClient.invalidateQueries(["processSchemas"]);
        if (newSchema?.id) {
          toast({
            title: "Создана новая версия",
            description: `Открыта версия v${newSchema.version ?? ""}`,
          });
          navigate(`/admin/process-editor/${newSchema.id}`);
        }
      },
      onError: (error: any) => {
        toast({
          title: "Не удалось создать новую версию",
          description: error?.message || "Попробуйте ещё раз",
          variant: "destructive",
        });
      },
    },
  );

  const bulkDeleteMutation = useMutation(
    async ({ ids }: { ids: string[] }) => {
      // Fetch deletion info for each id
      const infos = await Promise.all(
        ids.map(async (id) => {
          try {
            const info = await apiClient.getSchemaDeletionInfo({ id });
            return { id, info } as const;
          } catch {
            return { id, info: null } as const;
          }
        }),
      );

      // Build confirmation message
      const publishedWithApps = infos.filter(
        (x) => x.info?.isPublished && (x.info?.applicationsCount ?? 0) > 0,
      );
      const publishedNoApps = infos.filter(
        (x) => x.info?.isPublished && (x.info?.applicationsCount ?? 0) === 0,
      );
      const drafts = infos.filter((x) => !x.info?.isPublished);

      let message = `Вы выбрали для удаления: ${ids.length} схем.\n`;
      if (publishedWithApps.length)
        message += `• Опубликованные (есть заявки): ${publishedWithApps.length}. Удаление сделает формы недоступными.\n`;
      if (publishedNoApps.length)
        message += `• Опубликованные (без заявок): ${publishedNoApps.length}.\n`;
      if (drafts.length) message += `• Черновики: ${drafts.length}.\n`;
      message += "Продолжить удаление?";

      const ok = window.confirm(message);
      if (!ok) return { deleted: 0, failed: ids.length };

      let deleted = 0;
      let failed = 0;
      for (const id of ids) {
        try {
          await apiClient.deleteProcessSchema({ id });
          deleted++;
        } catch {
          failed++;
        }
      }
      return { deleted, failed };
    },
    {
      onSuccess: (res) => {
        void queryClient.invalidateQueries(["processSchemas"]);
        void queryClient.invalidateQueries(["serviceAdminStats"]);
        setSelectedIds([]);
        if (res.failed === 0) {
          toast({
            title: "Схемы удалены",
            description: `Удалено: ${res.deleted}`,
          });
        } else {
          toast({
            title: "Часть схем не удалось удалить",
            description: `Удалено: ${res.deleted}, Ошибок: ${res.failed}`,
            variant: "destructive",
          });
        }
      },
      onError: () => {
        toast({ title: "Не удалось удалить", variant: "destructive" });
      },
    },
  );

  if (schemas.length === 0) {
    return (
      <div className="text-center py-8">
        <Workflow className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Нет созданных схем процессов</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions bar */}
      {schemas.length > 0 && (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
            <span className="text-sm">Выбрать все</span>
            {selectedIds.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                Выбрано: {selectedIds.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              disabled={
                selectedIds.length === 0 || bulkDeleteMutation.isLoading
              }
              onClick={() => bulkDeleteMutation.mutate({ ids: selectedIds })}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Удалить выбранные
            </Button>
            {selectedIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds([])}
              >
                Снять выбор
              </Button>
            )}
          </div>
        </div>
      )}

      {schemas.map((schema) => (
        <div
          key={schema.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="pt-1">
              <Checkbox
                checked={selectedIds.includes(schema.id)}
                onCheckedChange={() => toggleOne(schema.id)}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Workflow className="w-4 h-4" />
                <h3 className="font-medium">{schema.name}</h3>
                {schema.isTemplate && (
                  <Badge variant="secondary" className="text-xs">
                    Шаблон
                  </Badge>
                )}
                <Badge
                  variant={schema.isPublished ? "default" : "secondary"}
                  className={`text-xs ${schema.isPublished ? "bg-green-600" : ""}`}
                >
                  {schema.isPublished ? "Опубликована" : "Черновик"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  v{schema.version ?? 1}
                </Badge>
              </div>
              {schema.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {schema.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {schema.service && <span>Услуга: {schema.service.name}</span>}
                <span>Элементов: {schema._count?.elements || 0}</span>
                <span>Соединений: {schema._count?.connections || 0}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (schema.isPublished) {
                  const confirmEdit = window.confirm(
                    "Схема опубликована. Вы действительно хотите внести изменения? Будет создана новая версия (черновик).",
                  );
                  if (!confirmEdit) return;
                  createNewVersionMutation.mutate({ id: schema.id });
                } else {
                  navigate(`/admin/process-editor/${schema.id}`);
                }
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              {schema.isPublished ? "Редактировать версию" : "Редактировать"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyMutation.mutate({ id: schema.id })}
              disabled={copyMutation.isLoading}
            >
              <Copy className="w-4 h-4 mr-2" />
              Копировать
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                try {
                  const info = await apiClient.getSchemaDeletionInfo({
                    id: schema.id,
                  });
                  if (info?.isPublished && (info?.applicationsCount ?? 0) > 0) {
                    const proceed = window.confirm(
                      `Внимание: схема опубликована и по ней уже создано заявок: ${info.applicationsCount}.\nУдаление приведёт к недоступности формы для новых заявок. Продолжить удаление?`,
                    );
                    if (!proceed) return;
                  } else {
                    const proceed = window.confirm(
                      "Вы уверены, что хотите удалить эту схему процесса?",
                    );
                    if (!proceed) return;
                  }
                } catch {
                  const proceed = window.confirm(
                    "Вы уверены, что хотите удалить эту схему процесса?",
                  );
                  if (!proceed) return;
                }
                deleteMutation.mutate({ id: schema.id });
              }}
              disabled={deleteMutation.isLoading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Process Preview Components
function ProcessPreviewDialog({ elementId }: { elementId: string }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { data: requisites = [] } = useQuery(
    ["processRequisites", elementId],
    () => apiClient.listProcessRequisites({ elementId }),
    { enabled: !!elementId && open },
  );
  const [localReqs, setLocalReqs] = useState<any[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const queryClient = useQueryClient();
  const reorderReqs = useMutation(apiClient.reorderProcessRequisites, {
    onSuccess: () => {
      void queryClient.invalidateQueries(["processRequisites", elementId]);
    },
  });
  useEffect(() => {
    setLocalReqs(requisites);
  }, [JSON.stringify(requisites)]);
  const { data: checklists = [] } = useQuery(
    ["processChecklists", elementId],
    () => apiClient.listProcessChecklists({ elementId }),
    { enabled: !!elementId && open },
  );
  const [localChecklists, setLocalChecklists] = useState<any[]>([]);
  useEffect(() => {
    setLocalChecklists(checklists);
  }, [JSON.stringify(checklists)]);
  const reorderChecklists = useMutation(apiClient.reorderProcessChecklists, {
    onSuccess: () => {
      void queryClient.invalidateQueries(["processChecklists", elementId]);
    },
  });
  const { data: roles = [] } = useQuery(
    ["processRoles", elementId],
    () => apiClient.listProcessRoles({ elementId }),
    { enabled: !!elementId && open },
  );
  const { data: transitions = [] } = useQuery(
    ["processTransitions", elementId],
    () => apiClient.listProcessTransitions({ elementId }),
    { enabled: !!elementId && open },
  );
  const { data: notifications = [] } = useQuery(
    ["processNotifications", elementId],
    () => apiClient.listProcessNotifications({ elementId }),
    { enabled: !!elementId && open },
  );
  const { data: printForms = [] } = useQuery(
    ["printForms", elementId, open ? "preview" : "closed"],
    () => apiClient.listPrintForms({ elementId }),
    { enabled: !!elementId && open },
  );
  const [localPrintForms, setLocalPrintForms] = useState<any[]>([]);
  useEffect(() => {
    setLocalPrintForms(printForms);
  }, [JSON.stringify(printForms)]);
  const reorderPrintForms = useMutation(apiClient.reorderPrintForms, {
    onSuccess: () => {
      void queryClient.invalidateQueries([
        "printForms",
        elementId,
        open ? "preview" : "closed",
      ]);
    },
  });

  const roleTypeLabels = {
    applicant: "Заявитель",
    executor: "Исполнитель",
    approver: "Согласующий",
    observer: "Наблюдатель",
  };

  const conditionLabels = {
    approved_or_rejected: "Согласовано/отклонено",
    approved: "Согласовано/отклонено",
    rejected: "Согласовано/отклонено",
    assigned: "Назначено",
    filled: "Заполнено",
  };

  const triggerLabels = {
    on_enter: "При входе",
    on_exit: "При выходе",
    on_approve: "При одобрении",
    on_reject: "При отклонении",
    on_timeout: "При таймауте",
  };

  // DnD sortable item for requisites
  function SortableRequisiteItem({
    req,
    children,
  }: {
    req: any;
    children: React.ReactNode;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: req.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : undefined,
    } as React.CSSProperties;
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`rounded-lg border p-3 bg-card ${isDragging ? "ring-2 ring-primary" : ""}`}
      >
        {children}
      </div>
    );
  }

  // DnD item for checklist rows
  function SortableChecklistItem({
    item,
    children,
  }: {
    item: any;
    children: React.ReactNode;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: item.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : undefined,
    } as React.CSSProperties;
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-card ${isDragging ? "ring-2 ring-primary rounded-lg" : ""}`}
      >
        {children}
      </div>
    );
  }

  // DnD item for print forms
  function SortablePrintFormItem({
    pf,
    children,
  }: {
    pf: any;
    children: React.ReactNode;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: pf.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : undefined,
    } as React.CSSProperties;
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-card ${isDragging ? "ring-2 ring-primary rounded-lg" : ""}`}
      >
        {children}
      </div>
    );
  }

  // Функция для рендеринга реального поля формы
  const renderFormField = (req: any) => {
    const fieldId = `field_${req.id}`;
    const value = formData[fieldId] || "";

    const handleFieldChange = (newValue: any) => {
      setFormData((prev) => ({ ...prev, [fieldId]: newValue }));
    };

    switch (req.fieldType) {
      case "text":
        return (
          <Input
            placeholder={
              req.placeholder || `Введите ${req.label.toLowerCase()}`
            }
            value={value}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled
          />
        );

      case "email":
        return (
          <Input
            type="email"
            placeholder={req.placeholder || "example@email.com"}
            value={value}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled
          />
        );

      case "phone":
        return (
          <Input
            type="tel"
            placeholder={req.placeholder || "+7 (999) 123-45-67"}
            value={value}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={req.placeholder || "0"}
            value={value}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={
              req.placeholder || `Введите ${req.label.toLowerCase()}`
            }
            value={value}
            onChange={(e) => handleFieldChange(e.target.value)}
            rows={3}
            disabled
          />
        );
      case "label":
        return (
          <div className="py-2">
            <div className="text-lg md:text-xl font-bold">{req.label}</div>
          </div>
        );

      case "select":
        let options: any[] = [];
        try {
          options = req.options
            ? (JSON.parse(req.options as string) as any[])
            : [];
        } catch {
          options = [];
        }
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Выберите вариант</option>
            {Array.isArray(options) &&
              options.map((option: any, index: number) => (
                <option
                  key={index}
                  value={typeof option === "string" ? option : option.value}
                >
                  {typeof option === "string" ? option : option.label}
                </option>
              ))}
          </select>
        );

      case "file":
        return (
          <div className="space-y-2">
            <Input type="file" disabled className="cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">
              Пользователь сможет загрузить файл
            </p>
          </div>
        );

      case "approval":
        return (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Процесс согласования</Badge>
            </div>
            {req.approvalStages && req.approvalStages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Этапы согласования:</p>
                {req.approvalStages.map((stage: any, index: number) => (
                  <div
                    key={stage.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-background"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-sm font-medium">{stage.name}</div>
                      {stage.description && (
                        <div className="text-xs text-muted-foreground">
                          {stage.description}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 text-xs">
                        {stage.department && (
                          <Badge variant="outline" className="text-xs">
                            Подразделение: {stage.department}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {stage.executionType === "sequential"
                            ? "Последовательно"
                            : "Параллельно"}
                        </Badge>
                        {stage.deadlineDays && (
                          <Badge variant="outline" className="text-xs">
                            Срок: {stage.deadlineDays} дн.
                          </Badge>
                        )}
                        <Badge
                          variant={stage.isRequired ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {stage.isRequired ? "Обязательный" : "Опциональный"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <Input
            placeholder={
              req.placeholder || `Введите ${req.label.toLowerCase()}`
            }
            value={value}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          Предпросмотр
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Предпросмотр формы процесса</DialogTitle>
          <DialogDescription>
            Так будет выглядеть форма для пользователей
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Печатные формы (предпросмотр для пользователя) */}
          {localPrintForms.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                🖨️ Печатные формы
              </h4>
              <Card className="p-6">
                {/* Drag to reorder only if все формы имеют id */}
                {localPrintForms.every((f: any) => !!f.id) ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={({ active, over }) => {
                      if (!over || active.id === over.id) return;
                      const oldIndex = localPrintForms.findIndex(
                        (r) => r.id === active.id,
                      );
                      const newIndex = localPrintForms.findIndex(
                        (r) => r.id === over.id,
                      );
                      const reordered = arrayMove(
                        localPrintForms,
                        oldIndex,
                        newIndex,
                      );
                      setLocalPrintForms(reordered);
                      reorderPrintForms.mutate({
                        elementId,
                        orderedIds: reordered.map((r) => r.id as string),
                      });
                    }}
                  >
                    <SortableContext
                      items={localPrintForms.map((r: any) => r.id as string)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {localPrintForms.map((pf: any) => (
                          <SortablePrintFormItem key={pf.id} pf={pf}>
                            <div className="flex items-center justify-between p-3 border rounded">
                              <div className="min-w-0">
                                <div className="font-medium truncate">
                                  {pf.label ||
                                    pf.templateName ||
                                    "Печатная форма"}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {pf.templateName || pf.templateUrl}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {pf.templateUrl && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a
                                      href={pf.templateUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Предпросмотр
                                    </a>
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    alert(
                                      "Предпросмотр: в реальной заявке значения будут подставлены согласно правилам подстановки.",
                                    );
                                  }}
                                >
                                  Выгрузить
                                </Button>
                              </div>
                            </div>
                          </SortablePrintFormItem>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="space-y-3">
                    {localPrintForms.map((pf: any) => (
                      <div
                        key={pf.id ?? pf.templateUrl}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {pf.label || pf.templateName || "Печатная форма"}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {pf.templateName || pf.templateUrl}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {pf.templateUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={pf.templateUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Предпросмотр
                              </a>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              alert(
                                "Предпросмотр: в реальной заявке значения будут подставлены согласно правилам подстановки.",
                              )
                            }
                          >
                            Выгрузить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Форма для заполнения */}
          {localReqs.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-2 flex items-center gap-2">
                📝 Форма для заполнения
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                Перетащите блоки вверх/вниз, чтобы изменить порядок. Изменения
                сохраняются автоматически.
              </p>
              <Card className="p-6">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={({ active, over }) => {
                    if (!over || active.id === over.id) return;
                    const oldIndex = localReqs.findIndex(
                      (r) => r.id === active.id,
                    );
                    const newIndex = localReqs.findIndex(
                      (r) => r.id === over.id,
                    );
                    const reordered = arrayMove(localReqs, oldIndex, newIndex);
                    setLocalReqs(reordered);
                    reorderReqs.mutate({
                      elementId,
                      orderedIds: reordered.map((r) => r.id),
                    });
                  }}
                >
                  <SortableContext
                    items={localReqs.map((r) => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-6">
                      {localReqs.map((req) => (
                        <SortableRequisiteItem key={req.id} req={req}>
                          <div className="space-y-2 cursor-grab">
                            <Label
                              htmlFor={`field_${req.id}`}
                              className="text-sm font-medium"
                            >
                              {req.label}
                              {req.isRequired && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </Label>
                            {renderFormField(req)}
                            {req.placeholder &&
                              req.fieldType !== "approval" && (
                                <p className="text-xs text-muted-foreground">
                                  Подсказка: {req.placeholder}
                                </p>
                              )}
                          </div>
                        </SortableRequisiteItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Если у элемента есть условие согласовано/отклонено — показать кнопки предпросмотра */}
                {(() => {
                  const hasApproveReject = Array.isArray(transitions)
                    ? transitions.some(
                        (t: any) => t?.condition === "approved_or_rejected",
                      )
                    : false;
                  return (
                    hasApproveReject && (
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline">Отклонить</Button>
                        <Button>Согласовать</Button>
                      </div>
                    )
                  );
                })()}
              </Card>
            </div>
          )}

          {/* Документы для загрузки */}
          {localChecklists.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                📎 Документы для загрузки
              </h4>
              <Card className="p-6">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={({ active, over }) => {
                    if (!over || active.id === over.id) return;
                    const oldIndex = localChecklists.findIndex(
                      (r) => r.id === active.id,
                    );
                    const newIndex = localChecklists.findIndex(
                      (r) => r.id === over.id,
                    );
                    const reordered = arrayMove(
                      localChecklists,
                      oldIndex,
                      newIndex,
                    );
                    setLocalChecklists(reordered);
                    reorderChecklists.mutate({
                      elementId,
                      orderedIds: reordered.map((r) => r.id as string),
                    });
                  }}
                >
                  <SortableContext
                    items={localChecklists.map((r) => r.id as string)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {localChecklists.map((item) => (
                        <SortableChecklistItem key={item.id} item={item}>
                          <div className="space-y-3 p-4 border rounded-lg">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                disabled
                                className="mt-1 rounded"
                              />
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-medium">{item.name}</h5>
                                  {item.isRequired && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      Обязательный
                                    </Badge>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {item.description}
                                  </p>
                                )}
                                {item.allowDocuments && (
                                  <div className="space-y-2">
                                    <Label className="text-xs font-medium">
                                      Загрузить документ:
                                    </Label>
                                    <Input
                                      type="file"
                                      disabled
                                      className="cursor-not-allowed"
                                    />
                                  </div>
                                )}
                                {item.allowComments && (
                                  <div className="space-y-2">
                                    <Label className="text-xs font-medium">
                                      Комментарий:
                                    </Label>
                                    <Textarea
                                      placeholder="Добавьте комментарий к документу..."
                                      disabled
                                      rows={2}
                                      className="cursor-not-allowed"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </SortableChecklistItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </Card>
            </div>
          )}

          {/* Информация о ролях и процессе */}
          {(roles.length > 0 ||
            transitions.length > 0 ||
            notifications.length > 0) && (
            <div>
              <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                ℹ️ Информация о процессе
              </h4>
              <Card className="p-6">
                <div className="space-y-4 text-sm">
                  {roles.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Участники процесса:</h5>
                      <div className="grid gap-2">
                        {roles.map((role) => (
                          <div
                            key={role.id}
                            className="flex items-center gap-2 p-2 bg-muted rounded"
                          >
                            <UsersIcon className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">{role.name}</span>
                            <span className="text-muted-foreground">
                              (
                              {
                                roleTypeLabels[
                                  role.roleType as keyof typeof roleTypeLabels
                                ]
                              }
                              )
                            </span>
                            {role.description && (
                              <span className="text-muted-foreground">
                                — {role.description}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {transitions.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Возможные исходы:</h5>
                      <div className="grid gap-2">
                        {transitions.map((transition) => (
                          <div
                            key={transition.id}
                            className="flex items-center gap-2 p-2 bg-muted rounded"
                          >
                            <GitBranch className="w-4 h-4 text-orange-500" />
                            <span className="font-medium">
                              {transition.name}
                            </span>
                            <span className="text-muted-foreground">
                              (
                              {
                                conditionLabels[
                                  transition.condition as keyof typeof conditionLabels
                                ]
                              }
                              )
                            </span>
                            {transition.targetState && (
                              <span className="text-muted-foreground">
                                → {transition.targetState}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {notifications.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Уведомления:</h5>
                      <div className="grid gap-2">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="flex items-center gap-2 p-2 bg-muted rounded"
                          >
                            <Bell className="w-4 h-4 text-red-500" />
                            <span className="font-medium">
                              {notification.name}
                            </span>
                            <span className="text-muted-foreground">
                              (
                              {
                                triggerLabels[
                                  notification.trigger as keyof typeof triggerLabels
                                ]
                              }
                              )
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Если нет компонентов */}
          {requisites.length === 0 &&
            checklists.length === 0 &&
            roles.length === 0 &&
            transitions.length === 0 &&
            notifications.length === 0 && (
              <div className="text-center py-8">
                <Workflow className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  У данного процесса пока нет настроенных компонентов
                </p>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Process Component Panels
function ProcessRequisitesPanel({ elementId }: { elementId: string }) {
  const { data: requisites = [] } = useQuery(
    ["processRequisites", elementId],
    () => apiClient.listProcessRequisites({ elementId }),
    { enabled: !!elementId },
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [templateQuery, setTemplateQuery] = useState("");
  const debouncedSetTemplateQuery = React.useMemo(
    () => debounce((v: string) => setTemplateQuery(v), 300),
    [],
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [createTab, setCreateTab] = useState<"new" | "templates" | "previous">(
    "new",
  );
  const [inheritDialogOpen, setInheritDialogOpen] = useState(false);
  const [pendingInherit, setPendingInherit] = useState<{
    sourceElementId: string;
    requisiteId: string;
    requisiteName: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    fieldType: "text",
    isRequired: false,
    placeholder: "",
    optionsText: "",
    allowMultiple: false,
  });
  const [dupDialogOpen, setDupDialogOpen] = useState(false);
  const [prevMatchDialogOpen, setPrevMatchDialogOpen] = useState(false);
  const [prevMatchesState, setPrevMatchesState] = useState<any[]>([]);
  const [selectedPrevIndex, setSelectedPrevIndex] = useState(0);
  const [editData, setEditData] = useState<{
    name: string;
    label: string;
    fieldType: string;
    isRequired: boolean;
    placeholder?: string;
    optionsText?: string;
    allowMultiple?: boolean;
  } | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const createMutation = useMutation(apiClient.createProcessRequisite, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(["processRequisites", elementId]);
      // Also refresh the schema to reflect auto-created DECISION and connection
      await queryClient.invalidateQueries({
        queryKey: ["processSchema"],
        exact: false,
      });
      setIsCreating(false);
      setFormData({
        name: "",
        label: "",
        fieldType: "text",
        isRequired: false,
        placeholder: "",
        optionsText: "",
        allowMultiple: false,
      });
      toast({
        title: "Реквизит добавлен",
        description: "Реквизит успешно добавлен",
      });
    },
  });

  const updateMutation = useMutation(apiClient.updateProcessRequisite, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processRequisites", elementId]);
      setEditingId(null);
      setEditData(null);
      toast({ title: "Реквизит обновлен", description: "Изменения сохранены" });
    },
  });

  const updateCascade = useMutation(apiClient.updateRequisiteCascade, {
    onSuccess: (res: any) => {
      queryClient.invalidateQueries(["processRequisites", elementId]);
      setEditingId(null);
      setEditData(null);
      toast({
        title: "Реквизит обновлен",
        description: `Изменения применены также к дочерним процессам (${res?.updatedChildren ?? 0})`,
      });
    },
    onError: (e: any) => {
      toast({
        title: "Не удалось обновить реквизит",
        description: e?.message || "Попробуйте ещё раз",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation(apiClient.deleteProcessRequisite, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processRequisites", elementId]);
      toast({
        title: "Реквизит удален",
        description: "Реквизит успешно удален",
      });
    },
  });

  const deleteCascade = useMutation(apiClient.deleteRequisiteCascade, {
    onSuccess: (res: any) => {
      queryClient.invalidateQueries(["processRequisites", elementId]);
      toast({
        title: "Реквизит удален",
        description: `Также удалён в дочерних процессах (${res?.deletedChildren ?? 0})`,
      });
    },
    onError: (e: any) => {
      toast({
        title: "Не удалось удалить реквизит",
        description: e?.message || "Попробуйте ещё раз",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let name = formData.name.trim();
    const isLabel = formData.fieldType === "label";
    if (isLabel) {
      name = `label_${Date.now()}`;
    }
    if (!formData.label.trim()) return;

    const existsInCurrent = (requisites as any[]).some(
      (r) => String(r.name || "").trim() === name,
    );
    if (existsInCurrent && !isLabel) {
      setDupDialogOpen(true);
      return;
    }

    const matchesInPrev = (previousRequisites as any[]).filter(
      (row: any) => String(row?.requisite?.name || "").trim() === name,
    );
    if (matchesInPrev.length > 0 && !isLabel) {
      setPrevMatchesState(matchesInPrev);
      setSelectedPrevIndex(0);
      setPrevMatchDialogOpen(true);
      return;
    }

    const options =
      formData.fieldType === "select"
        ? formData.optionsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    createMutation.mutate({
      elementId,
      name,
      label: formData.label,
      fieldType: formData.fieldType,
      isRequired: isLabel ? false : formData.isRequired,
      placeholder: isLabel ? undefined : formData.placeholder,
      options,
      allowMultiple:
        formData.fieldType === "select" ? formData.allowMultiple : false,
    });
  };

  const { data: templateResults = [], isFetching: isTemplateFetching } =
    useQuery(
      ["requisiteTemplates", templateQuery.trim() ? templateQuery : "__all__"],
      () =>
        apiClient.listRequisiteTemplates(
          templateQuery.trim() ? { query: templateQuery } : undefined,
        ),
      {
        enabled:
          isTemplatePickerOpen || (isCreating && createTab === "templates"),
      },
    );

  // Previous processes and requisites for inheritance
  const { data: previousProcesses = [] } = useQuery(
    ["previousProcesses", elementId, isCreating],
    () => apiClient.listPreviousProcesses({ elementId }),
    { enabled: !!elementId && isCreating },
  );

  const { data: previousRequisites = [] } = useQuery(
    ["previousRequisites", elementId, isCreating ? "open" : "closed"],
    () => apiClient.listPreviousRequisites({ elementId }),
    { enabled: !!elementId && isCreating },
  );

  const updateTemplateMutation = useMutation(
    apiClient.updateRequisiteTemplate,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["requisiteTemplates"]);
        toast({ title: "Шаблон обновлен" });
      },
      onError: (e: any) =>
        toast({
          title: "Ошибка",
          description: e?.message || "Не удалось обновить шаблон",
          variant: "destructive",
        }),
    },
  );
  const createTemplateMutation = useMutation(
    apiClient.createRequisiteTemplate,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["requisiteTemplates"]);
        toast({ title: "Шаблон сохранён" });
      },
      onError: (e: any) =>
        toast({
          title: "Ошибка",
          description: e?.message || "Не удалось сохранить шаблон",
          variant: "destructive",
        }),
    },
  );

  const startEdit = (req: any) => {
    /* used via onClick edit button */
    let optionsText = "";
    try {
      optionsText = req.options
        ? (JSON.parse(req.options as string) as string[]).join("\n")
        : "";
    } catch {
      optionsText = "";
    }
    setEditingId(req.id);
    setEditData({
      name: req.name,
      label: req.label,
      fieldType: req.fieldType,
      isRequired: !!req.isRequired,
      placeholder: req.placeholder || "",
      optionsText,
      allowMultiple: !!req.allowMultiple,
    });
  };

  async function getChildDependentsByName(
    requisiteName: string,
  ): Promise<string[]> {
    try {
      const children = await apiClient.listChildElements({
        parentElementId: elementId,
      });
      const names: string[] = [];
      for (const ch of children as any[]) {
        const reqs = await apiClient.listProcessRequisites({
          elementId: ch.id,
        });
        const found = (reqs as any[]).some((r) => {
          let meta: any = {};
          try {
            meta = r.validation ? JSON.parse(r.validation as string) : {};
          } catch {
            meta = {};
          }
          return (
            meta?.inherited &&
            meta?.inheritedFromElementId === elementId &&
            r.name === requisiteName
          );
        });
        if (found) names.push(ch.name);
      }
      return names;
    } catch {
      return [];
    }
  }

  const saveEdit = async () => {
    if (!editingId || !editData) return;
    const options =
      editData.fieldType === "select"
        ? (editData.optionsText || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    // Check dependencies in children
    const current = (requisites as any[]).find((r) => r.id === editingId);
    const dependents = current
      ? await getChildDependentsByName(current.name)
      : [];
    if (dependents.length > 0) {
      const first = dependents[0];
      const proceed = window.confirm(
        `Внимание! Этот реквизит используется в процессе '${first}'${dependents.length > 1 ? ` и ещё ${dependents.length - 1}` : ""}. Вы уверены, что хотите продолжить?`,
      );
      if (!proceed) return;
      updateCascade.mutate({
        parentElementId: elementId,
        parentRequisiteId: editingId,
        data: {
          name: editData.name,
          label: editData.label,
          fieldType: editData.fieldType,
          isRequired:
            editData.fieldType === "label" ? false : editData.isRequired,
          placeholder:
            editData.fieldType === "label" ? undefined : editData.placeholder,
          options,
          allowMultiple:
            editData.fieldType === "select" ? !!editData.allowMultiple : false,
        },
      });
      return;
    }

    updateMutation.mutate({
      id: editingId,
      name: editData.name,
      label: editData.label,
      fieldType: editData.fieldType,
      isRequired: editData.fieldType === "label" ? false : editData.isRequired,
      placeholder:
        editData.fieldType === "label" ? undefined : editData.placeholder,
      options,
      allowMultiple:
        editData.fieldType === "select" ? !!editData.allowMultiple : false,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Реквизиты</h4>
        <Button size="sm" variant="outline" onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Добавить
        </Button>
      </div>

      {isCreating && (
        <Card className="p-3">
          <Tabs value={createTab} onValueChange={(v) => setCreateTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-3">
              <TabsTrigger value="new">Создать</TabsTrigger>
              <TabsTrigger value="templates">Шаблоны функций</TabsTrigger>
              <TabsTrigger value="previous">Предыдущие процессы</TabsTrigger>
            </TabsList>

            <TabsContent value="new">
              {/* Dialog: duplicate name in current process */}
              <Dialog open={dupDialogOpen} onOpenChange={setDupDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Реквизит уже существует</DialogTitle>
                    <DialogDescription>
                      В этом процессе уже есть реквизит с таким именем. Добавить
                      ещё один с тем же именем?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDupDialogOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={() => {
                        setDupDialogOpen(false);
                        const options =
                          formData.fieldType === "select"
                            ? formData.optionsText
                                .split("\n")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            : undefined;
                        createMutation.mutate({
                          elementId,
                          name: formData.name.trim(),
                          label: formData.label,
                          fieldType: formData.fieldType,
                          isRequired: formData.isRequired,
                          placeholder: formData.placeholder,
                          options,
                          allowMultiple:
                            formData.fieldType === "select"
                              ? formData.allowMultiple
                              : false,
                        });
                      }}
                    >
                      Продолжить
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Dialog: found same-name in previous processes */}
              <Dialog
                open={prevMatchDialogOpen}
                onOpenChange={setPrevMatchDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Найден одноимённый реквизит</DialogTitle>
                    <DialogDescription>
                      В предыдущих процессах есть реквизит с таким же именем.
                      Унаследовать его или создать новый?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    {prevMatchesState.length > 1 && (
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={selectedPrevIndex}
                        onChange={(e) =>
                          setSelectedPrevIndex(parseInt(e.target.value) || 0)
                        }
                      >
                        {prevMatchesState.map((m: any, idx: number) => (
                          <option key={m.requisite.id} value={idx}>
                            {m.elementName || m.elementId}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPrevMatchDialogOpen(false);
                        const options =
                          formData.fieldType === "select"
                            ? formData.optionsText
                                .split("\n")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            : undefined;
                        createMutation.mutate({
                          elementId,
                          name: formData.name.trim(),
                          label: formData.label,
                          fieldType: formData.fieldType,
                          isRequired: formData.isRequired,
                          placeholder: formData.placeholder,
                          options,
                          allowMultiple:
                            formData.fieldType === "select"
                              ? formData.allowMultiple
                              : false,
                        });
                      }}
                    >
                      Создать новый
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          const match = prevMatchesState[
                            selectedPrevIndex
                          ] as any;
                          await apiClient.inheritRequisiteFromPrevious({
                            sourceElementId: match.elementId,
                            targetElementId: elementId,
                            requisiteId: match.requisite.id,
                            mode: "inherit",
                          });
                          setPrevMatchDialogOpen(false);
                          setIsCreating(false);
                          await queryClient.invalidateQueries([
                            "processRequisites",
                            elementId,
                          ]);
                          toast({ title: "Реквизит унаследован" });
                        } catch (e: any) {
                          toast({
                            title: "Ошибка",
                            description:
                              e?.message || "Не удалось унаследовать",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Унаследовать
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className={formData.fieldType === "label" ? "hidden" : ""}>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs">Название поля</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setIsTemplatePickerOpen(true)}
                      title="Выбрать из шаблонов"
                      aria-label="Выбрать из шаблонов"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={
                      formData.fieldType === "label"
                        ? "не требуется для типа «Надпись»"
                        : "название_поля"
                    }
                    disabled={formData.fieldType === "label"}
                  />

                  <Dialog
                    open={isTemplatePickerOpen}
                    onOpenChange={setIsTemplatePickerOpen}
                  >
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Выбрать шаблон реквизита</DialogTitle>
                        <DialogDescription>
                          Найдите шаблон по системному имени и примените его
                          значения в форму
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Input
                          placeholder="Поиск по системному имени"
                          onChange={(e) =>
                            debouncedSetTemplateQuery(e.target.value)
                          }
                        />
                        <div className="max-h-64 overflow-auto border rounded">
                          {isTemplateFetching ? (
                            <div className="p-3 text-sm text-muted-foreground">
                              Загрузка...
                            </div>
                          ) : (
                            <div className="divide-y">
                              {templateResults.map((t: any) => (
                                <button
                                  type="button"
                                  key={t.id}
                                  className="w-full text-left px-3 py-2 hover:bg-muted"
                                  onClick={() => {
                                    let optionsText = "";
                                    try {
                                      optionsText = t.options
                                        ? (
                                            JSON.parse(
                                              t.options as string,
                                            ) as string[]
                                          ).join("\n")
                                        : "";
                                    } catch {
                                      optionsText = "";
                                    }
                                    setFormData((prev) => ({
                                      ...prev,
                                      name: t.name ?? prev.name,
                                      label: t.label ?? prev.label,
                                      fieldType: t.fieldType ?? prev.fieldType,
                                      isRequired: !!t.isRequired,
                                      placeholder: t.placeholder ?? "",
                                      optionsText,
                                      allowMultiple: !!t.allowMultiple,
                                    }));
                                    setSelectedTemplate(t);
                                    setIsTemplatePickerOpen(false);
                                  }}
                                >
                                  <div className="font-medium text-sm">
                                    {t.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {t.label} • {t.fieldType}
                                    {t.isRequired ? " • обязательное" : ""}
                                  </div>
                                </button>
                              ))}
                              {templateResults.length === 0 && (
                                <div className="p-3 text-sm text-muted-foreground">
                                  Ничего не найдено
                                </div>
                              )}
                            </div>
                          )}{" "}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsTemplatePickerOpen(false)}
                        >
                          Закрыть
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div>
                  <Label className="text-xs">
                    {formData.fieldType === "label"
                      ? "Введите надпись"
                      : "Подпись"}
                  </Label>
                  <Input
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    placeholder={
                      formData.fieldType === "label"
                        ? "Например: Чек‑лист"
                        : "Подпись поля"
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Тип поля</Label>
                  <select
                    value={formData.fieldType}
                    onChange={(e) =>
                      setFormData({ ...formData, fieldType: e.target.value })
                    }
                    className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                  >
                    <option value="text">Текст</option>
                    <option value="email">Email</option>
                    <option value="phone">Телефон</option>
                    <option value="date">Дата</option>
                    <option value="number">Число</option>
                    <option value="textarea">Многострочный текст</option>
                    <option value="select">Выпадающий список</option>
                    <option value="file">Файл</option>
                    <option value="approval">Согласование</option>
                    <option value="label">Надпись</option>
                  </select>
                </div>
                {formData.fieldType === "select" && (
                  <div className="space-y-2">
                    <Label className="text-xs">
                      Значения списка (по одному в строке)
                    </Label>
                    <Textarea
                      value={formData.optionsText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          optionsText: e.target.value,
                        })
                      }
                      rows={3}
                      className="text-xs"
                      placeholder={"Например\nВариант A\nВариант B"}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.allowMultiple}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            allowMultiple: e.target.checked,
                          })
                        }
                      />
                      <Label className="text-xs">Множественный выбор</Label>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={
                      formData.fieldType === "label"
                        ? false
                        : formData.isRequired
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, isRequired: e.target.checked })
                    }
                    className="rounded"
                    disabled={formData.fieldType === "label"}
                  />
                  <Label
                    className={`text-xs ${formData.fieldType === "label" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Обязательное поле
                  </Label>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const options =
                        formData.fieldType === "select"
                          ? formData.optionsText
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean)
                          : undefined;
                      const sysName = prompt(
                        "Системное имя шаблона",
                        formData.name || "requisite_" + Date.now(),
                      );
                      if (!sysName) return;
                      createTemplateMutation.mutate({
                        name: sysName,
                        label: formData.label,
                        fieldType: formData.fieldType,
                        isRequired: formData.isRequired,
                        placeholder: formData.placeholder || undefined,
                        options,
                        allowMultiple:
                          formData.fieldType === "select"
                            ? formData.allowMultiple
                            : false,
                      });
                    }}
                  >
                    Сохранить как шаблон
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!selectedTemplate}
                    onClick={() => {
                      if (!selectedTemplate) return;
                      const options =
                        formData.fieldType === "select"
                          ? formData.optionsText
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean)
                          : undefined;
                      updateTemplateMutation.mutate({
                        id: selectedTemplate.id,
                        label: formData.label,
                        fieldType: formData.fieldType,
                        isRequired: formData.isRequired,
                        placeholder: formData.placeholder || undefined,
                        options,
                        allowMultiple:
                          formData.fieldType === "select"
                            ? formData.allowMultiple
                            : false,
                      });
                    }}
                  >
                    Обновить выбранный шаблон
                  </Button>
                  {selectedTemplate && (
                    <span className="text-xs text-muted-foreground">
                      Выбран: {selectedTemplate.name}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createMutation.isLoading}
                  >
                    Добавить
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreating(false)}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="templates">
              <div className="space-y-3">
                <Input
                  placeholder="Поиск по системному имени"
                  onChange={(e) => debouncedSetTemplateQuery(e.target.value)}
                />
                <div className="max-h-64 overflow-auto border rounded">
                  {isTemplateFetching ? (
                    <div className="p-3 text-sm text-muted-foreground">
                      Загрузка...
                    </div>
                  ) : (
                    <div className="divide-y">
                      {templateResults.map((t: any) => (
                        <button
                          type="button"
                          key={t.id}
                          className="w-full text-left px-3 py-2 hover:bg-muted"
                          onClick={() => {
                            let optionsText = "";
                            try {
                              optionsText = t.options
                                ? (
                                    JSON.parse(t.options as string) as string[]
                                  ).join("\n")
                                : "";
                            } catch {
                              optionsText = "";
                            }
                            setFormData({
                              name: t.name || "",
                              label: t.label || "",
                              fieldType: t.fieldType || "text",
                              isRequired: !!t.isRequired,
                              placeholder: t.placeholder || "",
                              optionsText,
                              allowMultiple: !!t.allowMultiple,
                            });
                            setCreateTab("new");
                          }}
                        >
                          <div className="font-medium text-sm">{t.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {t.label} • {t.fieldType}
                          </div>
                        </button>
                      ))}
                      {templateResults.length === 0 && (
                        <div className="p-3 text-sm text-muted-foreground">
                          Ничего не найдено
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="previous">
              <div className="space-y-3">
                {previousProcesses.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Нет связанных предшествующих процессов
                  </div>
                ) : null}

                <div className="max-h-80 overflow-auto space-y-3">
                  {/* Group previous requisites by process */}
                  {(() => {
                    const groups: Record<
                      string,
                      { elementId: string; items: any[] }
                    > = {};
                    (previousRequisites as any[]).forEach((row: any) => {
                      const key = row.elementName || row.elementId;
                      if (!groups[key])
                        groups[key] = { elementId: row.elementId, items: [] };
                      const g = groups[key]!;
                      g.items.push(row.requisite);
                    });
                    const entries = Object.entries(groups);
                    if (entries.length === 0) {
                      return (
                        <div className="text-sm text-muted-foreground">
                          Нет реквизитов для наследования
                        </div>
                      );
                    }
                    return entries.map(([name, group]) => (
                      <div key={group.elementId} className="border rounded">
                        <div className="px-3 py-2 text-xs font-medium bg-muted">
                          {name}
                        </div>
                        <div className="divide-y">
                          {group.items.map((r: any) => (
                            <div
                              key={r.id}
                              className="px-3 py-2 flex items-center justify-between"
                            >
                              <div className="text-sm truncate">
                                <span className="font-medium">{r.label}</span>
                                <span className="text-muted-foreground">
                                  {" "}
                                  • {r.name} • {r.fieldType}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // Check duplicates by name
                                    const exists = (requisites as any[]).some(
                                      (q) => q.name === r.name,
                                    );
                                    if (exists) {
                                      setPendingInherit({
                                        sourceElementId: group.elementId,
                                        requisiteId: r.id,
                                        requisiteName: r.name,
                                      });
                                      setInheritDialogOpen(true);
                                    } else {
                                      apiClient
                                        .inheritRequisiteFromPrevious({
                                          sourceElementId: group.elementId,
                                          targetElementId: elementId,
                                          requisiteId: r.id,
                                          mode: "inherit",
                                        })
                                        .then(() => {
                                          queryClient.invalidateQueries([
                                            "processRequisites",
                                            elementId,
                                          ]);
                                          toast({
                                            title: "Добавлено",
                                            description: "Реквизит унаследован",
                                          });
                                        })
                                        .catch((e: any) => {
                                          toast({
                                            title: "Ошибка",
                                            description:
                                              e?.message ||
                                              "Не удалось добавить",
                                            variant: "destructive",
                                          });
                                        });
                                    }
                                  }}
                                >
                                  Унаследовать
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    apiClient
                                      .inheritRequisiteFromPrevious({
                                        sourceElementId: group.elementId,
                                        targetElementId: elementId,
                                        requisiteId: r.id,
                                        mode: "copy",
                                      })
                                      .then(() => {
                                        queryClient.invalidateQueries([
                                          "processRequisites",
                                          elementId,
                                        ]);
                                        toast({
                                          title: "Добавлено",
                                          description:
                                            "Создана копия реквизита",
                                        });
                                      })
                                      .catch((e: any) => {
                                        toast({
                                          title: "Ошибка",
                                          description:
                                            e?.message || "Не удалось добавить",
                                          variant: "destructive",
                                        });
                                      });
                                  }}
                                >
                                  Копия
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreating(false)}
                  >
                    Готово
                  </Button>
                </div>
              </div>

              {/* Dialog for duplicate name choice */}
              <Dialog
                open={inheritDialogOpen}
                onOpenChange={setInheritDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Реквизит с таким именем уже существует
                    </DialogTitle>
                    <DialogDescription>
                      Выберите действие для "{pendingInherit?.requisiteName}" в
                      текущем процессе
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!pendingInherit) return;
                        apiClient
                          .inheritRequisiteFromPrevious({
                            sourceElementId: pendingInherit.sourceElementId,
                            targetElementId: elementId,
                            requisiteId: pendingInherit.requisiteId,
                            mode: "copy",
                          })
                          .then(() => {
                            setInheritDialogOpen(false);
                            setPendingInherit(null);
                            queryClient.invalidateQueries([
                              "processRequisites",
                              elementId,
                            ]);
                            toast({
                              title: "Добавлено",
                              description: "Создана копия реквизита",
                            });
                          })
                          .catch((e: any) => {
                            toast({
                              title: "Ошибка",
                              description: e?.message || "Не удалось добавить",
                              variant: "destructive",
                            });
                          });
                      }}
                    >
                      Добавить копию
                    </Button>
                    <Button
                      onClick={() => {
                        if (!pendingInherit) return;
                        apiClient
                          .inheritRequisiteFromPrevious({
                            sourceElementId: pendingInherit.sourceElementId,
                            targetElementId: elementId,
                            requisiteId: pendingInherit.requisiteId,
                            mode: "inherit",
                          })
                          .then(() => {
                            setInheritDialogOpen(false);
                            setPendingInherit(null);
                            queryClient.invalidateQueries([
                              "processRequisites",
                              elementId,
                            ]);
                            toast({
                              title: "Добавлено",
                              description: "Реквизит унаследован",
                            });
                          })
                          .catch((e: any) => {
                            toast({
                              title: "Ошибка",
                              description: e?.message || "Не удалось добавить",
                              variant: "destructive",
                            });
                          });
                      }}
                    >
                      Унаследовать
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      <div className="space-y-2">
        {requisites.map((req) => {
          let meta: { inherited?: boolean; inheritedFromElementName?: string } =
            {};
          try {
            meta = req.validation
              ? (JSON.parse(req.validation as string) as {
                  inherited?: boolean;
                  inheritedFromElementName?: string;
                })
              : {};
          } catch {}
          const isEditing = editingId === req.id;
          return (
            <Card key={req.id} className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {meta?.inherited && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <button
                        className="inline-flex items-center gap-1 hover:text-foreground"
                        title="Отключить наследование"
                        onClick={async () => {
                          const ok = window.confirm(
                            "Отключить наследование для этого реквизита? Будет создана независимая копия настроек.",
                          );
                          if (!ok) return;
                          try {
                            await apiClient.breakRequisiteInheritance({
                              targetRequisiteId: req.id,
                            });
                            await queryClient.invalidateQueries([
                              "processRequisites",
                              elementId,
                            ]);
                            toast({ title: "Наследование отключено" });
                          } catch (e: any) {
                            toast({
                              title: "Ошибка",
                              description:
                                e?.message ||
                                "Не удалось отключить наследование",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span>
                          Наследуется из:{" "}
                          {meta.inheritedFromElementName ||
                            "предыдущего процесса"}
                        </span>
                      </button>
                    </div>
                  )}

                  {!isEditing ? (
                    <>
                      <div className="text-sm font-medium">{req.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {req.name} • {req.fieldType}{" "}
                        {req.isRequired && "• Обязательное"}
                      </div>
                      {req.fieldType === "approval" && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Этапы согласования будут настроены заявителем при
                          заполнении формы
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                          className={
                            editData?.fieldType === "label" ? "hidden" : ""
                          }
                        >
                          <Label className="text-xs">Системное имя</Label>
                          <Input
                            value={editData?.name ?? ""}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...(prev as any),
                                name: e.target.value,
                              }))
                            }
                            placeholder="naprimer_service_name"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">
                            {editData?.fieldType === "label"
                              ? "Введите надпись"
                              : "Подпись"}
                          </Label>
                          <Input
                            value={editData?.label ?? ""}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...(prev as any),
                                label: e.target.value,
                              }))
                            }
                            placeholder={
                              editData?.fieldType === "label"
                                ? "Например: Чек‑лист"
                                : "Отображаемое название"
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div>
                          <Label className="text-xs">Тип поля</Label>
                          <select
                            value={editData?.fieldType ?? "text"}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...(prev as any),
                                fieldType: e.target.value,
                              }))
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="text">Текст</option>
                            <option value="email">Email</option>
                            <option value="phone">Телефон</option>
                            <option value="date">Дата</option>
                            <option value="number">Число</option>
                            <option value="textarea">
                              Многострочный текст
                            </option>
                            <option value="select">Выпадающий список</option>
                            <option value="file">Файл</option>
                            <option value="approval">Согласование</option>
                            <option value="label">Надпись</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id={`req-required-${req.id}`}
                            type="checkbox"
                            checked={!!editData?.isRequired}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...(prev as any),
                                isRequired: e.target.checked,
                              }))
                            }
                            disabled={editData?.fieldType === "label"}
                            className="rounded"
                          />
                          <Label
                            htmlFor={`req-required-${req.id}`}
                            className={`text-xs ${editData?.fieldType === "label" ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            Обязательное
                          </Label>
                        </div>
                        <div>
                          <Label className="text-xs">Подсказка</Label>
                          <Input
                            value={editData?.placeholder ?? ""}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...(prev as any),
                                placeholder: e.target.value,
                              }))
                            }
                            placeholder="Подсказка для пользователя"
                          />
                        </div>
                      </div>

                      {editData?.fieldType === "select" && (
                        <div className="space-y-2">
                          <Label className="text-xs">
                            Значения списка (по одному в строке)
                          </Label>
                          <Textarea
                            rows={3}
                            value={editData?.optionsText ?? ""}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...(prev as any),
                                optionsText: e.target.value,
                              }))
                            }
                            className="text-xs"
                            placeholder={"Например\nВариант A\nВариант B"}
                          />
                          <label className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={!!editData?.allowMultiple}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...(prev as any),
                                  allowMultiple: e.target.checked,
                                }))
                              }
                            />
                            Множественный выбор
                          </label>
                        </div>
                      )}

                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setEditData(null);
                          }}
                        >
                          Отмена
                        </Button>
                        <Button size="sm" onClick={saveEdit}>
                          Сохранить
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-1">
                  {!isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(req)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const dependents = await getChildDependentsByName(
                            req.name,
                          );
                          if (dependents.length > 0) {
                            const first = dependents[0];
                            const proceed = window.confirm(
                              `Внимание! Этот реквизит используется в процессе '${first}'${dependents.length > 1 ? ` и ещё ${dependents.length - 1}` : ""}. Вы уверены, что хотите продолжить?`,
                            );
                            if (!proceed) return;
                            deleteCascade.mutate({
                              parentElementId: elementId,
                              parentRequisiteId: req.id,
                            });
                            return;
                          }
                          deleteMutation.mutate({ id: req.id });
                        }}
                        disabled={
                          deleteMutation.isLoading || deleteCascade.isLoading
                        }
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
        {requisites.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Нет добавленных реквизитов
          </p>
        )}
      </div>
    </div>
  );
}

function ProcessChecklistsPanel({
  elementId,
  element,
}: {
  elementId: string;
  element?: any;
}) {
  const { data: checklists = [] } = useQuery(
    ["processChecklists", elementId],
    () => apiClient.listProcessChecklists({ elementId }),
    { enabled: !!elementId },
  );
  const [isCreating, setIsCreating] = useState(false);
  // Режим добавления объединяет: создать, шаблоны, предыдущие
  // убрали отдельное окно вставки — теперь это вкладки в режиме создания

  const [createTab, setCreateTab] = useState<"new" | "templates" | "previous">(
    "new",
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [insertMode, setInsertMode] = useState<"append" | "replace">("append");
  const { data: checklistTemplates = [] } = useQuery(
    ["checklistTemplates", "panel"],
    () => apiClient.listChecklistTemplates(),
    { enabled: !!elementId },
  );
  const { data: previousChecklists = [] } = useQuery(
    ["previousChecklists", elementId],
    () => apiClient.listPreviousChecklists({ elementId }),
    { enabled: !!elementId },
  );
  const [inheritDialogOpen, setInheritDialogOpen] = useState(false);
  const [pendingChecklist, setPendingChecklist] = useState<{
    sourceElementId: string;
    checklistId: string;
    checklistName: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isRequired: true,
    allowDocuments: true,
    allowComments: true,
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  // Метаданные всего чек-листа (заголовок и описание) сохраняем в properties элемента процесса
  const [listTitle, setListTitle] = useState<string>("");
  const [listDescription, setListDescription] = useState<string>("");
  const saveMetaMutation = useMutation(apiClient.updateProcessSchemaElement, {
    onSuccess: () => {
      void queryClient.invalidateQueries(["processChecklists", elementId]);
    },
  });
  useEffect(() => {
    try {
      const props = element?.properties
        ? (JSON.parse(element.properties as string) as any)
        : {};
      setListTitle(props.checklistTitle || "");
      setListDescription(props.checklistDescription || "");
    } catch {
      setListTitle("");
      setListDescription("");
    }
  }, [element?.properties]);

  const exportChecklistMutation = useMutation(
    apiClient.exportProcessChecklistToExcel,
    {
      onSuccess: (res) => {
        if (res?.url) window.open(res.url, "_blank");
      },
      onError: (e: any) =>
        toast({
          title: "Не удалось экспортировать",
          description: e?.message || "Ошибка экспорта чек-листа",
          variant: "destructive",
        }),
    },
  );

  const applyTemplateMutation = useMutation(
    apiClient.applyChecklistTemplateToElement,
    {
      onSuccess: (res) => {
        void queryClient.invalidateQueries(["processChecklists", elementId]);
        toast({
          title: "Шаблон применён",
          description: `Добавлено пунктов: ${res?.created ?? 0}`,
        });
        setIsCreating(false);
        setSelectedTemplateId("");
        setInsertMode("append");
      },
      onError: (e: any) =>
        toast({
          title: "Не удалось применить шаблон",
          description: e?.message || "Попробуйте ещё раз",
          variant: "destructive",
        }),
    },
  );

  const importChecklistMutation = useMutation(
    apiClient.importProcessChecklistFromExcel,
    {
      onSuccess: (res) => {
        void queryClient.invalidateQueries(["processChecklists", elementId]);
        toast({
          title: "Чек-лист импортирован",
          description: `Строк: ${res?.imported ?? 0}`,
        });
      },
      onError: (e: any) =>
        toast({
          title: "Не удалось импортировать",
          description: e?.message || "Проверьте файл XLSX",
          variant: "destructive",
        }),
    },
  );

  const createMutation = useMutation(apiClient.createProcessChecklist, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processChecklists", elementId]);
      setIsCreating(false);
      setFormData({
        name: "",
        description: "",
        isRequired: true,
        allowDocuments: true,
        allowComments: true,
      });
      toast({
        title: "Чек-лист добавлен",
        description: "Пункт чек-листа успешно добавлен",
      });
    },
  });

  const updateMutation = useMutation(apiClient.updateProcessChecklist, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processChecklists", elementId]);
      toast({ title: "Чек-лист обновлен", description: "Изменения сохранены" });
    },
  });

  const deleteMutation = useMutation(apiClient.deleteProcessChecklist, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processChecklists", elementId]);
      toast({
        title: "Чек-лист удален",
        description: "Пункт чек-листа успешно удален",
      });
    },
  });

  const inheritChecklistMutation = useMutation(
    apiClient.inheritChecklistFromPrevious,
    {
      onSuccess: () => {
        void queryClient.invalidateQueries(["processChecklists", elementId]);
        toast({ title: "Добавлено", description: "Пункт добавлен" });
        setIsCreating(false);
        setPendingChecklist(null);
        setInheritDialogOpen(false);
      },
      onError: (e: any) =>
        toast({
          title: "Не удалось добавить",
          description: e?.message || "Попробуйте ещё раз",
          variant: "destructive",
        }),
    },
  );

  const breakChecklistInheritanceMutation = useMutation(
    apiClient.breakChecklistInheritance,
    {
      onSuccess: () => {
        void queryClient.invalidateQueries(["processChecklists", elementId]);
        toast({ title: "Наследование отключено" });
      },
      onError: (e: any) =>
        toast({
          title: "Ошибка",
          description: e?.message || "Не удалось отключить наследование",
          variant: "destructive",
        }),
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    createMutation.mutate({ ...formData, elementId });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Чек-листы</h4>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </div>
      </div>

      {/* Общие параметры набора чек-листа */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Название чек-листа</Label>
          <Input
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            onBlur={() => {
              const props = (() => {
                try {
                  return element?.properties
                    ? (JSON.parse(element.properties as string) as any)
                    : {};
                } catch {
                  return {};
                }
              })();
              saveMetaMutation.mutate({
                id: elementId,
                properties: {
                  ...props,
                  checklistTitle: listTitle,
                  checklistDescription: listDescription,
                },
              });
            }}
            placeholder="Например: Комплект документов"
          />
        </div>
        <div>
          <Label className="text-xs">Описание чек-листа</Label>
          <Textarea
            rows={2}
            value={listDescription}
            onChange={(e) => setListDescription(e.target.value)}
            onBlur={() => {
              const props = (() => {
                try {
                  return element?.properties
                    ? (JSON.parse(element.properties as string) as any)
                    : {};
                } catch {
                  return {};
                }
              })();
              saveMetaMutation.mutate({
                id: elementId,
                properties: {
                  ...props,
                  checklistTitle: listTitle,
                  checklistDescription: listDescription,
                },
              });
            }}
            placeholder="Кратко опишите, что нужно предоставить"
          />
        </div>
      </div>

      {/* Кнопки вставки свернуты в общий диалог добавления (вкладки ниже) */}

      {/* Duplicate name choice dialog */}
      <Dialog open={inheritDialogOpen} onOpenChange={setInheritDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Выберите действие для "{pendingChecklist?.checklistName}"
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            В текущем процессе уже есть пункт с таким названием. Что сделать?
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (!pendingChecklist) return;
                inheritChecklistMutation.mutate({
                  sourceElementId: pendingChecklist.sourceElementId,
                  checklistId: pendingChecklist.checklistId,
                  targetElementId: elementId,
                  mode: "copy",
                });
              }}
            >
              Добавить копию
            </Button>
            <Button
              onClick={() => {
                if (!pendingChecklist) return;
                inheritChecklistMutation.mutate({
                  sourceElementId: pendingChecklist.sourceElementId,
                  checklistId: pendingChecklist.checklistId,
                  targetElementId: elementId,
                  mode: "inherit",
                });
              }}
            >
              Унаследовать из предыдущего
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isCreating && (
        <Card className="p-3">
          <Tabs value={createTab} onValueChange={(v) => setCreateTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-3">
              <TabsTrigger value="new">Создать</TabsTrigger>
              <TabsTrigger value="templates">Шаблоны функций</TabsTrigger>
              <TabsTrigger value="previous">Предыдущие процессы</TabsTrigger>
            </TabsList>

            <TabsContent value="new">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportChecklistMutation.mutate({ elementId })}
                  disabled={exportChecklistMutation.isLoading}
                >
                  Экспорт
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".xlsx";
                    input.onchange = async () => {
                      const file = input.files?.[0];
                      if (!file) return;
                      const base64 = await encodeFileAsBase64DataURL(file);
                      if (!base64) {
                        toast({ title: "Файл слишком большой" });
                        return;
                      }
                      importChecklistMutation.mutate({ elementId, base64 });
                    };
                    input.click();
                  }}
                  disabled={importChecklistMutation.isLoading}
                >
                  Импорт
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label className="text-xs">Название пункта</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Например: Паспорт организации"
                  />
                </div>
                <div>
                  <Label className="text-xs">Описание пункта</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Что именно требуется приложить"
                    rows={4}
                    className="text-xs"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isRequired}
                    onChange={(e) =>
                      setFormData({ ...formData, isRequired: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label className="text-xs">Обязательный пункт</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={formData.allowDocuments}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowDocuments: e.target.checked,
                        })
                      }
                    />
                    Разрешить прикрепление файла
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={formData.allowComments}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowComments: e.target.checked,
                        })
                      }
                    />
                    Разрешить комментарий
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">
                      Файл (пример для пользователя)
                    </Label>
                    <Input
                      type="file"
                      disabled
                      className="cursor-not-allowed"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Пользователь прикрепит файл при заполнении
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs">Комментарий (пример)</Label>
                    <Textarea
                      rows={2}
                      disabled
                      className="text-xs cursor-not-allowed"
                      placeholder="Короткий комментарий"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createMutation.isLoading}
                  >
                    Добавить пункт
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreating(false)}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="templates">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Шаблон</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                  >
                    <option value="">Выберите шаблон</option>
                    {checklistTemplates.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.label}{" "}
                        {(t._count?.items ?? 0) ? `(${t._count.items})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <Label className="text-sm">Режим</Label>
                  <select
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={insertMode}
                    onChange={(e) => setInsertMode(e.target.value as any)}
                  >
                    <option value="append">Добавить к существующим</option>
                    <option value="replace">Заменить существующие</option>
                  </select>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={() =>
                      selectedTemplateId &&
                      applyTemplateMutation.mutate({
                        elementId,
                        templateId: selectedTemplateId,
                        mode: insertMode,
                      })
                    }
                    disabled={
                      !selectedTemplateId || applyTemplateMutation.isLoading
                    }
                  >
                    Применить
                  </Button>
                </DialogFooter>
              </div>
            </TabsContent>

            <TabsContent value="previous">
              <div className="space-y-2 max-h-80 overflow-auto pr-1">
                {previousChecklists.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Нет доступных пунктов из предыдущих процессов
                  </div>
                ) : (
                  Object.entries(
                    previousChecklists.reduce(
                      (
                        acc: Record<string, { name: string; items: any[] }>,
                        row: any,
                      ) => {
                        const key = String(row?.elementId ?? "");
                        if (!acc[key]) {
                          acc[key] = {
                            name: row?.elementName ?? "Процесс",
                            items: [],
                          };
                        }
                        acc[key]!.items.push(row?.checklist);
                        return acc;
                      },
                      {},
                    ),
                  ).map(([elId, group]: any) => (
                    <div key={elId} className="border rounded p-2">
                      <div className="text-sm font-medium mb-2">
                        {group.name}
                      </div>
                      <div className="space-y-1">
                        {group.items.map((it: any) => (
                          <div
                            key={it.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div>{it.name}</div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const exists = (checklists || []).some(
                                  (c: any) => c.name === it.name,
                                );
                                if (exists) {
                                  setPendingChecklist({
                                    sourceElementId: elId,
                                    checklistId: it.id,
                                    checklistName: it.name,
                                  });
                                  setInheritDialogOpen(true);
                                } else {
                                  inheritChecklistMutation.mutate({
                                    sourceElementId: elId,
                                    checklistId: it.id,
                                    targetElementId: elementId,
                                    mode: "inherit",
                                  });
                                }
                              }}
                            >
                              Добавить
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      <div className="space-y-2">
        {checklists.map((item) => (
          <Card key={item.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium flex items-center gap-1">
                  {item.name}
                  {(() => {
                    try {
                      const meta = item.meta
                        ? (JSON.parse(item.meta as string) as {
                            inherited?: boolean;
                            inheritedFromElementName?: string;
                          })
                        : undefined;
                      return meta?.inherited ? (
                        <button
                          className="text-amber-500 text-xs"
                          title={`Унаследовано из ${meta.inheritedFromElementName || "предыдущего процесса"}`}
                          onClick={() => {
                            if (
                              confirm(
                                "Отключить наследование? Пункт станет независимой копией.",
                              )
                            ) {
                              breakChecklistInheritanceMutation.mutate({
                                targetChecklistId: item.id,
                              });
                            }
                          }}
                        >
                          ★
                        </button>
                      ) : null;
                    } catch {
                      return null;
                    }
                  })()}
                </div>
                {item.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {item.isRequired ? "Обязательный" : "Необязательный"}
                </div>{" "}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const name =
                      prompt("Изменить название документа", item.name ?? "") ??
                      item.name;
                    const description =
                      prompt(
                        "Описание (необязательно)",
                        item.description ?? "",
                      ) ?? item.description;
                    const isRequired = confirm(
                      "Обязательный документ? (OK — да)",
                    )
                      ? true
                      : false;
                    const allowDocuments = confirm(
                      "Разрешить загрузку документов? (OK — да)",
                    )
                      ? true
                      : false;
                    const allowComments = confirm(
                      "Разрешить комментарии? (OK — да)",
                    )
                      ? true
                      : false;
                    updateMutation.mutate({
                      id: item.id,
                      name: (name ?? undefined) as string | undefined,
                      description: (description ?? undefined) as
                        | string
                        | undefined,
                      isRequired,
                      allowDocuments,
                      allowComments,
                    });
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate({ id: item.id })}
                  disabled={deleteMutation.isLoading}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {checklists.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Нет добавленных документов
          </p>
        )}
      </div>

      {/* Save current set as template */}
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          className="hidden"
          onClick={async () => {
            const label =
              prompt("Название нового шаблона", "Шаблон чек‑листа") || "";
            if (!label.trim()) return;
            try {
              await apiClient.createChecklistTemplateFromElement({
                elementId,
                label,
              });
              toast({
                title: "Шаблон сохранён",
                description: "Набор пунктов сохранён в библиотеку",
              });
            } catch (e: any) {
              toast({
                title: "Не удалось сохранить шаблон",
                description: e?.message || "Попробуйте ещё раз",
                variant: "destructive",
              });
            }
          }}
        >
          Сохранить набор как шаблон
        </Button>
      </div>
    </div>
  );
}

function ProcessRolesPanel({ elementId }: { elementId: string }) {
  const { data: roles = [] } = useQuery(
    ["processRoles", elementId],
    () => apiClient.listProcessRoles({ elementId }),
    { enabled: !!elementId },
  );
  const { data: roleTypes = [] } = useQuery(["roleTypes"], () =>
    apiClient.listRoleTypes(),
  );
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    roleType: "executor",
    description: "",
    canEdit: false,
    canApprove: false,
    canRegister: false,
  });
  const [isAddingType, setIsAddingType] = useState(false);
  const [newType, setNewType] = useState({ code: "", name: "" });
  const [templateQuery, setTemplateQuery] = useState("");
  const debouncedSetTemplateQuery = React.useMemo(
    () => debounce((v: string) => setTemplateQuery(v), 150),
    [],
  );
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const createRoleTypeMutation = useMutation(apiClient.createRoleType, {
    onSuccess: () => {
      queryClient.invalidateQueries(["roleTypes"]);
      setNewType({ code: "", name: "" });
      setIsAddingType(false);
      toast({ title: "Тип роли добавлен" });
    },
    onError: (e: any) =>
      toast({
        title: "Ошибка",
        description: e?.message || "Не удалось добавить тип роли",
        variant: "destructive",
      }),
  });

  const createMutation = useMutation(apiClient.createProcessRole, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processRoles", elementId]);
      setIsCreating(false);
      setFormData({
        name: "",
        roleType: "executor",
        description: "",
        canEdit: false,
        canApprove: false,
        canRegister: false,
      });
      setTemplateQuery("");
      toast({
        title: "Роль добавлена",
        description: "Роль участника успешно добавлена",
      });
    },
  });

  const deleteMutation = useMutation(apiClient.deleteProcessRole, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processRoles", elementId]);
      toast({
        title: "Роль удалена",
        description: "Роль участника успешно удалена",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    createMutation.mutate({ ...formData, elementId });
  };

  // Load role templates suggestions
  const { data: roleTemplates = [] } = useQuery(
    ["roleTemplates", templateQuery.trim() ? templateQuery : "__all__"],
    () =>
      apiClient.listRoleTemplates(
        templateQuery.trim() ? { query: templateQuery } : undefined,
      ),
    { enabled: isCreating },
  );

  // Editable dropdown state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const applyTemplate = (t: any) => {
    setFormData({
      name: t.name,
      roleType: t.roleType || "executor",
      description: t.description || "",
      canEdit: !!t.canEdit,
      canApprove: !!t.canApprove,
      canRegister: !!t.canRegister,
    });
  };

  const saveTemplateMutation = useMutation(apiClient.createRoleTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(["roleTemplates"]);
      toast({
        title: "Шаблон роли сохранен",
        description: "Роль добавлена в библиотеку",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error?.message || "Не удалось сохранить шаблон",
        variant: "destructive",
      });
    },
  });

  const roleTypeLabels = {
    initiator: "Инициатор",
    applicant: "Заявитель",
    executor: "Исполнитель",
    approver: "Согласующий",
    observer: "Наблюдатель",
  } as Record<string, string>;
  const roleTypeMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    (roleTypes as any[]).forEach((rt: any) => {
      map[rt.code] = rt.name;
    });
    return map;
  }, [roleTypes]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Роли участников</h4>
        <Button size="sm" variant="outline" onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Добавить
        </Button>
      </div>

      {isCreating && (
        <Card className="p-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Label className="text-xs">Название роли</Label>
              <Input
                value={formData.name}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData({ ...formData, name: v });
                  setShowSuggestions(true);
                  debouncedSetTemplateQuery(v);
                }}
                onKeyDown={(e) => {
                  if (!showSuggestions || roleTemplates.length === 0) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHighlightedIndex((i) =>
                      Math.min(i + 1, roleTemplates.length - 1),
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlightedIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter") {
                    const t = roleTemplates[highlightedIndex];
                    if (t) {
                      applyTemplate(t);
                      e.preventDefault();
                    }
                    setShowSuggestions(false);
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                placeholder="Название роли"
              />
              {showSuggestions &&
                formData.name.trim().length > 0 &&
                roleTemplates.length > 0 && (
                  <ul className="absolute z-10 left-0 right-0 mt-1 max-h-48 overflow-auto rounded-md border bg-background shadow">
                    {roleTemplates.map((t: any, idx: number) => (
                      <li
                        key={t.id}
                        className={`px-2 py-1 text-xs cursor-pointer ${
                          idx === highlightedIndex ? "bg-muted" : ""
                        }`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applyTemplate(t);
                          setShowSuggestions(false);
                        }}
                      >
                        {t.name} • {t.roleType}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
            <div>
              <Label className="text-xs">Тип роли</Label>
              <div className="flex items-center gap-2">
                <select
                  value={formData.roleType}
                  onChange={(e) =>
                    setFormData({ ...formData, roleType: e.target.value })
                  }
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                >
                  {roleTypes.length > 0 ? (
                    roleTypes.map((rt: any) => (
                      <option key={rt.id} value={rt.code}>
                        {rt.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="applicant">Заявитель</option>
                      <option value="executor">Исполнитель</option>
                      <option value="approver">Согласующий</option>
                      <option value="observer">Наблюдатель</option>
                    </>
                  )}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingType((v) => !v)}
                >
                  {isAddingType ? "Отмена" : "Добавить тип"}
                </Button>
              </div>
              {isAddingType && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <Input
                    className="col-span-1 h-8 text-xs"
                    placeholder="Код"
                    value={newType.code}
                    onChange={(e) =>
                      setNewType((s) => ({ ...s, code: e.target.value }))
                    }
                  />
                  <Input
                    className="col-span-1 h-8 text-xs"
                    placeholder="Название"
                    value={newType.name}
                    onChange={(e) =>
                      setNewType((s) => ({ ...s, name: e.target.value }))
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      createRoleTypeMutation.mutate({
                        code: newType.code,
                        name: newType.name,
                      })
                    }
                    disabled={
                      createRoleTypeMutation.isLoading || !newType.code.trim()
                    }
                  >
                    Сохранить
                  </Button>
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs">Описание</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Описание роли"
                rows={2}
                className="text-xs"
              />
            </div>
            <div className="space-y-2">
              <div className="border rounded-md p-2">
                <div className="text-[11px] text-muted-foreground mb-1">
                  Настройка прав
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.canEdit}
                    onChange={(e) =>
                      setFormData({ ...formData, canEdit: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label className="text-xs">Редактирование</Label>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="checkbox"
                    checked={formData.canApprove}
                    onChange={(e) =>
                      setFormData({ ...formData, canApprove: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label className="text-xs">Согласование</Label>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="checkbox"
                    checked={formData.canRegister}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        canRegister: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Label className="text-xs">Регистрация</Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    saveTemplateMutation.mutate({
                      name: formData.name,
                      description: formData.description,
                      roleType: formData.roleType,
                      canEdit: formData.canEdit,
                      canApprove: formData.canApprove,
                      canRegister: formData.canRegister,
                    })
                  }
                  disabled={
                    !formData.name.trim() || saveTemplateMutation.isLoading
                  }
                >
                  Сохранить как шаблон
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isLoading}
              >
                Добавить
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreating(false)}
              >
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-2">
        {roles.map((role) => (
          <Card key={role.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium">{role.name}</div>
                <div className="text-xs text-muted-foreground">
                  {roleTypeMap[role.roleType] ??
                    roleTypeLabels[role.roleType] ??
                    role.roleType}
                </div>
                {role.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {role.description}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {[
                    role.canEdit && "Редактирование",
                    role.canApprove && "Согласование",
                    role.canRegister && "Регистрация",
                  ]
                    .filter(Boolean)
                    .join(", ") || "Только просмотр"}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Add edit functionality
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate({ id: role.id })}
                  disabled={deleteMutation.isLoading}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {roles.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Нет добавленных ролей
          </p>
        )}
      </div>
    </div>
  );
}

function ProcessTransitionsPanel({
  elementId,
  schemaId,
}: {
  elementId: string;
  schemaId?: string;
}) {
  const { data: element } = useQuery(
    ["processElement", elementId],
    () => apiClient.getProcessSchemaElement({ id: elementId }),
    { enabled: !!elementId },
  );
  const priorityMode = React.useMemo(() => {
    try {
      const props = element?.properties
        ? (JSON.parse(element.properties as string) as any)
        : {};
      return !!(props as any)?.priorityMode;
    } catch {
      return false;
    }
  }, [element]);
  const { data: transitions = [] } = useQuery(
    ["processTransitions", elementId],
    () => apiClient.listProcessTransitions({ elementId }),
    { enabled: !!elementId },
  );
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    condition: "approved_or_rejected",
    targetState: "",
    transitionType: "approve_or_reject",
  });
  // Typeahead for transition templates
  const [ttQuery, setTtQuery] = useState("");
  const debouncedSetTtQuery = React.useMemo(
    () => debounce((v: string) => setTtQuery(v), 150),
    [],
  );

  const { data: transitionTemplates = [] } = useQuery(
    ["transitionTemplates", ttQuery.trim() ? ttQuery : "__all__"],
    () =>
      apiClient.listTransitionTemplates(
        ttQuery.trim() ? { query: ttQuery } : undefined,
      ),
    { enabled: isCreating },
  );

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const togglePriority = useMutation(apiClient.updateProcessSchemaElement, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(["processElement", elementId]);
      toast({ title: "Настройки обновлены" });
    },
    onError: (e: any) =>
      toast({
        title: "Ошибка",
        description: e?.message || "Не удалось обновить настройки",
        variant: "destructive",
      }),
  });

  const hasResolution = Array.isArray(transitions)
    ? transitions.some((t: any) => t.transitionType === "resolution")
    : false;

  const createMutation = useMutation(apiClient.createProcessTransition, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processTransitions", elementId]);
      setIsCreating(false);
      setFormData({
        name: "",
        condition: "approved_or_rejected",
        targetState: "",
        transitionType: "approve_or_reject",
      });
      setTtQuery("");
      toast({
        title: "Переход добавлен",
        description: "Условие перехода успешно добавлено",
      });
    },
    onError: (e: any) => {
      const msg =
        e?.message && typeof e.message === "string"
          ? e.message
          : "Не удалось добавить переход";
      toast({
        title: "Ошибка",
        description: msg,
        variant: "destructive",
      });
    },
  });

  const saveTransitionTemplate = useMutation(
    apiClient.createTransitionTemplate,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["transitionTemplates"]);
        toast({
          title: "Шаблон перехода сохранён",
          description: "Теперь его можно быстро подставлять по названию",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Ошибка",
          description: error?.message || "Не удалось сохранить шаблон",
          variant: "destructive",
        });
      },
    },
  );

  const deleteMutation = useMutation(apiClient.deleteProcessTransition, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processTransitions", elementId]);
      toast({
        title: "Переход удален",
        description: "Условие перехода успешно удалено",
      });
    },
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    name: string;
    condition: string;
    targetState?: string;
    description?: string;
  }>({
    name: "",
    condition: "approved_or_rejected",
    targetState: "",
    description: "",
  });

  const updateTransition = useMutation(apiClient.updateProcessTransition, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(["processTransitions", elementId]);
      if (schemaId)
        await queryClient.invalidateQueries(["processSchema", schemaId]);
      await queryClient.refetchQueries({
        queryKey: ["processTransitions", elementId],
        exact: true,
      });
      if (schemaId)
        await queryClient.refetchQueries({
          queryKey: ["processSchema", schemaId],
          exact: true,
        });
      setEditingId(null);
      toast({ title: "Переход обновлён", description: "Изменения сохранены" });
    },
    onError: (e: any) =>
      toast({
        title: "Ошибка",
        description: e?.message || "Не удалось обновить переход",
        variant: "destructive",
      }),
  });

  const updateTransitionWithGraph = useMutation(
    apiClient.updateProcessTransitionWithGraphAdjust,
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["processTransitions", elementId]);
        if (schemaId)
          await queryClient.invalidateQueries(["processSchema", schemaId]);
        await queryClient.refetchQueries({
          queryKey: ["processTransitions", elementId],
          exact: true,
        });
        if (schemaId)
          await queryClient.refetchQueries({
            queryKey: ["processSchema", schemaId],
            exact: true,
          });
        setEditingId(null);
        toast({
          title: "Переход обновлён",
          description: "Нужные связи удалены автоматически",
        });
      },
      onError: (e: any) =>
        toast({
          title: "Ошибка",
          description: e?.message || "Не удалось обновить переход",
          variant: "destructive",
        }),
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (hasResolution && formData.transitionType === "resolution") {
      toast({
        title: "Резолюция уже добавлена",
        description: "В одном процессе можно добавить только одну резолюцию.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({ ...formData, elementId });
  };

  const conditionLabels = {
    approved_or_rejected: "Согласовано/отклонено",
    approved: "Согласовано/отклонено",
    rejected: "Согласовано/отклонено",
    assigned: "Назначено",
    filled: "Заполнено",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Условия перехода</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Определяют, при каких условиях процесс переходит к следующему этапу
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={priorityMode ? "secondary" : "outline"}
            onClick={() => {
              const props = (() => {
                try {
                  return element?.properties
                    ? (JSON.parse(element.properties as string) as any)
                    : {};
                } catch {
                  return {} as any;
                }
              })();
              const next = {
                ...(props as any),
                priorityMode: !priorityMode,
              } as any;
              togglePriority.mutate({ id: elementId, properties: next });
            }}
            disabled={togglePriority.isLoading}
          >
            {priorityMode ? "Приоритезация включена" : "Добавить приоритезацию"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              createMutation.mutate({
                elementId,
                name: "Делегирование процесса другому сотруднику",
                condition: "assigned",
                targetState: "Рассмотрение процесса другим сотрудником",
                transitionType: "resolution",
              })
            }
            disabled={hasResolution || createMutation.isLoading}
          >
            <Plus className="w-4 h-4 mr-1" />
            +Резолюция
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </div>
      </div>

      {isCreating && (
        <Card className="p-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-xs">Название перехода</Label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData({ ...formData, name: v });
                  debouncedSetTtQuery(v);
                }}
                placeholder="Название перехода"
              />
              {transitionTemplates.length > 0 && (
                <div className="mt-2 border rounded bg-background max-h-40 overflow-auto">
                  {transitionTemplates.map((t: any) => (
                    <button
                      type="button"
                      key={t.id}
                      className="w-full text-left px-2 py-1 hover:bg-muted text-xs"
                      onClick={() => {
                        setFormData({
                          name: t.name,
                          condition: t.condition || "approved_or_rejected",
                          targetState: t.targetState || "",
                          transitionType:
                            t.transitionType || "approve_or_reject",
                        });
                      }}
                    >
                      {t.name} • {t.condition}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Условие</Label>
                <select
                  value={formData.condition}
                  onChange={(e) => {
                    const newCond = e.target.value;
                    let allowed =
                      newCond === "approved_or_rejected"
                        ? ["approve_or_reject"]
                        : newCond === "assigned"
                          ? [
                              "send_for_review",
                              "send_for_approval",
                              "assign_executor",
                              // include 'resolution' only if it is not already present in the process
                              ...(hasResolution ? [] : ["resolution"]),
                            ]
                          : newCond === "filled"
                            ? ["send_for_review", "send_for_approval", "next"]
                            : ["send_for_review", "send_for_approval"];
                    // If current selected type is no longer allowed, switch to the first allowed
                    const nextType = (allowed as any[]).includes(
                      formData.transitionType as any,
                    )
                      ? formData.transitionType
                      : (allowed[0] as any);
                    setFormData({
                      ...formData,
                      condition: newCond,
                      transitionType: nextType,
                    });
                  }}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                >
                  <option value="approved_or_rejected">
                    Согласовано/отклонено
                  </option>
                  <option value="assigned">Назначено</option>
                  <option value="filled">Заполнено</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Тип перехода</Label>
                <select
                  value={formData.transitionType}
                  onChange={(e) =>
                    setFormData({ ...formData, transitionType: e.target.value })
                  }
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                >
                  {(() => {
                    const allowed =
                      formData.condition === "approved_or_rejected"
                        ? ["approve_or_reject"]
                        : formData.condition === "assigned"
                          ? [
                              "send_for_review",
                              "send_for_approval",
                              "assign_executor",
                              ...(hasResolution ? [] : ["resolution"]),
                            ]
                          : formData.condition === "filled"
                            ? ["send_for_review", "send_for_approval", "next"]
                            : ["send_for_review", "send_for_approval"];
                    const label: Record<string, string> = {
                      next: "Далее",
                      approve_or_reject: "Согласовать/отклонить",
                      send_for_review: "Отправить на рассмотрение",
                      send_for_approval: "Отправить на согласование",
                      assign_executor: "Назначить исполнителя",
                      resolution: "Резолюция",
                    };
                    return allowed.map((opt) => (
                      <option key={opt} value={opt}>
                        {label[opt]}
                      </option>
                    ));
                  })()}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Целевое состояние</Label>
              <Input
                value={formData.targetState}
                onChange={(e) =>
                  setFormData({ ...formData, targetState: e.target.value })
                }
                placeholder="Следующий этап"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isLoading}
              >
                Добавить
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreating(false)}
              >
                Отмена
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  saveTransitionTemplate.mutate({
                    name: formData.name,
                    condition: formData.condition,
                    targetState: formData.targetState,
                    transitionType: formData.transitionType,
                  })
                }
                disabled={
                  !formData.name.trim() || saveTransitionTemplate.isLoading
                }
              >
                Сохранить как шаблон
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-2">
        {transitions.map((transition) => (
          <Card key={transition.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium">{transition.name}</div>
                <div className="text-xs text-muted-foreground">
                  {
                    conditionLabels[
                      transition.condition as keyof typeof conditionLabels
                    ]
                  }
                  {transition.targetState && ` → ${transition.targetState}`}
                </div>

                {editingId === transition.id ? (
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        placeholder="Название"
                      />
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={editData.condition}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            condition: e.target.value,
                          })
                        }
                      >
                        <option value="approved_or_rejected">
                          Согласовано/отклонено
                        </option>
                        <option value="assigned">Назначено</option>
                        <option value="filled">Заполнено</option>
                      </select>
                      <Input
                        value={editData.targetState || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            targetState: e.target.value,
                          })
                        }
                        placeholder="Целевое состояние"
                      />
                    </div>

                    <div className="mt-1">
                      {editData.condition === "approved_or_rejected" ? (
                        <div className="flex gap-2">
                          <Button size="sm">Согласовать</Button>
                          <Button size="sm" variant="outline">
                            Отклонено
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm">Далее</Button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            const needAdjust =
                              transition.condition === "approved_or_rejected" &&
                              editData.condition !== "approved_or_rejected";
                            if (needAdjust) {
                              const info =
                                await apiClient.getDecisionChainInfoForProcess({
                                  elementId,
                                });
                              if (
                                info?.hasDecision &&
                                Array.isArray(info.branches) &&
                                info.branches.length > 0
                              ) {
                                const ok = window.confirm(
                                  'Этот переход связан с блоком "Решение" и ветками. Изменить условие и удалить соответствующие связи?',
                                );
                                if (!ok) {
                                  return;
                                }
                                updateTransitionWithGraph.mutate({
                                  id: transition.id,
                                  ...editData,
                                  adjustDecisionLinks: true,
                                });
                                return;
                              }
                            }
                            updateTransition.mutate({
                              id: transition.id,
                              ...editData,
                            });
                          } catch {
                            /* no-op */
                          }
                        }}
                      >
                        Сохранить
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    {transition.condition === "approved_or_rejected" ? (
                      <div className="flex gap-2">
                        <Button size="sm">Согласовать</Button>
                        <Button size="sm" variant="outline">
                          Отклонено
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm">Далее</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(transition.id);
                    setEditData({
                      name: transition.name,
                      condition: transition.condition,
                      targetState: transition.targetState || "",
                      description: transition.description || "",
                    });
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate({ id: transition.id })}
                  disabled={deleteMutation.isLoading}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {transitions.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Нет добавленных переходов
          </p>
        )}
      </div>
    </div>
  );
}

function ProcessNotificationsPanel({ elementId }: { elementId: string }) {
  const { data: notifications = [] } = useQuery(
    ["processNotifications", elementId],
    () => apiClient.listProcessNotifications({ elementId }),
    { enabled: !!elementId },
  );
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    trigger: "on_enter",
    template: "",
    recipients: [] as string[],
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const createMutation = useMutation(apiClient.createProcessNotification, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processNotifications", elementId]);
      setIsCreating(false);
      setFormData({
        name: "",
        trigger: "on_enter",
        template: "",
        recipients: [],
      });
      toast({
        title: "Уведомление добавлено",
        description: "Шаблон уведомления успешно добавлен",
      });
    },
  });

  const deleteMutation = useMutation(apiClient.deleteProcessNotification, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processNotifications", elementId]);
      toast({
        title: "Уведомление удалено",
        description: "Шаблон уведомления успешно удален",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.template.trim()) return;
    createMutation.mutate({ ...formData, elementId });
  };

  const triggerLabels = {
    on_enter: "При входе",
    on_exit: "При выходе",
    on_approve: "При одобрении",
    on_reject: "При отклонении",
    on_timeout: "При таймауте",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Уведомления</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Автоматические email-уведомления участникам процесса при
            определенных событиях
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Добавить
        </Button>
      </div>

      {isCreating && (
        <Card className="p-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-xs">Название уведомления</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Название уведомления"
              />
            </div>
            <div>
              <Label className="text-xs">Триггер</Label>
              <select
                value={formData.trigger}
                onChange={(e) =>
                  setFormData({ ...formData, trigger: e.target.value })
                }
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
              >
                <option value="on_enter">При входе</option>
                <option value="on_exit">При выходе</option>
                <option value="on_approve">При одобрении</option>
                <option value="on_reject">При отклонении</option>
                <option value="on_timeout">При таймауте</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Шаблон сообщения</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Используйте переменные:{" "}
                {
                  "{{ имя_пользователя }}, {{ название_процесса }}, {{ дата }}, {{ статус }}"
                }
              </p>
              <Textarea
                value={formData.template}
                onChange={(e) =>
                  setFormData({ ...formData, template: e.target.value })
                }
                placeholder="Текст уведомления с переменными {{ имя_переменной }}"
                rows={3}
                className="text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isLoading}
              >
                Добавить
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreating(false)}
              >
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-2">
        {notifications.map((notification) => {
          let recipients;
          try {
            recipients = JSON.parse(notification.recipients);
          } catch {
            recipients = [];
          }

          return (
            <Card key={notification.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium">{notification.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {
                      triggerLabels[
                        notification.trigger as keyof typeof triggerLabels
                      ]
                    }
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.template}
                  </div>
                  {recipients.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Получатели:{" "}
                      {Array.isArray(recipients)
                        ? recipients.join(", ")
                        : recipients}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Add edit functionality
                    }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      deleteMutation.mutate({ id: notification.id })
                    }
                    disabled={deleteMutation.isLoading}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
        {notifications.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Нет добавленных уведомлений
          </p>
        )}
      </div>
    </div>
  );
}

// Process Components Overview
function ProcessComponentsOverview({ elementId }: { elementId: string }) {
  const { data: requisites = [] } = useQuery(
    ["processRequisites", elementId],
    () => apiClient.listProcessRequisites({ elementId }),
    { enabled: !!elementId },
  );
  const { data: checklists = [] } = useQuery(
    ["processChecklists", elementId],
    () => apiClient.listProcessChecklists({ elementId }),
    { enabled: !!elementId },
  );
  const { data: roles = [] } = useQuery(
    ["processRoles", elementId],
    () => apiClient.listProcessRoles({ elementId }),
    { enabled: !!elementId },
  );
  const { data: transitions = [] } = useQuery(
    ["processTransitions", elementId],
    () => apiClient.listProcessTransitions({ elementId }),
    { enabled: !!elementId },
  );
  const { data: notifications = [] } = useQuery(
    ["processNotifications", elementId],
    () => apiClient.listProcessNotifications({ elementId }),
    { enabled: !!elementId },
  );
  const { data: printForms = [] } = useQuery(
    ["printForms", elementId, "overview"],
    () => apiClient.listPrintForms({ elementId }),
    { enabled: !!elementId },
  );

  return (
    <div className="bg-muted rounded-lg p-3">
      <h4 className="text-sm font-medium text-muted-foreground mb-2">
        Компоненты процесса
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="flex items-center justify-between p-3 bg-card border rounded">
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-blue-500" />
            <span className="text-sm">Реквизиты</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {requisites.length}
          </Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-card border rounded">
          <div className="flex items-center gap-2">
            <FileIcon className="w-4 h-4 text-green-500" />
            <span className="text-sm">Документы</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {checklists.length}
          </Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-card border rounded">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-purple-500" />
            <span className="text-sm">Роли</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {roles.length}
          </Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-card border rounded">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-orange-500" />
            <span className="text-sm">Переходы</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {transitions.length}
          </Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-card border rounded">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-500" />
            <span className="text-sm">Уведомления</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {notifications.length}
          </Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-card border rounded">
          <div className="flex items-center gap-2">
            <FileIcon className="w-4 h-4" />
            <span className="text-sm">Печатные формы</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {printForms.length}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// Process Editor Screen
function ProcessPrintFormPanel({ element }: { element: any }) {
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;
  const queryClient = useQueryClient();

  const parsedProps = React.useMemo(() => {
    try {
      return element?.properties
        ? (JSON.parse(element.properties as string) as Record<string, any>)
        : {};
    } catch {
      return {} as Record<string, any>;
    }
  }, [element?.properties]);
  const pf = (parsedProps as any).printForm ?? {};

  // Load requisites for mapping dropdowns (current element)
  const { data: requisites = [] } = useQuery(
    ["processRequisites", element?.id],
    () => apiClient.listProcessRequisites({ elementId: element.id }),
    { enabled: !!element?.id },
  );
  // Load requisites from previous processes
  const { data: prevRequisites = [] } = useQuery(
    ["previousRequisites", element?.id],
    () => apiClient.listPreviousRequisites({ elementId: element.id }),
    { enabled: !!element?.id },
  );

  // Load existing print forms (multi-print support)
  const { data: printForms = [], isFetching: isLoadingForms } = useQuery(
    ["printForms", element?.id],
    () => apiClient.listPrintForms({ elementId: element.id }),
    { enabled: !!element?.id },
  );
  // Load print forms from previous processes
  const { data: previousPrintForms = [], isFetching: isLoadingPrevForms } =
    useQuery(
      ["previousPrintForms", element?.id],
      () => apiClient.listPreviousPrintForms({ elementId: element.id }),
      { enabled: !!element?.id },
    );

  // Local editable state for the currently selected/edited form
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [selectedFormId, setSelectedFormId] = React.useState<
    string | undefined
  >(undefined);
  const [label, setLabel] = React.useState<string>("");
  const [enabled, setEnabled] = React.useState<boolean>(!!pf.enabled);
  const [templateName, setTemplateName] = React.useState<string>(
    pf.templateName || "",
  );
  const [templateUrl, setTemplateUrl] = React.useState<string>(
    pf.templateUrl || "",
  );
  const [mappings, setMappings] = React.useState<
    Array<{ token: string; requisiteName: string }>
  >(Array.isArray(pf.mappings) ? pf.mappings : []);
  const [addPrevOpen, setAddPrevOpen] = React.useState<boolean>(false);

  // Sync local state from selected form or fallback to legacy single form
  React.useEffect(() => {
    const forms = Array.isArray(printForms) ? printForms : [];
    let active = selectedFormId
      ? (forms.find((f: any) => f.id === selectedFormId) as any)
      : undefined;
    if (!active) {
      // pick first enabled or first available or legacy pf
      active =
        forms.find((f: any) => f.enabled) ||
        forms[0] ||
        (pf as any) ||
        undefined;
    }
    if (active) {
      setSelectedFormId(active.id);
      setEnabled(!!active.enabled);
      setTemplateName(active.templateName || "");
      setTemplateUrl(active.templateUrl || "");
      setMappings(Array.isArray(active.mappings) ? active.mappings : []);
      setLabel(active.label || active.templateName || "");
    } else {
      // fallback to empty state
      setSelectedFormId(undefined);
      setEnabled(true);
      setTemplateName("");
      setTemplateUrl("");
      setMappings([]);
      setLabel("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(printForms), pf.templateName, pf.templateUrl]);

  const uploadTemplate = useMutation(apiClient.uploadPrintFormTemplate, {
    onSuccess: (res) => {
      setTemplateUrl(res.templateUrl);
      setTemplateName(res.printForm?.templateName || templateName);
      setSelectedFormId(res.printForm?.id);
      queryClient.invalidateQueries(["printForms", element.id]);
      queryClient.invalidateQueries(["processSchema", element.schemaId]);
      queryClient.invalidateQueries(["printFormTemplates"]);
      toast({ title: "Шаблон загружен" });
    },
    onError: (e: any) =>
      toast({
        title: "Ошибка загрузки",
        description: e?.message || "Не удалось загрузить шаблон",
        variant: "destructive",
      }),
  });

  const saveConfig = useMutation(apiClient.updatePrintFormConfig, {
    onSuccess: () => {
      queryClient.invalidateQueries(["printForms", element.id]);
      queryClient.invalidateQueries(["processSchema", element.schemaId]);
      queryClient.invalidateQueries(["printFormTemplates"]);
      // Exit edit-like state: clear local fields so it looks like editing finished
      setSelectedFormId(undefined);
      setLabel("");
      setMappings([]);
      setIsEditing(false);
      toast({
        title: "Сохранено",
        description: "Форма добавлена/обновлена и доступна в списке.",
      });
    },
    onError: (e: any) =>
      toast({
        title: "Ошибка",
        description: e?.message || "Не удалось сохранить настройки",
        variant: "destructive",
      }),
  });

  const inheritPrintFormMutation = useMutation(
    apiClient.inheritPrintFormFromPrevious,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["printForms", element.id]);
        queryClient.invalidateQueries(["processSchema", element.schemaId]);
        toast({ title: "Добавлено из предыдущего" });
        setAddPrevOpen(false);
      },
      onError: (e: any) =>
        toast({
          title: "Ошибка",
          description: e?.message || "Не удалось добавить из предыдущего",
          variant: "destructive",
        }),
    },
  );

  const breakPrintFormInheritanceMutation = useMutation(
    apiClient.breakPrintFormInheritance,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["printForms", element.id]);
        queryClient.invalidateQueries(["processSchema", element.schemaId]);
        toast({ title: "Наследование отключено" });
      },
      onError: (e: any) =>
        toast({
          title: "Ошибка",
          description: e?.message || "Не удалось отключить наследование",
          variant: "destructive",
        }),
    },
  );

  const onUploadFile = async (file?: File) => {
    if (!file) return;
    const base64 = await encodeFileAsBase64DataURL(file);
    if (!base64) {
      toast({ title: "Файл слишком большой" });
      return;
    }
    uploadTemplate.mutate({
      elementId: element.id,
      base64,
      fileName: file.name,
      mappings,
      printFormId: selectedFormId,
      label: label || file.name,
      alsoSaveToLibrary: true,
    });
  };

  const addRow = () =>
    setMappings((prev) => [...prev, { token: "", requisiteName: "" }]);
  const removeRow = (idx: number) =>
    setMappings((prev) => prev.filter((_, i) => i !== idx));
  const updateRow = (
    idx: number,
    patch: Partial<{ token: string; requisiteName: string }>,
  ) =>
    setMappings((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    );

  const handleSaveEnabled = () => {
    saveConfig.mutate({
      elementId: element.id,
      mappings,
      enabled,
      printFormId: selectedFormId,
      label,
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Печатная форма</CardTitle>
        <CardDescription>
          Настройте использование печатной формы для данного процесса
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              id={`pf-enabled-${element?.id}`}
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <Label htmlFor={`pf-enabled-${element?.id}`}>
              Использовать печатную форму
            </Label>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Список печатных форм</Label>
            {isLoadingForms ? (
              <div className="text-xs text-muted-foreground">Загрузка...</div>
            ) : printForms.length > 0 ? (
              <div className="space-y-1">
                {" "}
                {printForms.map((pf: any) => (
                  <div
                    key={pf.id ?? pf.templateUrl}
                    className={`flex items-center justify-between p-2 border rounded ${selectedFormId === pf.id ? "bg-muted" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`pf-select-${element?.id}`}
                        checked={selectedFormId === pf.id}
                        onChange={() => {
                          setSelectedFormId(pf.id);
                          setEnabled(!!pf.enabled);
                          setTemplateName(pf.templateName || "");
                          setTemplateUrl(pf.templateUrl || "");
                          setMappings(
                            Array.isArray(pf.mappings) ? pf.mappings : [],
                          );
                          setLabel(pf.label || pf.templateName || "");
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium flex items-center gap-1">
                          {pf.label || pf.templateName || "Без названия"}
                          {pf?.inherited ? (
                            <button
                              className="text-amber-500 text-xs"
                              title={`Унаследовано из ${pf?.inheritedFromElementName || "предыдущего процесса"}`}
                              onClick={() => {
                                const ok = window.confirm(
                                  "Отключить наследование? Форма станет независимой копией.",
                                );
                                if (!ok) return;
                                breakPrintFormInheritanceMutation.mutate({
                                  targetElementId: element.id,
                                  printFormId: pf.id,
                                });
                              }}
                            >
                              ★
                            </button>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {pf.templateName || pf.templateUrl}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {pf.templateUrl && (
                        <a
                          href={pf.templateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs underline"
                        >
                          Предпросмотр
                        </a>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFormId(pf.id);
                          setEnabled(!!pf.enabled);
                          setTemplateName(pf.templateName || "");
                          setTemplateUrl(pf.templateUrl || "");
                          setMappings(
                            Array.isArray(pf.mappings) ? pf.mappings : [],
                          );
                          setLabel(pf.label || pf.templateName || "");
                          setIsEditing(true);
                        }}
                      >
                        Редактировать{" "}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Пока нет печатных форм — нажмите «Добавить», чтобы создать
                первую.
              </p>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFormId(undefined);
                  setEnabled(true);
                  setTemplateName("");
                  setTemplateUrl("");
                  setMappings([]);
                  setLabel("");
                  setIsEditing(true);
                }}
              >
                Добавить
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddPrevOpen(true)}
              >
                Из предыдущих
              </Button>
            </div>

            <Dialog open={addPrevOpen} onOpenChange={setAddPrevOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить из предыдущих процессов</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-80 overflow-auto pr-1">
                  {isLoadingPrevForms ? (
                    <div className="text-xs text-muted-foreground">
                      Загрузка...
                    </div>
                  ) : previousPrintForms.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Нет доступных печатных форм из предыдущих процессов
                    </div>
                  ) : (
                    Object.entries(
                      (previousPrintForms as any[]).reduce(
                        (
                          acc: Record<string, { name: string; items: any[] }>,
                          row: any,
                        ) => {
                          const key = String(row?.elementId ?? "");
                          if (!acc[key]) {
                            acc[key] = {
                              name: row?.elementName ?? "Процесс",
                              items: [],
                            };
                          }
                          acc[key]!.items.push(row?.form);
                          return acc;
                        },
                        {},
                      ),
                    ).map(([elId, group]: any) => (
                      <div key={elId} className="border rounded p-2">
                        <div className="text-sm font-medium mb-2">
                          {group.name}
                        </div>
                        <div className="space-y-1">
                          {group.items.map((f: any) => (
                            <div
                              key={f.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div>
                                {f.label || f.templateName || "Без названия"}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    inheritPrintFormMutation.mutate({
                                      sourceElementId: elId,
                                      targetElementId: element.id,
                                      printFormId: f.id,
                                      mode: "copy",
                                    })
                                  }
                                >
                                  Копия
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    inheritPrintFormMutation.mutate({
                                      sourceElementId: elId,
                                      targetElementId: element.id,
                                      printFormId: f.id,
                                      mode: "inherit",
                                    })
                                  }
                                >
                                  Унаследовать
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAddPrevOpen(false)}
                  >
                    Закрыть
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isEditing && (
          <>
            <div className="space-y-2">
              <Label className="text-sm">Шаблон файла</Label>
              {templateUrl ? (
                <div className="flex items-center gap-2">
                  <a
                    href={templateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline"
                  >
                    {templateName || "Открыть шаблон"}
                  </a>
                  <Input
                    type="file"
                    onChange={(e) => onUploadFile(e.target.files?.[0])}
                  />
                </div>
              ) : (
                <Input
                  type="file"
                  onChange={(e) => onUploadFile(e.target.files?.[0])}
                />
              )}
              <div className="space-y-2">
                <Label className="text-sm">Название печатной формы</Label>
                <Input
                  placeholder="Например: Заявление на оказание услуги"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Загрузите DOCX/PDF. Используйте токены в тексте, например:{" "}
                {"<open>"}.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Правила подстановки</Label>
              <div className="space-y-2">
                {mappings.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center"
                  >
                    <Input
                      placeholder="Токен (например <open>)"
                      value={row.token}
                      onChange={(e) =>
                        updateRow(idx, { token: e.target.value })
                      }
                    />
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={row.requisiteName}
                      onChange={(e) =>
                        updateRow(idx, { requisiteName: e.target.value })
                      }
                    >
                      <option value="">Выберите реквизит</option>
                      <optgroup label="Текущий процесс">
                        {requisites.map((r: any) => (
                          <option key={r.id} value={r.name}>
                            {r.label} ({r.name})
                          </option>
                        ))}
                      </optgroup>
                      {Array.isArray(prevRequisites) &&
                        prevRequisites.length > 0 && (
                          <optgroup label="Предыдущие процессы">
                            {(prevRequisites as any[]).map((p: any) => (
                              <option
                                key={`prev-${p.requisite.id}`}
                                value={p.requisite.name}
                              >
                                {p.requisite.label} ({p.requisite.name}) — из:{" "}
                                {p.elementName}
                              </option>
                            ))}
                          </optgroup>
                        )}
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addRow}>
                  <Plus className="w-4 h-4 mr-1" /> Добавить соответствие
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={() => handleSaveEnabled()}>
            Сохранить состояние
          </Button>
          <Button
            onClick={() =>
              saveConfig.mutate({
                elementId: element.id,
                mappings,
                enabled,
                printFormId: selectedFormId,
                label,
                alsoSaveToLibrary: true,
              })
            }
          >
            Сохранить настройки
          </Button>
        </CardFooter>
      )}{" "}
    </Card>
  );
}

function ProcessEditorScreen() {
  const navigate = useNavigate();
  const { schemaId } = useParams<{ schemaId: string }>();
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [elements, setElements] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [draggedElement, setDraggedElement] = useState<any>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectionStart, setConnectionStart] = useState<any>(null);
  const [pendingDecisionLink, setPendingDecisionLink] = useState<{
    sourceId: string;
    targetId: string;
    midWorld: { x: number; y: number };
  } | null>(null);
  // Approval route mode: assign a single status per PROCESS element
  const [approvalRouteMode, setApprovalRouteMode] = useState<boolean>(false);
  const [assigneePickerFor, setAssigneePickerFor] = useState<string | null>(
    null,
  );
  const [statusPickerFor, setStatusPickerFor] = useState<string | null>(null);
  const STATUS_OPTIONS = React.useMemo(
    () => [
      "Заполнение информации для обращения",
      "Направлен в ИЦ",
      "Входной контроль",
      "Заполнение листа согласующих",
      "Согласовано ЭСП",
      "Выбор регистратора",
      "Зарегистрированно",
      "Формирование результата",
      "Услуга оказана",
    ],
    [],
  );
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [decisionTriplesDraft, setDecisionTriplesDraft] = React.useState<
    Record<string, any[]>
  >({});
  const { data: roleTypes = [] } = useQuery(
    ["roleTypes"],
    () => apiClient.listRoleTypes(),
    { staleTime: 300000 },
  );
  const [openBranchConfigConnectionId, setOpenBranchConfigConnectionId] =
    useState<string | null>(null);
  const [collapsedBranches, setCollapsedBranches] = React.useState<
    Record<string, boolean>
  >({});
  // Draft state to avoid saving on every keystroke
  const [draftConditions, setDraftConditions] = React.useState<
    Record<string, any>
  >({});
  const [draftLabels, setDraftLabels] = React.useState<
    Record<string, string | undefined>
  >({});
  const [collapsedTriples, setCollapsedTriples] = React.useState<
    Record<string, Record<number, boolean>>
  >({});

  // Branch colors palette for DECISION outgoing edges
  const branchPalette = React.useMemo(
    () => [
      "#EF4444", // red-500
      "#10B981", // emerald-500
      "#3B82F6", // blue-500
      "#F59E0B", // amber-500
      "#8B5CF6", // violet-500
      "#14B8A6", // teal-500
      "#F43F5E", // rose-500
      "#22C55E", // green-500
      "#6366F1", // indigo-500
      "#EAB308", // yellow-500
    ],
    [],
  );

  const parseConnCondition = React.useCallback((conn: any) => {
    try {
      if (!conn?.condition) return {} as any;
      const parsed = JSON.parse(conn.condition as string) as any;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {} as any;
    }
  }, []);

  const pickNextBranchColor = React.useCallback(
    (decisionId: string) => {
      const used = new Set(
        connections
          .filter((c) => c.sourceId === decisionId)
          .map((c) => parseConnCondition(c)?.color)
          .filter(Boolean),
      );
      for (const c of branchPalette) if (!used.has(c)) return c;
      return branchPalette[(used.size || 0) % branchPalette.length];
    },
    [connections, branchPalette, parseConnCondition],
  );

  // Grid & snapping configuration
  const [gridCellWidth, setGridCellWidth] = useState<number>(120);
  const [gridCellHeight, setGridCellHeight] = useState<number>(60);
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [gridOpacity, setGridOpacity] = useState<number>(0.15);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);
  const centerLineEnabled = false;
  const [isAltPressed, setIsAltPressed] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseStartRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = React.useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  React.useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setCanvasSize({ width: cr.width, height: cr.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [gridDashed, setGridDashed] = useState<boolean>(false);
  const centerLineScreenY = React.useMemo(() => {
    if (!centerLineEnabled) return 0;
    const h = canvasSize.height || 0;
    const centerWorldY = (h / 2 - pan.y) / zoom;
    const snapped =
      Math.floor(centerWorldY / gridCellHeight) * gridCellHeight +
      gridCellHeight / 2;
    return snapped * zoom + pan.y;
  }, [canvasSize.height, pan.y, zoom, gridCellHeight, centerLineEnabled]);

  const shouldSnap = snapEnabled && !isAltPressed;

  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;
  const queryClient = useQueryClient();

  const {
    data: schema,
    isLoading: isSchemaLoading,
    error: schemaError,
  } = useQuery(
    ["processSchema", schemaId],
    () => (schemaId ? apiClient.getProcessSchema({ id: schemaId }) : null),
    { enabled: !!schemaId },
  );

  // Загрузка версий для выпадающего списка в шапке
  const { data: schemaVersions = [] } = useQuery(
    ["schemaVersions", schemaId],
    () =>
      schemaId
        ? apiClient.listSchemaVersions({ id: schemaId })
        : Promise.resolve([]),
    { enabled: !!schemaId },
  );

  // businessProcesses query removed since template selector was removed

  // Removed unused queries

  const createElement = useMutation(apiClient.createProcessSchemaElement, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processSchema", schemaId]);
      notify({
        title: "Элемент добавлен",
        description: "Элемент успешно добавлен в схему",
      });
    },
  });

  const syncChildren = useMutation(apiClient.syncChildElementsFromParent);

  const updateElement = useMutation(apiClient.updateProcessSchemaElement, {
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(["processSchema", schemaId]);
      if (variables && (variables as any).id) {
        syncChildren.mutate({ parentElementId: (variables as any).id });
      }
    },
  });

  const deleteElement = useMutation(apiClient.deleteProcessSchemaElement, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processSchema", schemaId]);
      setSelectedElement(null);
      notify({
        title: "Элемент удален",
        description: "Элемент успешно удален из схемы",
      });
    },
  });

  // Dialog state for Save action (current vs new version)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = React.useState(false);
  const [saveChoice, setSaveChoice] = React.useState<"current" | "new">(
    "current",
  );
  const [newVersionLabel, setNewVersionLabel] = React.useState("");
  const nextVersion = (schema?.version ?? 1) + 1;
  // Publish dialog state
  const [isPublishDialogOpen, setIsPublishDialogOpen] = React.useState(false);
  const [publishChoice, setPublishChoice] = React.useState<
    "keepOthers" | "unpublishOthers"
  >("keepOthers");

  const createNewVersion = useMutation(apiClient.createSchemaNewVersion, {
    onSuccess: async (newSchema) => {
      if (!newSchema || !newSchema.id) {
        toast({
          title: "Не удалось создать новую версию",
          description: "Попробуйте ещё раз",
          variant: "destructive",
        });
        return;
      }
      try {
        if (newVersionLabel.trim()) {
          await apiClient.updateProcessSchema({
            id: newSchema.id,
            versionLabel: newVersionLabel.trim(),
          });
        }
      } catch {}
      setIsSaveDialogOpen(false);
      setNewVersionLabel("");
      setSaveChoice("current");
      await queryClient.invalidateQueries(["schemaVersions", schemaId]);
      notify({
        title: "Создана новая версия",
        description: `Открыта v${newSchema?.version ?? nextVersion}`,
      });
      navigate(`/admin/process-editor/${newSchema.id}`);
    },
    onError: (e: any) =>
      notify({
        title: "Не удалось создать новую версию",
        description: e?.message || "Попробуйте ещё раз",
        variant: "destructive",
      }),
  });

  // const copyElement = useMutation(apiClient.copyProcessElement, {
  //   onSuccess: () => {
  //     queryClient.invalidateQueries(["processSchema", schemaId]);
  //     toast({ title: "Процесс скопирован" });
  //   },
  // });

  const deleteSchema = useMutation(apiClient.deleteProcessSchema, {
    onSuccess: () => {
      navigate("/admin");
      notify({
        title: "Схема удалена",
        description: "Схема процесса успешно удалена",
      });
    },
  });

  const createConnection = useMutation(apiClient.createProcessConnection, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processSchema", schemaId]);
      notify({
        title: "Соединение добавлено",
        description: "Соединение успешно добавлено в схему",
      });
    },
  });

  const updateConnection = useMutation(apiClient.updateProcessConnection, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processSchema", schemaId]);
    },
  });

  const deleteConnection = useMutation(apiClient.deleteProcessConnection, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processSchema", schemaId]);
    },
  });

  // Previous entities for rule suggestions when a DECISION is selected
  const { data: prevRequisites = [] } = useQuery(
    ["prevRequisites", selectedElement?.id],
    () => apiClient.listPreviousRequisites({ elementId: selectedElement!.id }),
    {
      enabled:
        !!selectedElement?.id && selectedElement?.elementType === "DECISION",
    },
  );
  const { data: prevChecklists = [] } = useQuery(
    ["prevChecklists", selectedElement?.id],
    () => apiClient.listPreviousChecklists({ elementId: selectedElement!.id }),
    {
      enabled:
        !!selectedElement?.id && selectedElement?.elementType === "DECISION",
    },
  );

  const validateAndPublish = useMutation(apiClient.publishProcessSchema, {
    onSuccess: () => {
      queryClient.invalidateQueries(["processSchema", schemaId]);
      queryClient.invalidateQueries(["processSchemas"]);
      queryClient.invalidateQueries(["publishedSchemas"]);
      notify({
        title: "Схема опубликована",
        description: "Схема процесса успешно валидирована и опубликована",
      });
    },
    onError: (error: any) => {
      notify({
        title: "Ошибка валидации",
        description: error.message || "Не удалось опубликовать схему",
        variant: "destructive",
      });
    },
  });

  React.useEffect(() => {
    if (schema?.elements) {
      setElements(schema.elements);
    }
    if (schema?.connections) {
      setConnections(schema.connections);
    }
  }, [schema]);

  React.useEffect(() => {
    // reset state related to legacy "existing branch" UI (removed)
  }, [selectedElement?.id]);

  React.useEffect(() => {
    const el = selectedElement;
    if (!el || el.elementType !== "DECISION") return;
    try {
      const props = el.properties
        ? (JSON.parse(el.properties as string) as any)
        : {};
      const triples = Array.isArray(props.decisionTriples)
        ? props.decisionTriples
        : [];
      setDecisionTriplesDraft((prev) => ({ ...prev, [el.id]: triples }));
    } catch {
      setDecisionTriplesDraft((prev) => ({ ...prev, [el!.id]: [] }));
    }
  }, [selectedElement?.id]);

  const elementTypes = [
    { type: "START", icon: Play, label: "Начало", color: "bg-green-600" },
    { type: "END", icon: StopCircle, label: "Конец", color: "bg-red-600" },
    { type: "PROCESS", icon: Square, label: "Процесс", color: "bg-blue-600" },
    {
      type: "APPROVAL",
      icon: Square,
      label: "Согласование",
      color: "bg-purple-600",
    },
    {
      type: "DECISION",
      icon: Diamond,
      label: "Решение",
      color: "bg-yellow-600",
    },
  ];

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (selectedTool === "select" || !schemaId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const viewX = e.clientX - rect.left;
    const viewY = e.clientY - rect.top;
    const x = (viewX - pan.x) / zoom;
    const y = (viewY - pan.y) / zoom;

    const elementType = elementTypes.find((t) => t.type === selectedTool);
    if (!elementType) return;

    const defaultW = 120;
    const defaultH = 60;

    const snapX = (v: number) => Math.round(v / gridCellWidth) * gridCellWidth;
    const snapY = (v: number) =>
      Math.round(v / gridCellHeight) * gridCellHeight;
    let nx = shouldSnap ? snapX(x) : x;
    let ny = shouldSnap ? snapY(y) : y;
    const centerWorldY = (rect.height / 2 - pan.y) / zoom;
    if (centerLineEnabled && elementType.type !== "DECISION") {
      const snappedCenterWorldY =
        Math.floor(centerWorldY / gridCellHeight) * gridCellHeight +
        gridCellHeight / 2;
      ny = snappedCenterWorldY - defaultH / 2;
    }

    // clamp to canvas bounds
    nx = Math.max(0, Math.min(nx, rect.width - defaultW));
    ny = Math.max(0, Math.min(ny, rect.height - defaultH));

    if (elementType.type === "APPROVAL") {
      (async () => {
        try {
          const approval = await apiClient.createProcessSchemaElement({
            schemaId,
            elementType: "APPROVAL",
            name: "Согласование",
            positionX: nx,
            positionY: ny,
            width: gridCellWidth,
            height: gridCellHeight,
            properties: {
              blockForwardWhileUnderReview: false,
              approvalConfig: { stages: [] },
            },
          });
          const decision = await apiClient.createProcessSchemaElement({
            schemaId,
            elementType: "DECISION",
            name: "Решение",
            positionX: nx + (gridCellWidth || 120) + 120,
            positionY: ny,
            width: gridCellWidth,
            height: gridCellHeight,
            properties: { needsConfiguration: true },
          });
          const link = await apiClient.createProcessConnection({
            schemaId,
            sourceId: approval.id,
            targetId: decision.id,
            connectionType: "sequence",
          });
          setElements((prev) => [...prev, approval, decision]);
          setConnections((prev) => [...prev, link]);
          setSelectedElement(approval);
          notify({
            title: "Добавлено согласование",
            description: "Автоматически создано 'Решение' и связь",
          });
        } catch {
          notify({
            title: "Не удалось добавить «Согласование»",
            variant: "destructive",
          });
        } finally {
          setSelectedTool("select");
        }
      })();
    } else {
      createElement.mutate({
        schemaId,
        elementType: selectedTool,
        name: `${elementType.label} ${elements.length + 1}`,
        positionX: nx,
        positionY: ny,
      });
      setSelectedTool("select");
    }
  };

  const handleElementClick = async (e: React.MouseEvent, element: any) => {
    if (selectedTool === "connect") {
      e.stopPropagation();

      if (!connectionStart) {
        // Start connection
        setConnectionStart(element);
        notify({
          title: "Выберите целевой элемент",
          description:
            "Нажмите на элемент, к которому нужно создать соединение",
        });
      } else if (connectionStart.id !== element.id) {
        // Complete connection with gateway logic
        const sourceEl = elements.find((el) => el.id === connectionStart.id);
        const targetEl = element;

        // Enforce allowed connection types:
        // PROCESS -> DECISION or APPROVAL
        // APPROVAL -> DECISION
        // DECISION -> PROCESS
        if (
          sourceEl?.elementType === "PROCESS" &&
          !["DECISION", "APPROVAL"].includes(targetEl?.elementType as any)
        ) {
          notify({
            title: "Недопустимый тип соединения",
            description:
              "От процесса можно соединять только к 'Решению' или 'Согласованию'",
            variant: "destructive",
          });
          setConnectionStart(null);
          return;
        }
        if (
          sourceEl?.elementType === "APPROVAL" &&
          targetEl?.elementType !== "DECISION"
        ) {
          notify({
            title: "Недопустимый тип соединения",
            description: "От 'Согласования' можно соединять только к 'Решению'",
            variant: "destructive",
          });
          setConnectionStart(null);
          return;
        }
        if (
          sourceEl?.elementType === "DECISION" &&
          targetEl?.elementType !== "PROCESS"
        ) {
          notify({
            title: "Недопустимый тип соединения",
            description: "От 'Решения' можно соединять только к процессу",
            variant: "destructive",
          });
          setConnectionStart(null);
          return;
        }

        // Frontend guard strengthened: if source PROCESS has transition approved_or_rejected,
        // require DECISION as the immediate next block. We verify from server to avoid stale UI.
        if (sourceEl?.elementType === "PROCESS") {
          try {
            const tr = await apiClient.listProcessTransitions({
              elementId: sourceEl.id,
            });
            const hasApproveReject =
              Array.isArray(tr) &&
              tr.some((t: any) => t.condition === "approved_or_rejected");
            if (hasApproveReject && targetEl.elementType !== "DECISION") {
              notify({
                title: "Нужен блок «Решение»",
                description:
                  "У этого процесса есть переход ‘Согласовано/отклонено’. Сначала добавьте блок ‘Решение’, затем соединяйте от него.",
                variant: "destructive",
              });
              setConnectionStart(null);
              return;
            }
          } catch {
            // If validation cannot be performed, rely on backend rule; proceed to attempt create.
          }
        }

        // If source is DECISION, determine if labels are strictly required
        if (sourceEl?.elementType === "DECISION") {
          let requiresStrict = false;
          try {
            // Determine predecessors (incoming sources) to this DECISION
            const incoming = connections.filter(
              (c) => c.targetId === sourceEl.id,
            );
            const predecessorIds = Array.from(
              new Set(incoming.map((c) => c.sourceId)),
            );
            const predecessorProcesses = elements.filter(
              (el) =>
                predecessorIds.includes(el.id) && el.elementType === "PROCESS",
            );
            if (predecessorProcesses.length > 0) {
              const all = await Promise.all(
                predecessorProcesses.map((p) =>
                  apiClient.listProcessTransitions({ elementId: p.id }),
                ),
              );
              requiresStrict = all.some(
                (arr: any) =>
                  Array.isArray(arr) &&
                  arr.some((t: any) =>
                    ["approved_or_rejected", "approved", "rejected"].includes(
                      t.condition,
                    ),
                  ),
              );
            }
          } catch {}

          if (requiresStrict) {
            // show interactive branch picker overlay and wait
            const sW = sourceEl.width || 120;
            const sH = sourceEl.height || 60;
            const tW = targetEl.width || 120;
            const tH = targetEl.height || 60;
            const sCX = (sourceEl.positionX ?? 0) + sW / 2;
            const sCY = (sourceEl.positionY ?? 0) + sH / 2;
            const tCX = (targetEl.positionX ?? 0) + tW / 2;
            const tCY = (targetEl.positionY ?? 0) + tH / 2;
            const dx1 = tCX - sCX;
            const dy1 = tCY - sCY;
            const scale1 =
              Math.max(Math.abs(dx1) / (sW / 2), Math.abs(dy1) / (sH / 2)) || 1;
            const startX = sCX + dx1 / scale1;
            const startY = sCY + dy1 / scale1;
            const dx2 = sCX - tCX;
            const dy2 = sCY - tCY;
            const scale2 =
              Math.max(Math.abs(dx2) / (tW / 2), Math.abs(dy2) / (tH / 2)) || 1;
            const endX = tCX + dx2 / scale2;
            const endY = tCY + dy2 / scale2;
            const midWorld = { x: (startX + endX) / 2, y: (startY + endY) / 2 };
            setPendingDecisionLink({
              sourceId: sourceEl.id,
              targetId: targetEl.id,
              midWorld,
            });
            setConnectionStart(null);
            return;
          }

          // Not strict: create connection immediately without label
          if (schemaId) {
            const color = pickNextBranchColor(sourceEl.id);
            createConnection.mutate({
              schemaId,
              sourceId: sourceEl.id,
              targetId: targetEl.id,
              connectionType: "sequence",
              condition: JSON.stringify({ color, rules: [] }),
            });
          }
          setConnectionStart(null);
          return;
        }

        if (schemaId) {
          // Handle PROCESS -> DECISION auto-branches when source process has approve/reject
          if (
            sourceEl?.elementType === "PROCESS" &&
            targetEl?.elementType === "DECISION"
          ) {
            let hasApproveReject = false;
            try {
              const tr = await apiClient.listProcessTransitions({
                elementId: sourceEl.id,
              });
              hasApproveReject =
                Array.isArray(tr) &&
                tr.some((t: any) => t.condition === "approved_or_rejected");
            } catch {}

            try {
              // Create the PROCESS -> DECISION link first
              const conn = await apiClient.createProcessConnection({
                schemaId,
                sourceId: connectionStart.id,
                targetId: element.id,
                connectionType: "sequence",
              });
              setConnections((prev) => [...prev, conn]);

              if (hasApproveReject) {
                const dec = targetEl;
                const existing = connections.filter(
                  (c) => c.sourceId === dec.id,
                );
                const usedLabels = new Set(
                  existing.map((c) => (c.label || "").trim()).filter(Boolean),
                );
                const labels: Array<"Согласовано" | "Отклонено"> = [
                  "Согласовано",
                  "Отклонено",
                ];

                // Create up to two branches with auto-created processes
                let createdAny = false;
                for (let i = 0; i < labels.length; i++) {
                  const lbl = labels[i];
                  if (usedLabels.has(lbl)) continue;
                  const offsetX = (dec.width || 120) + 220;
                  const offsetY = (i * 120) % 240;
                  const nx = (dec.positionX || 0) + offsetX;
                  const ny = (dec.positionY || 0) + offsetY;
                  const color = pickNextBranchColor(dec.id);

                  const newProc = await apiClient.createProcessSchemaElement({
                    schemaId,
                    elementType: "PROCESS",
                    name: `Процесс ${elements.length + 1}`,
                    positionX: nx,
                    positionY: ny,
                  });
                  setElements((prev) => [...prev, newProc]);

                  const newConn = await apiClient.createProcessConnection({
                    schemaId,
                    sourceId: dec.id,
                    targetId: newProc.id,
                    connectionType: "sequence",
                    label: lbl,
                    condition: JSON.stringify({ color, rules: [] }),
                  });
                  setConnections((prev) => [...prev, newConn]);
                  if (!createdAny) {
                    setSelectedElement(dec);
                    setOpenBranchConfigConnectionId(newConn.id);
                    createdAny = true;
                  }
                }
              }
            } catch {
              notify({
                title: "Не удалось создать соединение",
                variant: "destructive",
              });
            }
          } else {
            createConnection.mutate({
              schemaId,
              sourceId: connectionStart.id,
              targetId: element.id,
              connectionType: "sequence",
            });
          }
        }
        setConnectionStart(null);
      }
      return;
    }

    // Select element for property editing
    if (selectedTool === "select") {
      e.stopPropagation();
      setSelectedElement(element);
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent, element: any) => {
    if (selectedTool !== "select") return;

    e.stopPropagation();

    const canvasRect = e.currentTarget
      .closest(".canvas")
      ?.getBoundingClientRect();

    if (canvasRect) {
      const mx = e.clientX - canvasRect.left;
      const my = e.clientY - canvasRect.top;
      const worldX = (mx - pan.x) / zoom;
      const worldY = (my - pan.y) / zoom;
      setDragOffset({
        x: worldX - (element.positionX ?? 0),
        y: worldY - (element.positionY ?? 0),
      });
      setDraggedElement(element);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: panStartRef.current.x + (e.clientX - mouseStartRef.current.x),
        y: panStartRef.current.y + (e.clientY - mouseStartRef.current.y),
      });
      return;
    }
    if (!draggedElement) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const w = draggedElement.width ?? 120;
    const h = draggedElement.height ?? 60;

    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let rawX = (mx - pan.x) / zoom - dragOffset.x;
    let rawY = (my - pan.y) / zoom - dragOffset.y;

    const snapX = (v: number) => Math.round(v / gridCellWidth) * gridCellWidth;
    const snapY = (v: number) =>
      Math.round(v / gridCellHeight) * gridCellHeight;

    let nx = shouldSnap ? snapX(rawX) : rawX;
    let ny = shouldSnap ? snapY(rawY) : rawY;

    const centerWorldY = (rect.height / 2 - pan.y) / zoom;
    if (centerLineEnabled && draggedElement.elementType !== "DECISION") {
      const snappedCenterWorldY =
        Math.floor(centerWorldY / gridCellHeight) * gridCellHeight +
        gridCellHeight / 2;
      ny = snappedCenterWorldY - h / 2;
    }

    // clamp into canvas (world space)
    const worldW = rect.width / zoom;
    const worldH = rect.height / zoom;
    nx = Math.max(0, Math.min(nx, worldW - w));
    ny = Math.max(0, Math.min(ny, worldH - h));

    setElements((prev) =>
      prev.map((el) =>
        el.id === draggedElement.id
          ? {
              ...el,
              positionX: nx,
              positionY: ny,
            }
          : el,
      ),
    );
  };

  const handleMouseUp = () => {
    if (draggedElement) {
      const updatedElement = elements.find((el) => el.id === draggedElement.id);
      if (updatedElement) {
        updateElement.mutate({
          id: updatedElement.id,
          positionX: updatedElement.positionX,
          positionY: updatedElement.positionY,
        });
      }
      setDraggedElement(null);
    }
    if (isPanning) setIsPanning(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 2) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = pan;
      mouseStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.05 : 0.95;
    const nextZoom = Math.max(0.6, Math.min(1.4, zoom * factor));
    const worldX = (cx - pan.x) / zoom;
    const worldY = (cy - pan.y) / zoom;
    const nextPan = { x: cx - worldX * nextZoom, y: cy - worldY * nextZoom };
    setZoom(nextZoom);
    setPan(nextPan);
  };

  // Keyboard handler for temporary snapping override (Alt)
  React.useEffect(() => {
    const onDown = (ev: KeyboardEvent) => {
      if (ev.altKey) setIsAltPressed(true);
    };
    const onUp = () => setIsAltPressed(false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  const confirmDecisionBranch = (label: "Согласовано" | "Отклонено") => {
    if (!pendingDecisionLink || !schemaId) return;
    const color = pickNextBranchColor(pendingDecisionLink.sourceId);
    createConnection.mutate({
      schemaId,
      sourceId: pendingDecisionLink.sourceId,
      targetId: pendingDecisionLink.targetId,
      connectionType: "sequence",
      label,
      condition: JSON.stringify({ color, rules: [] }),
    });
    setPendingDecisionLink(null);
    // If we just added first branch, remove needsConfiguration on DECISION
    const dec = elements.find((e) => e.id === pendingDecisionLink.sourceId);
    if (dec) {
      try {
        const props = dec.properties
          ? (JSON.parse(dec.properties as string) as any)
          : {};
        if (props.needsConfiguration) {
          props.needsConfiguration = false;
          updateElement.mutate({
            id: dec.id,
            properties: JSON.stringify(props),
          });
        }
      } catch {}
    }
  };

  const isHighlighted = (id: string) => highlightIds.includes(id);

  const renderElement = (element: any) => {
    const elementType = elementTypes.find(
      (t) => t.type === element.elementType,
    );
    if (!elementType) return null;

    const Icon = elementType.icon;

    const needsConfig = (() => {
      try {
        const props = element?.properties
          ? (JSON.parse(element.properties as string) as any)
          : {};
        return !!props.needsConfiguration;
      } catch {
        return false;
      }
    })();
    return (
      <div
        key={element.id}
        className={`group absolute cursor-pointer p-2 ${elementType.color} text-white text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-200 select-none ${element.elementType !== "DECISION" && element.elementType !== "APPROVAL" ? "border-2 border-gray-300 rounded-lg" : ""} ${selectedElement?.id === element.id ? "ring-2 ring-blue-400 ring-offset-2" : ""} ${isHighlighted(element.id) ? "ring-2 ring-primary ring-offset-2" : ""} ${element.elementType === "DECISION" && needsConfig ? "opacity-60 ring-0" : ""}`}
        style={{
          left: element.positionX,
          top: element.positionY,
          width:
            element.elementType === "DECISION"
              ? element.width || gridCellWidth
              : element.width || 120,
          height: element.height || gridCellHeight,
          clipPath:
            element.elementType === "DECISION"
              ? "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"
              : element.elementType === "APPROVAL"
                ? "polygon(10% 0, 100% 0, 90% 100%, 0 100%)"
                : undefined,
        }}
        title={
          element.elementType === "DECISION" && needsConfig
            ? "настройте связи"
            : undefined
        }
        onMouseDown={(e) => handleElementMouseDown(e, element)}
        onClick={(e) => handleElementClick(e, element)}
      >
        <div className="flex items-center justify-center h-full" style={{}}>
          {" "}
          <Icon className="w-4 h-4 mr-1" />
          <span className="truncate">{element.name}</span>
        </div>
        {/* Copy handler (plus) - show on hover over PROCESS element only */}
        {element.elementType === "PROCESS" && !approvalRouteMode && (
          <button
            className="absolute -right-3 -top-3 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center shadow focus:outline-none focus:ring-2 focus:ring-ring opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              (async () => {
                if (!schemaId) return;
                const parent = element;
                try {
                  const dec = await apiClient.createProcessSchemaElement({
                    schemaId,
                    elementType: "DECISION",
                    name: "Решение",
                    positionX:
                      (parent.positionX ?? 0) + (parent.width ?? 120) + 120,
                    positionY: parent.positionY ?? 0,
                    width: gridCellWidth,
                    height: gridCellHeight,
                  });
                  setElements((prev) => [...prev, dec]);

                  const child = await apiClient.copyProcessElement({
                    elementId: parent.id,
                  });
                  // place child further right from decision
                  await apiClient.updateProcessSchemaElement({
                    id: child.id,
                    positionX:
                      (dec.positionX ?? 0) + (dec.width ?? gridCellWidth) + 120,
                    positionY: dec.positionY ?? 0,
                  });

                  // connections: parent -> decision, decision -> child
                  await apiClient.createProcessConnection({
                    schemaId,
                    sourceId: parent.id,
                    targetId: dec.id,
                    connectionType: "sequence",
                    condition: JSON.stringify({
                      color: pickNextBranchColor(parent.id),
                    }),
                  });
                  const outColor = pickNextBranchColor(dec.id);
                  const outConn = await apiClient.createProcessConnection({
                    schemaId,
                    sourceId: dec.id,
                    targetId: child.id,
                    connectionType: "sequence",
                    condition: JSON.stringify({ color: outColor, rules: [] }),
                  });

                  // Save triple into decision properties
                  try {
                    const props = {
                      decisionTriples: [
                        {
                          incomingProcessId: parent.id,
                          incomingColor: pickNextBranchColor(parent.id),
                          incomingLabel: "",
                          logic: { rules: [] },
                          outgoingProcessId: child.id,
                          outgoingColor: outColor,
                          outgoingLabel: "",
                        },
                      ],
                    };
                    await apiClient.updateProcessSchemaElement({
                      id: dec.id,
                      properties: props,
                    });
                  } catch {}

                  setSelectedElement(dec);
                  setOpenBranchConfigConnectionId(outConn.id);
                  await queryClient.invalidateQueries([
                    "processSchema",
                    schemaId,
                  ]);
                } catch {
                  notify({
                    title: "Не удалось наследовать процесс",
                    variant: "destructive",
                  });
                }
              })();
            }}
            title="Наследовать процесс"
            aria-label="Наследовать процесс"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}{" "}
      </div>
    );
  };

  // Popover to preset assignees per role for a process element
  const AssigneePresetPopover: React.FC<{
    elementId: string;
    onClose: () => void;
  }> = ({ elementId, onClose }) => {
    const el = elements.find((e) => e.id === elementId);

    const worldX = (el?.positionX ?? 0) + (el?.width ?? 120) / 2 + 24;
    const worldY = (el?.positionY ?? 0) - 8;
    const screenX = worldX * zoom + pan.x;
    const screenY = worldY * zoom + pan.y;

    const mapRole = (
      r: string,
    ): "applicant" | "executor" | "approver" | "observer" | undefined => {
      const v = (r || "").toLowerCase();
      if (v === "инициатор" || v === "initiator" || v === "applicant")
        return "applicant";
      if (v === "executor") return "executor";
      if (v === "approver") return "approver";
      if (v === "observer" || v === "наблюдатель") return "observer";
      return undefined;
    };

    const { data: roleDefs } = useQuery(
      ["elementRoles", elementId],
      () => apiClient.listElementRolesPublic({ elementId }),
      { staleTime: 30_000 },
    );

    const roles: Array<"applicant" | "executor" | "approver" | "observer"> = (
      roleDefs ?? []
    )
      .map((r: any) => mapRole(r.roleType))
      .filter(Boolean) as any;

    const currentProps: any = el?.properties
      ? (JSON.parse(el.properties as string) as any)
      : {};
    const defaultAssignees: Record<string, string> =
      currentProps.defaultAssignees ?? {};

    return (
      <div className="absolute z-50" style={{ left: screenX, top: screenY }}>
        <div
          className="bg-card border rounded shadow p-2 -translate-x-1/2 -translate-y-full w-80"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="text-xs mb-2">Преднастройка ответственных</div>
          {roles.length === 0 ? (
            <div className="text-[12px] text-muted-foreground">
              Добавьте роли участника для этого процесса, чтобы выбрать
              пользователей.
            </div>
          ) : (
            roles.map((rk) => (
              <RoleUsersList
                key={rk}
                roleKey={rk}
                elementId={elementId}
                selectedId={defaultAssignees?.[rk]}
              />
            ))
          )}
          <div className="flex justify-end mt-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const RoleUsersList: React.FC<{
    roleKey: "applicant" | "executor" | "approver" | "observer";
    elementId: string;
    selectedId?: string;
  }> = ({ roleKey, elementId, selectedId }) => {
    const { data: users } = useQuery(
      ["usersByRole", roleKey],
      () => apiClient.listUsersByRole({ roleType: roleKey }),
      { staleTime: 30_000 },
    );

    const saveSelection = async (userId: string) => {
      try {
        const el = elements.find((e) => e.id === elementId);
        if (!el) return;
        const props: any = el?.properties
          ? (JSON.parse(el.properties as string) as any)
          : {};
        props.defaultAssignees = {
          ...(props.defaultAssignees ?? {}),
          [roleKey]: userId,
        };
        // optimistic update
        setElements((prev) =>
          prev.map((p) =>
            p.id === el.id ? { ...p, properties: JSON.stringify(props) } : p,
          ),
        );
        await apiClient.updateProcessSchemaElement({
          id: elementId,
          properties: props,
        });
      } catch {
        // ignored, toast elsewhere if needed
      }
    };

    const roleLabel: Record<string, string> = {
      applicant: "Заявитель",
      executor: "Исполнитель",
      approver: "Согласующий",
      observer: "Наблюдатель",
    };

    return (
      <div className="mb-2">
        <div className="text-[12px] font-medium mb-1">{roleLabel[roleKey]}</div>
        <div className="flex flex-col gap-1 max-h-40 overflow-auto">
          {(users ?? []).map((u: any) => {
            const isSel = selectedId === u.id;
            return (
              <Button
                key={u.id}
                variant={isSel ? "default" : "outline"}
                size="sm"
                className="justify-start"
                onClick={() => saveSelection(u.id)}
                title={u.email || u.handle || u.id}
              >
                <span className="truncate">
                  {u.name || u.handle || u.email || u.id}
                </span>
                {isSel && (
                  <span className="ml-2 text-[10px] opacity-80">(выбран)</span>
                )}
              </Button>
            );
          })}
          {users?.length === 0 && (
            <div className="text-[12px] text-muted-foreground">
              Нет пользователей с этой ролью
            </div>
          )}
        </div>
      </div>
    );
  };

  // Handle loading and error states
  if (!schemaId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Схема не найдена</h2>
          <p className="text-muted-foreground mb-4">ID схемы не указан в URL</p>
          <Button onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к админ панели
          </Button>
        </div>
      </div>
    );
  }

  if (isSchemaLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка схемы...</p>
        </div>
      </div>
    );
  }

  if (schemaError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Ошибка загрузки</h2>
          <p className="text-muted-foreground mb-4">
            {schemaError instanceof Error
              ? schemaError.message
              : "Не удалось загрузить схему"}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Обновить страницу
            </Button>
            <Button onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться к админ панели
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Схема не найдена</h2>
          <p className="text-muted-foreground mb-4">
            Схема с ID {schemaId} не существует
          </p>
          <Button onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к админ панели
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">
                {schema
                  ? `Редактор схемы: ${schema.name}`
                  : "Новая схема процесса"}
              </h1>
              {schema && (
                <>
                  <Badge
                    variant={schema.isPublished ? "default" : "secondary"}
                    className={`text-xs ${schema.isPublished ? "bg-green-600" : ""}`}
                  >
                    {schema.isPublished ? "Опубликована" : "Черновик"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        v{schema.version ?? 1}
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80">
                      <DropdownMenuLabel>Версии</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {schemaVersions.length === 0 ? (
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                          Версии не найдены
                        </div>
                      ) : (
                        schemaVersions.map((v: any) => {
                          const isCurrent = v.id === schema.id;
                          return (
                            <DropdownMenuItem
                              key={v.id}
                              className="flex items-center justify-between gap-2"
                              onClick={() => {
                                if (!isCurrent)
                                  navigate(`/admin/process-editor/${v.id}`);
                              }}
                            >
                              <span className="truncate">
                                v{v.version ?? 1}
                                {v.versionLabel ? ` — ${v.versionLabel}` : ""}
                              </span>
                              <Badge
                                variant={
                                  v.isPublished ? "default" : "secondary"
                                }
                                className={`${v.isPublished ? "bg-green-600" : ""} text-[10px]`}
                              >
                                {v.isPublished ? "Опубликована" : "Черновик"}
                              </Badge>
                            </DropdownMenuItem>
                          );
                        })
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (!schemaId) return;
                try {
                  const info = await apiClient.getSchemaDeletionInfo({
                    id: schemaId,
                  });
                  if (info?.isPublished && (info?.applicationsCount ?? 0) > 0) {
                    const proceed = window.confirm(
                      `Внимание: схема опубликована и по ней уже создано заявок: ${info.applicationsCount}.\nУдаление приведёт к недоступности формы для новых заявок. Продолжить удаление?`,
                    );
                    if (!proceed) return;
                  } else {
                    const proceed = window.confirm(
                      "Вы уверены, что хотите удалить эту схему процесса?",
                    );
                    if (!proceed) return;
                  }
                } catch {
                  const proceed = window.confirm(
                    "Вы уверены, что хотите удалить эту схему процесса?",
                  );
                  if (!proceed) return;
                }
                deleteSchema.mutate({ id: schemaId });
              }}
              disabled={deleteSchema.isLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Удалить схему
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSaveDialogOpen(true)}
              disabled={false}
            >
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsPublishDialogOpen(true)}
              disabled={validateAndPublish.isLoading}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Опубликовать
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Save dialog */}
        <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Сохранение схемы</DialogTitle>
              <DialogDescription>
                Выберите, как сохранить изменения для версии v
                {schema?.version ?? 1}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="saveMode"
                  checked={saveChoice === "current"}
                  onChange={() => setSaveChoice("current")}
                />
                Сохранить в текущей версии v{schema?.version ?? 1}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="saveMode"
                  checked={saveChoice === "new"}
                  onChange={() => setSaveChoice("new")}
                />
                Создать новую версию v{nextVersion}
              </label>

              {saveChoice === "new" && (
                <div className="space-y-2">
                  <Label className="text-sm">
                    Название версии (необязательно)
                  </Label>
                  <Input
                    placeholder="Например: Демо для клиента"
                    value={newVersionLabel}
                    onChange={(e) => setNewVersionLabel(e.target.value)}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsSaveDialogOpen(false)}
              >
                Отмена
              </Button>
              {saveChoice === "current" ? (
                <Button
                  onClick={async () => {
                    // Пересохранение текущей версии: данные уже сохраняются по месту, просто подтвердим и рефрешнем схему
                    setIsSaveDialogOpen(false);
                    await queryClient.invalidateQueries([
                      "processSchema",
                      schemaId,
                    ]);
                    notify({
                      title: "Сохранено",
                      description: `Изменения сохранены в v${schema?.version ?? 1}`,
                    });
                  }}
                >
                  Сохранить в v{schema?.version ?? 1}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (!schemaId) return;
                    createNewVersion.mutate({ id: schemaId });
                  }}
                  disabled={createNewVersion.isLoading}
                >
                  Создать v{nextVersion}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Publish options dialog */}
        <Dialog
          open={isPublishDialogOpen}
          onOpenChange={setIsPublishDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Публикация схемы</DialogTitle>
              <DialogDescription>
                Выберите, как публиковать текущую версию
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="publishMode"
                  checked={publishChoice === "keepOthers"}
                  onChange={() => setPublishChoice("keepOthers")}
                />
                Опубликовать текущую и оставить другие опубликованные версии
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="publishMode"
                  checked={publishChoice === "unpublishOthers"}
                  onChange={() => setPublishChoice("unpublishOthers")}
                />
                Опубликовать текущую и снять публикацию с остальных версий
              </label>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPublishDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button
                onClick={() => {
                  if (!schemaId) return;
                  validateAndPublish.mutate({
                    id: schemaId,
                    unpublishOthers: publishChoice === "unpublishOthers",
                  });
                  setIsPublishDialogOpen(false);
                }}
                disabled={validateAndPublish.isLoading}
              >
                Опубликовать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Toolbar */}
        <div className="w-48 bg-card border-r p-4">
          <h3 className="font-medium mb-4">Инструменты</h3>

          {/* Selection Tool */}
          <div className="mb-4">
            {" "}
            <Button
              variant={selectedTool === "select" ? "default" : "outline"}
              size="sm"
              className="w-full justify-start mb-2"
              onClick={() => setSelectedTool("select")}
            >
              <MousePointer className="w-4 h-4 mr-2" />
              Выбор
            </Button>
            <Button
              variant={selectedTool === "connect" ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setSelectedTool("connect");
                setConnectionStart(null);
              }}
            >
              <Workflow className="w-4 h-4 mr-2" />
              Соединить
            </Button>
            <Button
              variant={approvalRouteMode ? "default" : "outline"}
              size="sm"
              className="w-full justify-start mt-2"
              onClick={() => {
                setApprovalRouteMode((v) => !v);
                setStatusPickerFor(null);
              }}
            >
              Маршрут согласования {approvalRouteMode ? "Вкл" : "Выкл"}
            </Button>
          </div>

          {/* Element Types */}
          <div>
            <h4 className="text-sm font-medium mb-2">Элементы схемы</h4>
            <div className="space-y-2">
              {elementTypes.map((elementType) => {
                const Icon = elementType.icon;
                return (
                  <Button
                    key={elementType.type}
                    variant={
                      selectedTool === elementType.type ? "default" : "outline"
                    }
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedTool(elementType.type)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {elementType.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Версии перенесены в шапку: список убран из левого меню */}

          {/* Настройки холста/сетки — в сворачиваемом блоке (по умолчанию закрыт) */}
          <Collapsible defaultOpen={false}>
            <div className="mt-6">
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                >
                  <span>Сетка</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-2">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={gridVisible}
                    onChange={(e) => setGridVisible(e.target.checked)}
                  />
                  Показать сетку
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={snapEnabled}
                    onChange={(e) => setSnapEnabled(e.target.checked)}
                  />
                  Привязка к сетке
                </label>
                <div className="text-[11px] text-muted-foreground">
                  Удерживайте Alt, чтобы временно отключить привязку
                </div>
                <div className="space-y-1">
                  <label className="text-xs">Шаг по X (px)</label>
                  <Input
                    type="number"
                    value={gridCellWidth}
                    onChange={(e) =>
                      setGridCellWidth(() => {
                        const n = parseInt(e.target.value || "120");
                        if (Number.isNaN(n)) return 120;
                        return Math.max(120, Math.min(400, n));
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs">Шаг по Y (px)</label>
                  <Input
                    type="number"
                    value={gridCellHeight}
                    onChange={(e) =>
                      setGridCellHeight(() => {
                        const n = parseInt(e.target.value || "60");
                        if (Number.isNaN(n)) return 60;
                        return Math.max(60, Math.min(400, n));
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs">
                    Прозрачность великолепной сетки
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={gridOpacity}
                    onChange={(e) => setGridOpacity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs">Контур сетки</label>
                  <select
                    className="border rounded px-2 py-1 text-sm bg-background w-full"
                    value={gridDashed ? "dashed" : "solid"}
                    onChange={(e) => setGridDashed(e.target.value === "dashed")}
                  >
                    <option value="solid">Сплошной</option>
                    <option value="dashed">Пунктир</option>
                  </select>
                </div>
              </CollapsibleContent>{" "}
            </div>
          </Collapsible>

          {/* Properties Panel */}
          {schema && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Свойства схемы</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Название:</span>
                  <div className="font-medium">{schema.name}</div>
                </div>
                {schema.service && (
                  <div>
                    <span className="text-muted-foreground">Услуга:</span>
                    <div className="font-medium">{schema.service.name}</div>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Элементов:</span>
                  <div className="font-medium">{elements.length}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden min-h-0">
          {" "}
          <div
            ref={canvasRef}
            className="canvas process-editor-canvas w-full h-full bg-gray-700 relative"
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseDown={handleCanvasMouseDown}
            onWheel={handleCanvasWheel}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Основная горизонтальная зелёная линия-ориентир (полупрозрачная) */}
            {centerLineEnabled && (
              <div
                className="absolute inset-x-0 h-[2px] bg-green-500/30 z-0 pointer-events-none"
                style={{ top: centerLineScreenY }}
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
              }}
            >
              {gridVisible && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <pattern
                      id="gridPattern"
                      width={gridCellWidth}
                      height={gridCellHeight}
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d={`M ${gridCellWidth} 0 V ${gridCellHeight} M 0 ${gridCellHeight} H ${gridCellWidth}`}
                        stroke={`rgba(255,255,255,${gridOpacity})`}
                        strokeWidth="1"
                        strokeDasharray={gridDashed ? "6 8" : undefined}
                        fill="none"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#gridPattern)" />
                </svg>
              )}
              {/* Connections - bring above elements */}{" "}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                {connections.map((connection) => {
                  const sourceElement = elements.find(
                    (el) => el.id === connection.sourceId,
                  );
                  const targetElement = elements.find(
                    (el) => el.id === connection.targetId,
                  );

                  if (!sourceElement || !targetElement) return null;

                  const sW = sourceElement.width || 120;
                  const sH = sourceElement.height || 60;
                  const tW = targetElement.width || 120;
                  const tH = targetElement.height || 60;

                  const sCX = sourceElement.positionX + sW / 2;
                  const sCY = sourceElement.positionY + sH / 2;
                  const tCX = targetElement.positionX + tW / 2;
                  const tCY = targetElement.positionY + tH / 2;

                  // Compute intersection with source rectangle edge toward target
                  const dx1 = tCX - sCX;
                  const dy1 = tCY - sCY;
                  const scale1 =
                    Math.max(
                      Math.abs(dx1) / (sW / 2),
                      Math.abs(dy1) / (sH / 2),
                    ) || 1;
                  const startX = sCX + dx1 / scale1;
                  const startY = sCY + dy1 / scale1;

                  // Compute intersection with target rectangle edge toward source
                  const dx2 = sCX - tCX;
                  const dy2 = sCY - tCY;
                  const scale2 =
                    Math.max(
                      Math.abs(dx2) / (tW / 2),
                      Math.abs(dy2) / (tH / 2),
                    ) || 1;
                  const endX = tCX + dx2 / scale2;
                  const endY = tCY + dy2 / scale2;

                  // Build orthogonal (Manhattan) polyline: avoid diagonals
                  const points: Array<{ x: number; y: number }> = [];
                  points.push({ x: startX, y: startY });

                  if (
                    Math.abs(startX - endX) < 0.5 ||
                    Math.abs(startY - endY) < 0.5
                  ) {
                    // Already horizontal or vertical
                    // no intermediate corner needed
                  } else {
                    // Default to horizontal-then-vertical L-shape
                    points.push({ x: endX, y: startY });
                  }

                  points.push({ x: endX, y: endY });

                  const polyPoints = points
                    .map((p) => `${p.x},${p.y}`)
                    .join(" ");

                  // Choose a label anchor point (midpoint of the longest segment)
                  const segs = points.length - 1;
                  let labelX = (startX + endX) / 2;
                  let labelY = (startY + endY) / 2;
                  if (segs >= 1) {
                    let maxLen = -1;
                    let anchorIndex = 0;
                    for (let i = 0; i < segs; i++) {
                      const a = points[i]!;
                      const b = points[i + 1]!;
                      const len = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
                      if (len > maxLen) {
                        maxLen = len;
                        anchorIndex = i;
                      }
                    }
                    const a = points[anchorIndex]!;
                    const b = points[anchorIndex + 1]!;
                    labelX = (a.x + b.x) / 2;
                    labelY = (a.y + b.y) / 2;
                  }

                  const cond = parseConnCondition(connection) as any;
                  const strokeColor = cond?.color || "#d1d5db";
                  const textRotation: 0 | 90 =
                    cond?.labelRotation === 90 ? 90 : 0;

                  return (
                    <g key={connection.id}>
                      <polyline
                        points={polyPoints}
                        fill="none"
                        stroke={strokeColor}
                        strokeOpacity={
                          sourceElement.elementType === "DECISION" &&
                          (!cond ||
                            !Array.isArray(cond.rules) ||
                            cond.rules.length === 0)
                            ? 0.4
                            : 1
                        }
                        strokeWidth={
                          highlightIds.includes(sourceElement.id) &&
                          highlightIds.includes(targetElement.id)
                            ? 3
                            : 2
                        }
                        markerEnd="url(#arrowhead)"
                      />

                      {(() => {
                        // draw star if child is fully inherited
                        let showStar = false;
                        try {
                          const props = targetElement?.properties
                            ? (JSON.parse(
                                targetElement.properties as string,
                              ) as any)
                            : {};
                          showStar =
                            !!props.fullyInherited &&
                            props.parentElementId === sourceElement.id;
                        } catch {}
                        return showStar ? (
                          <g>
                            <title>
                              Полное наследование: дочерний процесс унаследован
                              от родительского
                            </title>
                            <text
                              x={labelX}
                              y={labelY - 12}
                              textAnchor="middle"
                              fill="#f59e0b"
                              fontSize="14"
                            >
                              ★
                            </text>
                          </g>
                        ) : null;
                      })()}

                      {connection.label && (
                        <g>
                          <title>Ветка: {connection.label}</title>
                          <text
                            x={labelX}
                            y={labelY - 6}
                            textAnchor="middle"
                            fill="#d1d5db"
                            fontSize="10"
                            transform={
                              textRotation === 90
                                ? `rotate(-90 ${labelX} ${labelY - 6})`
                                : undefined
                            }
                          >
                            {connection.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Arrow marker definition */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" />
                  </marker>
                </defs>
                {/* Extra arrows from approval checklist icon to DECISION */}
                {elements
                  .filter((el) => el.elementType === "PROCESS")
                  .map((proc) => {
                    let hasApproval = false;
                    try {
                      const props = proc?.properties
                        ? (JSON.parse(proc.properties as string) as any)
                        : {};
                      hasApproval = !!props?.hasApprovalRequisite;
                    } catch {}
                    if (!hasApproval) return null;
                    const decConn = connections.find((c) => {
                      const tgt = elements.find((e) => e.id === c.targetId);
                      return (
                        c.sourceId === proc.id &&
                        tgt?.elementType === "DECISION"
                      );
                    });
                    if (!decConn) return null;
                    const targetEl = elements.find(
                      (e) => e.id === decConn.targetId,
                    );
                    if (!targetEl) return null;

                    const pW = proc.width || 120;
                    const pH = proc.height || 60;
                    const tW = targetEl.width || 120;
                    const tH = targetEl.height || 60;

                    const iconX = (proc.positionX ?? 0) + pW / 2;
                    const iconY = (proc.positionY ?? 0) + pH + 10; // a little below the process

                    const tCX = (targetEl.positionX ?? 0) + tW / 2;
                    const tCY = (targetEl.positionY ?? 0) + tH / 2;

                    // intersect to target edge
                    const dx2 = iconX - tCX;
                    const dy2 = iconY - tCY;
                    /* compute scale to intersect target edge (unused in current rendering) */
                    void dx2;
                    void dy2;
                    /* const endX = tCX + dx2 / scale2;
                    const endY = tCY + dy2 / scale2; */

                    return null;
                  })}
              </svg>
              {/* Grid Pattern and Elements */}
              <div className="absolute inset-0 z-10">
                {/* Render elements */}
                {elements.map(renderElement)}

                {/* Approval checklist icon under processes with approval requisite */}
                {elements
                  .filter((el) => el.elementType === "PROCESS")
                  .map((el) => {
                    let hasApproval = false;
                    try {
                      const props = el?.properties
                        ? (JSON.parse(el.properties as string) as any)
                        : {};
                      hasApproval = !!props?.hasApprovalRequisite;
                    } catch {}
                    if (!hasApproval) return null;
                    return (
                      <div
                        key={el.id + "-approval-icon"}
                        className="absolute z-20 text-[10px] px-1 py-0.5 rounded bg-black/60 text-white"
                        style={{
                          left: (el.positionX ?? 0) + (el.width ?? 120) / 2 - 8,
                          top: (el.positionY ?? 0) + (el.height ?? 60) + 4,
                        }}
                        title="Согласование: чек‑лист"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 11l3 3 5-5"
                            stroke="#22c55e"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <rect
                            x="4"
                            y="4"
                            width="16"
                            height="16"
                            rx="2"
                            stroke="#e5e7eb"
                            strokeWidth="2"
                            fill="none"
                          />
                        </svg>
                      </div>
                    );
                  })}

                {/* Status badge overlays on elements */}
                {approvalRouteMode &&
                  elements
                    .filter((el) => el.elementType === "PROCESS")
                    .map((el) => {
                      let statusLabel: string | undefined;
                      try {
                        const props = el?.properties
                          ? (JSON.parse(el.properties as string) as any)
                          : {};
                        statusLabel = props?.approvalStatus;
                      } catch {}
                      const showText = statusLabel || undefined;
                      if (!showText) return null;
                      return (
                        <div
                          key={el.id + "-status"}
                          className="absolute z-20 text-[10px] px-2 py-0.5 rounded bg-black/60 text-white"
                          style={{
                            left: (el.positionX ?? 0) + 4,
                            top: (el.positionY ?? 0) + (el.height ?? 60) - 16,
                          }}
                          title="Статус заявки для этого процесса"
                        >
                          {showText}
                        </div>
                      );
                    })}

                {/* Ellipsis label for processes without status in route mode */}
                {approvalRouteMode &&
                  elements
                    .filter((el) => el.elementType === "PROCESS")
                    .map((el) => {
                      let hasStatus = false;
                      try {
                        const props = el?.properties
                          ? (JSON.parse(el.properties as string) as any)
                          : {};
                        hasStatus = !!props?.approvalStatus;
                      } catch {}
                      if (hasStatus) return null;
                      return (
                        <div
                          key={el.id + "-ellipsis"}
                          className="absolute z-40 text-xs px-1 rounded bg-black/60 text-white cursor-pointer hover:bg-black/80"
                          style={{
                            left: (el.positionX ?? 0) + (el.width ?? 120) / 2,
                            top: (el.positionY ?? 0) - 10,
                            transform: "translateX(-50%)",
                          }}
                          title="Назначить статус"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => setStatusPickerFor(el.id)}
                        >
                          ...*
                        </div>
                      );
                    })}

                {/* Assignee preset button (...+) */}
                {approvalRouteMode &&
                  elements
                    .filter((el) => el.elementType === "PROCESS")
                    .map((el) => (
                      <div
                        key={el.id + "-assignees"}
                        className="absolute z-40 text-xs px-1 rounded bg-black/60 text-white cursor-pointer hover:bg-black/80"
                        style={{
                          left:
                            (el.positionX ?? 0) + (el.width ?? 120) / 2 + 28,
                          top: (el.positionY ?? 0) - 10,
                          transform: "translateX(-50%)",
                        }}
                        title="Преднастройка пользователей"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => setAssigneePickerFor(el.id)}
                      >
                        ...+
                      </div>
                    ))}

                {/* Status picker popover (positioned in world coords) */}
                {(() => {
                  if (!statusPickerFor) return null;
                  const el = elements.find((e) => e.id === statusPickerFor);
                  if (!el) return null;
                  const worldX = (el.positionX ?? 0) + (el.width ?? 120) / 2;
                  const worldY = (el.positionY ?? 0) - 8;
                  const screenX = worldX * zoom + pan.x;
                  const screenY = worldY * zoom + pan.y;
                  return (
                    <div
                      className="absolute z-50"
                      style={{ left: screenX, top: screenY }}
                    >
                      <div className="bg-card border rounded shadow p-2 -translate-x-1/2 -translate-y-full w-72">
                        <div className="text-xs mb-2">
                          Выберите статус (только один)
                        </div>
                        <div
                          className="max-h-56 overflow-auto space-y-1"
                          onWheel={(e) => e.stopPropagation()}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <Button
                              key={opt}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-left"
                              onClick={async () => {
                                try {
                                  const props = el?.properties
                                    ? (JSON.parse(
                                        el.properties as string,
                                      ) as any)
                                    : {};
                                  props.approvalStatus = opt;
                                  // optimistic update
                                  setElements((prev) =>
                                    prev.map((p) =>
                                      p.id === el.id
                                        ? {
                                            ...p,
                                            properties: JSON.stringify(props),
                                          }
                                        : p,
                                    ),
                                  );
                                  await apiClient.updateProcessSchemaElement({
                                    id: el.id,
                                    properties: props,
                                  });
                                } catch {}
                                setStatusPickerFor(null);
                              }}
                            >
                              {opt}
                            </Button>
                          ))}
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStatusPickerFor(null)}
                          >
                            Отмена
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              {/* Assignee preset popover */}
              {assigneePickerFor ? (
                <AssigneePresetPopover
                  elementId={assigneePickerFor}
                  onClose={() => setAssigneePickerFor(null)}
                />
              ) : null}
              {/* Instructions */}
              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-300">
                    <Workflow className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Создайте схему процесса
                    </h3>
                    <p className="text-sm">
                      Выберите элемент из панели инструментов слева
                      <br />и нажмите на холст, чтобы добавить его
                    </p>
                  </div>
                </div>
              )}
            </div>
            {pendingDecisionLink && (
              <div
                className="absolute z-50"
                style={{
                  left: pendingDecisionLink.midWorld.x * zoom + pan.x,
                  top: pendingDecisionLink.midWorld.y * zoom + pan.y - 8,
                }}
              >
                <div className="flex items-center gap-2 bg-card border rounded shadow p-2 -translate-x-1/2 -translate-y-full">
                  <Button
                    size="sm"
                    onClick={() => confirmDecisionBranch("Согласовано")}
                  >
                    Согласовано
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => confirmDecisionBranch("Отклонено")}
                  >
                    Отклонено
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setPendingDecisionLink(null)}
                    className="h-7 w-7"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        {selectedElement && (
          <div
            className="w-[52rem] bg-card border-l p-4 overflow-y-auto"
            onMouseLeave={() => setHighlightIds([])}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Свойства элемента</h3>
              <div className="flex items-center gap-2"></div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (selectedElement) {
                      deleteElement.mutate({ id: selectedElement.id });
                    }
                  }}
                  disabled={deleteElement.isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedElement(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Название</Label>
                <Input
                  value={selectedElement.name}
                  onChange={(e) => {
                    const updatedElement = {
                      ...selectedElement,
                      name: e.target.value,
                    };
                    setSelectedElement(updatedElement);
                    setElements((prev) =>
                      prev.map((el) =>
                        el.id === selectedElement.id ? updatedElement : el,
                      ),
                    );
                  }}
                  onBlur={() => {
                    updateElement.mutate({
                      id: selectedElement.id,
                      name: selectedElement.name,
                    });
                  }}
                />
              </div>

              <div>
                <Label>Описание</Label>
                <Textarea
                  value={selectedElement.description || ""}
                  onChange={(e) => {
                    const updatedElement = {
                      ...selectedElement,
                      description: e.target.value,
                    };
                    setSelectedElement(updatedElement);
                    setElements((prev) =>
                      prev.map((el) =>
                        el.id === selectedElement.id ? updatedElement : el,
                      ),
                    );
                  }}
                  onBlur={() => {
                    updateElement.mutate({
                      id: selectedElement.id,
                      description: selectedElement.description,
                    });
                  }}
                  rows={3}
                />
              </div>

              {selectedElement.elementType === "DECISION" && false && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Ветвления</h4>
                  </div>
                  <div className="flex justify-between">
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!schemaId) return;
                        const dec = selectedElement;
                        const offsetX = (dec.width || 120) + 220;
                        const existing = connections.filter(
                          (c) => c.sourceId === dec.id,
                        );
                        const offsetY = (existing.length * 100) % 240;
                        const nx = (dec.positionX || 0) + offsetX;
                        const ny = (dec.positionY || 0) + offsetY;
                        try {
                          const color = pickNextBranchColor(dec.id);
                          const newProc =
                            await apiClient.createProcessSchemaElement({
                              schemaId,
                              elementType: "PROCESS",
                              name: `Процесс ${elements.length + 1}`,
                              positionX: nx,
                              positionY: ny,
                            });
                          setElements((prev) => [...prev, newProc]);

                          // Определяем, нужны ли строгие метки для этого DECISION
                          let requiresStrict = false;
                          try {
                            const incoming = connections.filter(
                              (c) => c.targetId === dec.id,
                            );
                            const predecessorIds = Array.from(
                              new Set(incoming.map((c) => c.sourceId)),
                            );
                            const predecessorProcesses = elements.filter(
                              (el) =>
                                predecessorIds.includes(el.id) &&
                                el.elementType === "PROCESS",
                            );
                            if (predecessorProcesses.length > 0) {
                              const all = await Promise.all(
                                predecessorProcesses.map((p) =>
                                  apiClient.listProcessTransitions({
                                    elementId: p.id,
                                  }),
                                ),
                              );
                              requiresStrict = all.some(
                                (arr: any) =>
                                  Array.isArray(arr) &&
                                  arr.some((t: any) =>
                                    [
                                      "approved_or_rejected",
                                      "approved",
                                      "rejected",
                                    ].includes(t.condition),
                                  ),
                              );
                            }
                          } catch {}

                          let labelToUse:
                            | "Согласовано"
                            | "Отклонено"
                            | undefined = undefined;
                          if (requiresStrict) {
                            const allowedLabels: Array<
                              "Согласовано" | "Отклонено"
                            > = ["Согласовано", "Отклонено"];
                            const usedLabels = existing
                              .map((c) => (c.label || "").trim())
                              .filter(Boolean);
                            labelToUse = allowedLabels.find(
                              (l) => !usedLabels.includes(l),
                            );
                            if (!labelToUse) {
                              notify({
                                title: "Обе ветки уже добавлены",
                                description:
                                  "Для блока 'Решение' доступны только ветки ‘Согласовано’ и ‘Отклонено’.",
                                variant: "destructive",
                              });
                              return;
                            }
                          }

                          const newConn =
                            await apiClient.createProcessConnection({
                              schemaId,
                              sourceId: dec.id,
                              targetId: newProc.id,
                              connectionType: "sequence",
                              label: labelToUse,
                              condition: JSON.stringify({ color, rules: [] }),
                            });
                          setConnections((prev) => [...prev, newConn]);
                          // Open right panel (properties) with DECISION selected and auto-expand the just-created branch config
                          setSelectedElement(dec);
                          setOpenBranchConfigConnectionId(newConn.id);
                          // briefly highlight the connection to draw attention
                          setHighlightIds([dec.id, newProc.id]);
                          setTimeout(() => setHighlightIds([]), 600);
                          // remove needsConfiguration flag
                          try {
                            const props = dec.properties
                              ? (JSON.parse(dec.properties as string) as any)
                              : {};
                            if (props.needsConfiguration) {
                              props.needsConfiguration = false;
                              await apiClient.updateProcessSchemaElement({
                                id: dec.id,
                                properties: JSON.stringify(props),
                              });
                            }
                          } catch {}
                          await queryClient.invalidateQueries([
                            "processSchema",
                            schemaId,
                          ]);
                        } catch {
                          notify({
                            title: "Не удалось добавить ветку",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Добавить ветку
                    </Button>
                  </div>

                  {/* Existing branches list */}
                  <div className="space-y-3">
                    <datalist id="req-fields">
                      {prevRequisites?.map((i: any) => (
                        <option
                          key={i.requisite.id}
                          value={`${i.elementName}.${i.requisite.name}`}
                        />
                      ))}
                    </datalist>
                    <datalist id="checklist-fields">
                      {prevChecklists?.map((i: any) => (
                        <option
                          key={i.checklist.id}
                          value={`${i.elementName}.${i.checklist.name}`}
                        />
                      ))}
                    </datalist>
                    {connections
                      .filter((c) => c.sourceId === selectedElement.id)
                      .map((c) => {
                        const baseCond = parseConnCondition(c) as any;
                        const cond = draftConditions[c.id] ?? baseCond;
                        const color =
                          cond.color || pickNextBranchColor(selectedElement.id);
                        const rules: any[] = Array.isArray(cond.rules)
                          ? cond.rules
                          : [];
                        return (
                          <div
                            key={c.id}
                            className="border rounded p-3 bg-background/60"
                            style={{ borderLeft: `4px solid ${color}` }}
                          >
                            {collapsedBranches[c.id] && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="inline-block w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span className="text-sm font-medium">
                                    {c.label || "Без метки"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    условий: {rules.length}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setCollapsedBranches((prev) => ({
                                        ...prev,
                                        [c.id]: false,
                                      }))
                                    }
                                  >
                                    Редактировать
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() =>
                                      deleteConnection.mutate({ id: c.id })
                                    }
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              {/* Селектор метки показываем только когда она обязательна */}
                              {(() => {
                                // вычисляем требование строгих меток для выбранного DECISION
                                const hasStrict = (() => {
                                  // мы не делаем здесь сетевые вызовы — отображение только; если сервер потребует, он проверит при сохранении
                                  // эвристика: если хотя бы одна существующая ветка уже имеет метку, продолжаем показывать селектор
                                  return connections.some(
                                    (cc) =>
                                      cc.sourceId === selectedElement.id &&
                                      (cc.label || "").trim() !== "",
                                  );
                                })();
                                return hasStrict ? (
                                  <select
                                    className="flex-1 h-9 rounded-md border border-input bg-background px-2 text-sm"
                                    value={
                                      draftLabels[c.id] ??
                                      c.label ??
                                      "Согласовано"
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value as
                                        | "Согласовано"
                                        | "Отклонено";
                                      setDraftLabels((prev) => ({
                                        ...prev,
                                        [c.id]: val,
                                      }));
                                      setConnections((prev) =>
                                        prev.map((cc) =>
                                          cc.id === c.id
                                            ? { ...cc, label: val }
                                            : cc,
                                        ),
                                      );
                                    }}
                                  >
                                    <option value="Согласовано">
                                      Согласовано
                                    </option>
                                    <option value="Отклонено">Отклонено</option>
                                  </select>
                                ) : null;
                              })()}
                              <input
                                type="color"
                                value={color}
                                onChange={(e) => {
                                  const next = {
                                    ...cond,
                                    color: e.target.value,
                                  };
                                  setDraftConditions((prev) => ({
                                    ...prev,
                                    [c.id]: next,
                                  }));
                                }}
                                title="Цвет ветки"
                              />
                              {/* Label rotation toggle */}
                              <label className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
                                <input
                                  type="checkbox"
                                  checked={(cond?.labelRotation ?? 0) === 90}
                                  onChange={(e) => {
                                    const next = {
                                      ...cond,
                                      labelRotation: e.target.checked ? 90 : 0,
                                    };
                                    setDraftConditions((prev) => ({
                                      ...prev,
                                      [c.id]: next,
                                    }));
                                  }}
                                />
                                Повернуть подпись 90°
                              </label>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() =>
                                  deleteConnection.mutate({ id: c.id })
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>{" "}
                            </div>

                            {/* Rule builder */}
                            <div
                              className={`mt-3 ${collapsedBranches[c.id] ? "hidden" : ""}`}
                            >
                              {" "}
                              <details
                                open={c.id === openBranchConfigConnectionId}
                              >
                                <summary className="cursor-pointer text-sm text-muted-foreground">
                                  Добавить условие
                                </summary>
                                <div className="mt-2 space-y-2">
                                  {rules.map((r, idx) => (
                                    <div
                                      key={idx}
                                      className="grid grid-cols-4 gap-2 items-center"
                                    >
                                      <select
                                        className="border rounded px-2 py-1 text-sm col-span-1 bg-background"
                                        value={r.type || "requisite"}
                                        onChange={(e) => {
                                          const next = {
                                            ...cond,
                                            rules: [...rules],
                                          };
                                          next.rules[idx] = {
                                            ...rules[idx],
                                            type: e.target.value,
                                          };
                                          setDraftConditions((prev) => ({
                                            ...prev,
                                            [c.id]: next,
                                          }));
                                        }}
                                      >
                                        <option value="requisite">
                                          Реквизит
                                        </option>
                                        <option value="checklist">
                                          Чек-лист
                                        </option>
                                        <option value="comment">
                                          Комментарий
                                        </option>
                                        <option value="file">Файл</option>
                                        <option value="prev_branch">
                                          Предыдущая ветка
                                        </option>
                                        <option value="date">Дата</option>
                                        <option value="number">Число</option>
                                        <option value="text">Текст</option>
                                      </select>
                                      {r.type === "requisite" ||
                                      r.type === "checklist" ? (
                                        <select
                                          className="border rounded px-2 py-1 text-sm col-span-1 bg-background"
                                          value={r.field || ""}
                                          onChange={(e) => {
                                            const next = {
                                              ...cond,
                                              rules: [...rules],
                                            };
                                            next.rules[idx] = {
                                              ...rules[idx],
                                              field: e.target.value,
                                            };
                                            setDraftConditions((prev) => ({
                                              ...prev,
                                              [c.id]: next,
                                            }));
                                          }}
                                        >
                                          {(() => {
                                            // Формируем список доступных полей и приоритизируем реквизиты из непосредственного предшественника
                                            const decId = selectedElement.id;
                                            const incoming = connections.filter(
                                              (cc) => cc.targetId === decId,
                                            );
                                            const predecessor = elements.find(
                                              (el) =>
                                                incoming.some(
                                                  (cc) => cc.sourceId === el.id,
                                                ) &&
                                                el.elementType === "PROCESS",
                                            );
                                            const isReq =
                                              r.type === "requisite";
                                            const list = (
                                              isReq
                                                ? prevRequisites
                                                : prevChecklists
                                            ) as any[];
                                            const sorted = [...list].sort(
                                              (a, b) => {
                                                const aFirst =
                                                  predecessor &&
                                                  a.elementId === predecessor.id
                                                    ? 0
                                                    : 1;
                                                const bFirst =
                                                  predecessor &&
                                                  b.elementId === predecessor.id
                                                    ? 0
                                                    : 1;
                                                if (aFirst !== bFirst)
                                                  return aFirst - bFirst;
                                                return String(
                                                  a.requisite?.name ||
                                                    a.checklist?.name ||
                                                    "",
                                                ).localeCompare(
                                                  String(
                                                    b.requisite?.name ||
                                                      b.checklist?.name ||
                                                      "",
                                                  ),
                                                  "ru",
                                                );
                                              },
                                            );
                                            // Группируем по процессу
                                            const groups: Record<
                                              string,
                                              any[]
                                            > = {};
                                            for (const it of sorted) {
                                              const key = `${it.elementName}`;
                                              if (!groups[key]) {
                                                groups[key] = [] as any[];
                                              }
                                              (groups[key] as any[]).push(it);
                                            }
                                            return Object.entries(groups).map(
                                              ([groupName, items]) => (
                                                <optgroup
                                                  key={groupName}
                                                  label={groupName}
                                                >
                                                  {items.map((it: any) => {
                                                    const name = isReq
                                                      ? it.requisite.name
                                                      : it.checklist.name;
                                                    const value = `${it.elementName}.${name}`;
                                                    return (
                                                      <option
                                                        key={value}
                                                        value={value}
                                                      >
                                                        {name} —{" "}
                                                        {it.elementName}
                                                      </option>
                                                    );
                                                  })}
                                                </optgroup>
                                              ),
                                            );
                                          })()}
                                        </select>
                                      ) : (
                                        <Input
                                          placeholder="Имя/поле"
                                          value={r.field || ""}
                                          onChange={(e) => {
                                            const next = {
                                              ...cond,
                                              rules: [...rules],
                                            };
                                            next.rules[idx] = {
                                              ...rules[idx],
                                              field: e.target.value,
                                            };
                                            updateConnection.mutate({
                                              id: c.id,
                                              condition: JSON.stringify(next),
                                            });
                                          }}
                                        />
                                      )}
                                      <select
                                        className="border rounded px-2 py-1 text-sm bg-background"
                                        value={r.op || "eq"}
                                        onChange={(e) => {
                                          const next = {
                                            ...cond,
                                            rules: [...rules],
                                          };
                                          next.rules[idx] = {
                                            ...rules[idx],
                                            op: e.target.value,
                                          };
                                          setDraftConditions((prev) => ({
                                            ...prev,
                                            [c.id]: next,
                                          }));
                                        }}
                                      >
                                        <option value="eq">равно</option>
                                        <option value="ne">не равно</option>
                                        {(r.valueType ?? "text") === "text" && (
                                          <option value="contains">
                                            содержит
                                          </option>
                                        )}
                                        {(r.valueType === "number" ||
                                          r.valueType === "date") && (
                                          <>
                                            <option value="gt">{">"}</option>
                                            <option value="lt">{"<"}</option>
                                          </>
                                        )}
                                        <option value="exists">
                                          заполнено
                                        </option>
                                      </select>
                                      {/* Value type selector */}
                                      <select
                                        className="border rounded px-2 py-1 text-sm bg-background"
                                        value={r.valueType || "text"}
                                        onChange={(e) => {
                                          const next = {
                                            ...cond,
                                            rules: [...rules],
                                          };
                                          next.rules[idx] = {
                                            ...rules[idx],
                                            valueType: e.target.value,
                                          };
                                          setDraftConditions((prev) => ({
                                            ...prev,
                                            [c.id]: next,
                                          }));
                                        }}
                                      >
                                        <option value="text">текст</option>
                                        <option value="number">число</option>
                                        <option value="date">дата</option>
                                        <option value="boolean">
                                          логическое
                                        </option>
                                      </select>

                                      {/* Value input based on type */}
                                      {r.valueType === "boolean" ? (
                                        <select
                                          className="border rounded px-2 py-1 text-sm bg-background"
                                          value={String(r.value ?? "")}
                                          onChange={(e) => {
                                            const next = {
                                              ...cond,
                                              rules: [...rules],
                                            };
                                            next.rules[idx] = {
                                              ...rules[idx],
                                              value: e.target.value === "true",
                                            };
                                            setDraftConditions((prev) => ({
                                              ...prev,
                                              [c.id]: next,
                                            }));
                                          }}
                                        >
                                          <option value="true">истина</option>
                                          <option value="false">ложь</option>
                                        </select>
                                      ) : r.valueType === "date" ? (
                                        <Input
                                          type="date"
                                          value={r.value ?? ""}
                                          onChange={(e) => {
                                            const next = {
                                              ...cond,
                                              rules: [...rules],
                                            };
                                            next.rules[idx] = {
                                              ...rules[idx],
                                              value: e.target.value,
                                            };
                                            setDraftConditions((prev) => ({
                                              ...prev,
                                              [c.id]: next,
                                            }));
                                          }}
                                        />
                                      ) : r.valueType === "number" ? (
                                        <Input
                                          type="number"
                                          value={r.value ?? ""}
                                          onChange={(e) => {
                                            const next = {
                                              ...cond,
                                              rules: [...rules],
                                            };
                                            next.rules[idx] = {
                                              ...rules[idx],
                                              value: e.target.value,
                                            };
                                            setDraftConditions((prev) => ({
                                              ...prev,
                                              [c.id]: next,
                                            }));
                                          }}
                                        />
                                      ) : (
                                        <Input
                                          placeholder="Значение"
                                          value={r.value ?? ""}
                                          onChange={(e) => {
                                            const next = {
                                              ...cond,
                                              rules: [...rules],
                                            };
                                            next.rules[idx] = {
                                              ...rules[idx],
                                              value: e.target.value,
                                            };
                                            setDraftConditions((prev) => ({
                                              ...prev,
                                              [c.id]: next,
                                            }));
                                          }}
                                        />
                                      )}
                                      <div className="col-span-4 flex justify-end">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const nextRules = rules.filter(
                                              (_, i) => i !== idx,
                                            );
                                            const next = {
                                              ...cond,
                                              rules: nextRules,
                                            };
                                            setDraftConditions((prev) => ({
                                              ...prev,
                                              [c.id]: next,
                                            }));
                                          }}
                                        >
                                          Удалить
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      const next = {
                                        ...cond,
                                        rules: [
                                          ...rules,
                                          {
                                            type: "requisite",
                                            field: "",
                                            op: "eq",
                                            value: "",
                                            valueType: "text",
                                          },
                                        ],
                                      };
                                      setDraftConditions((prev) => ({
                                        ...prev,
                                        [c.id]: next,
                                      }));
                                    }}
                                  >
                                    + Добавить условие
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="ml-2"
                                    onClick={() => {
                                      const condToSave =
                                        draftConditions[c.id] ?? cond;
                                      const labelToSave =
                                        draftLabels[c.id] ?? c.label;
                                      updateConnection.mutate({
                                        id: c.id,
                                        condition: JSON.stringify(condToSave),
                                        ...(labelToSave !== undefined
                                          ? { label: labelToSave }
                                          : {}),
                                      });
                                      setCollapsedBranches((prev) => ({
                                        ...prev,
                                        [c.id]: true,
                                      }));
                                    }}
                                  >
                                    Сохранить
                                  </Button>
                                </div>
                              </details>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Связи (вход → логика → выход) — редактор трёх блоков */}
              {selectedElement.elementType === "DECISION" &&
                decisionTriplesDraft[selectedElement.id] !== undefined && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">
                      Связи (вход → логика → выход)
                    </h4>
                    <div className="text-[11px] text-muted-foreground mb-2">
                      Для каждой связи укажите источник (входящая стрелка),
                      настройте условия перехода и выберите цель (выходящая
                      стрелка). Если нужной стрелки ещё нет, она будет создана
                      автоматически.
                    </div>

                    {(decisionTriplesDraft[selectedElement.id] ?? []).map(
                      (t: any, idx: number) => {
                        const processes = elements.filter(
                          (e) => e.elementType === "PROCESS",
                        );
                        const rules: any[] = Array.isArray(t?.logic?.rules)
                          ? t.logic.rules
                          : [];
                        const incomingConns = t?.incomingProcessId
                          ? connections.filter(
                              (c) =>
                                c.targetId === selectedElement.id &&
                                c.sourceId === t.incomingProcessId,
                            )
                          : [];
                        const outgoingConns = t?.outgoingProcessId
                          ? connections.filter(
                              (c) =>
                                c.sourceId === selectedElement.id &&
                                c.targetId === t.outgoingProcessId,
                            )
                          : [];

                        const updateTriple = (patch: any) => {
                          setDecisionTriplesDraft((prev) => {
                            const arr = [...(prev[selectedElement.id] ?? [])];
                            const cur = { ...(arr[idx] ?? {}) };
                            arr[idx] = { ...cur, ...patch };
                            return { ...prev, [selectedElement.id]: arr };
                          });
                        };

                        const updateLogic = (patch: any) => {
                          setDecisionTriplesDraft((prev) => {
                            const arr = [...(prev[selectedElement.id] ?? [])];
                            const cur = { ...(arr[idx] ?? {}) };
                            const logic = { ...(cur.logic ?? {}), ...patch };
                            arr[idx] = { ...cur, logic };
                            return { ...prev, [selectedElement.id]: arr };
                          });
                        };

                        const isCollapsed =
                          collapsedTriples[selectedElement.id]?.[idx] === true;
                        const incomingName = elements.find(
                          (e) => e.id === t?.incomingProcessId,
                        )?.name;
                        const outgoingName = elements.find(
                          (e) => e.id === t?.outgoingProcessId,
                        )?.name;
                        const firstRule =
                          (Array.isArray(t?.logic?.rules) &&
                            t.logic.rules[0]) ||
                          null;
                        const logicHint = firstRule
                          ? firstRule.type === "railway"
                            ? "Железная дорога"
                            : firstRule.field || "логика"
                          : "логика";

                        if (isCollapsed) {
                          return (
                            <div
                              key={idx}
                              className="border rounded p-3 bg-background/60 flex items-center justify-between mb-3"
                            >
                              <div className="text-sm truncate">
                                <span className="font-medium">
                                  {incomingName || "—"}
                                </span>
                                <span className="mx-2">→</span>
                                <span className="text-muted-foreground">
                                  {logicHint}
                                </span>
                                <span className="mx-2">→</span>
                                <span className="font-medium">
                                  {outgoingName || "—"}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setCollapsedTriples((prev) => ({
                                      ...prev,
                                      [selectedElement.id]: {
                                        ...(prev[selectedElement.id] || {}),
                                        [idx]: false,
                                      },
                                    }));
                                  }}
                                >
                                  Редактировать
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setDecisionTriplesDraft((prev) => {
                                      const arr = [
                                        ...(prev[selectedElement.id] ?? []),
                                      ];
                                      arr.splice(idx, 1);
                                      return {
                                        ...prev,
                                        [selectedElement.id]: arr,
                                      };
                                    });
                                  }}
                                >
                                  Удалить
                                </Button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={idx}
                            className="border rounded p-3 bg-background/60 grid grid-cols-12 gap-3 mb-3"
                          >
                            {" "}
                            {/* Левая колонка — входящая стрелка */}
                            <div className="col-span-3 pr-3">
                              <div className="font-medium text-xs mb-1">
                                Входящая стрелка
                              </div>
                              <select
                                className="border rounded px-2 py-1 text-sm bg-background w-full mb-2"
                                value={t?.incomingProcessId ?? ""}
                                onChange={(e) =>
                                  updateTriple({
                                    incomingProcessId:
                                      e.target.value || undefined,
                                    incomingConnectionId: undefined,
                                  })
                                }
                              >
                                <option value="">Процесс-источник…</option>
                                {processes.map((p: any) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                              <select
                                className="border rounded px-2 py-1 text-sm bg-background w-full"
                                value={t?.incomingConnectionId ?? ""}
                                onChange={(e) =>
                                  updateTriple({
                                    incomingConnectionId:
                                      e.target.value || undefined,
                                  })
                                }
                                disabled={(incomingConns ?? []).length === 0}
                              >
                                <option value="">
                                  {incomingConns.length
                                    ? "Стрелка (если несколько)"
                                    : "Стрелка будет создана"}
                                </option>
                                {incomingConns.map((c: any) => (
                                  <option key={c.id} value={c.id}>
                                    {elements.find((e) => e.id === c.sourceId)
                                      ?.name ?? "Процесс"}{" "}
                                    → Решение
                                  </option>
                                ))}
                              </select>
                              <div className="mt-2 flex items-center gap-3">
                                <label className="text-[12px] text-muted-foreground">
                                  Цвет линии
                                </label>
                                <input
                                  type="color"
                                  value={t?.incomingColor || "#d1d5db"}
                                  onChange={(e) =>
                                    updateTriple({
                                      incomingColor: e.target.value,
                                    })
                                  }
                                  title="Цвет входящей стрелки"
                                />
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {branchPalette.slice(0, 10).map((c) => (
                                    <button
                                      key={c}
                                      type="button"
                                      className="w-5 h-5 rounded-full border"
                                      style={{ backgroundColor: c }}
                                      title={c}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        updateTriple({ incomingColor: c });
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-2">
                                Подпись на стрелке (необязательно)
                              </div>
                              <Input
                                placeholder="Напр. Из процесса А"
                                value={t?.incomingLabel ?? ""}
                                onChange={(e) =>
                                  updateTriple({
                                    incomingLabel: e.target.value,
                                  })
                                }
                              />
                            </div>
                            {/* Средняя колонка — логика обработки */}
                            <div className="col-span-6 pr-3">
                              <div className="font-medium text-xs mb-1">
                                Логика обработки
                              </div>

                              <div className="grid grid-cols-3 gap-2 items-center mb-2">
                                <div className="text-[12px] text-muted-foreground col-span-1">
                                  Роль для входа
                                </div>
                                <select
                                  className="border rounded px-2 py-1 text-sm bg-background col-span-2"
                                  value={t?.logic?.roleType ?? ""}
                                  onChange={(e) =>
                                    updateLogic({
                                      roleType: e.target.value || undefined,
                                    })
                                  }
                                >
                                  <option value="">Не задано</option>
                                  {(roleTypes as any[]).map((rt: any) => (
                                    <option
                                      key={rt.id ?? rt}
                                      value={rt.key ?? rt}
                                    >
                                      {rt.name ?? rt}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Правила как в ветвлениях */}
                              <div className="space-y-2">
                                {(rules ?? []).map((r: any, rIdx: number) => (
                                  <div
                                    key={rIdx}
                                    className="grid grid-cols-6 gap-2 items-center"
                                  >
                                    {" "}
                                    <select
                                      className="border rounded px-2 py-1 text-sm bg-background"
                                      value={r.type || "requisite"}
                                      onChange={(e) => {
                                        const next = [...rules];
                                        next[rIdx] = {
                                          ...next[rIdx],
                                          type: e.target.value,
                                          ...(e.target.value === "railway"
                                            ? {
                                                field: "railway",
                                                valueType: "text",
                                              }
                                            : {}),
                                        };
                                        updateLogic({ rules: next });
                                      }}
                                    >
                                      <option value="requisite">
                                        Реквизит
                                      </option>
                                      <option value="checklist">
                                        Чек-лист
                                      </option>
                                      <option value="railway">
                                        Железная дорога
                                      </option>
                                      <option value="text">Текст</option>
                                      <option value="number">Число</option>
                                      <option value="date">Дата</option>
                                      <option value="boolean">
                                        Логическое
                                      </option>
                                    </select>
                                    {/* Поле */}
                                    {r.type === "requisite" ||
                                    r.type === "checklist" ? (
                                      <select
                                        className="border rounded px-2 py-1 text-sm bg-background col-span-2"
                                        value={r.field || ""}
                                        onChange={(e) => {
                                          const next = [...rules];
                                          next[rIdx] = {
                                            ...next[rIdx],
                                            field: e.target.value,
                                          };
                                          updateLogic({ rules: next });
                                        }}
                                      >
                                        {(() => {
                                          const isReq = r.type === "requisite";
                                          const list = (
                                            isReq
                                              ? prevRequisites
                                              : prevChecklists
                                          ) as any[];
                                          const groups: Record<string, any[]> =
                                            {};
                                          for (const it of list) {
                                            const key = `${it.elementName}`;
                                            if (!groups[key]) groups[key] = [];
                                            groups[key]!.push(it);
                                          }
                                          return Object.entries(groups).map(
                                            ([g, items]) => (
                                              <optgroup key={g} label={g}>
                                                {items.map((it: any) => {
                                                  const name = isReq
                                                    ? it.requisite.name
                                                    : it.checklist.name;
                                                  const value = `${it.elementName}.${name}`;
                                                  return (
                                                    <option
                                                      key={value}
                                                      value={value}
                                                    >
                                                      {name} — {it.elementName}
                                                    </option>
                                                  );
                                                })}
                                              </optgroup>
                                            ),
                                          );
                                        })()}
                                      </select>
                                    ) : r.type === "railway" ? (
                                      <Input
                                        className="col-span-2"
                                        value="Железная дорога"
                                        disabled
                                      />
                                    ) : (
                                      <Input
                                        className="col-span-2"
                                        placeholder="Имя/поле"
                                        value={r.field || ""}
                                        onChange={(e) => {
                                          const next = [...rules];
                                          next[rIdx] = {
                                            ...next[rIdx],
                                            field: e.target.value,
                                          };
                                          updateLogic({ rules: next });
                                        }}
                                      />
                                    )}{" "}
                                    {/* Оператор */}
                                    <select
                                      className="border rounded px-2 py-1 text-sm bg-background"
                                      value={r.op || "eq"}
                                      onChange={(e) => {
                                        const next = [...rules];
                                        next[rIdx] = {
                                          ...next[rIdx],
                                          op: e.target.value,
                                        };
                                        updateLogic({ rules: next });
                                      }}
                                    >
                                      <option value="eq">равно</option>
                                      <option value="ne">не равно</option>
                                      {(r.valueType ?? "text") === "text" && (
                                        <option value="contains">
                                          содержит
                                        </option>
                                      )}
                                      {(r.valueType === "number" ||
                                        r.valueType === "date") && (
                                        <>
                                          <option value="gt">{">"}</option>
                                          <option value="lt">{"<"}</option>
                                        </>
                                      )}
                                      <option value="exists">заполнено</option>
                                    </select>
                                    {/* Тип значения */}
                                    <select
                                      className="border rounded px-2 py-1 text-sm bg-background"
                                      value={r.valueType || "text"}
                                      onChange={(e) => {
                                        const next = [...rules];
                                        next[rIdx] = {
                                          ...next[rIdx],
                                          valueType: e.target.value,
                                        };
                                        updateLogic({ rules: next });
                                      }}
                                    >
                                      <option value="text">текст</option>
                                      <option value="number">число</option>
                                      <option value="date">дата</option>
                                      <option value="boolean">
                                        логическое
                                      </option>
                                    </select>
                                    {/* Значение */}
                                    {r.type === "railway" ? (
                                      <select
                                        className="border rounded px-2 py-1 text-sm bg-background col-span-6"
                                        value={r.value ?? ""}
                                        onChange={(e) => {
                                          const next = [...rules];
                                          next[rIdx] = {
                                            ...next[rIdx],
                                            value: e.target.value,
                                          };
                                          updateLogic({ rules: next });
                                        }}
                                      >
                                        <option value="">Выберите ЖД…</option>
                                        <option value="Калининградская железная дорога">
                                          Калининградская железная дорога
                                        </option>
                                        <option value="Октябрьская железная дорога">
                                          Октябрьская железная дорога
                                        </option>
                                        <option value="Московская железная дорога">
                                          Московская железная дорога
                                        </option>
                                        <option value="Северная железная дорога">
                                          Северная железная дорога
                                        </option>
                                        <option value="Горьковская железная дорога">
                                          Горьковская железная дорога
                                        </option>
                                        <option value="Северо-Кавказская железная дорога">
                                          Северо-Кавказская железная дорога
                                        </option>
                                        <option value="Юго-Восточная железная дорога">
                                          Юго-Восточная железная дорога
                                        </option>
                                        <option value="Приволжская железная дорога">
                                          Приволжская железная дорога
                                        </option>
                                        <option value="Куйбышевская железная дорога">
                                          Куйбышевская железная дорога
                                        </option>
                                        <option value="Свердловская железная дорога">
                                          Свердловская железная дорога
                                        </option>
                                        <option value="Южно-Уральская железная дорога">
                                          Южно-Уральская железная дорога
                                        </option>
                                        <option value="Западно-Сибирская железная дорога">
                                          Западно-Сибирская железная дорога
                                        </option>
                                        <option value="Красноярская железная дорога">
                                          Красноярская железная дорога
                                        </option>
                                        <option value="Восточно-Сибирская железная дорога">
                                          Восточно-Сибирская железная дорога
                                        </option>
                                        <option value="Забайкальская железная дорога">
                                          Забайкальская железная дорога
                                        </option>
                                        <option value="Дальневосточная железная дорога">
                                          Дальневосточная железная дорога
                                        </option>
                                      </select>
                                    ) : r.valueType === "boolean" ? (
                                      <select
                                        className="border rounded px-2 py-1 text-sm bg-background col-span-6"
                                        value={String(r.value ?? "")}
                                        onChange={(e) => {
                                          const next = [...rules];
                                          next[rIdx] = {
                                            ...next[rIdx],
                                            value: e.target.value === "true",
                                          };
                                          updateLogic({ rules: next });
                                        }}
                                      >
                                        <option value="true">истина</option>
                                        <option value="false">ложь</option>
                                      </select>
                                    ) : r.valueType === "date" ? (
                                      <Input
                                        className="col-span-6"
                                        type="date"
                                        value={r.value ?? ""}
                                        onChange={(e) => {
                                          const next = [...rules];
                                          next[rIdx] = {
                                            ...next[rIdx],
                                            value: e.target.value,
                                          };
                                          updateLogic({ rules: next });
                                        }}
                                      />
                                    ) : r.valueType === "number" ? (
                                      <Input
                                        className="col-span-6"
                                        type="number"
                                        value={r.value ?? ""}
                                        onChange={(e) => {
                                          const next = [...rules];
                                          next[rIdx] = {
                                            ...next[rIdx],
                                            value: e.target.value,
                                          };
                                          updateLogic({ rules: next });
                                        }}
                                      />
                                    ) : (
                                      <Input
                                        className="col-span-6"
                                        placeholder="Значение"
                                        value={r.value ?? ""}
                                        onChange={(e) => {
                                          const next = [...rules];
                                          next[rIdx] = {
                                            ...next[rIdx],
                                            value: e.target.value,
                                          };
                                          updateLogic({ rules: next });
                                        }}
                                      />
                                    )}{" "}
                                    <div className="col-span-6 flex justify-end">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const next = [...rules].filter(
                                            (_, i) => i !== rIdx,
                                          );
                                          updateLogic({ rules: next });
                                        }}
                                      >
                                        Удалить
                                      </Button>
                                    </div>
                                  </div>
                                ))}

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    updateLogic({
                                      rules: [
                                        ...rules,
                                        {
                                          type: "requisite",
                                          field: "",
                                          op: "eq",
                                          value: "",
                                          valueType: "text",
                                        },
                                      ],
                                    })
                                  }
                                >
                                  + Добавить условие
                                </Button>
                              </div>
                            </div>
                            {/* Правая колонка — выходящая стрелка */}
                            <div className="col-span-3 pl-3 border-l">
                              <div className="font-medium text-xs mb-1">
                                Выходящая стрелка
                              </div>
                              <select
                                className="border rounded px-2 py-1 text-sm bg-background w-full mb-2"
                                value={t?.outgoingProcessId ?? ""}
                                onChange={(e) =>
                                  updateTriple({
                                    outgoingProcessId:
                                      e.target.value || undefined,
                                    outgoingConnectionId: undefined,
                                  })
                                }
                              >
                                <option value="">Процесс-назначение…</option>
                                {processes.map((p: any) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="mb-2"
                                onClick={async () => {
                                  if (!schemaId) return;
                                  const dec = selectedElement;
                                  const offsetX = (dec.width || 120) + 220;
                                  const nx = (dec.positionX || 0) + offsetX;
                                  const ny =
                                    (dec.positionY || 0) + ((idx * 100) % 220);
                                  try {
                                    const newProc =
                                      await apiClient.createProcessSchemaElement(
                                        {
                                          schemaId,
                                          elementType: "PROCESS",
                                          name: `Процесс ${elements.length + 1}`,
                                          positionX: nx,
                                          positionY: ny,
                                        },
                                      );
                                    setElements((prev) => [...prev, newProc]);
                                    updateTriple({
                                      outgoingProcessId: newProc.id,
                                    });
                                  } catch {}
                                }}
                              >
                                Создать процесс
                              </Button>
                              <select
                                className="border rounded px-2 py-1 text-sm bg-background w-full"
                                value={t?.outgoingConnectionId ?? ""}
                                onChange={(e) =>
                                  updateTriple({
                                    outgoingConnectionId:
                                      e.target.value || undefined,
                                  })
                                }
                                disabled={(outgoingConns ?? []).length === 0}
                              >
                                <option value="">
                                  {outgoingConns.length
                                    ? "Стрелка (если несколько)"
                                    : "Стрелка будет создана"}
                                </option>
                                {outgoingConns.map((c: any) => (
                                  <option key={c.id} value={c.id}>
                                    Решение →{" "}
                                    {elements.find((e) => e.id === c.targetId)
                                      ?.name ?? "Процесс"}
                                  </option>
                                ))}
                              </select>
                              <div className="mt-2 flex items-center gap-3">
                                <label className="text-[12px] text-muted-foreground">
                                  Цвет линии
                                </label>
                                <input
                                  type="color"
                                  value={t?.outgoingColor || "#d1d5db"}
                                  onChange={(e) =>
                                    updateTriple({
                                      outgoingColor: e.target.value,
                                    })
                                  }
                                  title="Цвет выходящей стрелки"
                                />
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {branchPalette.slice(0, 10).map((c) => (
                                    <button
                                      key={c}
                                      type="button"
                                      className="w-5 h-5 rounded-full border"
                                      style={{ backgroundColor: c }}
                                      title={c}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        updateTriple({ outgoingColor: c });
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <input
                                  type="checkbox"
                                  checked={!!t?.outgoingLabelRotation}
                                  onChange={(e) =>
                                    updateTriple({
                                      outgoingLabelRotation: e.target.checked,
                                    })
                                  }
                                />
                                <span className="text-[12px] text-muted-foreground">
                                  Повернуть подпись 90°
                                </span>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-2">
                                Подпись на стрелке (необязательно)
                              </div>{" "}
                              <Input
                                placeholder="Напр. Согласовано"
                                value={t?.outgoingLabel ?? ""}
                                onChange={(e) =>
                                  updateTriple({
                                    outgoingLabel: e.target.value,
                                  })
                                }
                              />
                              <div className="flex flex-col items-start gap-2 mt-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      if (!schemaId) return;
                                      const decId = selectedElement.id;
                                      const tcur = t;
                                      // incoming
                                      if (tcur?.incomingProcessId) {
                                        let inConn = connections.find(
                                          (c) =>
                                            (tcur.incomingConnectionId
                                              ? c.id ===
                                                tcur.incomingConnectionId
                                              : true) &&
                                            c.sourceId ===
                                              tcur.incomingProcessId &&
                                            c.targetId === decId,
                                        );
                                        const inCond = JSON.stringify({
                                          color:
                                            tcur?.incomingColor || "#d1d5db",
                                        });
                                        if (inConn) {
                                          await apiClient.updateProcessConnection(
                                            {
                                              id: inConn.id,
                                              ...(tcur?.incomingLabel
                                                ? { label: tcur.incomingLabel }
                                                : {}),
                                              condition: inCond,
                                            },
                                          );
                                        } else {
                                          const created =
                                            await apiClient.createProcessConnection(
                                              {
                                                schemaId,
                                                sourceId:
                                                  tcur.incomingProcessId,
                                                targetId: decId,
                                                connectionType: "sequence",
                                                ...(tcur?.incomingLabel
                                                  ? {
                                                      label: tcur.incomingLabel,
                                                    }
                                                  : {}),
                                                condition: inCond,
                                              },
                                            );
                                          setConnections((prev) => [
                                            ...prev,
                                            created,
                                          ]);
                                        }
                                      }
                                      // outgoing
                                      if (tcur?.outgoingProcessId) {
                                        let outConn = connections.find(
                                          (c) =>
                                            (tcur.outgoingConnectionId
                                              ? c.id ===
                                                tcur.outgoingConnectionId
                                              : true) &&
                                            c.sourceId === decId &&
                                            c.targetId ===
                                              tcur.outgoingProcessId,
                                        );
                                        const outCond = JSON.stringify({
                                          color:
                                            tcur?.outgoingColor || "#d1d5db",
                                          rules: tcur?.logic?.rules || [],
                                          ...(tcur?.outgoingLabelRotation
                                            ? { labelRotation: 90 }
                                            : {}),
                                        });
                                        if (outConn) {
                                          await apiClient.updateProcessConnection(
                                            {
                                              id: outConn.id,
                                              ...(tcur?.outgoingLabel
                                                ? { label: tcur.outgoingLabel }
                                                : {}),
                                              condition: outCond,
                                            },
                                          );
                                        } else {
                                          const created =
                                            await apiClient.createProcessConnection(
                                              {
                                                schemaId,
                                                sourceId: decId,
                                                targetId:
                                                  tcur.outgoingProcessId,
                                                connectionType: "sequence",
                                                ...(tcur?.outgoingLabel
                                                  ? {
                                                      label: tcur.outgoingLabel,
                                                    }
                                                  : {}),
                                                condition: outCond,
                                              },
                                            );
                                          setConnections((prev) => [
                                            ...prev,
                                            created,
                                          ]);
                                        }
                                      }
                                      // Persist triples
                                      const el = elements.find(
                                        (e) => e.id === decId,
                                      );
                                      if (el) {
                                        const props = el.properties
                                          ? (JSON.parse(
                                              el.properties as string,
                                            ) as any)
                                          : {};
                                        const triples = (decisionTriplesDraft[
                                          decId
                                        ] ?? []) as any[];
                                        props.decisionTriples = triples;
                                        // if at least one triple configured fully, mark as configured
                                        const hasAny = (triples || []).some(
                                          (x: any) =>
                                            x?.incomingProcessId &&
                                            x?.outgoingProcessId,
                                        );
                                        props.needsConfiguration = !hasAny;
                                        setElements((prev) =>
                                          prev.map((p) =>
                                            p.id === el.id
                                              ? {
                                                  ...p,
                                                  properties:
                                                    JSON.stringify(props),
                                                }
                                              : p,
                                          ),
                                        );
                                        await apiClient.updateProcessSchemaElement(
                                          { id: el.id, properties: props },
                                        );
                                      }
                                      // Collapse
                                      setCollapsedTriples((prev) => ({
                                        ...prev,
                                        [selectedElement.id]: {
                                          ...(prev[selectedElement.id] || {}),
                                          [idx]: true,
                                        },
                                      }));
                                      notify({ title: "Связь сохранена" });
                                    } catch {
                                      notify({
                                        title: "Не удалось сохранить связь",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  Сохранить связь
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setDecisionTriplesDraft((prev) => {
                                      const arr = [
                                        ...(prev[selectedElement.id] ?? []),
                                      ];
                                      arr.splice(idx, 1);
                                      return {
                                        ...prev,
                                        [selectedElement.id]: arr,
                                      };
                                    });
                                  }}
                                >
                                  Удалить связь
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setDecisionTriplesDraft((prev) => ({
                            ...prev,
                            [selectedElement.id]: [
                              ...(prev[selectedElement.id] ?? []),
                              {
                                incomingProcessId: "",
                                outgoingProcessId: "",
                                logic: { rules: [] },
                              },
                            ],
                          }))
                        }
                      >
                        Создать новую пару связи
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            if (!schemaId) return;
                            const decId = selectedElement.id;
                            const triples = (decisionTriplesDraft[decId] ??
                              []) as any[];

                            // Apply connections for each triple
                            for (const t of triples) {
                              // incoming
                              if (t?.incomingProcessId) {
                                let inConn = connections.find(
                                  (c) =>
                                    (t.incomingConnectionId
                                      ? c.id === t.incomingConnectionId
                                      : true) &&
                                    c.sourceId === t.incomingProcessId &&
                                    c.targetId === decId,
                                );
                                const inCond = JSON.stringify({
                                  color: t?.incomingColor || "#d1d5db",
                                });
                                if (inConn) {
                                  await apiClient.updateProcessConnection({
                                    id: inConn.id,
                                    ...(t?.incomingLabel
                                      ? { label: t.incomingLabel }
                                      : {}),
                                    condition: inCond,
                                  });
                                } else {
                                  const created =
                                    await apiClient.createProcessConnection({
                                      schemaId,
                                      sourceId: t.incomingProcessId,
                                      targetId: decId,
                                      connectionType: "sequence",
                                      ...(t?.incomingLabel
                                        ? { label: t.incomingLabel }
                                        : {}),
                                      condition: inCond,
                                    });
                                  setConnections((prev) => [...prev, created]);
                                }
                              }

                              // outgoing
                              if (t?.outgoingProcessId) {
                                let outConn = connections.find(
                                  (c) =>
                                    (t.outgoingConnectionId
                                      ? c.id === t.outgoingConnectionId
                                      : true) &&
                                    c.sourceId === decId &&
                                    c.targetId === t.outgoingProcessId,
                                );
                                const outCond = JSON.stringify({
                                  color: t?.outgoingColor || "#d1d5db",
                                  rules: t?.logic?.rules || [],
                                  ...(t?.outgoingLabelRotation
                                    ? { labelRotation: 90 }
                                    : {}),
                                });
                                if (outConn) {
                                  await apiClient.updateProcessConnection({
                                    id: outConn.id,
                                    ...(t?.outgoingLabel
                                      ? { label: t.outgoingLabel }
                                      : {}),
                                    condition: outCond,
                                  });
                                } else {
                                  const created =
                                    await apiClient.createProcessConnection({
                                      schemaId,
                                      sourceId: decId,
                                      targetId: t.outgoingProcessId,
                                      connectionType: "sequence",
                                      ...(t?.outgoingLabel
                                        ? { label: t.outgoingLabel }
                                        : {}),
                                      condition: outCond,
                                    });
                                  setConnections((prev) => [...prev, created]);
                                }
                              }
                            }

                            // Persist triples in element
                            const el = elements.find((e) => e.id === decId);
                            if (!el) return;
                            const props = el.properties
                              ? (JSON.parse(el.properties as string) as any)
                              : {};
                            props.decisionTriples = triples;
                            setElements((prev) =>
                              prev.map((p) =>
                                p.id === el.id
                                  ? { ...p, properties: JSON.stringify(props) }
                                  : p,
                              ),
                            );
                            await apiClient.updateProcessSchemaElement({
                              id: el.id,
                              properties: props,
                            });
                            await queryClient.invalidateQueries([
                              "processSchema",
                              schemaId,
                            ]);
                            // Collapse all saved triples
                            setCollapsedTriples((prev) => ({
                              ...prev,
                              [decId]: Object.fromEntries(
                                (triples || []).map((_, i) => [i, true]),
                              ),
                            }));
                            notify({ title: "Связи сохранены" });
                          } catch {
                            notify({
                              title: "Не удалось применить связи",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Сохранить связи
                      </Button>
                    </div>

                    <div className="text-[11px] text-muted-foreground mt-1">
                      Недостающие стрелки будут созданы автоматически на
                      следующем шаге разработки.
                    </div>
                  </div>
                )}

              {selectedElement.elementType === "APPROVAL" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={(() => {
                        try {
                          const props = selectedElement?.properties
                            ? (JSON.parse(
                                selectedElement.properties as string,
                              ) as any)
                            : {};
                          return !!props.blockForwardWhileUnderReview;
                        } catch {
                          return false;
                        }
                      })()}
                      onChange={(e) => {
                        try {
                          const props = selectedElement?.properties
                            ? (JSON.parse(
                                selectedElement.properties as string,
                              ) as any)
                            : {};
                          props.blockForwardWhileUnderReview = e.target.checked;
                          const updated = {
                            ...selectedElement,
                            properties: JSON.stringify(props),
                          };
                          setSelectedElement(updated);
                          setElements((prev) =>
                            prev.map((el) =>
                              el.id === selectedElement.id ? updated : el,
                            ),
                          );
                          updateElement.mutate({
                            id: selectedElement.id,
                            properties: props,
                          });
                        } catch {}
                      }}
                    />
                    <div className="text-sm">
                      Запретить направлять далее документ по цепочка, пока
                      документ находится на рассмотрении
                    </div>
                  </div>

                  <div>
                    <ApprovalStagesEditor
                      fieldId="approvalConfig"
                      value={(() => {
                        try {
                          const props = selectedElement?.properties
                            ? (JSON.parse(
                                selectedElement.properties as string,
                              ) as any)
                            : {};
                          return props.approvalConfig || { stages: [] };
                        } catch {
                          return { stages: [] };
                        }
                      })()}
                      onFieldChange={(_fieldId, value) => {
                        try {
                          const props = selectedElement?.properties
                            ? (JSON.parse(
                                selectedElement.properties as string,
                              ) as any)
                            : {};
                          props.approvalConfig = value;
                          const updated = {
                            ...selectedElement,
                            properties: JSON.stringify(props),
                          };
                          setSelectedElement(updated);
                          setElements((prev) =>
                            prev.map((el) =>
                              el.id === selectedElement.id ? updated : el,
                            ),
                          );
                          updateElement.mutate({
                            id: selectedElement.id,
                            properties: props,
                          });
                        } catch {}
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedElement.elementType === "PROCESS" && (
                <div className="space-y-4">
                  {/* Process Preview Button */}
                  <ProcessPreviewDialog elementId={selectedElement.id} />
                  {/* Quick status selector removed */}{" "}
                  {/*
                  <div className="space-y-2">
                    <Label>Статус заявки (маршрут согласования)</Label>
                    <select
                      className="border rounded px-2 py-2 text-sm bg-background w-full"
                      value={(() => {
                        try {
                          const props = selectedElement?.properties
                            ? (JSON.parse(
                                selectedElement.properties as string,
                              ) as any)
                            : {};
                          return props?.approvalStatus ?? "";
                        } catch {
                          return "";
                        }
                      })()}
                      onChange={(e) => {
                        try {
                          const props = selectedElement?.properties
                            ? (JSON.parse(
                                selectedElement.properties as string,
                              ) as any)
                            : {};
                          const next = {
                            ...props,
                            approvalStatus: e.target.value,
                          };
                          const updated = {
                            ...selectedElement,
                            properties: JSON.stringify(next),
                          };
                          setSelectedElement(updated);
                          setElements((prev) =>
                            prev.map((el) =>
                              el.id === selectedElement.id ? updated : el,
                            ),
                          );
                          updateElement.mutate({
                            id: selectedElement.id,
                            properties: next,
                          });
                        } catch {}
                      }}
                    >
                      <option value="">Статуса нет</option>
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <div className="text-[11px] text-muted-foreground">
                      Можно выбрать только один статус для процесса
                    </div>
                  */}
                  <Tabs defaultValue="requisites" className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="requisites">
                        <List className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="checklists">
                        <FileIcon className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="printform">
                        <FileText className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="roles">
                        <UsersIcon className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="transitions">
                        <GitBranch className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="notifications">
                        <Bell className="w-4 h-4" />
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="requisites" className="mt-4">
                      <ProcessRequisitesPanel elementId={selectedElement.id} />
                    </TabsContent>

                    <TabsContent value="checklists" className="mt-4">
                      <ProcessChecklistsPanel
                        elementId={selectedElement.id}
                        element={selectedElement}
                      />
                    </TabsContent>

                    <TabsContent value="printform" className="mt-4">
                      <ProcessPrintFormPanel element={selectedElement} />
                    </TabsContent>

                    <TabsContent value="roles" className="mt-4">
                      <ProcessRolesPanel elementId={selectedElement.id} />
                    </TabsContent>

                    <TabsContent value="transitions" className="mt-4">
                      <ProcessTransitionsPanel
                        elementId={selectedElement.id}
                        schemaId={schema.id}
                      />
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-4">
                      <ProcessNotificationsPanel
                        elementId={selectedElement.id}
                      />
                    </TabsContent>
                  </Tabs>
                  {/* Process Components Overview moved to bottom */}
                  <ProcessComponentsOverview elementId={selectedElement.id} />
                  {/* Linked processes preview (1 hop) */}
                  <LinkedProcesses
                    schema={schema}
                    currentElement={selectedElement}
                    onHoverPath={(ids) => setHighlightIds(ids)}
                    onSelectElement={(id) => {
                      const target = elements.find((e) => e.id === id);
                      if (target) {
                        setSelectedElement(target);
                        // Optional: briefly highlight the path between current and selected
                        setHighlightIds([selectedElement.id, id]);
                        setTimeout(() => setHighlightIds([]), 400);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Application Form Screen
function ApplicationFormScreen() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { data: application } = useQuery(
    ["serviceApplication", applicationId],
    () => apiClient.getServiceApplication({ id: applicationId! }),
    { enabled: !!applicationId },
  );
  const auth = useAuth();
  const { data: schema } = useQuery(
    ["processSchema", application?.schemaId],
    () => apiClient.getProcessSchema({ id: application!.schemaId }),
    { enabled: !!application?.schemaId },
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  // Helpers to read element.props safely
  const parseProps = React.useCallback((propsStr?: string | null) => {
    if (!propsStr) return {} as any;
    try {
      return JSON.parse(propsStr) as any;
    } catch {
      return {} as any;
    }
  }, []);

  // Get ordered process steps (START -> PROCESS elements -> END)
  const processSteps = React.useMemo(() => {
    if (!schema?.elements) return [];
    // Show only actual user-facing steps: PROCESS elements
    return schema.elements.filter((el) => el.elementType === "PROCESS");
  }, [schema]);

  const updateApplicationMutation = useMutation(
    apiClient.updateServiceApplication,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["serviceApplication", applicationId]);
        toast({
          title: "Данные сохранены",
          description: "Форма успешно сохранена",
        });
      },
    },
  );

  const hasAssigned = React.useMemo(() => {
    const step = processSteps[currentStepIndex];
    if (!step) return false;
    return Array.isArray((step as any).transitions)
      ? (step as any).transitions.some((t: any) => t?.condition === "assigned")
      : false;
  }, [processSteps, currentStepIndex]);

  const [assignQuery, setAssignQuery] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [resAssignQuery, setResAssignQuery] = useState("");
  const [selectedResolutionAssignee, setSelectedResolutionAssignee] =
    useState<string>("");

  // Reject mode state for "Согласовано/Отклонено"
  const [rejectMode, setRejectMode] = useState(false);
  const [rejected, setRejected] = useState<
    Record<string, { rejected: boolean; comment?: string }>
  >({});
  const hasAnyRejected = React.useMemo(
    () => Object.values(rejected || {}).some((v: any) => v?.rejected),
    [rejected],
  );
  const toggleReject = React.useCallback((blockId: string) => {
    setRejected((prev) => ({
      ...prev,
      [blockId]: {
        rejected: !prev?.[blockId]?.rejected,
        comment: prev?.[blockId]?.comment || "",
      },
    }));
  }, []);
  const setRejectComment = React.useCallback(
    (blockId: string, comment: string) => {
      setRejected((prev) => ({
        ...prev,
        [blockId]: {
          rejected: prev?.[blockId]?.rejected ?? true,
          comment,
        },
      }));
    },
    [],
  );

  const [uploadingPfId, setUploadingPfId] = useState<string | null>(null);
  const { data: assignableUsers = [], isFetching: isAssignLoading } = useQuery(
    ["assignableUsersExecutor", assignQuery],
    () =>
      apiClient.listUsersByRole({
        roleType: "executor",
        query: assignQuery.trim() ? assignQuery : undefined,
      }),
    { enabled: !!hasAssigned },
  );

  // Current step derived values (must be before any usage below)
  const currentStep = processSteps[currentStepIndex];

  // Approval status label for current step
  const currentStepStatusLabel = React.useMemo(() => {
    if (!currentStep) return "Статуса нет";
    try {
      const props = currentStep?.properties
        ? (JSON.parse(currentStep.properties as string) as any)
        : {};
      const label = props?.approvalStatus;
      return label && String(label).trim().length > 0 ? label : "Статуса нет";
    } catch {
      return "Статуса нет";
    }
  }, [currentStep]);

  // Load element roles configured for current step (public, no admin rights needed)
  const { data: stepRoles = [] } = useQuery(
    ["elementRoles", currentStep?.id],
    () => apiClient.listElementRolesPublic({ elementId: currentStep!.id }),
    { enabled: !!currentStep?.id },
  );

  // Load transitions for current step to detect special types like 'resolution'
  const { data: stepTransitions = [] } = useQuery(
    ["processTransitions", currentStep?.id],
    () => apiClient.listProcessTransitions({ elementId: currentStep!.id }),
    { enabled: !!currentStep?.id },
  );
  const hasResolution = React.useMemo(
    () =>
      stepTransitions.some(
        (t: any) => (t.transitionType || "next") === "resolution",
      ),
    [stepTransitions],
  );

  // Определяем правило «Назначено/Далее»: держатель следующего процесса остаётся текущим пользователем
  const hasAssignedNext = React.useMemo(
    () =>
      stepTransitions.some(
        (t: any) =>
          t?.condition === "assigned" &&
          (t.transitionType || "next") === "next",
      ),
    [stepTransitions],
  );

  // Figure out which participant role types the current user has in this application
  const userRoleTypes = React.useMemo(() => {
    const types: string[] = [];
    const uid = auth.userId;
    if (uid && application) {
      if (uid === application.applicantId) types.push("applicant");
      if (uid === application.assignedTo) types.push("executor");
    }
    return types;
  }, [auth.userId, application]);

  const userRights = React.useMemo(() => {
    const hasRolesConfigured = Array.isArray(stepRoles) && stepRoles.length > 0;
    const canEditConfigured = stepRoles.some(
      (r: any) => userRoleTypes.includes(r.roleType) && r.canEdit,
    );
    const canApprove = stepRoles.some(
      (r: any) => userRoleTypes.includes(r.roleType) && r.canApprove,
    );
    const canRegister = stepRoles.some(
      (r: any) => userRoleTypes.includes(r.roleType) && r.canRegister,
    );

    const isApplicant = userRoleTypes.includes("applicant");
    const status = application?.status || "";
    const isDraftLike = status === "DRAFT" || status === "IN_PROGRESS";

    // Правило редактирования:
    // 1) Если роли не настроены — заявитель может редактировать.
    // 2) Если роли настроены, но ни одна не даёт право редактирования текущему пользователю —
    //    всё равно разрешаем заявителю редактировать на стадиях черновика/заполнения.
    let canEdit = hasRolesConfigured ? canEditConfigured : isApplicant;
    if (!canEdit && isApplicant && isDraftLike) {
      canEdit = true;
    }

    return { canEdit, canApprove, canRegister };
  }, [stepRoles, userRoleTypes, application?.status]);
  // Resolution assignee list and mutation (stay on the same step)
  const { data: resAssignableUsers = [], isFetching: isResAssignLoading } =
    useQuery(
      ["assignableUsersForResolution", resAssignQuery],
      () =>
        apiClient.listUsersByRole({
          roleType: "executor",
          query: resAssignQuery.trim() ? resAssignQuery : undefined,
        }),
      { enabled: !!hasResolution },
    );
  const assignByResolutionMutation = useMutation(
    apiClient.assignApplicationToUser,
    {
      onSuccess: () => {
        toast({
          title: "Отправлено по резолюции",
          description: "Ответственный назначен",
        });
        void queryClient.invalidateQueries(["userApplications"]);
        void queryClient.invalidateQueries([
          "serviceApplication",
          applicationId,
        ]);
        navigate("/applications");
      },
      onError: (e: any) =>
        toast({
          title: "Не удалось отправить",
          description: e?.message || "Попробуйте ещё раз",
          variant: "destructive",
        }),
    },
  );

  const isLastStep = currentStepIndex === processSteps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const onStepCompleteForChild = React.useCallback(
    (isCompleted: boolean) => {
      handleStepComplete(currentStepIndex, isCompleted);
    },
    [currentStepIndex],
  );

  const assignMutation = useMutation(apiClient.assignApplicationToUser, {
    onSuccess: () => {
      toast({ title: "Назначено", description: "Ответственный назначен" });
      void queryClient.invalidateQueries(["userApplications"]);
      void queryClient.invalidateQueries(["serviceApplication", applicationId]);
      navigate("/applications");
    },
    onError: (e: any) =>
      toast({
        title: "Не удалось назначить",
        description: e?.message || "Попробуйте ещё раз",
        variant: "destructive",
      }),
  });

  // Load saved form data
  React.useEffect(() => {
    if (application?.formData) {
      try {
        const savedData = JSON.parse(application.formData) as Record<
          string,
          any
        >;
        setFormData(savedData);
      } catch (err) {
        console.error("Error parsing form data:", err);
      }
    }
  }, [application]);

  // Save form data to application
  const saveFormData = () => {
    if (applicationId) {
      updateApplicationMutation.mutate({
        id: applicationId,
        formData,
        currentStage: currentStep?.name || "В процессе",
      });
    }
  };

  // Check if current step is completed
  const isCurrentStepCompleted = () => {
    if (!currentStep) return true;
    return completedSteps.has(currentStepIndex);
  };

  // Preselect assignee from next step preset if available
  React.useEffect(() => {
    if (!hasAssigned || hasAssignedNext || selectedAssignee) return;
    try {
      if (!schema || !currentStep) return;
      // Find likely next PROCESS element (direct edge or via DECISION first branch)
      const direct = (schema.connections || []).find(
        (c: any) => c.sourceId === currentStep.id,
      );
      let nextProcess: any | null = null;
      if (direct) {
        const tgt = (schema.elements || []).find(
          (e: any) => e.id === direct.targetId,
        );
        if (tgt?.elementType === "PROCESS") nextProcess = tgt;
        if (tgt?.elementType === "DECISION") {
          const out = (schema.connections || []).find(
            (c: any) => c.sourceId === tgt.id,
          );
          if (out)
            nextProcess =
              (schema.elements || []).find(
                (e: any) =>
                  e.id === out.targetId && e.elementType === "PROCESS",
              ) || null;
        }
      }
      if (nextProcess) {
        const props = parseProps(nextProcess.properties as any);
        const preset = props?.defaultAssignees?.executor as string | undefined;
        if (preset) setSelectedAssignee(preset);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAssigned, schema, currentStep?.id]);

  const handleNext = async () => {
    // Сохраняем текущее состояние формы перед переходом
    saveFormData();

    try {
      // Локальные вспомогательные функции для разбора условий и их проверки
      const parseConnCondition = (conn: any) => {
        try {
          if (!conn?.condition) return {} as any;
          const parsed = JSON.parse(conn.condition as string) as any;
          return parsed && typeof parsed === "object" ? parsed : ({} as any);
        } catch {
          return {} as any;
        }
      };

      const getFieldValue = (field: string) => {
        const name = String(field || "").trim();
        const candidates = [
          `byName_${name}`,
          ...(name.includes(".") ? [`byName_${name.split(".").pop()}`] : []),
        ];
        for (const k of candidates)
          if (formData[k] !== undefined) return formData[k];
        return undefined;
      };

      const evaluateRules = (rules: any[]) => {
        if (!Array.isArray(rules) || rules.length === 0) return false; // пустые правила считаем как "нет условия"
        return rules.every((r) => {
          const vt = r.valueType || "text";
          const op = r.op || "eq";
          const val =
            r.type === "railway"
              ? formData.railway
              : getFieldValue(r.field || "");
          const cmp = r.value;

          if (op === "exists") {
            return (
              val !== undefined && val !== null && String(val).trim() !== ""
            );
          }

          if (vt === "boolean") {
            const v = Boolean(val);
            const c = cmp === true || cmp === "true";
            return op === "ne" ? v !== c : v === c;
          }

          if (vt === "number") {
            const v = Number(val);
            const c = Number(cmp);
            if (Number.isNaN(v) || Number.isNaN(c)) return false;
            if (op === "gt") return v > c;
            if (op === "lt") return v < c;
            if (op === "ne") return v !== c;
            return v === c;
          }

          if (vt === "date") {
            const v = val ? new Date(val) : null;
            const c = cmp ? new Date(cmp) : null;
            if (!v || !c) return false;
            if (op === "gt") return v.getTime() > c.getTime();
            if (op === "lt") return v.getTime() < c.getTime();
            if (op === "ne") return v.toDateString() !== c.toDateString();
            return v.toDateString() === c.toDateString();
          }

          // Текст
          const vStr = String(val ?? "").toLowerCase();
          const cStr = String(cmp ?? "").toLowerCase();
          if (op === "contains") return vStr.includes(cStr);
          if (op === "ne") return vStr !== cStr;
          return vStr === cStr;
        });
      };

      // Если после текущего PROCESS стоит DECISION, выбираем ветку по условиям
      const step = currentStep;
      if (schema && step) {
        const decisionEdge = schema.connections?.find((c: any) => {
          if (c.sourceId !== step.id) return false;
          const targetEl = schema.elements?.find(
            (el: any) => el.id === c.targetId,
          );
          return targetEl?.elementType === "DECISION";
        });

        if (decisionEdge) {
          const outgoing = (schema.connections || []).filter(
            (c: any) => c.sourceId === decisionEdge.targetId,
          );

          // Ищем первую ветку, чьи правила истинны, иначе берём первую без условий/по умолчанию
          let chosen: any = null;
          for (const edge of outgoing) {
            const cond = parseConnCondition(edge);
            const rules = Array.isArray(cond.rules) ? cond.rules : [];
            if (evaluateRules(rules)) {
              chosen = edge;
              break;
            }
          }
          if (!chosen && outgoing.length > 0) chosen = outgoing[0];

          if (chosen) {
            const target = schema.elements?.find(
              (el: any) => el.id === chosen.targetId,
            );
            if (target?.elementType === "PROCESS") {
              // Auto-assign the next holder ("Держатель процесса") if needed, then move
              try {
                const props = target?.properties
                  ? (JSON.parse(target.properties as string) as any)
                  : {};
                const preset = props?.defaultAssignees?.executor as
                  | string
                  | undefined;
                const nextExecutor = hasAssignedNext
                  ? auth.userId
                  : selectedAssignee || preset;

                if (hasAssigned && !hasAssignedNext && !selectedAssignee) {
                  toast({
                    title: "Выберите держателя процесса",
                    description:
                      "Укажите сотрудника, который продолжит работу на следующем этапе.",
                    variant: "destructive",
                  });
                  return;
                }

                if (nextExecutor && applicationId) {
                  await assignMutation.mutateAsync({
                    applicationId: applicationId!,
                    userId: nextExecutor,
                    targetElementId: target.id,
                  });
                  return; // onSuccess will navigate out
                }
              } catch {}

              const idx = processSteps.findIndex(
                (s: any) => s.id === target.id,
              );
              if (idx >= 0) {
                setCurrentStepIndex(idx);
                return; // уже перешли по подходящей ветке
              }
            }
          }
        }
      }
    } catch {
      // игнорируем, уйдём по стандартному пути ниже
    }

    if (currentStepIndex < processSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Завершение заявки
      updateApplicationMutation.mutate({
        id: applicationId!,
        status: "SUBMITTED",
        formData,
        currentStage: "Завершено",
      });
      navigate("/applications");
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      saveFormData();
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleStepComplete = (stepIndex: number, isCompleted: boolean) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (isCompleted) {
        newSet.add(stepIndex);
      } else {
        newSet.delete(stepIndex);
      }
      return newSet;
    });
  };

  if (!application || !schema) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка заявки...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/applications")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад к заявкам
              </Button>
              <div>
                <h1 className="text-xl font-bold">{application.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Схема: {schema.name}
                </p>
              </div>
            </div>
            <Badge variant="outline">
              Этап {currentStepIndex + 1} из {processSteps.length}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {processSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : index < currentStepIndex || completedSteps.has(index)
                        ? "bg-green-600 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStepIndex || completedSteps.has(index) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="ml-2 text-sm">
                  <div className="font-medium">{step.name}</div>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="w-12 h-px bg-border mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current step content */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>{currentStep?.name}</CardTitle>
              <Badge variant="secondary" title="Статус заявки на этом этапе">
                {currentStepStatusLabel}
              </Badge>
            </div>
            {currentStep?.description && (
              <CardDescription>{currentStep.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {currentStep &&
              (() => {
                // Deprecated single-form check removed; multi-form buttons below handle availability
                const hasApproveReject = Array.isArray(currentStep?.transitions)
                  ? currentStep.transitions.some(
                      (t: any) => t?.condition === "approved_or_rejected",
                    )
                  : false;

                const goToApprovalBranch = async (
                  label: "Согласовано" | "Отклонено",
                ) => {
                  try {
                    // Save current data to keep values fresh
                    if (applicationId) {
                      await updateApplicationMutation.mutateAsync({
                        id: applicationId,
                        formData,
                        currentStage: currentStep?.name || "В процессе",
                      });
                    }

                    // Find DECISION node directly connected from this PROCESS
                    const decisionEdge = schema?.connections?.find((c: any) => {
                      if (c.sourceId !== currentStep.id) return false;
                      const targetEl = schema?.elements?.find(
                        (el: any) => el.id === c.targetId,
                      );
                      return targetEl?.elementType === "DECISION";
                    });

                    if (!decisionEdge) {
                      toast({
                        title: "Не найден блок 'Решение'",
                        description:
                          "Добавьте блок 'Решение' после процесса или обновите схему.",
                        variant: "destructive",
                      });
                      return;
                    }

                    // Find branch from DECISION by label
                    const branchEdge = schema?.connections?.find(
                      (c: any) =>
                        c.sourceId === decisionEdge.targetId &&
                        (c.label || "").trim() === label,
                    );
                    if (!branchEdge) {
                      toast({
                        title: "Ветка не настроена",
                        description: `Для ветки "${label}" нет соединения из блока 'Решение'.`,
                        variant: "destructive",
                      });
                      return;
                    }

                    const targetEl = schema?.elements?.find(
                      (el: any) => el.id === branchEdge.targetId,
                    );
                    if (!targetEl) {
                      toast({ title: "Целевой этап не найден" });
                      return;
                    }

                    if (targetEl.elementType === "PROCESS") {
                      // Try to auto-assign the next holder ("Держатель процесса") before moving on
                      try {
                        const props = targetEl?.properties
                          ? (JSON.parse(targetEl.properties as string) as any)
                          : {};
                        const preset = props?.defaultAssignees?.executor as
                          | string
                          | undefined;
                        const nextExecutor = hasAssignedNext
                          ? auth.userId
                          : selectedAssignee || preset;

                        if (
                          hasAssigned &&
                          !hasAssignedNext &&
                          !selectedAssignee
                        ) {
                          toast({
                            title: "Выберите держателя процесса",
                            description:
                              "Укажите сотрудника, который продолжит работу на следующем этапе.",
                            variant: "destructive",
                          });
                          return;
                        }

                        if (nextExecutor && applicationId) {
                          await assignMutation.mutateAsync({
                            applicationId: applicationId!,
                            userId: nextExecutor,
                            targetElementId: targetEl.id,
                          });
                          return; // onSuccess will navigate to "Мои заявки"
                        }
                      } catch {}

                      const idx = processSteps.findIndex(
                        (s: any) => s.id === targetEl.id,
                      );
                      if (idx >= 0) {
                        setCurrentStepIndex(idx);
                        return;
                      }
                    }
                    // Fallback: go to END if present, or next step
                    if (currentStepIndex < processSteps.length - 1) {
                      setCurrentStepIndex(currentStepIndex + 1);
                    }
                  } catch {
                    toast({ title: "Не удалось перейти по ветке" });
                  }
                };

                return (
                  <>
                    {(() => {
                      // Try to read all print forms for this element
                      let props: any = {};
                      try {
                        props = currentStep?.properties
                          ? (JSON.parse(
                              currentStep.properties as string,
                            ) as any)
                          : {};
                      } catch {}
                      const forms: any[] = Array.isArray(props.printForms)
                        ? props.printForms
                        : props.printForm
                          ? [props.printForm]
                          : [];
                      if (!forms || forms.length === 0) return null;
                      return (
                        <div className="flex flex-wrap gap-2 justify-end mb-4">
                          {forms.map((f: any) => {
                            const signedUrl = (formData as any)[
                              `${currentStep.id}_printform_${f.id}_signed_url`
                            ];
                            return (
                              <div
                                key={f.id ?? f.templateUrl}
                                className="flex items-center gap-2"
                              >
                                <Button
                                  variant="outline"
                                  onClick={async () => {
                                    try {
                                      if (applicationId) {
                                        await updateApplicationMutation.mutateAsync(
                                          {
                                            id: applicationId,
                                            formData,
                                            currentStage:
                                              currentStep?.name || "В процессе",
                                          },
                                        );
                                      }
                                      const res =
                                        await apiClient.generatePrintFormForApplication(
                                          {
                                            applicationId: applicationId!,
                                            elementId: currentStep.id,
                                            printFormId: f.id,
                                          },
                                        );
                                      if (res?.url)
                                        window.open(res.url, "_blank");
                                    } catch {
                                      toast({
                                        title:
                                          "Не удалось сформировать печатную форму",
                                        description:
                                          "Проверьте, что администратор загрузил шаблон и настроил соответствия токенов.",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  {f.label ||
                                    f.templateName ||
                                    "Печатная форма"}
                                </Button>
                                {userRights.canEdit && (
                                  <>
                                    <input
                                      id={`pf-upload-${f.id}`}
                                      type="file"
                                      accept=".pdf,.doc,.docx"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const inputEl =
                                          e.currentTarget as HTMLInputElement;
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                          setUploadingPfId(String(f.id));
                                          const base64 =
                                            await encodeFileAsBase64DataURL(
                                              file,
                                            );
                                          if (!base64) return;
                                          const res =
                                            await apiClient.attachPrintFormSigned(
                                              {
                                                applicationId: applicationId!,
                                                elementId: currentStep.id,
                                                printFormId: f.id,
                                                file: {
                                                  base64,
                                                  name: file.name,
                                                },
                                              },
                                            );
                                          const baseKey = `${currentStep.id}_printform_${f.id}`;
                                          setFormData((prev) => {
                                            const next = {
                                              ...prev,
                                              [`${baseKey}_signed`]: file.name,
                                              [`${baseKey}_signed_url`]:
                                                res.url,
                                            };
                                            try {
                                              const props =
                                                currentStep?.properties
                                                  ? (JSON.parse(
                                                      currentStep.properties as string,
                                                    ) as any)
                                                  : {};
                                              const formsArr: any[] =
                                                Array.isArray(props.printForms)
                                                  ? props.printForms
                                                  : props.printForm
                                                    ? [props.printForm]
                                                    : [];
                                              const allSigned = formsArr.every(
                                                (pf: any) => {
                                                  const k1 = `${currentStep.id}_printform_${String(pf.id)}_signed_url`;
                                                  const k2 = `${currentStep.id}_printform_${String(pf.id)}_signed`;
                                                  return Boolean(
                                                    (next as any)[k1] ||
                                                      (next as any)[k2],
                                                  );
                                                },
                                              );
                                              if (allSigned) {
                                                handleStepComplete(
                                                  currentStepIndex,
                                                  true,
                                                );
                                              }
                                            } catch {}
                                            return next;
                                          });
                                        } catch {
                                          toast({
                                            title: "Не удалось прикрепить файл",
                                            variant: "destructive",
                                          });
                                        } finally {
                                          setUploadingPfId(null);
                                          if (inputEl) inputEl.value = "";
                                        }
                                      }}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        document
                                          .getElementById(`pf-upload-${f.id}`)
                                          ?.click()
                                      }
                                      disabled={uploadingPfId === String(f.id)}
                                    >
                                      {uploadingPfId === String(f.id)
                                        ? "Загрузка..."
                                        : "Прикрепить"}
                                    </Button>
                                  </>
                                )}
                                {signedUrl && (
                                  <a
                                    href={signedUrl as string}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs underline"
                                  >
                                    Подписанный
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    <ProcessStepForm
                      applicationId={applicationId!}
                      elementId={currentStep.id}
                      formData={formData}
                      onFormDataChange={setFormData}
                      onStepComplete={onStepCompleteForChild}
                      readOnly={!userRights.canEdit}
                      rejectMode={rejectMode}
                      rejected={rejected}
                      onToggleReject={toggleReject}
                      onSetRejectComment={setRejectComment}
                      requiredPrintForms={(() => {
                        try {
                          const props = currentStep?.properties
                            ? (JSON.parse(
                                currentStep.properties as string,
                              ) as any)
                            : {};
                          const forms: any[] = Array.isArray(props.printForms)
                            ? props.printForms
                            : props.printForm
                              ? [props.printForm]
                              : [];
                          return forms.map((f: any) => ({ id: String(f.id) }));
                        } catch {
                          return [] as Array<{ id: string }>;
                        }
                      })()}
                    />{" "}
                    {(hasResolution ||
                      hasAssigned ||
                      (hasApproveReject && userRights.canApprove)) && (
                      <div className="mt-4 flex flex-col md:flex-row gap-4">
                        {hasResolution && (
                          <Card className="w-full md:w-1/2">
                            <CardHeader>
                              <CardTitle>Резолюция</CardTitle>
                              <CardDescription>
                                Выберите пользователя для делегирования текущего
                                этапа
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-col md:flex-row gap-2">
                                <Input
                                  placeholder="Поиск по имени или email"
                                  value={resAssignQuery}
                                  onChange={(e) =>
                                    setResAssignQuery(e.target.value)
                                  }
                                />
                              </div>
                              <div className="mt-3 max-h-56 overflow-auto border rounded">
                                {isResAssignLoading ? (
                                  <div className="p-3 text-sm text-muted-foreground">
                                    Загрузка...
                                  </div>
                                ) : (
                                  <div className="divide-y">
                                    {resAssignableUsers.map((u: any) => (
                                      <label
                                        key={u.id}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted"
                                      >
                                        <input
                                          type="radio"
                                          name="resAssignee"
                                          checked={
                                            selectedResolutionAssignee === u.id
                                          }
                                          onChange={() =>
                                            setSelectedResolutionAssignee(u.id)
                                          }
                                        />
                                        <div className="min-w-0">
                                          <div className="text-sm font-medium truncate">
                                            {u.name ||
                                              u.handle ||
                                              u.email ||
                                              u.id}
                                          </div>
                                          {u.email && (
                                            <div className="text-xs text-muted-foreground truncate">
                                              {u.email}
                                            </div>
                                          )}
                                        </div>
                                      </label>
                                    ))}
                                    {resAssignableUsers.length === 0 && (
                                      <div className="p-3 text-sm text-muted-foreground">
                                        Сотрудники не найдены
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="justify-end">
                              <Button
                                onClick={() =>
                                  selectedResolutionAssignee &&
                                  assignByResolutionMutation.mutate({
                                    applicationId: applicationId!,
                                    userId: selectedResolutionAssignee,
                                  })
                                }
                                disabled={
                                  !selectedResolutionAssignee ||
                                  assignByResolutionMutation.isLoading
                                }
                              >
                                Отправить по резолюции
                              </Button>
                            </CardFooter>
                          </Card>
                        )}

                        {hasAssigned && !hasAssignedNext && (
                          <Card className="w-full md:w-1/2">
                            <CardHeader>
                              <CardTitle>Назначение ответственного</CardTitle>
                              <CardDescription>
                                Выберите сотрудника и нажмите «Назначить»
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-col md:flex-row gap-2">
                                <Input
                                  placeholder="Поиск по имени или email"
                                  value={assignQuery}
                                  onChange={(e) =>
                                    setAssignQuery(e.target.value)
                                  }
                                />
                              </div>
                              <div className="mt-3 max-h-56 overflow-auto border rounded">
                                {isAssignLoading ? (
                                  <div className="p-3 text-sm text-muted-foreground">
                                    Загрузка...
                                  </div>
                                ) : (
                                  <div className="divide-y">
                                    {assignableUsers.map((u: any) => (
                                      <label
                                        key={u.id}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted"
                                      >
                                        <input
                                          type="radio"
                                          name="assignee"
                                          checked={selectedAssignee === u.id}
                                          onChange={() =>
                                            setSelectedAssignee(u.id)
                                          }
                                        />
                                        <div className="min-w-0">
                                          <div className="text-sm font-medium truncate">
                                            {u.name ||
                                              u.handle ||
                                              u.email ||
                                              u.id}
                                          </div>
                                          {u.email && (
                                            <div className="text-xs text-muted-foreground truncate">
                                              {u.email}
                                            </div>
                                          )}
                                        </div>
                                      </label>
                                    ))}
                                    {assignableUsers.length === 0 && (
                                      <div className="p-3 text-sm text-muted-foreground">
                                        Сотрудники не найдены
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="justify-end">
                              <Button
                                onClick={() =>
                                  selectedAssignee &&
                                  assignMutation.mutate({
                                    applicationId: applicationId!,
                                    userId: selectedAssignee,
                                  })
                                }
                                disabled={
                                  !selectedAssignee ||
                                  assignMutation.isLoading ||
                                  !isCurrentStepCompleted()
                                }
                              >
                                Назначить
                              </Button>
                            </CardFooter>
                          </Card>
                        )}

                        {hasApproveReject && userRights.canApprove && (
                          <Card className="w-full md:w-1/2">
                            <CardHeader>
                              <CardTitle>Согласование</CardTitle>
                              <CardDescription>
                                Выберите действие для текущего этапа
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-sm text-muted-foreground">
                                Доступны варианты «Согласовать» или «Отклонить».
                              </div>
                            </CardContent>
                            <CardFooter className="justify-end gap-2">
                              {rejectMode ? (
                                <>
                                  <Button
                                    variant="destructive"
                                    disabled={!hasAnyRejected}
                                    onClick={async () => {
                                      try {
                                        const entries = Object.entries(
                                          rejected || {},
                                        ).filter(([, v]) => v?.rejected);
                                        const payload = entries.map(
                                          ([id, v]) => ({
                                            id,
                                            comment: v?.comment || "",
                                          }),
                                        );
                                        const key = `${currentStep.id}_rejections`;
                                        const nextForm = {
                                          ...formData,
                                          [key]: payload,
                                        };
                                        setFormData(nextForm);
                                        if (applicationId) {
                                          await updateApplicationMutation.mutateAsync(
                                            {
                                              id: applicationId,
                                              formData: nextForm,
                                              currentStage:
                                                currentStep?.name ||
                                                "В процессе",
                                            },
                                          );
                                        }
                                        await goToApprovalBranch("Отклонено");
                                        setRejectMode(false);
                                        setRejected({});
                                      } catch {
                                        toast({
                                          title:
                                            "Не удалось отправить замечания",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    Отправить замечания
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setRejectMode(false);
                                      setRejected({});
                                    }}
                                  >
                                    Отменить
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    onClick={() => setRejectMode(true)}
                                  >
                                    Отклонить
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      goToApprovalBranch("Согласовано")
                                    }
                                  >
                                    Согласовать
                                  </Button>
                                </>
                              )}
                            </CardFooter>
                          </Card>
                        )}
                      </div>
                    )}{" "}
                  </>
                );
              })()}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>

          <Button onClick={handleNext} disabled={!isCurrentStepCompleted()}>
            {isLastStep ? "Отправить заявку" : "Далее"}
            {!isLastStep && <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />}
          </Button>
        </div>
      </main>
    </div>
  );
}

// Process Step Form Component
function ProcessStepForm({
  applicationId,
  elementId,
  formData,
  onFormDataChange,
  onStepComplete,
  readOnly = false,
  rejectMode = false,
  rejected,
  onToggleReject,
  onSetRejectComment,
  requiredPrintForms,
}: {
  applicationId: string;
  elementId: string;
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
  onStepComplete: (isCompleted: boolean) => void;
  readOnly?: boolean;
  rejectMode?: boolean;
  rejected?: Record<string, { rejected: boolean; comment?: string }>;
  onToggleReject?: (blockId: string) => void;
  onSetRejectComment?: (blockId: string, comment: string) => void;
  requiredPrintForms?: Array<{ id: string }>; // print forms configured on step properties (outside requisites)
}) {
  const { data: requisites = [] } = useQuery(
    ["processRequisites", elementId],
    () => apiClient.listProcessRequisites({ elementId }),
    { enabled: !!elementId },
  );
  const { data: checklists = [] } = useQuery(
    ["processChecklists", elementId],
    () => apiClient.listProcessChecklists({ elementId }),
    { enabled: !!elementId },
  );

  const [checklistOrder, setChecklistOrder] = useState<string[]>([]);
  React.useEffect(() => {
    if (!Array.isArray(checklists)) return;
    const ids = (checklists as any[]).map((c: any) => c.id);
    const isSame =
      ids.length === checklistOrder.length &&
      ids.every((id, i) => id === checklistOrder[i]);
    if (!isSame) {
      setChecklistOrder(ids);
    }
  }, [checklists, checklistOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const orderedChecklists = React.useMemo(() => {
    if (!Array.isArray(checklists)) return [] as any[];
    if (!checklistOrder || checklistOrder.length === 0)
      return checklists as any[];
    const map = new Map(checklists.map((c: any) => [c.id, c]));
    return checklistOrder.map((id) => map.get(id)).filter(Boolean) as any[];
  }, [checklists, checklistOrder]);

  const ChecklistSortableRow = ({
    id,
    children,
  }: {
    id: string;
    children: React.ReactNode;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : undefined,
    } as React.CSSProperties;
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={isDragging ? "ring-2 ring-primary rounded-lg" : undefined}
      >
        {children}
      </div>
    );
  };

  const lastCompletedRef = React.useRef<boolean | null>(null);

  // Check if step is completed
  React.useEffect(() => {
    // 1) Regular required requisites (excluding print_form handled separately)
    const reqRequired = requisites.filter((req) => req.isRequired);
    const requisitesOK = reqRequired.every((req) => {
      const fieldId = `${elementId}_${req.id}`;
      const value = formData[fieldId];

      if (req.fieldType === "approval") {
        const v = value as any;
        return !!(v && Array.isArray(v.stages) && v.stages.length > 0);
      }

      if (req.fieldType === "print_form") {
        // Consider print form completed when a signed file is attached
        const signedOk = Boolean(
          formData[`${fieldId}_signed_url`] || formData[`${fieldId}_signed`],
        );
        return signedOk;
      }

      return value && value.toString().trim() !== "";
    });

    // 2) Required checklists
    const requiredChecklist = checklists.filter((c) => c.isRequired);
    const checklistsOK = requiredChecklist.every((item) => {
      const key = `${elementId}_checklist_${item.id}`;
      return Boolean(formData[key]);
    });

    // 3) Print forms configured on step properties (outside requisites)
    const propertyPrintForms: Array<{ id: string }> = Array.isArray(
      requiredPrintForms,
    )
      ? (requiredPrintForms as Array<{ id: string }>)
      : [];
    const printFormsOK = propertyPrintForms.every((pf) =>
      Boolean(
        formData[`${elementId}_printform_${pf.id}_signed_url`] ||
          formData[`${elementId}_printform_${pf.id}_signed`],
      ),
    );

    const isCompleted = requisitesOK && checklistsOK && printFormsOK;

    if (lastCompletedRef.current !== isCompleted) {
      lastCompletedRef.current = isCompleted;
      onStepComplete(isCompleted);
    }
  }, [formData, requisites, checklists, elementId, requiredPrintForms]);

  const handleFieldChange = (
    fieldId: string,
    value: any,
    systemName?: string,
  ) => {
    if (readOnly) return;
    onFormDataChange({
      ...formData,
      [fieldId]: value,
      ...(systemName ? { ["byName_" + systemName]: value } : {}),
    });
  };

  // Auto-fill inherited fields using values saved by system name from previous steps
  React.useEffect(() => {
    if (!requisites || requisites.length === 0) return;
    let updated = false;
    const nextData: Record<string, any> = { ...formData };
    for (const req of requisites as any[]) {
      const fieldId = `${elementId}_${req.id}`;
      if (nextData[fieldId]) continue;
      try {
        const meta = req.validation
          ? (JSON.parse(req.validation as string) as { inherited?: boolean })
          : {};
        if (meta?.inherited) {
          const candidate = nextData[`byName_${req.name}`];
          if (
            candidate !== undefined &&
            candidate !== null &&
            candidate !== ""
          ) {
            nextData[fieldId] = candidate;
            updated = true;
          }
        }
      } catch {}
    }
    if (updated) onFormDataChange(nextData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requisites]);

  const renderFormField = (req: any) => {
    const fieldId = `${elementId}_${req.id}`;
    const value = formData[fieldId] || "";

    switch (req.fieldType) {
      case "text":
        return (
          <Input
            placeholder={
              req.placeholder || `Введите ${req.label.toLowerCase()}`
            }
            value={value}
            onChange={(e) =>
              handleFieldChange(fieldId, e.target.value, req.name)
            }
          />
        );

      case "email":
        return (
          <Input
            type="email"
            placeholder={req.placeholder || "example@email.com"}
            value={value}
            onChange={(e) =>
              handleFieldChange(fieldId, e.target.value, req.name)
            }
            disabled={readOnly}
          />
        );

      case "phone":
        return (
          <Input
            type="tel"
            placeholder={req.placeholder || "+7 (999) 123-45-67"}
            value={value}
            onChange={(e) =>
              handleFieldChange(fieldId, e.target.value, req.name)
            }
            disabled={readOnly}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) =>
              handleFieldChange(fieldId, e.target.value, req.name)
            }
            disabled={readOnly}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={req.placeholder || "0"}
            value={value}
            onChange={(e) =>
              handleFieldChange(fieldId, e.target.value, req.name)
            }
            disabled={readOnly}
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={
              req.placeholder || `Введите ${req.label.toLowerCase()}`
            }
            value={value}
            onChange={(e) =>
              handleFieldChange(fieldId, e.target.value, req.name)
            }
            rows={3}
            disabled={readOnly}
          />
        );
      case "label":
        return (
          <div className="py-2">
            <div className="text-lg md:text-xl font-bold">{req.label}</div>
          </div>
        );

      case "select":
        let options: any[] = [];
        try {
          options = req.options
            ? (JSON.parse(req.options as string) as any[])
            : [];
        } catch {
          options = [];
        }
        return (
          <select
            value={value}
            onChange={(e) =>
              handleFieldChange(fieldId, e.target.value, req.name)
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            disabled={readOnly}
          >
            <option value="">Выберите вариант</option>
            {Array.isArray(options) &&
              options.map((option: any, index: number) => (
                <option
                  key={index}
                  value={typeof option === "string" ? option : option.value}
                >
                  {typeof option === "string" ? option : option.label}
                </option>
              ))}
          </select>
        );

      case "file":
        return (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={(e) => {
                if (readOnly) return;
                const file = e.target.files?.[0];
                if (file) {
                  handleFieldChange(fieldId, file.name, req.name);
                }
              }}
              disabled={readOnly}
            />
            {value && (
              <p className="text-sm text-muted-foreground">Файл: {value}</p>
            )}
          </div>
        );

      case "print_form":
        return (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Печатная форма</Badge>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Шаблон документа</Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={async (e) => {
                    const inputEl = e.currentTarget as HTMLInputElement;
                    if (readOnly) return;
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const base64 = await encodeFileAsBase64DataURL(file);
                    if (!base64) return;
                    try {
                      const res = await apiClient.attachPrintFormFile({
                        applicationId,
                        elementId,
                        requisiteId: req.id,
                        which: "template",
                        file: { base64, name: file.name },
                      });
                      onFormDataChange({
                        ...formData,
                        [`${fieldId}_template`]: file.name,
                        [`${fieldId}_template_url`]: res.url,
                      });
                    } catch {}
                    if (inputEl) inputEl.value = "";
                  }}
                />
                {(formData[`${fieldId}_template`] ||
                  formData[`${fieldId}_template_url`]) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Загружен шаблон: {formData[`${fieldId}_template`]}
                    {formData[`${fieldId}_template_url`] && (
                      <>
                        {" "}
                        •{" "}
                        <a
                          href={formData[`${fieldId}_template_url`] as string}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          Открыть
                        </a>
                      </>
                    )}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Подписанный документ
                </Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={async (e) => {
                    const inputEl = e.currentTarget as HTMLInputElement;
                    if (readOnly) return;
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const base64 = await encodeFileAsBase64DataURL(file);
                    if (!base64) return;
                    try {
                      const res = await apiClient.attachPrintFormFile({
                        applicationId,
                        elementId,
                        requisiteId: req.id,
                        which: "signed",
                        file: { base64, name: file.name },
                      });
                      onFormDataChange({
                        ...formData,
                        [`${fieldId}_signed`]: file.name,
                        [`${fieldId}_signed_url`]: res.url,
                      });
                    } catch {}
                    if (inputEl) inputEl.value = "";
                  }}
                />
                {(formData[`${fieldId}_signed`] ||
                  formData[`${fieldId}_signed_url`]) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Загружен подписанный документ:{" "}
                    {formData[`${fieldId}_signed`]}
                    {formData[`${fieldId}_signed_url`] && (
                      <>
                        {" "}
                        •{" "}
                        <a
                          href={formData[`${fieldId}_signed_url`] as string}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          Открыть
                        </a>
                      </>
                    )}
                  </p>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <p>1. Загрузите шаблон документа</p>
                <p>2. Заполните документ вручную и подпишите</p>
                <p>3. Загрузите подписанный документ</p>
              </div>
            </div>
          </div>
        );

      case "approval":
        return readOnly ? (
          <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
            <Badge variant="secondary">Процесс согласования</Badge>
            <div className="text-xs text-muted-foreground">Только просмотр</div>
          </div>
        ) : (
          <ApprovalStagesEditor
            fieldId={fieldId}
            value={value}
            onFieldChange={handleFieldChange}
          />
        );

      default:
        return (
          <Input
            placeholder={
              req.placeholder || `Введите ${req.label.toLowerCase()}`
            }
            value={value}
            onChange={(e) =>
              handleFieldChange(fieldId, e.target.value, req.name)
            }
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Form fields */}
      {requisites.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Заполните форму</h4>
          {requisites.map((req) => {
            const blockId = `req:${req.id}`;
            const isRejected = !!rejected?.[blockId]?.rejected;
            const isLabelType = req.fieldType === "label";
            return (
              <div
                key={req.id}
                className={`space-y-2 rounded-md p-2 ${
                  rejectMode
                    ? isRejected
                      ? "border border-destructive/50 bg-destructive/10"
                      : "border border-dashed border-muted"
                    : ""
                }`}
              >
                {!isLabelType && (
                  <div className="flex items-start justify-between gap-3">
                    <Label
                      className={`text-sm font-medium ${
                        isRejected ? "line-through text-destructive" : ""
                      }`}
                    >
                      {req.label}
                      {req.isRequired && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    {rejectMode && (
                      <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isRejected}
                          onChange={() => onToggleReject?.(blockId)}
                        />
                        <span>Отклонить</span>
                      </label>
                    )}
                  </div>
                )}
                {renderFormField(req)}
                {req.placeholder &&
                  req.fieldType !== "approval" &&
                  req.fieldType !== "label" && (
                    <p className="text-xs text-muted-foreground">
                      {req.placeholder}
                    </p>
                  )}
                {rejectMode && isRejected && !isLabelType && (
                  <div className="pt-2">
                    <Label className="text-xs font-medium">
                      Комментарий к замечанию
                    </Label>
                    <Textarea
                      rows={2}
                      placeholder="Опишите, что нужно поправить"
                      value={rejected?.[blockId]?.comment || ""}
                      onChange={(e) =>
                        onSetRejectComment?.(blockId, e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}{" "}
        </div>
      )}

      {/* Checklists */}
      {orderedChecklists.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Документы</h4>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (!over || active.id === over.id) return;
              const oldIndex = checklistOrder.indexOf(active.id as string);
              const newIndex = checklistOrder.indexOf(over.id as string);
              setChecklistOrder(arrayMove(checklistOrder, oldIndex, newIndex));
            }}
          >
            <SortableContext
              items={orderedChecklists.map((it: any) => it.id)}
              strategy={verticalListSortingStrategy}
            >
              {orderedChecklists.map((item) => (
                <ChecklistSortableRow key={item.id} id={item.id}>
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 rounded"
                        onChange={(e) => {
                          if (readOnly) return;
                          const fieldId = `${elementId}_checklist_${item.id}`;
                          handleFieldChange(fieldId, e.target.checked);
                        }}
                        checked={
                          formData[`${elementId}_checklist_${item.id}`] || false
                        }
                        disabled={readOnly}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">{item.name}</h5>
                          {item.isRequired && (
                            <Badge variant="destructive" className="text-xs">
                              Обязательный
                            </Badge>
                          )}
                        </div>
                        {(() => {
                          const text = item.description || "";
                          const words = String(text).split(/\s+/);
                          const short =
                            words.length > 100
                              ? words.slice(0, 100).join(" ") + "…"
                              : text;
                          return short ? (
                            <p className="text-sm text-muted-foreground">
                              {short}
                            </p>
                          ) : null;
                        })()}

                        {item.allowDocuments && (
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">
                              Прикрепить файл(ы):
                            </Label>
                            <Input
                              type="file"
                              multiple
                              onChange={async (e) => {
                                const inputEl =
                                  e.currentTarget as HTMLInputElement;
                                if (readOnly) return;
                                const files = Array.from(e.target.files ?? []);
                                if (files.length === 0) return;
                                const encoded = await Promise.all(
                                  files.map(async (f) => ({
                                    base64: await encodeFileAsBase64DataURL(f),
                                    name: f.name,
                                  })),
                                );
                                const valid = encoded.filter(
                                  (f) => !!f.base64,
                                ) as Array<{ base64: string; name: string }>;
                                if (valid.length === 0) return;
                                const comment = formData[
                                  `${elementId}_comment_${item.id}`
                                ] as string | undefined;
                                const res =
                                  await apiClient.attachChecklistFiles({
                                    applicationId,
                                    elementId,
                                    checklistId: item.id,
                                    files: valid,
                                    comment,
                                  });
                                if (res?.urls) {
                                  const key = `${elementId}_checklist_${item.id}_files`;
                                  const prev = Array.isArray(formData[key])
                                    ? (formData[key] as string[])
                                    : [];
                                  onFormDataChange({
                                    ...formData,
                                    [key]: [...prev, ...res.urls],
                                  });
                                }
                                if (inputEl) inputEl.value = "";
                              }}
                              disabled={readOnly}
                            />
                            {Array.isArray(
                              formData[
                                `${elementId}_checklist_${item.id}_files`
                              ],
                            ) && (
                              <div className="text-xs text-muted-foreground space-y-1">
                                {(
                                  formData[
                                    `${elementId}_checklist_${item.id}_files`
                                  ] as string[]
                                ).map((u, idx) => (
                                  <div key={idx} className="truncate">
                                    <a
                                      href={u}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="underline"
                                    >
                                      Файл {idx + 1}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {item.allowComments && (
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">
                              Комментарий:
                            </Label>
                            <Textarea
                              placeholder="Добавьте комментарий к документу..."
                              rows={2}
                              value={
                                formData[`${elementId}_comment_${item.id}`] ||
                                ""
                              }
                              onChange={(e) => {
                                const fieldId = `${elementId}_comment_${item.id}`;
                                handleFieldChange(fieldId, e.target.value);
                              }}
                              disabled={readOnly}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </ChecklistSortableRow>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {requisites.length === 0 && checklists.length === 0 && (
        <div className="text-center py-8">
          <Workflow className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            У данного процесса нет настроенных полей для заполнения
          </p>
        </div>
      )}
    </div>
  );
}
// Approval Stages Configuration Panel for Applications
export function _DeprecatedApprovalStagesConfigPanel({
  fieldId,
  value,
  onFieldChange,
}: {
  fieldId: string;
  value: any;
  onFieldChange: (fieldId: string, value: any) => void;
}) {
  const [stages, setStages] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedStage, setSelectedStage] = useState<any>(null);
  const [draggedStage, setDraggedStage] = useState<any>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [connectionStart, setConnectionStart] = useState<any>(null);
  const [newStageData, setNewStageData] = useState({
    name: "",
    description: "",
    departments: [] as { name: string; responsible: string }[],
    executionType: "sequential" as "sequential" | "parallel",
    deadlineDays: 7,
  });
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  // Load saved stages from form data
  React.useEffect(() => {
    if (value && typeof value === "object") {
      if (value.stages) {
        setStages(value.stages);
      }
      if (value.connections) {
        setConnections(value.connections);
      }
    }
  }, [value]);

  // Auto-generate stage names
  const getNextStageName = () => {
    return `Этап ${stages.length + 1}`;
  };

  const saveToFormData = (updatedStages: any[], updatedConnections: any[]) => {
    onFieldChange(fieldId, {
      stages: updatedStages,
      connections: updatedConnections,
      status: updatedStages.length > 0 ? "configured" : "empty",
    });
  };

  const addStage = () => {
    if (!newStageData.name.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название этапа",
        variant: "destructive",
      });
      return;
    }

    const newStage = {
      id: Date.now().toString(),
      ...newStageData,
      order: stages.length + 1,
      positionX: 100 + stages.length * 200,
      positionY: 100,
    };

    const updatedStages = [...stages, newStage];
    setStages(updatedStages);
    saveToFormData(updatedStages, connections);

    setNewStageData({
      name: "",
      description: "",
      departments: [],
      executionType: "sequential",
      deadlineDays: 7,
    });
    setIsAddingStage(false);

    toast({
      title: "Этап добавлен",
      description: "Этап согласования успешно добавлен",
    });
  };

  const removeStage = (stageId: string) => {
    const updatedStages = stages.filter((stage) => stage.id !== stageId);
    const updatedConnections = connections.filter(
      (conn) => conn.sourceId !== stageId && conn.targetId !== stageId,
    );
    setStages(updatedStages);
    setConnections(updatedConnections);
    saveToFormData(updatedStages, updatedConnections);
    setSelectedStage(null);

    toast({
      title: "Этап удален",
      description: "Этап согласования удален",
    });
  };

  const handleStageClick = (e: React.MouseEvent, stage: any) => {
    e.stopPropagation();

    if (connectionStart) {
      // Complete connection
      if (connectionStart.id !== stage.id) {
        const newConnection = {
          id: Date.now().toString(),
          sourceId: connectionStart.id,
          targetId: stage.id,
          connectionType: "sequential",
        };
        const updatedConnections = [...connections, newConnection];
        setConnections(updatedConnections);
        saveToFormData(stages, updatedConnections);
      }
      setConnectionStart(null);
    } else {
      setSelectedStage(stage);
    }
  };

  const handleStageMouseDown = (e: React.MouseEvent, stage: any) => {
    e.stopPropagation();
    const rect = e.currentTarget.closest(".canvas")?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - (rect.left + stage.positionX),
        y: e.clientY - (rect.top + stage.positionY),
      });
      setDraggedStage(stage);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedStage) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    setStages((prev) =>
      prev.map((stage) =>
        stage.id === draggedStage.id
          ? {
              ...stage,
              positionX: Math.max(0, newX),
              positionY: Math.max(0, newY),
            }
          : stage,
      ),
    );
  };

  const handleMouseUp = () => {
    if (draggedStage) {
      const updatedStages = stages.map((stage) =>
        stage.id === draggedStage.id
          ? {
              ...stage,
              positionX: stage.positionX,
              positionY: stage.positionY,
            }
          : stage,
      );
      saveToFormData(updatedStages, connections);
      setDraggedStage(null);
    }
  };

  const toggleConnectionType = (connectionId: string) => {
    const updatedConnections = connections.map((conn) =>
      conn.id === connectionId
        ? {
            ...conn,
            connectionType:
              conn.connectionType === "sequential" ? "parallel" : "sequential",
          }
        : conn,
    );
    setConnections(updatedConnections);
    saveToFormData(stages, updatedConnections);
  };

  const addDepartment = () => {
    setNewStageData({
      ...newStageData,
      departments: [...newStageData.departments, { name: "", responsible: "" }],
    });
  };

  const updateDepartment = (index: number, field: string, value: string) => {
    const updatedDepartments = [...newStageData.departments];
    if (updatedDepartments[index]) {
      const currentDept = updatedDepartments[index];
      updatedDepartments[index] = {
        name: field === "name" ? value : currentDept?.name || "",
        responsible:
          field === "responsible" ? value : currentDept?.responsible || "",
      };
      setNewStageData({ ...newStageData, departments: updatedDepartments });
    }
  };
  const removeDepartment = (index: number) => {
    const updatedDepartments = newStageData.departments.filter(
      (_, i) => i !== index,
    );
    setNewStageData({ ...newStageData, departments: updatedDepartments });
  };

  const renderStage = (stage: any) => {
    return (
      <div
        key={stage.id}
        className={`absolute cursor-pointer border-2 rounded-lg p-3 bg-card text-card-foreground shadow-lg hover:shadow-xl transition-all duration-200 select-none min-w-[180px] ${
          selectedStage?.id === stage.id
            ? "ring-2 ring-primary ring-offset-2 border-primary"
            : "border-border hover:border-primary"
        } ${
          connectionStart?.id === stage.id
            ? "ring-2 ring-blue-400 ring-offset-2"
            : ""
        }`}
        style={{
          left: stage.positionX,
          top: stage.positionY,
        }}
        onMouseDown={(e) => handleStageMouseDown(e, stage)}
        onClick={(e) => handleStageClick(e, stage)}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{stage.name}</h4>
            <Badge variant="outline" className="text-xs">
              {stage.executionType === "sequential" ? "Посл." : "Пар."}
            </Badge>
          </div>
          {stage.description && (
            <p className="text-xs text-muted-foreground">{stage.description}</p>
          )}
          {stage.departments && stage.departments.length > 0 && (
            <div className="space-y-1">
              {stage.departments.map((dept: any, index: number) => (
                <div key={index} className="text-xs p-1 bg-muted rounded">
                  <div className="font-medium">{dept.name}</div>
                  {dept.responsible && (
                    <div className="text-muted-foreground">
                      {dept.responsible}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {stage.deadlineDays && (
            <div className="text-xs text-muted-foreground">
              Срок: {stage.deadlineDays} дн.
            </div>
          )}
        </div>
      </div>
    );
  };

  const isConfigured = stages.length > 0;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Процесс согласования</Badge>
          <Badge variant={isConfigured ? "default" : "outline"}>
            {isConfigured ? "Настроено" : "Требует настройки"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant={connectionStart ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (connectionStart) {
                setConnectionStart(null);
                toast({ title: "Режим соединения отключен" });
              } else {
                toast({
                  title: "Режим соединения",
                  description:
                    "Кликните на этап, затем на следующий этап для создания связи",
                });
              }
            }}
          >
            <Workflow className="w-4 h-4 mr-1" />
            {connectionStart ? "Отмена" : "Связать"}
          </Button>
          {!isAddingStage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewStageData({
                  ...newStageData,
                  name: getNextStageName(),
                });
                setIsAddingStage(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить этап
            </Button>
          )}
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="relative">
        <div
          className="canvas w-full h-96 bg-gray-100 dark:bg-gray-800 border rounded-lg relative overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={() => {
            setSelectedStage(null);
            setConnectionStart(null);
          }}
          style={{
            backgroundImage: `
              radial-gradient(circle, #9ca3af 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        >
          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((connection) => {
              const sourceStage = stages.find(
                (s) => s.id === connection.sourceId,
              );
              const targetStage = stages.find(
                (s) => s.id === connection.targetId,
              );

              if (!sourceStage || !targetStage) return null;

              const sourceX = sourceStage.positionX + 90;
              const sourceY = sourceStage.positionY + 40;
              const targetX = targetStage.positionX + 90;
              const targetY = targetStage.positionY + 40;

              return (
                <g key={connection.id}>
                  <line
                    x1={sourceX}
                    y1={sourceY}
                    x2={targetX}
                    y2={targetY}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                    className="cursor-pointer hover:stroke-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleConnectionType(connection.id);
                    }}
                  />
                  {connection.connectionType === "parallel" && (
                    <line
                      x1={sourceX}
                      y1={sourceY + 4}
                      x2={targetX}
                      y2={targetY + 4}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                      className="cursor-pointer hover:stroke-blue-600"
                    />
                  )}
                  {/* Connection label */}
                  <text
                    x={(sourceX + targetX) / 2}
                    y={(sourceY + targetY) / 2 - 10}
                    textAnchor="middle"
                    className="fill-primary text-xs font-medium"
                  >
                    {connection.connectionType === "sequential"
                      ? "Посл."
                      : "Пар."}
                  </text>
                </g>
              );
            })}

            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
              </marker>
            </defs>
          </svg>

          {/* Stages */}
          {stages.map(renderStage)}

          {/* Instructions */}
          {stages.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Workflow className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Создайте схему согласования
                </h3>
                <p className="text-sm">
                  Добавьте этапы согласования и настройте связи между ними
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-4 h-0.5 bg-primary"></div>
            <span>Последовательно</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="space-y-0.5">
              <div className="w-4 h-0.5 bg-primary"></div>
              <div className="w-4 h-0.5 bg-primary"></div>
            </div>
            <span>Параллельно</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border border-primary rounded"></div>
            <span>Кликните для выбора</span>
          </div>
        </div>
      </div>

      {/* Add new stage form */}
      {isAddingStage && (
        <Card className="p-4">
          <div className="space-y-4">
            <h5 className="font-medium">Новый этап согласования</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Название этапа *</Label>
                <Input
                  value={newStageData.name}
                  onChange={(e) =>
                    setNewStageData({ ...newStageData, name: e.target.value })
                  }
                  placeholder="Этап 1"
                />
              </div>
              <div>
                <Label className="text-sm">Срок (дни)</Label>
                <Input
                  type="number"
                  value={newStageData.deadlineDays}
                  onChange={(e) =>
                    setNewStageData({
                      ...newStageData,
                      deadlineDays: parseInt(e.target.value) || 7,
                    })
                  }
                  placeholder="7"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Описание</Label>
              <Textarea
                value={newStageData.description}
                onChange={(e) =>
                  setNewStageData({
                    ...newStageData,
                    description: e.target.value,
                  })
                }
                placeholder="Описание этапа"
                rows={2}
              />
            </div>

            {/* Departments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Согласующие подразделения</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDepartment}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить
                </Button>
              </div>
              {newStageData.departments.map((dept, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 p-2 border rounded"
                >
                  <Input
                    placeholder="Название подразделения"
                    value={dept.name}
                    onChange={(e) =>
                      updateDepartment(index, "name", e.target.value)
                    }
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ответственный"
                      value={dept.responsible}
                      onChange={(e) =>
                        updateDepartment(index, "responsible", e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDepartment(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Label className="text-sm">
                Порядок согласования внутри этапа
              </Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="executionType"
                    value="sequential"
                    checked={newStageData.executionType === "sequential"}
                    onChange={(e) =>
                      setNewStageData({
                        ...newStageData,
                        executionType: e.target.value as
                          | "sequential"
                          | "parallel",
                      })
                    }
                  />
                  <span className="text-sm">Последовательно</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="executionType"
                    value="parallel"
                    checked={newStageData.executionType === "parallel"}
                    onChange={(e) =>
                      setNewStageData({
                        ...newStageData,
                        executionType: e.target.value as
                          | "sequential"
                          | "parallel",
                      })
                    }
                  />
                  <span className="text-sm">Параллельно</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={addStage} size="sm">
                Добавить этап
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingStage(false)}
              >
                Отмена
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stage Properties Panel */}
      {selectedStage && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">
                Настройки этапа: {selectedStage.name}
              </h5>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeStage(selectedStage.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Удалить
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Название</Label>
                <Input
                  value={selectedStage.name}
                  onChange={(e) => {
                    const updatedStages = stages.map((stage) =>
                      stage.id === selectedStage.id
                        ? { ...stage, name: e.target.value }
                        : stage,
                    );
                    setStages(updatedStages);
                    setSelectedStage({
                      ...selectedStage,
                      name: e.target.value,
                    });
                    saveToFormData(updatedStages, connections);
                  }}
                />
              </div>
              <div>
                <Label className="text-sm">Срок (дни)</Label>
                <Input
                  type="number"
                  value={selectedStage.deadlineDays || 7}
                  onChange={(e) => {
                    const deadlineDays = parseInt(e.target.value) || 7;
                    const updatedStages = stages.map((stage) =>
                      stage.id === selectedStage.id
                        ? { ...stage, deadlineDays }
                        : stage,
                    );
                    setStages(updatedStages);
                    setSelectedStage({ ...selectedStage, deadlineDays });
                    saveToFormData(updatedStages, connections);
                  }}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Описание</Label>
              <Textarea
                value={selectedStage.description || ""}
                onChange={(e) => {
                  const updatedStages = stages.map((stage) =>
                    stage.id === selectedStage.id
                      ? { ...stage, description: e.target.value }
                      : stage,
                  );
                  setStages(updatedStages);
                  setSelectedStage({
                    ...selectedStage,
                    description: e.target.value,
                  });
                  saveToFormData(updatedStages, connections);
                }}
                rows={2}
              />
            </div>
            <div>
              <Label className="text-sm">Порядок согласования</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`executionType_${selectedStage.id}`}
                    value="sequential"
                    checked={selectedStage.executionType === "sequential"}
                    onChange={(e) => {
                      const updatedStages = stages.map((stage) =>
                        stage.id === selectedStage.id
                          ? { ...stage, executionType: e.target.value }
                          : stage,
                      );
                      setStages(updatedStages);
                      setSelectedStage({
                        ...selectedStage,
                        executionType: e.target.value,
                      });
                      saveToFormData(updatedStages, connections);
                    }}
                  />
                  <span className="text-sm">Последовательно</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`executionType_${selectedStage.id}`}
                    value="parallel"
                    checked={selectedStage.executionType === "parallel"}
                    onChange={(e) => {
                      const updatedStages = stages.map((stage) =>
                        stage.id === selectedStage.id
                          ? { ...stage, executionType: e.target.value }
                          : stage,
                      );
                      setStages(updatedStages);
                      setSelectedStage({
                        ...selectedStage,
                        executionType: e.target.value,
                      });
                      saveToFormData(updatedStages, connections);
                    }}
                  />
                  <span className="text-sm">Параллельно</span>
                </label>
              </div>
            </div>
          </div>
        </Card>
      )}

      {stages.length === 0 && !isAddingStage && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">Этапы согласования не настроены</p>
          <p className="text-xs mt-1">
            Добавьте этапы для настройки процесса согласования
          </p>
        </div>
      )}
    </div>
  );
}

function ApprovalStagesEditor({
  fieldId,
  value,
  onFieldChange,
}: {
  fieldId: string;
  value: any;
  onFieldChange: (fieldId: string, value: any) => void;
}) {
  type Approver = {
    id: string;
    name: string;
    email?: string;
    position?: string;
  };
  type Department = { id: string; name: string; approvers: Approver[] };
  type Stage = {
    id: string;
    name: string;
    description?: string;
    deadlineDays?: number;
    optionalDirection?: boolean;
    departments: Department[];
  };

  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;
  const [stages, setStages] = useState<Stage[]>([]);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [newStageDeadline, setNewStageDeadline] = useState<number>(7);
  const [newStageDescription, setNewStageDescription] = useState("");

  const uid = () => Math.random().toString(36).slice(2);

  React.useEffect(() => {
    if (value && typeof value === "object" && Array.isArray(value.stages)) {
      const normalized: Stage[] = (value.stages as any[]).map((s, idx) => {
        const deps = Array.isArray(s.departments)
          ? s.departments.map((d: any) => ({
              id: d.id || uid(),
              name: d.name || d.department || "Подразделение",
              approvers: Array.isArray(d.approvers)
                ? d.approvers.map((a: any) => ({
                    id: a.id || uid(),
                    name: a.name || a.responsible || "Сотрудник",
                    email: a.email || "",
                    position: a.position || "",
                  }))
                : d.responsible
                  ? [{ id: uid(), name: d.responsible as string }]
                  : [],
            }))
          : [];
        return {
          id: s.id || uid(),
          name: s.name || `Этап ${idx + 1}`,
          description: s.description || "",
          deadlineDays: s.deadlineDays || 7,
          optionalDirection: !!s.optionalDirection,
          departments: deps,
        } as Stage;
      });
      setStages(normalized);
    } else if (!value || !value.stages) {
      setStages([]);
    }
  }, [value]);

  const persist = (next: Stage[]) => {
    setStages(next);
    onFieldChange(fieldId, {
      stages: next,
      status: next.length > 0 ? "configured" : "empty",
    });
  };

  const addStage = () => {
    const name = newStageName.trim() || `Этап ${stages.length + 1}`;
    const stage: Stage = {
      id: uid(),
      name,
      description: newStageDescription.trim(),
      deadlineDays: newStageDeadline || 7,
      optionalDirection: false,
      departments: [],
    };
    persist([...stages, stage]);
    setIsAddingStage(false);
    setNewStageName("");
    setNewStageDescription("");
    setNewStageDeadline(7);
    toast({ title: "Этап добавлен" });
  };

  const removeStage = (stageId: string) => {
    persist(stages.filter((s) => s.id !== stageId));
  };

  const moveStage = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= stages.length) return;
    const next = [...stages];
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    persist(next);
  };

  const updateStage = (stageId: string, patch: Partial<Stage>) => {
    persist(stages.map((s) => (s.id === stageId ? { ...s, ...patch } : s)));
  };

  const addDepartment = (stageId: string) => {
    const next = stages.map((s) =>
      s.id === stageId
        ? {
            ...s,
            departments: [
              ...s.departments,
              { id: uid(), name: "Подразделение", approvers: [] },
            ],
          }
        : s,
    );
    persist(next);
  };

  const updateDepartment = (
    stageId: string,
    deptId: string,
    patch: Partial<Department>,
  ) => {
    const next = stages.map((s) => {
      if (s.id !== stageId) return s;
      return {
        ...s,
        departments: s.departments.map((d) =>
          d.id === deptId ? { ...d, ...patch } : d,
        ),
      };
    });
    persist(next);
  };

  const removeDepartment = (stageId: string, deptId: string) => {
    const next = stages.map((s) =>
      s.id === stageId
        ? { ...s, departments: s.departments.filter((d) => d.id !== deptId) }
        : s,
    );
    persist(next);
  };

  const moveDepartmentWithin = (
    stageId: string,
    deptIndex: number,
    dir: -1 | 1,
  ) => {
    const sIdx = stages.findIndex((s) => s.id === stageId);
    if (sIdx === -1) return;
    const stage = stages[sIdx]!;
    const t = deptIndex + dir;
    if (t < 0 || t >= stage.departments.length) return;
    const deps = [...stage.departments];
    const tmp = deps[deptIndex]!;
    deps[deptIndex] = deps[t]!;
    deps[t] = tmp;
    const next = [...stages];
    next[sIdx] = { ...stage, departments: deps };
    persist(next);
  };

  const moveDepartmentToStage = (
    fromStageId: string,
    deptId: string,
    toStageId: string,
  ) => {
    if (fromStageId === toStageId) return;
    const from = stages.find((s) => s.id === fromStageId);
    const to = stages.find((s) => s.id === toStageId);
    if (!from || !to) return;
    const dept = from.departments.find((d) => d.id === deptId);
    if (!dept) return;

    const next = stages.map((s) => {
      if (s.id === fromStageId)
        return {
          ...s,
          departments: s.departments.filter((d) => d.id !== deptId),
        };
      if (s.id === toStageId)
        return { ...s, departments: [...s.departments, dept] };
      return s;
    });
    persist(next);
  };

  const addApprover = (stageId: string, deptId: string) => {
    const next = stages.map((s) => {
      if (s.id !== stageId) return s;
      return {
        ...s,
        departments: s.departments.map((d) =>
          d.id === deptId
            ? {
                ...d,
                approvers: [...d.approvers, { id: uid(), name: "Согласующий" }],
              }
            : d,
        ),
      };
    });
    persist(next);
  };

  const updateApprover = (
    stageId: string,
    deptId: string,
    apprId: string,
    patch: Partial<Approver>,
  ) => {
    const next = stages.map((s) => {
      if (s.id !== stageId) return s;
      return {
        ...s,
        departments: s.departments.map((d) =>
          d.id === deptId
            ? {
                ...d,
                approvers: d.approvers.map((a) =>
                  a.id === apprId ? { ...a, ...patch } : a,
                ),
              }
            : d,
        ),
      };
    });
    persist(next);
  };

  const removeApprover = (stageId: string, deptId: string, apprId: string) => {
    const next = stages.map((s) => {
      if (s.id !== stageId) return s;
      return {
        ...s,
        departments: s.departments.map((d) =>
          d.id === deptId
            ? { ...d, approvers: d.approvers.filter((a) => a.id !== apprId) }
            : d,
        ),
      };
    });
    persist(next);
  };

  const moveApproverWithin = (
    stageId: string,
    deptId: string,
    index: number,
    dir: -1 | 1,
  ) => {
    const sIdx = stages.findIndex((s) => s.id === stageId);
    if (sIdx === -1) return;
    const stage = stages[sIdx]!;
    const dIdx = stage.departments.findIndex((d) => d.id === deptId);
    if (dIdx === -1) return;
    const dept = stage.departments[dIdx]!;
    const t = index + dir;
    if (t < 0 || t >= dept.approvers.length) return;
    const arr = [...dept.approvers];
    const tmp = arr[index]!;
    arr[index] = arr[t]!;
    arr[t] = tmp;
    const next = [...stages];
    next[sIdx] = {
      ...stage,
      departments: stage.departments.map((d, i) =>
        i === dIdx ? { ...d, approvers: arr } : d,
      ),
    };
    persist(next);
  };

  const moveApproverTo = (
    fromStageId: string,
    fromDeptId: string,
    apprId: string,
    toStageId: string,
    toDeptId: string,
  ) => {
    const fromStage = stages.find((s) => s.id === fromStageId);
    const toStage = stages.find((s) => s.id === toStageId);
    if (!fromStage || !toStage) return;
    const fromDept = fromStage.departments.find((d) => d.id === fromDeptId);
    const toDept = toStage.departments.find((d) => d.id === toDeptId);
    if (!fromDept || !toDept) return;
    const approver = fromDept.approvers.find((a) => a.id === apprId);
    if (!approver) return;

    const next = stages.map((s) => {
      if (s.id === fromStageId) {
        return {
          ...s,
          departments: s.departments.map((d) =>
            d.id === fromDeptId
              ? { ...d, approvers: d.approvers.filter((a) => a.id !== apprId) }
              : d,
          ),
        };
      }
      if (s.id === toStageId) {
        return {
          ...s,
          departments: s.departments.map((d) =>
            d.id === toDeptId
              ? { ...d, approvers: [...d.approvers, approver] }
              : d,
          ),
        };
      }
      return s;
    });
    persist(next);
  };

  const isConfigured = stages.length > 0;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Процесс согласования</Badge>
          <Badge variant={isConfigured ? "default" : "outline"}>
            {isConfigured ? "Настроено" : "Требует настройки"}
          </Badge>
        </div>
        {!isAddingStage && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingStage(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Добавить этап
          </Button>
        )}
      </div>

      {isAddingStage && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Название этапа</Label>
              <Input
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="Этап"
              />
            </div>
            <div>
              <Label className="text-sm">Срок (дни)</Label>
              <Input
                type="number"
                value={newStageDeadline}
                onChange={(e) =>
                  setNewStageDeadline(parseInt(e.target.value) || 7)
                }
              />
            </div>
            <div>
              <Label className="text-sm">Описание</Label>
              <Input
                value={newStageDescription}
                onChange={(e) => setNewStageDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={addStage}>
              Добавить
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddingStage(false)}
            >
              Отмена
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {stages.map((stage, sIndex) => (
          <Card key={stage.id} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="md:col-span-2">
                  <div className="text-lg font-bold">Этап {sIndex + 1}</div>
                </div>
                <div>
                  <Label className="text-xs">Срок (дни)</Label>
                  <Input
                    type="number"
                    value={stage.deadlineDays ?? 7}
                    onChange={(e) =>
                      updateStage(stage.id, {
                        deadlineDays: parseInt(e.target.value) || 7,
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`opt_${stage.id}`}
                    checked={!!stage.optionalDirection}
                    onCheckedChange={(c) =>
                      updateStage(stage.id, { optionalDirection: !!c })
                    }
                  />
                  <Label htmlFor={`opt_${stage.id}`} className="text-xs">
                    Выборное направление
                  </Label>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveStage(sIndex, -1)}
                  disabled={sIndex === 0}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveStage(sIndex, 1)}
                  disabled={sIndex === stages.length - 1}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStage(stage.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Departments */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium">
                  Согласующие подразделения
                </h5>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addDepartment(stage.id)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Добавить подразделение
                </Button>
              </div>

              <div className="space-y-2">
                {stage.departments.map((dept, dIndex) => (
                  <div
                    key={dept.id}
                    className={`${dIndex > 0 ? "border-t border-border mt-3 pt-3" : ""} py-3`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Подразделение</Label>
                          <Input
                            value={dept.name}
                            onChange={(e) =>
                              updateDepartment(stage.id, dept.id, {
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-span-2 flex items-end gap-2">
                          <select
                            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            onChange={(e) => {
                              const selectEl =
                                e.currentTarget as HTMLSelectElement;
                              const val = e.target.value as string;
                              if (!val) return;
                              moveDepartmentToStage(stage.id, dept.id, val);
                              selectEl.value = "";
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Переместить в этап...
                            </option>
                            {stages
                              .filter((s) => s.id !== stage.id)
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            moveDepartmentWithin(stage.id, dIndex, -1)
                          }
                          disabled={dIndex === 0}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            moveDepartmentWithin(stage.id, dIndex, 1)
                          }
                          disabled={dIndex === stage.departments.length - 1}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDepartment(stage.id, dept.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Approvers */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-medium">
                          Согласующие сотрудники
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addApprover(stage.id, dept.id)}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Добавить сотрудника
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {dept.approvers.map((a, aIndex) => (
                          <div
                            key={a.id}
                            className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end"
                          >
                            <Input
                              className="md:col-span-2"
                              placeholder="ФИО"
                              value={a.name}
                              onChange={(e) =>
                                updateApprover(stage.id, dept.id, a.id, {
                                  name: e.target.value,
                                })
                              }
                            />
                            <Input
                              placeholder="Email"
                              value={a.email || ""}
                              onChange={(e) =>
                                updateApprover(stage.id, dept.id, a.id, {
                                  email: e.target.value,
                                })
                              }
                            />
                            <Input
                              placeholder="Должность"
                              value={a.position || ""}
                              onChange={(e) =>
                                updateApprover(stage.id, dept.id, a.id, {
                                  position: e.target.value,
                                })
                              }
                            />
                            <div className="flex items-center gap-1 md:col-span-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  moveApproverWithin(
                                    stage.id,
                                    dept.id,
                                    aIndex,
                                    -1,
                                  )
                                }
                                disabled={aIndex === 0}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  moveApproverWithin(
                                    stage.id,
                                    dept.id,
                                    aIndex,
                                    1,
                                  )
                                }
                                disabled={aIndex === dept.approvers.length - 1}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                              <select
                                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                onChange={(e) => {
                                  const selectEl =
                                    e.currentTarget as HTMLSelectElement;
                                  const val = e.target.value as string;
                                  if (!val) return;
                                  const parts = val.split(":");
                                  const toStageId = parts[0] ?? "";
                                  const toDeptId = parts[1] ?? "";
                                  moveApproverTo(
                                    stage.id,
                                    dept.id,
                                    a.id,
                                    toStageId,
                                    toDeptId,
                                  );
                                  selectEl.value = "";
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled>
                                  Переместить в...
                                </option>
                                {stages
                                  .flatMap((s) =>
                                    s.departments.map((d) => ({
                                      sId: s.id,
                                      dId: d.id,
                                      label: `${s.name} — ${d.name}`,
                                    })),
                                  )
                                  .filter(
                                    (opt) =>
                                      !(
                                        opt.sId === stage.id &&
                                        opt.dId === dept.id
                                      ),
                                  )
                                  .map((opt) => (
                                    <option
                                      key={`${opt.sId}:${opt.dId}`}
                                      value={`${opt.sId}:${opt.dId}`}
                                    >
                                      {opt.label}
                                    </option>
                                  ))}
                              </select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeApprover(stage.id, dept.id, a.id)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {dept.approvers.length === 0 && (
                          <p className="text-xs text-muted-foreground">
                            Нет добавленных сотрудников
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {stage.departments.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Нет подразделений
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
        {stages.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Этапы согласования не настроены</p>
            <p className="text-xs mt-1">
              Добавьте этапы и укажите подразделения и согласующих
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Service Applications Screen
function ServiceApplicationsScreen() {
  const navigate = useNavigate();
  const { data: publishedSchemas = [] } = useQuery(
    ["publishedSchemas"],
    apiClient.listPublishedSchemas,
  );
  const { data: currentUser } = useQuery(["me"], apiClient.getCurrentUser);
  const { data: userApplications = [] } = useQuery(
    ["userApplications"],
    apiClient.listUserServiceApplications,
  );
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const createApplicationMutation = useMutation(
    apiClient.createServiceApplication,
    {
      onSuccess: (created) => {
        queryClient.invalidateQueries(["userApplications"]);
        toast({
          title: "Заявка создана",
          description: "Новая заявка успешно создана",
        });
        if (created?.id) {
          navigate(`/application/${created.id}`);
        }
      },
    },
  );

  const deleteApplicationMutation = useMutation(
    apiClient.deleteServiceApplication,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["userApplications"]);
        toast({
          title: "Заявка удалена",
          description: "Заявка успешно удалена",
        });
      },
    },
  );

  // Удаление схемы из списка доступных (доступно администраторам услуг)
  const deleteSchemaMutation = useMutation(apiClient.deleteProcessSchema, {
    onSuccess: () => {
      queryClient.invalidateQueries(["publishedSchemas"]);
      toast({ title: "Схема удалена", description: "Схема успешно удалена" });
    },
    onError: () => {
      toast({ title: "Не удалось удалить схему", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Edit className="w-3 h-3" />
            Черновик
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Подана
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-blue-600"
          >
            <Clock className="w-3 h-3" />В работе
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-green-600"
          >
            <CheckCircle className="w-3 h-3" />
            Завершена
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Отклонена
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Мои заявки</h1>
        <CreateServiceApplicationDialog schemas={publishedSchemas} />
      </div>

      {/* Available Services */}
      {publishedSchemas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Доступные услуги</CardTitle>
            <CardDescription>
              Опубликованные схемы процессов для создания заявок
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border divide-y">
              {publishedSchemas.map((schema) => (
                <div
                  key={schema.id}
                  className="flex items-start justify-between p-3 gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {schema.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        v{schema.version ?? 1}
                      </Badge>
                      <Badge
                        variant="default"
                        className="text-[10px] bg-green-600"
                      >
                        Опубликована
                      </Badge>
                    </div>
                    {schema.service && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Услуга: {schema.service.name}
                      </div>
                    )}
                    {schema.description && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {schema.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => {
                        navigate(`/applications/new/${schema.id}/railway`, {
                          state: {
                            title: `Заявка по схеме: ${schema.name}`,
                            description: `Заявка на оказание услуги по схеме "${schema.name}"`,
                          },
                        });
                      }}
                      disabled={createApplicationMutation.isLoading}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Создать
                    </Button>
                    {currentUser?.isServiceAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          const proceed = window.confirm(
                            `Удалить схему "${schema.name}"?`,
                          );
                          if (!proceed) return;
                          deleteSchemaMutation.mutate({ id: schema.id });
                        }}
                        disabled={deleteSchemaMutation.isLoading}
                        title="Удалить схему"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Applications */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Мои заявки</h2>
        {userApplications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-5 h-5" />
                  {application.title}
                </CardTitle>
                {getStatusBadge(application.status)}
              </div>
              <CardDescription>
                Схема: {application.schema.name}
                {application.schema.service && (
                  <> • Услуга: {application.schema.service.name}</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {application.description && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Описание:</p>
                  <p className="text-sm text-muted-foreground">
                    {application.description}
                  </p>
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>
                  Создана:{" "}
                  {new Date(application.createdAt).toLocaleDateString("ru-RU")}
                </span>
                {application.currentStage && (
                  <span>• Текущий этап: {application.currentStage}</span>
                )}
                {/* Show current process status hint if available */}
                {(() => {
                  try {
                    const elements = ((application as any).schema as any)
                      ?.elements as
                      | Array<{ elementType: string; properties?: string }>
                      | undefined;
                    const processWithStatus = (elements ?? []).find((el) => {
                      if (el.elementType !== "PROCESS") return false;
                      try {
                        const props = (
                          el.properties
                            ? JSON.parse(el.properties)
                            : ({} as any)
                        ) as any;
                        return !!props.approvalStatus;
                      } catch {
                        return false;
                      }
                    });
                    if (!processWithStatus)
                      return <span>• Статус: Статуса нет</span>;
                    let label: string | undefined;
                    try {
                      const props = (
                        processWithStatus.properties
                          ? JSON.parse(processWithStatus.properties)
                          : ({} as any)
                      ) as any;
                      label = props.approvalStatus as string | undefined;
                    } catch {}
                    if (!label || !String(label).trim())
                      return <span>• Статус: Статуса нет</span>;
                    return <span>• Статус: {label}</span>;
                  } catch {
                    return <span>• Статус: Статуса нет</span>;
                  }
                })()}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              {application.status === "DRAFT" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate(`/application/${application.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Заполнить заявку
                </Button>
              )}
              {application.status !== "DRAFT" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/application/${application.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Просмотреть
                </Button>
              )}
              {application.status === "DRAFT" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    deleteApplicationMutation.mutate({ id: application.id })
                  }
                  disabled={deleteApplicationMutation.isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
        {userApplications.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Workflow className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                У вас пока нет созданных заявок
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Create Service Application Dialog
function CreateServiceApplicationDialog({ schemas }: { schemas: any[] }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    schemaId: "",
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const createMutation = useMutation(apiClient.createServiceApplication, {
    onSuccess: (created) => {
      queryClient.invalidateQueries(["userApplications"]);
      setOpen(false);
      setFormData({ title: "", description: "", schemaId: "" });
      toast({
        title: "Заявка создана",
        description: "Новая заявка успешно создана",
      });
      if (created?.id) {
        navigate(`/application/${created.id}`);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.schemaId) return;
    navigate(`/applications/new/${formData.schemaId}/railway`, {
      state: { title: formData.title, description: formData.description },
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Создать заявку
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать заявку на услугу</DialogTitle>
          <DialogDescription>
            Создать новую заявку по опубликованной схеме процесса
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название заявки</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Введите название заявки"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schema">Схема процесса</Label>
            <select
              id="schema"
              value={formData.schemaId}
              onChange={(e) =>
                setFormData({ ...formData, schemaId: e.target.value })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Выберите схему</option>
              {schemas.map((schema) => (
                <option key={schema.id} value={schema.id}>
                  {schema.name}
                  {schema.service && ` (${schema.service.name})`}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Описание заявки (необязательно)"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isLoading ||
                !formData.title.trim() ||
                !formData.schemaId
              }
            >
              {createMutation.isLoading ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SimpleBusinessProcessEditor({
  processId,
  onBack,
}: {
  processId: string;
  onBack: () => void;
}) {
  const { data: businessProcessTemplate } = useQuery(
    ["businessProcessTemplate", processId],
    () => apiClient.getBusinessProcessTemplateById({ id: processId }),
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requisites: [] as any[],
  });
  const [editingRequisite, setEditingRequisite] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  // Обновляем form data когда загружаются данные
  useEffect(() => {
    if (businessProcessTemplate) {
      setFormData({
        name: businessProcessTemplate.name,
        description: businessProcessTemplate.description || "",
        requisites: businessProcessTemplate.requisites || [],
      });
    }
  }, [businessProcessTemplate]);

  const updateBusinessProcessTemplate = useMutation(
    apiClient.updateBusinessProcessTemplate,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["businessProcessTemplates"]);
        queryClient.invalidateQueries(["businessProcessTemplate", processId]);
        toast({
          title: "Шаблон бизнес-процесса обновлен",
          description: "Изменения успешно сохранены",
        });
      },
    },
  );

  const handleSave = () => {
    updateBusinessProcessTemplate.mutate({
      id: processId,
      name: formData.name,
      description: formData.description,
      requisites: formData.requisites,
    });
  };

  const addRequisite = () => {
    const newRequisite = {
      name: `requisite_${formData.requisites.length + 1}`,
      label: "Новый реквизит",
      fieldType: "text",
      isRequired: false,
      placeholder: "",
      order: formData.requisites.length + 1,
    };
    setFormData({
      ...formData,
      requisites: [...formData.requisites, newRequisite],
    });
    setEditingRequisite(formData.requisites.length);
  };

  const updateRequisite = (index: number, updates: any) => {
    const updatedRequisites = [...formData.requisites];
    updatedRequisites[index] = { ...updatedRequisites[index], ...updates };
    setFormData({ ...formData, requisites: updatedRequisites });
  };

  const removeRequisite = (index: number) => {
    const updatedRequisites = formData.requisites.filter((_, i) => i !== index);
    setFormData({ ...formData, requisites: updatedRequisites });
    if (editingRequisite === index) {
      setEditingRequisite(null);
    }
  };

  const moveRequisite = (index: number, direction: "up" | "down") => {
    const updatedRequisites = [...formData.requisites];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < updatedRequisites.length) {
      [updatedRequisites[index], updatedRequisites[targetIndex]] = [
        updatedRequisites[targetIndex],
        updatedRequisites[index],
      ];

      // Обновляем порядок
      updatedRequisites[index].order = index + 1;
      updatedRequisites[targetIndex].order = targetIndex + 1;

      setFormData({ ...formData, requisites: updatedRequisites });
    }
  };

  if (!businessProcessTemplate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Загрузка шаблона бизнес-процесса...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Button>
          <h1 className="text-3xl font-bold">
            Редактор шаблона бизнес-процесса
          </h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateBusinessProcessTemplate.isLoading}
        >
          {updateBusinessProcessTemplate.isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Сохранить
        </Button>
      </div>

      {/* Основная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Реквизиты */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Реквизиты процесса</CardTitle>
              <CardDescription>
                Настройте поля формы, которые будут доступны при создании заявки
              </CardDescription>
            </div>
            <Button onClick={addRequisite} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Добавить реквизит
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.requisites.map((requisite, index) => (
              <div key={index} className="border rounded-lg p-4">
                {editingRequisite === index ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Название поля</Label>
                        <Input
                          value={requisite.name}
                          onChange={(e) =>
                            updateRequisite(index, { name: e.target.value })
                          }
                          placeholder="field_name"
                        />
                      </div>
                      <div>
                        <Label>Отображаемое название</Label>
                        <Input
                          value={requisite.label}
                          onChange={(e) =>
                            updateRequisite(index, { label: e.target.value })
                          }
                          placeholder="Отображаемое название"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Тип поля</Label>
                        <Select
                          value={requisite.fieldType}
                          onValueChange={(value) =>
                            updateRequisite(index, { fieldType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Текст</SelectItem>
                            <SelectItem value="textarea">
                              Многострочный текст
                            </SelectItem>
                            <SelectItem value="number">Число</SelectItem>
                            <SelectItem value="date">Дата</SelectItem>
                            <SelectItem value="select">
                              Список выбора
                            </SelectItem>
                            <SelectItem value="checkbox">Флажок</SelectItem>
                            <SelectItem value="approval">
                              Согласование
                            </SelectItem>
                            <SelectItem value="file">Файл</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required-${index}`}
                          checked={requisite.isRequired}
                          disabled={requisite.fieldType === "label"}
                          onCheckedChange={(checked) =>
                            updateRequisite(index, { isRequired: !!checked })
                          }
                        />
                        <Label
                          htmlFor={`required-${index}`}
                          className={`${requisite.fieldType === "label" ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          Обязательное поле
                        </Label>
                      </div>
                    </div>
                    <div>
                      <Label>Подсказка</Label>
                      <Input
                        value={requisite.placeholder}
                        onChange={(e) =>
                          updateRequisite(index, {
                            placeholder: e.target.value,
                          })
                        }
                        placeholder="Подсказка для пользователя"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => setEditingRequisite(null)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Готово
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRequisite(null)}
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        {requisite.fieldType === "text" && (
                          <Type className="w-4 h-4 text-blue-600" />
                        )}
                        {requisite.fieldType === "textarea" && (
                          <AlignLeft className="w-4 h-4 text-blue-600" />
                        )}
                        {requisite.fieldType === "number" && (
                          <Hash className="w-4 h-4 text-blue-600" />
                        )}
                        {requisite.fieldType === "date" && (
                          <Calendar className="w-4 h-4 text-blue-600" />
                        )}
                        {requisite.fieldType === "select" && (
                          <List className="w-4 h-4 text-blue-600" />
                        )}
                        {requisite.fieldType === "checkbox" && (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        )}
                        {requisite.fieldType === "approval" && (
                          <UserCheck className="w-4 h-4 text-blue-600" />
                        )}
                        {requisite.fieldType === "file" && (
                          <FileText className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{requisite.label}</h4>
                        <p className="text-sm text-muted-foreground">
                          {requisite.name} • {requisite.fieldType}
                          {requisite.isRequired && " • обязательное"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveRequisite(index, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveRequisite(index, "down")}
                        disabled={index === formData.requisites.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRequisite(index)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequisite(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {formData.requisites.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Нет настроенных реквизитов</p>
                <p className="text-sm">
                  Добавьте реквизиты для создания формы заявки
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 2,
      // Prevent queries from running too frequently
      refetchInterval: false,
      refetchIntervalInBackground: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
function RequisitesLibrary({ isActive = false }: { isActive?: boolean }) {
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const debouncedSetSearch = React.useMemo(
    () => debounce((v: string) => setSearch(v), 300),
    [],
  );
  const { data: templates = [], isFetching } = useQuery(
    ["requisiteTemplates", search.trim() ? search : "__all__"],
    () =>
      apiClient.listRequisiteTemplates(
        search.trim() ? { query: search } : undefined,
      ),
    { enabled: !!isActive, refetchOnMount: false },
  );

  const [openCreate, setOpenCreate] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    label: "",
    fieldType: "text",
    isRequired: false,
    placeholder: "",
    optionsText: "",
    allowMultiple: false,
  });

  // Inline edit state for an existing template
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({
    name: "",
    label: "",
    fieldType: "text",
    isRequired: false,
    placeholder: "",
    optionsText: "",
    allowMultiple: false,
  });

  const createMutation = useMutation(apiClient.createRequisiteTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(["requisiteTemplates"]);
      setOpenCreate(false);
      setForm({
        name: "",
        label: "",
        fieldType: "text",
        isRequired: false,
        placeholder: "",
        optionsText: "",
        allowMultiple: false,
      });
      toast({ title: "Шаблон реквизита сохранён" });
    },
  });
  const updateMutation = useMutation(apiClient.updateRequisiteTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(["requisiteTemplates"]);
      toast({ title: "Шаблон обновлён" });
    },
  });
  const deleteMutation = useMutation(apiClient.deleteRequisiteTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(["requisiteTemplates"]);
      toast({ title: "Шаблон скрыт" });
    },
  });

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.label.trim()) return;
    const options =
      form.fieldType === "select"
        ? form.optionsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;
    createMutation.mutate({
      name: form.name,
      label: form.label,
      fieldType: form.fieldType,
      isRequired: form.isRequired,
      placeholder: form.placeholder || undefined,
      options,
      allowMultiple: form.fieldType === "select" ? form.allowMultiple : false,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Поиск по названию или подписи"
          onChange={(e) => debouncedSetSearch(e.target.value)}
        />
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Новый шаблон
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать шаблон реквизита</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitCreate} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Системное имя</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="naprimer_service_name"
                  />
                </div>
                <div>
                  <Label className="text-sm">Подпись</Label>
                  <Input
                    value={form.label}
                    onChange={(e) =>
                      setForm({ ...form, label: e.target.value })
                    }
                    placeholder="Наименование услуги"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm">Тип</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.fieldType}
                    onChange={(e) =>
                      setForm({ ...form, fieldType: e.target.value })
                    }
                  >
                    <option value="text">Текст</option>
                    <option value="email">Email</option>
                    <option value="phone">Телефон</option>
                    <option value="date">Дата</option>
                    <option value="number">Число</option>
                    <option value="textarea">Многострочный текст</option>
                    <option value="select">Список</option>
                    <option value="file">Файл</option>
                    <option value="approval">Согласование</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isRequired}
                    onChange={(e) =>
                      setForm({ ...form, isRequired: e.target.checked })
                    }
                  />
                  Обязательное
                </label>
                {form.fieldType === "select" && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.allowMultiple}
                      onChange={(e) =>
                        setForm({ ...form, allowMultiple: e.target.checked })
                      }
                    />
                    Множественный выбор
                  </label>
                )}
              </div>
              {form.fieldType === "select" && (
                <div>
                  <Label className="text-sm">
                    Варианты (по одному в строке)
                  </Label>
                  <Textarea
                    rows={3}
                    value={form.optionsText}
                    onChange={(e) =>
                      setForm({ ...form, optionsText: e.target.value })
                    }
                  />
                </div>
              )}
              <div>
                <Label className="text-sm">Подсказка</Label>
                <Input
                  value={form.placeholder}
                  onChange={(e) =>
                    setForm({ ...form, placeholder: e.target.value })
                  }
                  placeholder="Введите значение..."
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setOpenCreate(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isLoading ||
                    !form.name.trim() ||
                    !form.label.trim()
                  }
                >
                  Сохранить
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Шаблоны реквизитов</CardTitle>
          <CardDescription>
            Список для быстрого повтора в процессах
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="text-sm text-muted-foreground">Загрузка...</div>
          ) : templates.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Пока нет шаблонов
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((t: any) => (
                <div key={t.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">
                        {t.label}{" "}
                        <span className="text-muted-foreground">
                          ({t.name})
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Тип: {t.fieldType}
                        {t.isRequired ? " • обязательный" : ""}
                        {t.allowMultiple ? " • множественный" : ""}
                      </div>
                      {t.placeholder && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Подсказка: {t.placeholder}
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-2 flex-col md:flex-row md:items-center">
                      <div className="flex items-center gap-2">
                        {editingId === t.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                const options =
                                  editForm.fieldType === "select"
                                    ? editForm.optionsText
                                        .split("\n")
                                        .map((s) => s.trim())
                                        .filter(Boolean)
                                    : undefined;
                                updateMutation.mutate({
                                  id: t.id,
                                  name: editForm.name,
                                  label: editForm.label,
                                  fieldType: editForm.fieldType,
                                  isRequired: editForm.isRequired,
                                  placeholder:
                                    editForm.placeholder || undefined,
                                  options,
                                  allowMultiple:
                                    editForm.fieldType === "select"
                                      ? editForm.allowMultiple
                                      : false,
                                });
                                setEditingId(null);
                              }}
                            >
                              Сохранить
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              Отмена
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              let optionsText = "";
                              try {
                                optionsText = t.options
                                  ? (
                                      JSON.parse(
                                        t.options as string,
                                      ) as string[]
                                    ).join("\n")
                                  : "";
                              } catch {}
                              setEditForm({
                                name: t.name || "",
                                label: t.label || "",
                                fieldType: t.fieldType || "text",
                                isRequired: !!t.isRequired,
                                placeholder: t.placeholder || "",
                                optionsText,
                                allowMultiple: !!t.allowMultiple,
                              });
                              setEditingId(t.id);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" /> Редактировать
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate({ id: t.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {editingId === t.id && (
                        <div className="w-full max-w-xl mt-2 p-3 border rounded">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Системное имя</Label>
                              <Input
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Подпись</Label>
                              <Input
                                value={editForm.label}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    label: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end mt-2">
                            <div>
                              <Label className="text-xs">Тип</Label>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={editForm.fieldType}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    fieldType: e.target.value,
                                  })
                                }
                              >
                                <option value="text">Текст</option>
                                <option value="email">Email</option>
                                <option value="phone">Телефон</option>
                                <option value="date">Дата</option>
                                <option value="number">Число</option>
                                <option value="textarea">
                                  Многострочный текст
                                </option>
                                <option value="select">Список</option>
                                <option value="file">Файл</option>
                                <option value="approval">Согласование</option>
                              </select>
                            </div>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={editForm.isRequired}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    isRequired: e.target.checked,
                                  })
                                }
                              />
                              Обязательное
                            </label>
                            {editForm.fieldType === "select" && (
                              <label className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={editForm.allowMultiple}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      allowMultiple: e.target.checked,
                                    })
                                  }
                                />
                                Множественный выбор
                              </label>
                            )}
                          </div>
                          <div className="mt-2">
                            <Label className="text-xs">Подсказка</Label>
                            <Input
                              value={editForm.placeholder}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  placeholder: e.target.value,
                                })
                              }
                            />
                          </div>
                          {editForm.fieldType === "select" && (
                            <div className="mt-2">
                              <Label className="text-xs">
                                Значения списка (по одному в строке)
                              </Label>
                              <Textarea
                                rows={3}
                                value={editForm.optionsText}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    optionsText: e.target.value,
                                  })
                                }
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InlineRename({
  value,
  onSubmit,
}: {
  value: string;
  onSubmit: (v: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [local, setLocal] = React.useState(value);
  React.useEffect(() => setLocal(value), [value]);
  return editing ? (
    <div className="flex items-center gap-2">
      <Input
        className="w-40"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
      <Button
        size="sm"
        onClick={() => {
          onSubmit(local.trim());
          setEditing(false);
        }}
      >
        Сохранить
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setLocal(value);
          setEditing(false);
        }}
      >
        Отмена
      </Button>
    </div>
  ) : (
    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
      Редактировать
    </Button>
  );
}

function PrintFormLibrary({ isActive = false }: { isActive?: boolean }) {
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const debouncedSetSearch = React.useMemo(
    () => debounce((v: string) => setSearch(v), 300),
    [],
  );

  const { data: templates = [], isFetching } = useQuery(
    ["printFormTemplates", search.trim() ? search : "__all__"],
    () =>
      apiClient.listPrintFormTemplates(
        search.trim() ? { query: search } : undefined,
      ),
    { enabled: !!isActive, refetchOnMount: false },
  );

  const updateMutation = useMutation(apiClient.updatePrintFormTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(["printFormTemplates"]);
      toast({ title: "Шаблон обновлён" });
    },
    onError: (e: any) =>
      toast({
        title: "Ошибка",
        description: e?.message || "Не удалось обновить шаблон",
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation(apiClient.deletePrintFormTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(["printFormTemplates"]);
      toast({ title: "Шаблон скрыт" });
    },
    onError: (e: any) =>
      toast({
        title: "Ошибка",
        description: e?.message || "Не удалось скрыть шаблон",
        variant: "destructive",
      }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Поиск по названию или имени файла"
          onChange={(e) => debouncedSetSearch(e.target.value)}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Шаблоны печатных форм</CardTitle>
          <CardDescription>
            Сохранённые формы, доступные для повторного использования
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="text-sm text-muted-foreground">Загрузка...</div>
          ) : templates.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Пока нет шаблонов печатных форм
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((t: any) => {
                let mappingsCount = 0;
                try {
                  const arr = t.mappings
                    ? (JSON.parse(t.mappings as string) as any[])
                    : [];
                  mappingsCount = Array.isArray(arr) ? arr.length : 0;
                } catch {}
                return (
                  <div
                    key={t.id}
                    className="p-3 border rounded-lg flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {t.label}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {t.templateName} • сопоставлений: {mappingsCount}
                      </div>
                      {t.templateUrl && (
                        <a
                          className="text-xs underline"
                          href={t.templateUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Просмотреть шаблон
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <InlineRename
                        value={t.label || ""}
                        onSubmit={(newVal) =>
                          updateMutation.mutate({ id: t.id, label: newVal })
                        }
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate({ id: t.id })}
                        disabled={deleteMutation.isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ChecklistTemplatesLibrary({
  isActive = false,
}: {
  isActive?: boolean;
}) {
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const debouncedSetSearch = React.useMemo(
    () => debounce((v: string) => setSearch(v), 300),
    [],
  );

  const { data: templates = [], isFetching } = useQuery(
    ["checklistTemplates", search.trim() ? search : "__all__"],
    () =>
      apiClient.listChecklistTemplates(
        search.trim() ? { query: search } : undefined,
      ),
    { enabled: !!isActive, refetchOnMount: false },
  );

  const [openCreate, setOpenCreate] = React.useState(false);
  const [form, setForm] = React.useState({
    label: "",
    description: "",
    isRequired: true,
    allowDocuments: true,
    allowComments: true,
    fileTypesText: "",
    maxFileSize: "",
    order: 0,
    items: [] as Array<{
      name: string;
      description?: string;
      isRequired: boolean;
      allowDocuments: boolean;
      allowComments: boolean;
      fileTypesText: string;
      maxFileSize?: string;
      order?: number;
    }>,
  });

  const createMutation = useMutation(apiClient.createChecklistTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(["checklistTemplates"]);
      setOpenCreate(false);
      setForm({
        label: "",
        description: "",
        isRequired: true,
        allowDocuments: true,
        allowComments: true,
        fileTypesText: "",
        maxFileSize: "",
        order: 0,
        items: [],
      });
      toast({ title: "Шаблон чек‑листа сохранён" });
    },
  });

  // Export / Import draft items via Excel
  const exportDraftMutation = useMutation(
    apiClient.exportChecklistDraftToExcel,
    {
      onSuccess: (res: any) => {
        if (res?.url) window.open(res.url, "_blank");
        toast({
          title: "Экспорт выполнен",
          description: `Строк: ${res?.count ?? 0}`,
        });
      },
      onError: (e: any) =>
        toast({
          title: "Не удалось экспортировать",
          description: e?.message || "Ошибка экспорта",
          variant: "destructive",
        }),
    },
  );

  const importDraftMutation = useMutation(
    apiClient.importChecklistDraftFromExcel,
    {
      onSuccess: (res: any) => {
        const items = Array.isArray(res?.items) ? res.items : [];
        setForm((prev) => ({
          ...prev,
          items: items.map((it: any, idx: number) => ({
            name: it.name,
            description: it.description || "",
            isRequired: !!it.isRequired,
            allowDocuments: it.allowDocuments !== false,
            allowComments: it.allowComments !== false,
            fileTypesText: Array.isArray(it.fileTypes)
              ? it.fileTypes.join(", ")
              : "",
            maxFileSize:
              typeof it.maxFileSize === "number" ? String(it.maxFileSize) : "",
            order: typeof it.order === "number" ? it.order : idx,
          })),
        }));
        toast({
          title: "Импорт выполнен",
          description: `Импортировано: ${items.length}`,
        });
      },
      onError: (e: any) =>
        toast({
          title: "Не удалось импортировать",
          description: e?.message || "Проверьте файл XLSX",
          variant: "destructive",
        }),
    },
  );

  const handleExportDraft = () => {
    const itemsPayload = (form.items || []).map((it: any, idx: number) => {
      const fileTypes = (it.fileTypesText || "")
        .split(/[,,\n;]/)
        .map((s: string) => s.trim())
        .filter(Boolean);
      return {
        name: it.name,
        description: it.description || undefined,
        isRequired: !!it.isRequired,
        allowDocuments: it.allowDocuments !== false,
        allowComments: it.allowComments !== false,
        fileTypes: fileTypes.length ? fileTypes : undefined,
        maxFileSize: it.maxFileSize
          ? parseInt(String(it.maxFileSize))
          : undefined,
        order: typeof it.order === "number" ? it.order : idx,
      };
    });
    exportDraftMutation.mutate({ items: itemsPayload });
  };

  const handleImportDraft = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const base64 = await encodeFileAsBase64DataURL(file);
      if (!base64) {
        toast({ title: "Файл слишком большой" });
        return;
      }
      importDraftMutation.mutate({ base64 });
    };
    input.click();
  };
  const updateMutation = useMutation(apiClient.updateChecklistTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(["checklistTemplates"]);
      toast({ title: "Шаблон обновлён" });
    },
  });
  const exportMutation = useMutation(apiClient.exportChecklistTemplateToExcel, {
    onSuccess: (res: any) => {
      if (res?.url) {
        window.open(res.url, "_blank");
      }
      toast({
        title: "Экспорт выполнен",
        description: `Строк: ${res?.count ?? 0}`,
      });
    },
  });
  const importMutation = useMutation(
    apiClient.importChecklistTemplateFromExcel,
    {
      onSuccess: (res: any) => {
        queryClient.invalidateQueries(["checklistTemplates"]);
        toast({
          title: "Импорт выполнен",
          description: `Импортировано: ${res?.imported ?? 0}`,
        });
      },
    },
  );
  const deleteMutation = useMutation(apiClient.deleteChecklistTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(["checklistTemplates"]);
      toast({ title: "Шаблон скрыт" });
    },
  });

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) return;
    const fileTypes = (form.fileTypesText || "")
      .split(/[,,\n;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const maxFileSize = form.maxFileSize
      ? parseInt(String(form.maxFileSize))
      : undefined;

    const itemsPayload = (form.items || []).map((it, idx) => {
      const itFileTypes = ((it as any).fileTypesText || "")
        .split(/[,,\n;]/)
        .map((s) => s.trim())
        .filter(Boolean);
      return {
        name: it.name,
        description: it.description || undefined,
        isRequired: !!it.isRequired,
        allowDocuments: !!it.allowDocuments,
        allowComments: !!it.allowComments,
        fileTypes: itFileTypes.length ? itFileTypes : undefined,
        maxFileSize: (it as any).maxFileSize
          ? parseInt(String((it as any).maxFileSize))
          : undefined,
        order: typeof (it as any).order === "number" ? (it as any).order : idx,
      };
    });

    createMutation.mutate({
      label: form.label,
      description: form.description || undefined,
      isRequired: form.isRequired,
      allowDocuments: form.allowDocuments,
      allowComments: form.allowComments,
      fileTypes: fileTypes.length ? fileTypes : undefined,
      maxFileSize,
      order: form.order || 0,
      items: itemsPayload,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Поиск по названию"
          onChange={(e) => debouncedSetSearch(e.target.value)}
        />
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Новый шаблон
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать шаблон чек‑листа</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitCreate} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Название</Label>
                  <Input
                    value={form.label}
                    onChange={(e) =>
                      setForm({ ...form, label: e.target.value })
                    }
                    placeholder="Например: Уставные документы"
                  />
                </div>
                <div>
                  <Label className="text-sm">Порядок</Label>
                  <Input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm">Описание</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isRequired}
                    onChange={(e) =>
                      setForm({ ...form, isRequired: e.target.checked })
                    }
                  />
                  Обязательный
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.allowDocuments}
                    onChange={(e) =>
                      setForm({ ...form, allowDocuments: e.target.checked })
                    }
                  />
                  Документы
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.allowComments}
                    onChange={(e) =>
                      setForm({ ...form, allowComments: e.target.checked })
                    }
                  />
                  Комментарии
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">
                    Типы файлов (через запятую/строки)
                  </Label>
                  <Textarea
                    rows={2}
                    value={form.fileTypesText}
                    onChange={(e) =>
                      setForm({ ...form, fileTypesText: e.target.value })
                    }
                    placeholder="pdf, jpg, png"
                  />
                </div>
                <div>
                  <Label className="text-sm">Макс. размер (МБ)</Label>
                  <Input
                    type="number"
                    value={form.maxFileSize}
                    onChange={(e) =>
                      setForm({ ...form, maxFileSize: e.target.value })
                    }
                    placeholder="Например: 25"
                  />
                </div>
              </div>

              {/* Конструктор пунктов шаблона */}
              <div className="space-y-3 border-t pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Пункты чек‑листа</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleExportDraft}
                      disabled={exportDraftMutation.isLoading}
                    >
                      Экспорт
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleImportDraft}
                      disabled={importDraftMutation.isLoading}
                    >
                      Импорт
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setForm((prev: any) => ({
                          ...prev,
                          items: [
                            ...(prev.items || []),
                            {
                              name: "Новый пункт",
                              description: "",
                              isRequired: true,
                              allowDocuments: true,
                              allowComments: true,
                              fileTypesText: "",
                              maxFileSize: "",
                            },
                          ],
                        }))
                      }
                    >
                      <Plus className="w-4 h-4 mr-1" /> Добавить пункт
                    </Button>
                  </div>
                </div>

                {(form.items || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Пока нет пунктов
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(form.items || []).map((it: any, index: number) => (
                      <Card key={index} className="p-3">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
                          <div className="md:col-span-3">
                            <Label className="text-xs">Название</Label>
                            <Input
                              value={it.name}
                              onChange={(e) =>
                                setForm((prev: any) => {
                                  const items = [...(prev.items || [])];
                                  items[index] = {
                                    ...items[index],
                                    name: e.target.value,
                                  };
                                  return { ...prev, items };
                                })
                              }
                              placeholder="Название пункта"
                            />
                          </div>
                          <div className="md:col-span-5">
                            <Label className="text-xs">Описание</Label>
                            <Textarea
                              rows={2}
                              value={it.description || ""}
                              onChange={(e) =>
                                setForm((prev: any) => {
                                  const items = [...(prev.items || [])];
                                  items[index] = {
                                    ...items[index],
                                    description: e.target.value,
                                  };
                                  return { ...prev, items };
                                })
                              }
                              placeholder="Пояснение к пункту"
                            />
                          </div>
                          <div className="md:col-span-4 grid grid-cols-2 gap-2">
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={!!it.isRequired}
                                onChange={(e) =>
                                  setForm((prev: any) => {
                                    const items = [...(prev.items || [])];
                                    items[index] = {
                                      ...items[index],
                                      isRequired: e.target.checked,
                                    };
                                    return { ...prev, items };
                                  })
                                }
                              />
                              Обязательный
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={!!it.allowDocuments}
                                onChange={(e) =>
                                  setForm((prev: any) => {
                                    const items = [...(prev.items || [])];
                                    items[index] = {
                                      ...items[index],
                                      allowDocuments: e.target.checked,
                                    };
                                    return { ...prev, items };
                                  })
                                }
                              />
                              Документы
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={!!it.allowComments}
                                onChange={(e) =>
                                  setForm((prev: any) => {
                                    const items = [...(prev.items || [])];
                                    items[index] = {
                                      ...items[index],
                                      allowComments: e.target.checked,
                                    };
                                    return { ...prev, items };
                                  })
                                }
                              />
                              Комментарии
                            </label>
                          </div>
                          <div className="md:col-span-4">
                            <Label className="text-xs">Типы файлов</Label>
                            <Textarea
                              rows={2}
                              value={it.fileTypesText || ""}
                              onChange={(e) =>
                                setForm((prev: any) => {
                                  const items = [...(prev.items || [])];
                                  items[index] = {
                                    ...items[index],
                                    fileTypesText: e.target.value,
                                  };
                                  return { ...prev, items };
                                })
                              }
                              placeholder="pdf, jpg, png"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-xs">Макс. размер (МБ)</Label>
                            <Input
                              type="number"
                              value={it.maxFileSize || ""}
                              onChange={(e) =>
                                setForm((prev: any) => {
                                  const items = [...(prev.items || [])];
                                  items[index] = {
                                    ...items[index],
                                    maxFileSize: e.target.value,
                                  };
                                  return { ...prev, items };
                                })
                              }
                            />
                          </div>
                          <div className="md:col-span-1">
                            <Label className="text-xs">Порядок</Label>
                            <Input
                              type="number"
                              value={
                                typeof it.order === "number" ? it.order : index
                              }
                              onChange={(e) =>
                                setForm((prev: any) => {
                                  const items = [...(prev.items || [])];
                                  items[index] = {
                                    ...items[index],
                                    order: parseInt(e.target.value) || 0,
                                  };
                                  return { ...prev, items };
                                })
                              }
                            />
                          </div>
                          <div className="md:col-span-12 flex items-center gap-2 justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setForm((prev: any) => {
                                  const items = [...(prev.items || [])];
                                  items.splice(index, 1);
                                  return { ...prev, items };
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setOpenCreate(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isLoading || !form.label.trim()}
                >
                  Сохранить
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Шаблоны чек‑листов</CardTitle>
          <CardDescription>
            Повторно используемые пункты для документов и комментариев
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="text-sm text-muted-foreground">Загрузка...</div>
          ) : templates.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Пока нет шаблонов
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((t: any) => (
                <div
                  key={t.id}
                  className="p-3 border rounded-lg flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {t.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.isRequired ? "Обязательный" : "Необязательный"} •{" "}
                      {t.allowDocuments ? "Документы" : "Без документов"} •{" "}
                      {t.allowComments ? "Комментарий" : "Без комментария"}
                    </div>
                    {t.description && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {t.description}
                      </div>
                    )}
                    {(() => {
                      let types: string[] = [];
                      try {
                        types = t.fileTypes
                          ? (JSON.parse(t.fileTypes) as string[])
                          : [];
                      } catch {}
                      return types.length ? (
                        <div className="text-xs text-muted-foreground">
                          Типы: {types.join(", ")}
                        </div>
                      ) : null;
                    })()}
                    {t.maxFileSize && (
                      <div className="text-xs text-muted-foreground">
                        Макс. размер: {t.maxFileSize} МБ
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden md:inline-block">
                      Пунктов: {t._count?.items ?? 0}
                    </span>
                    <InlineRename
                      value={t.label || ""}
                      onSubmit={(newVal) =>
                        updateMutation.mutate({ id: t.id, label: newVal })
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        exportMutation.mutate({ templateId: t.id })
                      }
                    >
                      Экспорт
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".xlsx,.xls";
                        input.onchange = async () => {
                          const file = input.files?.[0];
                          if (!file) return;
                          const b64 = await encodeFileAsBase64DataURL(file);
                          if (!b64) return;
                          importMutation.mutate({
                            templateId: t.id,
                            base64: b64,
                          });
                        };
                        input.click();
                      }}
                    >
                      Импорт
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate({ id: t.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationTemplatesLibrary({
  isActive = false,
}: {
  isActive?: boolean;
}) {
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const debouncedSetSearch = React.useMemo(
    () => debounce((v: string) => setSearch(v), 300),
    [],
  );

  const { data: templates = [], isFetching } = useQuery(
    ["notificationTemplates", search.trim() ? search : "__all__"],
    () =>
      apiClient.listNotificationTemplates(
        search.trim() ? { query: search } : undefined,
      ),
    { enabled: !!isActive, refetchOnMount: false },
  );

  const [openCreate, setOpenCreate] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    trigger: "on_enter",
    template: "",
    recipientsText: "",
  });

  const createMutation = useMutation(apiClient.createNotificationTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(["notificationTemplates"]);
      setOpenCreate(false);
      setForm({
        name: "",
        trigger: "on_enter",
        template: "",
        recipientsText: "",
      });
      toast({ title: "Шаблон уведомления сохранён" });
    },
  });
  const updateMutation = useMutation(apiClient.updateNotificationTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(["notificationTemplates"]);
      toast({ title: "Шаблон обновлён" });
    },
  });
  const deleteMutation = useMutation(apiClient.deleteNotificationTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(["notificationTemplates"]);
      toast({ title: "Шаблон скрыт" });
    },
  });

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.template.trim()) return;
    const recipients = (form.recipientsText || "")
      .split(/[,\n;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    createMutation.mutate({
      name: form.name,
      trigger: form.trigger,
      template: form.template,
      recipients,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Поиск по названию"
          onChange={(e) => debouncedSetSearch(e.target.value)}
        />
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Новый шаблон
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать шаблон уведомления</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitCreate} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Название</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Например: Уведомить исполнителя"
                  />
                </div>
                <div>
                  <Label className="text-sm">Триггер</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.trigger}
                    onChange={(e) =>
                      setForm({ ...form, trigger: e.target.value })
                    }
                  >
                    <option value="on_enter">При входе</option>
                    <option value="on_exit">При выходе</option>
                    <option value="on_approve">При одобрении</option>
                    <option value="on_reject">При отклонении</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-sm">Текст письма (markdown)</Label>
                <Textarea
                  rows={4}
                  value={form.template}
                  onChange={(e) =>
                    setForm({ ...form, template: e.target.value })
                  }
                  placeholder="Текст уведомления..."
                />
              </div>
              <div>
                <Label className="text-sm">
                  Получатели (через запятую/строки)
                </Label>
                <Textarea
                  rows={2}
                  value={form.recipientsText}
                  onChange={(e) =>
                    setForm({ ...form, recipientsText: e.target.value })
                  }
                  placeholder="executor, approver или user:123"
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setOpenCreate(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isLoading ||
                    !form.name.trim() ||
                    !form.template.trim()
                  }
                >
                  Сохранить
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Шаблоны уведомлений</CardTitle>
          <CardDescription>
            Повторно используемые письма для событий процесса
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="text-sm text-muted-foreground">Загрузка...</div>
          ) : templates.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Пока нет шаблонов
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((t: any) => (
                <div
                  key={t.id}
                  className="p-3 border rounded-lg flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Триггер:{" "}
                      {(
                        {
                          on_enter: "При входе",
                          on_exit: "При выходе",
                          on_approve: "При одобрении",
                          on_reject: "При отклонении",
                        } as any
                      )[t.trigger] || t.trigger}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {t.template}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <InlineRename
                      value={t.name || ""}
                      onSubmit={(newVal) =>
                        updateMutation.mutate({ id: t.id, name: newVal })
                      }
                    />{" "}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate({ id: t.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StandardFunctionsScreen() {
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = React.useState("roles");

  // Roles templates
  const [roleSearch, setRoleSearch] = React.useState("");
  const debouncedSetRoleSearch = React.useMemo(
    () => debounce((v: string) => setRoleSearch(v), 300),
    [],
  );
  const { data: roleTemplates = [], isFetching: rolesFetching } = useQuery(
    ["roleTemplates", roleSearch.trim() ? roleSearch : "__all__"],
    () =>
      apiClient.listRoleTemplates(
        roleSearch.trim() ? { query: roleSearch } : undefined,
      ),
    { enabled: selectedTab === "roles", refetchOnMount: false },
  );
  const createRoleTemplateMutation = useMutation(apiClient.createRoleTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries(["roleTemplates"]);
      toast({ title: "Шаблон роли сохранён" });
      setNewRole({
        name: "",
        roleType: "executor",
        description: "",
        canEdit: false,
        canApprove: false,
        canRegister: false,
      });
    },
    onError: (e: any) =>
      toast({
        title: "Ошибка",
        description: e?.message || "Не удалось сохранить шаблон",
        variant: "destructive",
      }),
  });
  const [newRole, setNewRole] = React.useState({
    name: "",
    roleType: "executor",
    description: "",
    canEdit: false,
    canApprove: false,
    canRegister: false,
  });

  // Role types dictionary (manage and list)
  const { data: roleTypes = [], isFetching: roleTypesFetching } = useQuery(
    ["roleTypes"],
    () => apiClient.listRoleTypes(),
    { enabled: selectedTab === "roles", refetchOnMount: false },
  );
  const [newRoleType, setNewRoleType] = React.useState({ code: "", name: "" });
  const createRoleTypeMutation = useMutation(apiClient.createRoleType, {
    onSuccess: () => {
      queryClient.invalidateQueries(["roleTypes"]);
      setNewRoleType({ code: "", name: "" });
      toast({ title: "Тип роли добавлен" });
    },
    onError: (e: any) =>
      toast({
        title: "Ошибка",
        description: e?.message || "Не удалось добавить тип роли",
        variant: "destructive",
      }),
  });
  const deleteRoleTypeMutation = useMutation(apiClient.deleteRoleType, {
    onSuccess: () => {
      queryClient.invalidateQueries(["roleTypes"]);
      toast({ title: "Тип роли удалён" });
    },
    onError: (e: any) =>
      toast({
        title: "Ошибка",
        description: e?.message || "Не удалось удалить тип роли",
        variant: "destructive",
      }),
  });

  // Transition templates
  const [ttSearch, setTtSearch] = React.useState("");
  const debouncedSetTtSearch = React.useMemo(
    () => debounce((v: string) => setTtSearch(v), 300),
    [],
  );
  const { data: transitionTemplates = [], isFetching: ttFetching } = useQuery(
    ["transitionTemplates", ttSearch.trim() ? ttSearch : "__all__"],
    () =>
      apiClient.listTransitionTemplates(
        ttSearch.trim() ? { query: ttSearch } : undefined,
      ),
    { enabled: selectedTab === "transitions", refetchOnMount: false },
  );
  const createTransitionTemplateMutation = useMutation(
    apiClient.createTransitionTemplate,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["transitionTemplates"]);
        toast({ title: "Шаблон перехода сохранён" });
        setNewTransition({
          name: "",
          condition: "approved_or_rejected",
          targetState: "",
          transitionType: "approve_or_reject",
        });
      },
      onError: (e: any) =>
        toast({
          title: "Ошибка",
          description: e?.message || "Не удалось сохранить шаблон",
          variant: "destructive",
        }),
    },
  );
  const [newTransition, setNewTransition] = React.useState({
    name: "",
    condition: "approved_or_rejected",
    targetState: "",
    transitionType: "approve_or_reject",
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Стандартные функции бизнес-процесса
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Библиотека функций</CardTitle>
          <CardDescription>
            Управляйте стандартными элементами, используемыми при сборке
            процессов в редакторе схем
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="requisites">Реквизиты</TabsTrigger>
              <TabsTrigger value="checklists">Чек-листы</TabsTrigger>
              <TabsTrigger value="printform">Печатная форма</TabsTrigger>
              <TabsTrigger value="roles">Роли</TabsTrigger>
              <TabsTrigger value="transitions">Условия</TabsTrigger>
              <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            </TabsList>

            {/* Requisites tab */}
            {selectedTab === "requisites" && (
              <TabsContent value="requisites" className="mt-4">
                <RequisitesLibrary isActive={true} />
              </TabsContent>
            )}

            {/* Checklists templates tab */}
            {selectedTab === "checklists" && (
              <TabsContent value="checklists" className="mt-4">
                <ChecklistTemplatesLibrary isActive={true} />
              </TabsContent>
            )}

            {/* Print form tab - library */}
            {selectedTab === "printform" && (
              <TabsContent value="printform" className="mt-4">
                <PrintFormLibrary isActive={true} />
              </TabsContent>
            )}

            {/* Roles tab */}
            <TabsContent value="roles" className="mt-4">
              {/* Role types dictionary management */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Типы ролей (справочник)</CardTitle>
                  <CardDescription>
                    Базовые 4 типа доступны по умолчанию. Здесь можно добавить
                    новые типы для использования в шаблонах и при настройке
                    процессов.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <form
                    className="grid grid-cols-1 md:grid-cols-3 gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const code = newRoleType.code.trim();
                      if (!code) return;
                      createRoleTypeMutation.mutate({
                        code,
                        name:
                          newRoleType.name.trim() || newRoleType.code.trim(),
                      });
                    }}
                  >
                    <div>
                      <Label className="text-sm">Код</Label>
                      <Input
                        value={newRoleType.code}
                        onChange={(e) =>
                          setNewRoleType((s) => ({
                            ...s,
                            code: e.target.value,
                          }))
                        }
                        placeholder="например: reviewer"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Название</Label>
                      <Input
                        value={newRoleType.name}
                        onChange={(e) =>
                          setNewRoleType((s) => ({
                            ...s,
                            name: e.target.value,
                          }))
                        }
                        placeholder="например: Рецензент"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="submit"
                        disabled={
                          createRoleTypeMutation.isLoading ||
                          !newRoleType.code.trim()
                        }
                      >
                        Добавить тип
                      </Button>
                    </div>
                  </form>

                  <div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Доступные типы
                    </div>
                    {roleTypesFetching ? (
                      <div className="text-sm text-muted-foreground">
                        Загрузка...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {roleTypes.map((rt: any) => (
                          <div
                            key={rt.id}
                            className="p-2 border rounded-md flex items-center justify-between text-sm"
                          >
                            <div>
                              <div className="font-medium">{rt.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {rt.code}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                deleteRoleTypeMutation.mutate({ id: rt.id })
                              }
                              disabled={deleteRoleTypeMutation.isLoading}
                            >
                              Удалить
                            </Button>
                          </div>
                        ))}
                        {roleTypes.length === 0 && (
                          <div className="text-sm text-muted-foreground">
                            Пока нет типов
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Добавить шаблон роли</CardTitle>
                    <CardDescription>
                      Сохраните типовую роль для быстрого использования в
                      процессах
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm">Название роли</Label>
                      <Input
                        value={newRole.name}
                        onChange={(e) =>
                          setNewRole({ ...newRole, name: e.target.value })
                        }
                        placeholder="Например: Инженер-проектировщик"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Тип</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={newRole.roleType}
                        onChange={(e) =>
                          setNewRole({ ...newRole, roleType: e.target.value })
                        }
                      >
                        {(roleTypes as any[]).length > 0 ? (
                          (roleTypes as any[]).map((rt: any) => (
                            <option key={rt.id} value={rt.code}>
                              {rt.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="applicant">Заявитель</option>
                            <option value="executor">Исполнитель</option>
                            <option value="approver">Согласующий</option>
                            <option value="observer">Наблюдатель</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm">Описание</Label>
                      <Textarea
                        rows={3}
                        value={newRole.description}
                        onChange={(e) =>
                          setNewRole({
                            ...newRole,
                            description: e.target.value,
                          })
                        }
                        placeholder="Краткое описание назначения роли"
                      />
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="text-xs text-muted-foreground mb-2">
                        Настройка прав
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newRole.canEdit}
                            onChange={(e) =>
                              setNewRole({
                                ...newRole,
                                canEdit: e.target.checked,
                              })
                            }
                          />
                          Редактирование
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newRole.canApprove}
                            onChange={(e) =>
                              setNewRole({
                                ...newRole,
                                canApprove: e.target.checked,
                              })
                            }
                          />
                          Согласование
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newRole.canRegister}
                            onChange={(e) =>
                              setNewRole({
                                ...newRole,
                                canRegister: e.target.checked,
                              })
                            }
                          />
                          Регистрация
                        </label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button
                      onClick={() =>
                        createRoleTemplateMutation.mutate({
                          name: newRole.name,
                          description: newRole.description,
                          roleType: newRole.roleType,
                          canEdit: newRole.canEdit,
                          canApprove: newRole.canApprove,
                          canRegister: newRole.canRegister,
                        })
                      }
                      disabled={
                        createRoleTemplateMutation.isLoading ||
                        !newRole.name.trim()
                      }
                    >
                      Сохранить как шаблон
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Шаблоны ролей</CardTitle>
                    <CardDescription>
                      Поиск и быстрый выбор существующих шаблонов
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      placeholder="Поиск по названию"
                      onChange={(e) => debouncedSetRoleSearch(e.target.value)}
                    />
                    {rolesFetching ? (
                      <div className="text-sm text-muted-foreground">
                        Загрузка...
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {roleTemplates.map((t: any) => (
                          <div key={t.id} className="p-3 border rounded-lg">
                            <div className="font-medium text-sm">{t.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Тип: {t.roleType}
                            </div>
                            {(t.description ||
                              t.canEdit ||
                              t.canApprove ||
                              t.canRegister) && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {t.description && <div>{t.description}</div>}
                                <div>
                                  {[
                                    t.canEdit && "Редактирование",
                                    t.canApprove && "Согласование",
                                    t.canRegister && "Регистрация",
                                  ]
                                    .filter(Boolean)
                                    .join(", ") || "Только просмотр"}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {roleTemplates.length === 0 && (
                          <div className="text-sm text-muted-foreground">
                            Нет шаблонов
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Transitions tab */}
            <TabsContent value="transitions" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Добавить шаблон условия</CardTitle>
                    <CardDescription>
                      Сохраните часто используемое условие перехода
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm">Название</Label>
                      <Input
                        value={newTransition.name}
                        onChange={(e) =>
                          setNewTransition({
                            ...newTransition,
                            name: e.target.value,
                          })
                        }
                        placeholder="Например: Согласовано руководителем"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">Условие</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={newTransition.condition}
                          onChange={(e) =>
                            setNewTransition({
                              ...newTransition,
                              condition: e.target.value,
                              transitionType:
                                e.target.value === "approved_or_rejected"
                                  ? "approve_or_reject"
                                  : e.target.value === "assigned"
                                    ? "assign_executor"
                                    : e.target.value === "filled"
                                      ? "next"
                                      : newTransition.transitionType,
                            })
                          }
                        >
                          <option value="approved_or_rejected">
                            Согласовано/отклонено
                          </option>
                          <option value="assigned">Назначено</option>
                          <option value="filled">Заполнено</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm">Тип перехода</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={newTransition.transitionType}
                          onChange={(e) =>
                            setNewTransition({
                              ...newTransition,
                              transitionType: e.target.value,
                            })
                          }
                          disabled={
                            newTransition.condition === "approved_or_rejected"
                          }
                        >
                          {(() => {
                            const options =
                              newTransition.condition === "approved_or_rejected"
                                ? [
                                    {
                                      v: "approve_or_reject",
                                      l: "Согласовать/отклонить",
                                    },
                                  ]
                                : newTransition.condition === "assigned"
                                  ? [
                                      {
                                        v: "send_for_review",
                                        l: "Отправить на рассмотрение",
                                      },
                                      {
                                        v: "send_for_approval",
                                        l: "Отправить на согласование",
                                      },
                                      {
                                        v: "assign_executor",
                                        l: "Назначить исполнителя",
                                      },
                                    ]
                                  : [
                                      { v: "next", l: "Далее" },
                                      {
                                        v: "send_for_review",
                                        l: "Отправить на рассмотрение",
                                      },
                                      {
                                        v: "send_for_approval",
                                        l: "Отправить на согласование",
                                      },
                                    ];
                            return options.map((o) => (
                              <option key={o.v} value={o.v}>
                                {o.l}
                              </option>
                            ));
                          })()}
                        </select>{" "}
                      </div>
                      <div className="md:col-span-2 mt-1">
                        {newTransition.transitionType ===
                        "approve_or_reject" ? (
                          <div className="flex gap-2">
                            <Button size="sm">Согласовать</Button>
                            <Button size="sm" variant="outline">
                              Отклонить
                            </Button>
                          </div>
                        ) : newTransition.transitionType ===
                          "assign_executor" ? (
                          <div className="text-xs text-muted-foreground">
                            Будет показан выбор сотрудника
                          </div>
                        ) : newTransition.transitionType ===
                          "send_for_review" ? (
                          <div className="text-xs text-muted-foreground">
                            Будет отправлено на рассмотрение по выбранной ЖД.
                            Требуется роль «Заявитель» с правами редактирования.
                          </div>
                        ) : newTransition.transitionType ===
                          "send_for_approval" ? (
                          <div className="text-xs text-muted-foreground">
                            Будет отправлено на согласование по настроенной
                            этажности. Необходимо добавить роли «Согласующий»
                            и/или «Исполнитель».{" "}
                          </div>
                        ) : newTransition.transitionType === "resolution" ? (
                          <div className="text-xs text-muted-foreground">
                            Возможность переназначить исполнителя внутри
                            подразделения
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button size="sm">Далее</Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Целевое состояние</Label>{" "}
                      <Input
                        value={newTransition.targetState}
                        onChange={(e) =>
                          setNewTransition({
                            ...newTransition,
                            targetState: e.target.value,
                          })
                        }
                        placeholder="Например: Отправлено на согласование"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end gap-2">
                    {(
                      ["approved_or_rejected", "assigned", "filled"] as const
                    ).includes(newTransition.condition as any) && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          createTransitionTemplateMutation.mutate({
                            name: newTransition.name?.trim()
                              ? `${newTransition.name} — резолюция`
                              : "Назначено → Резолюция",
                            condition: "assigned",
                            transitionType: "resolution",
                            targetState: "Резолюция",
                          })
                        }
                      >
                        Добавить «Назначено → Резолюция»
                      </Button>
                    )}
                    <Button
                      onClick={() =>
                        createTransitionTemplateMutation.mutate({
                          name: newTransition.name,
                          condition: newTransition.condition,
                          targetState: newTransition.targetState || undefined,
                          transitionType: newTransition.transitionType,
                        })
                      }
                      disabled={
                        createTransitionTemplateMutation.isLoading ||
                        !newTransition.name.trim()
                      }
                    >
                      Сохранить как шаблон
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Шаблоны условий</CardTitle>
                    <CardDescription>
                      Поиск и быстрый выбор шаблонов переходов
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      placeholder="Поиск по названию"
                      onChange={(e) => debouncedSetTtSearch(e.target.value)}
                    />
                    {ttFetching ? (
                      <div className="text-sm text-muted-foreground">
                        Загрузка...
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {transitionTemplates.map((t: any) => (
                          <div key={t.id} className="p-3 border rounded-lg">
                            <div className="font-medium text-sm">{t.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Условие: {t.condition}
                              {t.targetState ? ` → ${t.targetState}` : ""}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Тип: {t.transitionType || "next"}
                            </div>

                            <div className="mt-2">
                              {t.condition === "approved_or_rejected" ? (
                                <div className="flex gap-2">
                                  <Button size="sm">Согласовать</Button>
                                  <Button size="sm" variant="outline">
                                    Отклонено
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <Button size="sm">Далее</Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {transitionTemplates.length === 0 && (
                          <div className="text-sm text-muted-foreground">
                            Нет шаблонов
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notifications templates tab */}
            {selectedTab === "notifications" && (
              <TabsContent value="notifications" className="mt-4">
                <NotificationTemplatesLibrary isActive={true} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function LinkedProcesses({
  schema,
  currentElement,
  onHoverPath,
  onSelectElement,
}: {
  schema: any;
  currentElement: any;
  onHoverPath: (ids: string[]) => void;
  onSelectElement?: (id: string) => void;
}) {
  if (!schema || !currentElement) return null;

  const elements: any[] = Array.isArray(schema.elements) ? schema.elements : [];
  const connections: any[] = Array.isArray(schema.connections)
    ? schema.connections
    : [];

  const prevConnections = connections.filter(
    (c) => c.targetId === currentElement.id,
  );
  const nextConnections = connections.filter(
    (c) => c.sourceId === currentElement.id,
  );

  const uniqueById = (items: any[]) => {
    const seen = new Set<string>();
    const out: any[] = [];
    items.forEach((el: any) => {
      if (!el) return;
      if (!seen.has(el.id)) {
        seen.add(el.id);
        out.push(el);
      }
    });
    return out;
  };

  const isDecision = currentElement.elementType === "DECISION";

  const prevElements = uniqueById(
    prevConnections.map((c) => elements.find((e) => e.id === c.sourceId)),
  );
  const nextElements = uniqueById(
    nextConnections.map((c) => elements.find((e) => e.id === c.targetId)),
  );

  // For DECISION nodes: show only PROCESS-type neighbors
  const prevProcessElements = isDecision
    ? uniqueById(
        prevConnections
          .map((c) => elements.find((e) => e.id === c.sourceId))
          .filter((el: any) => el && el.elementType === "PROCESS"),
      )
    : [];

  const nextProcessElements = isDecision
    ? uniqueById(
        nextConnections
          .map((c) => elements.find((e) => e.id === c.targetId))
          .filter((el: any) => el && el.elementType === "PROCESS"),
      )
    : [];

  const prevToShow = isDecision ? prevProcessElements : prevElements;
  const nextToShow = isDecision ? nextProcessElements : nextElements;

  const buildPath = (otherId: string) => [currentElement.id, otherId];

  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium mb-2">Связанные процессы</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 border rounded">
          <div className="text-xs text-muted-foreground mb-2">
            Предшествующие (1 шаг)
          </div>
          {prevToShow.length === 0 ? (
            <div className="text-xs text-muted-foreground">Нет</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {prevToShow.map((el: any) => (
                <button
                  key={el.id}
                  className="text-sm px-2 py-1 rounded bg-muted hover:bg-accent"
                  onMouseEnter={() => onHoverPath(buildPath(el.id))}
                  onMouseLeave={() => onHoverPath([])}
                  onClick={() => onSelectElement && onSelectElement(el.id)}
                >
                  {el.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-3 border rounded">
          <div className="text-xs text-muted-foreground mb-2">
            Последующие (1 шаг)
          </div>
          {nextToShow.length === 0 ? (
            <div className="text-xs text-muted-foreground">Нет</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {nextToShow.map((el: any) => (
                <button
                  key={el.id}
                  className="text-sm px-2 py-1 rounded bg-muted hover:bg-accent"
                  onMouseEnter={() => onHoverPath(buildPath(el.id))}
                  onMouseLeave={() => onHoverPath([])}
                  onClick={() => onSelectElement && onSelectElement(el.id)}
                >
                  {el.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Экран выбора железной дороги перед созданием заявки
function RailwaySelectionScreen() {
  const navigate = useNavigate();
  const { schemaId } = useParams<{ schemaId: string }>();
  const location = useLocation();
  const state = (location.state ?? {}) as {
    title?: string;
    description?: string;
  };
  const [selected, setSelected] = React.useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const notify = React.useCallback(
    (opts: any) => toast({ duration: 1000, ...opts }),
    [toast],
  );
  void notify;

  const { data: schemas = [] } = useQuery(
    ["publishedSchemas"],
    apiClient.listPublishedSchemas,
  );
  const schema = React.useMemo(
    () => schemas.find((s: any) => s.id === schemaId),
    [schemas, schemaId],
  );

  const RAILWAYS = [
    "Калининградская железная дорога",
    "Октябрьская железная дорога",
    "Московская железная дорога",
    "Северная железная дорога",
    "Горьковская железная дорога",
    "Северо-Кавказская железная дорога",
    "Юго-Восточная железная дорога",
    "Приволжская железная дорога",
    "Куйбышевская железная дорога",
    "Свердловская железная дорога",
    "Южно-Уральская железная дорога",
    "Западно-Сибирская железная дорога",
    "Красноярская железная дорога",
    "Восточно-Сибирская железная дорога",
    "Забайкальская железная дорога",
    "Дальневосточная железная дорога",
  ];

  const createMutation = useMutation(apiClient.createServiceApplication, {
    onSuccess: (created) => {
      queryClient.invalidateQueries(["userApplications"]);
      if (created?.id) {
        navigate(`/application/${created.id}`);
      } else {
        navigate("/applications");
      }
    },
    onError: () => {
      toast({ title: "Не удалось создать заявку", variant: "destructive" });
    },
  });

  const handleContinue = () => {
    if (!schemaId || !selected) return;
    const title =
      state.title?.trim() ||
      (schema ? `Заявка по схеме: ${schema.name}` : "Заявка");
    const description =
      state.description ||
      (schema ? `Заявка на оказание услуги по схеме "${schema.name}"` : "");
    createMutation.mutate({
      title,
      description,
      schemaId,
      formData: { railway: selected },
    } as any);
  };

  if (!schemaId) {
    // Если пришли без схемы — возвращаем назад
    navigate("/applications", { replace: true });
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Выбор железной дороги</h1>
        <div className="text-sm text-muted-foreground truncate">
          {schema ? (
            <>
              Схема: {schema.name}
              {schema.service ? ` • Услуга: ${schema.service.name}` : ""}
            </>
          ) : (
            "Загрузка схемы..."
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Левая часть: список ЖД */}
            <div className="border-r divide-y">
              {RAILWAYS.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelected(r)}
                  className={`w-full text-left p-4 hover:bg-accent transition ${selected === r ? "bg-accent" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium truncate">{r}</span>
                    {selected === r && <Check className="w-4 h-4" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Правая часть: условная «схематичная карта» */}
            <div className="p-6 min-h-[400px] flex flex-col">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Схематичная карта</h2>
                <p className="text-sm text-muted-foreground">
                  Подсветка выбранной дороги (упрощённый макет для справки)
                </p>
              </div>
              <div className="flex-1 rounded-md border bg-muted/20 flex items-center justify-center">
                {selected ? (
                  <div className="text-center p-4">
                    <MapIcon className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-sm">Вы выбрали</div>
                    <div className="text-base font-semibold mt-1 max-w-xs">
                      {selected}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm p-4 text-center">
                    Выберите железную дорогу слева, чтобы продолжить
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Назад
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={!selected || createMutation.isLoading}
                >
                  {createMutation.isLoading ? "Создание..." : "Продолжить"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectsScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <Layout>
                  <ServiceRequestsScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-requests"
            element={<Navigate to="/requests" replace />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/standard-functions"
            element={
              <ProtectedRoute>
                <Layout>
                  <StandardFunctionsScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/business-processes"
            element={<Navigate to="/admin/standard-functions" replace />}
          />
          <Route
            path="/admin/business-processes-legacy"
            element={
              <ProtectedRoute>
                <Layout>
                  <BusinessProcessManagementScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/process-editor/:schemaId"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProcessEditorScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/application/:applicationId"
            element={
              <ProtectedRoute>
                <Layout>
                  <ApplicationFormScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/new/:schemaId/railway"
            element={
              <ProtectedRoute>
                <Layout>
                  <RailwaySelectionScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Layout>
                  <ServiceApplicationsScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
