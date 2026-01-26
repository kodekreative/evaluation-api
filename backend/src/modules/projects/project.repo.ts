import { prisma } from "../../db/prismaClient";
import type { CreateProjectInput, UpdateProjectInput } from "./project.types";
import { Prisma, ProjectMemberRole } from "@prisma/client";

const projectListSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  owner: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
  _count: {
    select: {
      members: true,
    },
  },
} as const;

type ProjectListRecord = Prisma.ProjectGetPayload<{ select: typeof projectListSelect }>;

const projectDetailInclude = {
  owner: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
  members: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
} as const;

export const projectRepo = {
  async findPaginated(params: {
    page: number;
    pageSize: number;
    where: Prisma.ProjectWhereInput;
    search?: string;
  }) {
    const { page, pageSize, where, search } = params;
    const skip = (page - 1) * pageSize;

    const [items, total] = (await prisma.$transaction([
      prisma.project.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: projectListSelect,
      }),
      prisma.project.count({ where }),
    ])) as [ProjectListRecord[], number];

    const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

    const mappedItems = items.map((item: ProjectListRecord) => ({
      ...item,
      memberCount: item._count.members,
    }));

    return {
      items: mappedItems,
      total,
      page,
      pageSize,
      totalPages,
      search,
    };
  },

  create(data: CreateProjectInput & { ownerId: string }) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        ownerId: data.ownerId,
      },
      include: projectDetailInclude,
    });
  },

  findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: projectDetailInclude,
    });
  },

  update(id: string, data: UpdateProjectInput) {
    return prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
      },
      include: projectDetailInclude,
    });
  },

  delete(id: string) {
    return prisma.project.delete({ where: { id } });
  },

  addMember(data: { projectId: string; userId: string; role?: ProjectMemberRole }) {
    return prisma.projectMember.create({
      data: {
        projectId: data.projectId,
        userId: data.userId,
        role: data.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  },

  removeMember(projectId: string, userId: string) {
    return prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  },

  findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  },
};
