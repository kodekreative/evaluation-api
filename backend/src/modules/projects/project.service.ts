import { Prisma, Role } from "@prisma/client";
import { projectRepo } from "./project.repo";
import type {
  AddProjectMemberInput,
  CreateProjectInput,
  ListProjectsParams,
  PaginatedProjectsResult,
  ProjectDetail,
  ProjectMemberDetail,
  ProjectListItem,
  UpdateProjectInput,
} from "./project.types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function buildWhereFilter(
  params: Partial<ListProjectsParams>,
  user: { id: string; role: Role }
): Prisma.ProjectWhereInput {
  const filters: Prisma.ProjectWhereInput[] = [];

  const search = params.search?.trim();
  if (search) {
    filters.push({
      name: {
        contains: search,
        mode: "insensitive" as Prisma.QueryMode,
      },
    });
  }

  if (params.status) {
    filters.push({ status: params.status });
  }

  if (user.role === Role.ADMIN) {
    if (params.ownerId) {
      filters.push({ ownerId: params.ownerId });
    }
    if (params.memberId) {
      filters.push({ members: { some: { userId: params.memberId } } });
    }
  } else {
    filters.push({
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    });
  }

  if (filters.length === 0) return {};
  if (filters.length === 1) return filters[0];

  return { AND: filters };
}

