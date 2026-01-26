import { z } from "zod";
import { ProjectMemberRole, ProjectStatus } from "@prisma/client";

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().trim().min(1).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  ownerId: z.string().min(1).optional(),
  memberId: z.string().min(1).optional(),
});

export const createProjectBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(1000).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export const updateProjectBodySchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().max(1000).optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const addProjectMemberBodySchema = z.object({
  userId: z.string().min(1),
  role: z
    .nativeEnum(ProjectMemberRole)
    .optional()
    .refine((value) => value !== ProjectMemberRole.OWNER, {
      message: "OWNER role is reserved for project owners",
    }),
});

export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;
export type UpdateProjectBody = z.infer<typeof updateProjectBodySchema>;
export type AddProjectMemberBody = z.infer<typeof addProjectMemberBodySchema>;
