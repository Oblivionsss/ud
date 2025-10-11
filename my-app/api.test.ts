import { expect } from "expect";
import { createProject, listProjects, deleteProject } from "./api";

async function testCreateProject() {
  const projectData = {
    name: "Тестовый проект",
    description: "Описание тестового проекта"
  };
  
  const project = await createProject(projectData);
  
  expect(project).toHaveProperty("id");
  expect(project.name).toBe(projectData.name);
  expect(project.description).toBe(projectData.description);
  expect(project.status).toBe("ACTIVE");
  expect(project).toHaveProperty("owner");
  expect(new Date(project.createdAt)).toBeInstanceOf(Date);
  
  // Cleanup
  await deleteProject({ id: project.id });
}

type TestResult = {
  passedTests: string[];
  failedTests: { name: string; error: string }[];
};

export async function _runApiTests() {
  const result: TestResult = { passedTests: [], failedTests: [] };
  
  const testFunctions = [testCreateProject];
  
  const finalResult = await testFunctions.reduce(
    async (promisedAcc, testFunction) => {
      const acc = await promisedAcc;
      try {
        await testFunction();
        return {
          ...acc,
          passedTests: [...acc.passedTests, testFunction.name],
        };
      } catch (error) {
        return {
          ...acc,
          failedTests: [
            ...acc.failedTests,
            {
              name: testFunction.name,
              error: error instanceof Error ? error.message : "Unknown error",
            },
          ],
        };
      }
    },
    Promise.resolve(result),
  );
  
  return finalResult;
}