function mapProjectDetail(project: any): ProjectDetail {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    owner: project.owner,
    memberCount: project.members.length,
    members: project.members.map((member: any) => ({
      id: member.id,
      role: member.role,
      user: member.user,
    })),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export const projectService = {
  async listProjects(
    user: { id: string; role: Role },
    params: Partial<ListProjectsParams> = {}
  ): Promise<PaginatedProjectsResult> {
    let page = params.page ?? DEFAULT_PAGE;
    let pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 1;
    if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

    const search = params.search?.trim() || undefined;

    const where = buildWhereFilter({ ...params, search }, user);

    const result = await projectRepo.findPaginated({
      page,
      pageSize,
      where,
      search,
    });

    const items: ProjectListItem[] = result.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      status: item.status,
      owner: item.owner,
      memberCount: item.memberCount,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return {
      ...result,
      items,
    };
  },

  async getProject(
    user: { id: string; role: Role },
    projectId: string
  ): Promise<ProjectDetail> {
    const project = await projectRepo.findById(projectId);

    if (!project) {
      const err: any = new Error("Project not found");
      err.status = 404;
      err.code = "PROJECT_NOT_FOUND";
      throw err;
    }

    const isOwner = project.ownerId === user.id;
    const isMember = project.members.some(
      (member: { userId: string }) => member.userId === user.id
    );
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isMember && !isAdmin) {
      const err: any = new Error("You do not have access to this project");
      err.status = 403;
      err.code = "FORBIDDEN";
      throw err;
    }

    return mapProjectDetail(project);
  },

  async createProject(
    user: { id: string; role: Role },
    input: CreateProjectInput
  ): Promise<ProjectDetail> {
    try {
      const project = await projectRepo.create({
        ...input,
        ownerId: user.id,
      });

      return mapProjectDetail(project);
    } catch (error: any) {
      if (error?.code === "P2002") {
        const err: any = new Error("Project name already exists for this owner");
        err.status = 409;
        err.code = "PROJECT_NAME_TAKEN";
        throw err;
      }

      throw error;
    }
  },

  async updateProject(
    user: { id: string; role: Role },
    projectId: string,
    input: UpdateProjectInput
  ): Promise<ProjectDetail> {
    const existing = await projectRepo.findById(projectId);

    if (!existing) {
      const err: any = new Error("Project not found");
      err.status = 404;
      err.code = "PROJECT_NOT_FOUND";
      throw err;
    }

    const isOwner = existing.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      const err: any = new Error("You do not have permission to update this project");
      err.status = 403;
      err.code = "FORBIDDEN";
      throw err;
    }

    try {
      const project = await projectRepo.update(projectId, input);
      return mapProjectDetail(project);
    } catch (error: any) {
      if (error?.code === "P2002") {
        const err: any = new Error("Project name already exists for this owner");
        err.status = 409;
        err.code = "PROJECT_NAME_TAKEN";
        throw err;
      }
      throw error;
    }
  },

  async deleteProject(user: { id: string; role: Role }, projectId: string) {
    const existing = await projectRepo.findById(projectId);

    if (!existing) {
      const err: any = new Error("Project not found");
      err.status = 404;
      err.code = "PROJECT_NOT_FOUND";
      throw err;
    }

    const isOwner = existing.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      const err: any = new Error("You do not have permission to delete this project");
      err.status = 403;
      err.code = "FORBIDDEN";
      throw err;
    }

    await projectRepo.delete(projectId);
    return mapProjectDetail(existing);
  },

  async addMember(
    user: { id: string; role: Role },
    projectId: string,
    input: AddProjectMemberInput
  ): Promise<ProjectMemberDetail> {
    const project = await projectRepo.findById(projectId);

    if (!project) {
      const err: any = new Error("Project not found");
      err.status = 404;
      err.code = "PROJECT_NOT_FOUND";
      throw err;
    }

    const isOwner = project.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      const err: any = new Error("You do not have permission to manage members");
      err.status = 403;
      err.code = "FORBIDDEN";
      throw err;
    }

    if (input.userId === project.ownerId) {
      const err: any = new Error("Owner is already associated with the project");
      err.status = 400;
      err.code = "OWNER_ALREADY_ASSOCIATED";
      throw err;
    }

    const targetUser = await projectRepo.findUserById(input.userId);
    if (!targetUser) {
      const err: any = new Error("User not found");
      err.status = 404;
      err.code = "USER_NOT_FOUND";
      throw err;
    }

    try {
      const member = await projectRepo.addMember({
        projectId,
        userId: input.userId,
        role: input.role,
      });

      return {
        id: member.id,
        role: member.role,
        user: member.user,
      };
    } catch (error: any) {
      if (error?.code === "P2002") {
        const err: any = new Error("User is already a member of this project");
        err.status = 409;
        err.code = "MEMBER_ALREADY_EXISTS";
        throw err;
      }
      throw error;
    }
  },

  async removeMember(
    user: { id: string; role: Role },
    projectId: string,
    memberId: string
  ) {
    const project = await projectRepo.findById(projectId);

    if (!project) {
      const err: any = new Error("Project not found");
      err.status = 404;
      err.code = "PROJECT_NOT_FOUND";
      throw err;
    }

    const isOwner = project.ownerId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      const err: any = new Error("You do not have permission to manage members");
      err.status = 403;
      err.code = "FORBIDDEN";
      throw err;
    }

    try {
      const member = await projectRepo.removeMember(projectId, memberId);
      return {
        id: member.id,
        role: member.role,
        user: member.user,
      };
    } catch (error: any) {
      if (error?.code === "P2025") {
        const err: any = new Error("Project member not found");
        err.status = 404;
        err.code = "MEMBER_NOT_FOUND";
        throw err;
      }
      throw error;
    }
  },

  async listMembers(
    user: { id: string; role: Role },
    projectId: string
  ): Promise<ProjectMemberDetail[]> {
    const project = await projectRepo.findById(projectId);

    if (!project) {
      const err: any = new Error("Project not found");
      err.status = 404;
      err.code = "PROJECT_NOT_FOUND";
      throw err;
    }

    const isOwner = project.ownerId === user.id;
    const isMember = project.members.some(
      (member: { userId: string }) => member.userId === user.id
    );
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isMember && !isAdmin) {
      const err: any = new Error("You do not have access to this project");
      err.status = 403;
      err.code = "FORBIDDEN";
      throw err;
    }

    return project.members.map((member: { id: string; role: any; user: any }) => ({
      id: member.id,
      role: member.role,
      user: member.user,
    }));
  },
};
