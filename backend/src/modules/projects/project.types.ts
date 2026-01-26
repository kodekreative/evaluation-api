import type { ProjectMemberRole, ProjectStatus, Role } from "@prisma/client";

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface AddProjectMemberInput {
  userId: string;
  role?: ProjectMemberRole;
}

export interface ListProjectsParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: ProjectStatus;
  ownerId?: string;
  memberId?: string;
}

export interface ProjectUserSummary {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
}

export interface ProjectListItem {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  owner: ProjectUserSummary;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMemberDetail {
  id: string;
  role: ProjectMemberRole;
  user: ProjectUserSummary;
}

export interface ProjectDetail extends ProjectListItem {
  members: ProjectMemberDetail[];
}

export interface PaginatedProjectsResult {
  items: ProjectListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  search?: string;
}
