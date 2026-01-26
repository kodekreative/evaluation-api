import type { Response, NextFunction } from "express";
import { projectService } from "./project.service";
import type { AuthenticatedRequest } from "../../middlewares/authGuard";

export const projectController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const result = await projectService.listProjects(user, req.query as any);

      res.json({
        success: true,
        data: result.items,
        meta: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
          search: result.search ?? null,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async get(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const project = await projectService.getProject(user, req.params.id);

      res.json({
        success: true,
        data: project,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const project = await projectService.createProject(user, req.body);

      res.status(201).json({
        success: true,
        data: project,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const project = await projectService.updateProject(user, req.params.id, req.body);

      res.json({
        success: true,
        data: project,
      });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const result = await projectService.deleteProject(user, req.params.id);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async listMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const members = await projectService.listMembers(user, req.params.id);

      res.json({
        success: true,
        data: members,
      });
    } catch (err) {
      next(err);
    }
  },

  async addMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const member = await projectService.addMember(user, req.params.id, req.body);

      res.status(201).json({
        success: true,
        data: member,
      });
    } catch (err) {
      next(err);
    }
  },

  async removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const result = await projectService.removeMember(
        user,
        req.params.id,
        req.params.userId
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
