// src/docs/swagger.ts
import { version } from "../../package.json";

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Candidate Evaluation API",
    version,
    description:
      "API used for evaluating software engineering candidates. Includes auth, users, and related resources.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local dev",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "ckv123..." },
          email: { type: "string", example: "user@example.com" },
          firstName: { type: "string", nullable: true, example: "Ada" },
          lastName: { type: "string", nullable: true, example: "Lovelace" },
          role: { type: "string", example: "USER" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      PaginatedUsersResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/User" },
          },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              pageSize: { type: "integer", example: 20 },
              total: { type: "integer", example: 57 },
              totalPages: { type: "integer", example: 3 },
              search: { type: "string", nullable: true, example: "ada" },
            },
          },
        },
      },
      ProjectStatus: {
        type: "string",
        enum: ["ACTIVE", "ARCHIVED", "INACTIVE"],
        example: "ACTIVE",
      },
      ProjectMemberRole: {
        type: "string",
        enum: ["OWNER", "LEAD", "MEMBER"],
        example: "MEMBER",
      },
      ProjectUserSummary: {
        type: "object",
        properties: {
          id: { type: "string", example: "ckv123..." },
          email: { type: "string", example: "owner@example.com" },
          firstName: { type: "string", nullable: true, example: "Ada" },
          lastName: { type: "string", nullable: true, example: "Lovelace" },
          role: { type: "string", example: "USER" },
        },
      },
      ProjectMember: {
        type: "object",
        properties: {
          id: { type: "string", example: "ckm123..." },
          role: { $ref: "#/components/schemas/ProjectMemberRole" },
          user: { $ref: "#/components/schemas/ProjectUserSummary" },
        },
      },
      Project: {
        type: "object",
        properties: {
          id: { type: "string", example: "ckp123..." },
          name: { type: "string", example: "Internal Tools" },
          description: { type: "string", nullable: true, example: "Admin dashboard" },
          status: { $ref: "#/components/schemas/ProjectStatus" },
          owner: { $ref: "#/components/schemas/ProjectUserSummary" },
          memberCount: { type: "integer", example: 3 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProjectDetail: {
        allOf: [
          { $ref: "#/components/schemas/Project" },
          {
            type: "object",
            properties: {
              members: {
                type: "array",
                items: { $ref: "#/components/schemas/ProjectMember" },
              },
            },
          },
        ],
      },
      PaginatedProjectsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Project" },
          },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              pageSize: { type: "integer", example: 20 },
              total: { type: "integer", example: 5 },
              totalPages: { type: "integer", example: 1 },
              search: { type: "string", nullable: true, example: "internal" },
            },
          },
        },
      },
      ProjectResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/ProjectDetail" },
        },
      },
      ProjectMembersResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/ProjectMember" },
          },
        },
      },
      ProjectMemberResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/ProjectMember" },
        },
      },
      CreateProjectRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Internal Tools" },
          description: { type: "string", example: "Admin dashboard" },
          status: { $ref: "#/components/schemas/ProjectStatus" },
        },
      },
      UpdateProjectRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Internal Tools" },
          description: { type: "string", example: "Admin dashboard" },
          status: { $ref: "#/components/schemas/ProjectStatus" },
        },
      },
      AddProjectMemberRequest: {
        type: "object",
        required: ["userId"],
        properties: {
          userId: { type: "string", example: "cku123..." },
          role: { $ref: "#/components/schemas/ProjectMemberRole" },
        },
      },
      AuthTokens: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },
      AuthUserWithTokensResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              user: { $ref: "#/components/schemas/User" },
              tokens: { $ref: "#/components/schemas/AuthTokens" },
            },
          },
        },
      },
      MeResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/User" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Invalid request body" },
              details: {
                type: "object",
                nullable: true,
              },
            },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description:
          "Creates a new user account and returns a JWT access token along with the user.",
        security: [], // public
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "new.user@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 8,
                    example: "SuperSecret123",
                  },
                  firstName: {
                    type: "string",
                    example: "New",
                  },
                  lastName: {
                    type: "string",
                    example: "User",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User successfully registered",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthUserWithTokensResponse",
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get JWT",
        description:
          "Authenticates an existing user and returns a JWT access token along with the user.",
        security: [], // public
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  password: {
                    type: "string",
                    example: "SuperSecret123",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthUserWithTokensResponse",
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        description:
          "Returns the currently authenticated user's profile based on the JWT access token.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Current user returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeResponse" },
              },
            },
          },
          401: {
            description: "Missing or invalid JWT",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        description:
          "Returns a paginated list of users. Supports simple full-text search on email, first name, and last name.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number (1-based).",
          },
          {
            in: "query",
            name: "pageSize",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            description: "Number of items per page.",
          },
          {
            in: "query",
            name: "search",
            schema: { type: "string" },
            description:
              "Optional search term. Matches email, firstName, or lastName (case-insensitive).",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedUsersResponse",
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/projects": {
      get: {
        tags: ["Projects"],
        summary: "List projects",
        description:
          "Returns a paginated list of projects the current user can access. Admins can query all projects.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number (1-based).",
          },
          {
            in: "query",
            name: "pageSize",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            description: "Number of items per page.",
          },
          {
            in: "query",
            name: "search",
            schema: { type: "string" },
            description: "Optional search term (project name).",
          },
          {
            in: "query",
            name: "status",
            schema: { $ref: "#/components/schemas/ProjectStatus" },
            description: "Optional status filter.",
          },
          {
            in: "query",
            name: "ownerId",
            schema: { type: "string" },
            description: "Optional owner filter (admin only).",
          },
          {
            in: "query",
            name: "memberId",
            schema: { type: "string" },
            description: "Optional member filter (admin only).",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedProjectsResponse",
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Create a project",
        description: "Creates a new project owned by the authenticated user.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProjectRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Project created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectResponse" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Duplicate project name",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/projects/{id}": {
      get: {
        tags: ["Projects"],
        summary: "Get a project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Project detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Projects"],
        summary: "Update a project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProjectRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Project updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectResponse" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Duplicate project name",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete a project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Project deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/projects/{id}/members": {
      get: {
        tags: ["Projects"],
        summary: "List project members",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Members list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectMembersResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Add project member",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddProjectMemberRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Member added",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectMemberResponse" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project or user not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Member already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/projects/{id}/members/{userId}": {
      delete: {
        tags: ["Projects"],
        summary: "Remove project member",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
          {
            in: "path",
            name: "userId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Member removed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectMemberResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project or member not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};
