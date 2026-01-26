import { Router } from "express";
import { requireAuth } from "../../middlewares/authGuard";
import { validateBody, validateQuery } from "../../middlewares/validation";
import { projectController } from "./project.controller";
import {
  addProjectMemberBodySchema,
  createProjectBodySchema,
  listProjectsQuerySchema,
  updateProjectBodySchema,
} from "./project.validation";

export const projectRouter = Router();

projectRouter.use(requireAuth);

// GET /projects
projectRouter.get("/", validateQuery(listProjectsQuerySchema), projectController.list);

// POST /projects
projectRouter.post("/", validateBody(createProjectBodySchema), projectController.create);

// GET /projects/:id
projectRouter.get("/:id", projectController.get);

// PUT /projects/:id
projectRouter.put("/:id", validateBody(updateProjectBodySchema), projectController.update);

// DELETE /projects/:id
projectRouter.delete("/:id", projectController.remove);

// GET /projects/:id/members
projectRouter.get("/:id/members", projectController.listMembers);

// POST /projects/:id/membersss
projectRouter.post(
  "/:id/members",
  validateBody(addProjectMemberBodySchema),
  projectController.addMember
);

// DELETE /projects/:id/members/:userId
projectRouter.delete("/:id/members/:userId", projectController.removeMember);
