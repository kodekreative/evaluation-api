import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "../../app";
import { prisma } from "../../db/prismaClient";

const app = createApp();

describe("Projects API integration", () => {
  jest.setTimeout(20000);

  const password = "SuperSecret123!";
  const adminEmail = `admin.project+${Date.now()}@example.com`;
  const ownerEmail = `owner.project+${Date.now()}@example.com`;
  const memberEmail = `member.project+${Date.now()}@example.com`;

  let adminToken: string;
  let ownerToken: string;
  let memberToken: string;

  let ownerId: string;
  let memberId: string;

  let projectId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash(password, 10);

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
      },
    });

    ownerId = (
      await prisma.user.create({
        data: {
          email: ownerEmail,
          passwordHash,
          firstName: "Owner",
          lastName: "User",
          role: "USER",
        },
      })
    ).id;

    memberId = (
      await prisma.user.create({
        data: {
          email: memberEmail,
          passwordHash,
          firstName: "Member",
          lastName: "User",
          role: "USER",
        },
      })
    ).id;

    const adminLogin = await request(app).post("/auth/login").send({
      email: adminEmail,
      password,
    });
    adminToken = adminLogin.body.data.tokens.accessToken;

    const ownerLogin = await request(app).post("/auth/login").send({
      email: ownerEmail,
      password,
    });
    ownerToken = ownerLogin.body.data.tokens.accessToken;

    const memberLogin = await request(app).post("/auth/login").send({
      email: memberEmail,
      password,
    });
    memberToken = memberLogin.body.data.tokens.accessToken;

    expect(adminToken).toBeTruthy();
    expect(ownerToken).toBeTruthy();
    expect(memberToken).toBeTruthy();

    await prisma.projectMember.deleteMany({});
    await prisma.project.deleteMany({
      where: {
        ownerId,
      },
    });
  });

  afterAll(async () => {
    await prisma.projectMember.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, ownerEmail, memberEmail] } },
    });
    await prisma.$disconnect();
  });

  it("creates a project as owner", async () => {
    const res = await request(app)
      .post("/projects")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Internal Tools",
        description: "Admin dashboard",
        status: "ACTIVE",
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        name: "Internal Tools",
        status: "ACTIVE",
        owner: {
          id: ownerId,
        },
      },
    });

    projectId = res.body.data.id;
    expect(projectId).toBeTruthy();
  });

  it("rejects duplicate project name for the same owner", async () => {
    const res = await request(app)
      .post("/projects")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Internal Tools",
      });

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: "PROJECT_NAME_TAKEN",
      },
    });
  });

  it("prevents non-owner from updating project", async () => {
    const res = await request(app)
      .put(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        description: "Updated",
      });

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: "FORBIDDEN",
      },
    });
  });

  it("owner can add a project member", async () => {
    const res = await request(app)
      .post(`/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        userId: memberId,
        role: "MEMBER",
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        user: {
          id: memberId,
        },
      },
    });
  });

  it("rejects duplicate member assignment", async () => {
    const res = await request(app)
      .post(`/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        userId: memberId,
        role: "MEMBER",
      });

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: "MEMBER_ALREADY_EXISTS",
      },
    });
  });

  it("allows project member to fetch project details", async () => {
    const res = await request(app)
      .get(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        id: projectId,
        members: expect.any(Array),
      },
    });
  });

  it("denies non-member access to project details", async () => {
    const anotherPasswordHash = await bcrypt.hash(password, 10);
    const outsiderEmail = `outsider.project+${Date.now()}@example.com`;

    const outsider = await prisma.user.create({
      data: {
        email: outsiderEmail,
        passwordHash: anotherPasswordHash,
        firstName: "Out",
        lastName: "Side",
        role: "USER",
      },
    });

    const outsiderLogin = await request(app).post("/auth/login").send({
      email: outsiderEmail,
      password,
    });

    const outsiderToken = outsiderLogin.body.data.tokens.accessToken;

    const res = await request(app)
      .get(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${outsiderToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: "FORBIDDEN",
      },
    });

    await prisma.user.delete({ where: { id: outsider.id } });
  });

  it("returns paginated projects list", async () => {
    const res = await request(app)
      .get("/projects?page=1&pageSize=1")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: expect.any(Array),
      meta: {
        page: 1,
        pageSize: 1,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      },
    });
  });

  it("admin can list all projects", async () => {
    const res = await request(app)
      .get("/projects")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: expect.any(Array),
    });
  });
});
