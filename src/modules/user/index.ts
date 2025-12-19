import Elysia, { t } from "elysia";
import { UserModel } from "./model";
import { UserService } from "./service";
import jwt from "@elysiajs/jwt";
import {
  successResponse,
  successListResponse,
  successMessageResponse,
} from "../../utils/response";

export const user = new Elysia({ prefix: "/users" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "kintil",
    })
  )
  .guard({
    cookie: t.Cookie({
      authToken: t.String(),
    }),
  })
  .derive(async ({ jwt, cookie: { authToken }, set }) => {
    const payload = await jwt.verify(authToken.value);
    if (!payload) {
      set.status = 401;
      throw new Error("Unauthorized");
    }
    return { userId: payload.userId as number };
  })
  // Get current user profile
  .get("/profile", async ({ userId, set }) => {
    const user = await UserService.getProfile(userId);
    set.status = 200; // OK
    return successResponse(user, "Profile retrieved successfully");
  })
  // Update current user
  .put(
    "/profile",
    async ({ userId, body, set }) => {
      const user = await UserService.updateUser(userId, body);
      set.status = 200; // OK
      return successResponse(user, "Profile updated successfully");
    },
    {
      body: UserModel.updateBody,
    }
  )
  // List users with pagination and search (admin)
  .get(
    "/",
    async ({ query, set }) => {
      const result = await UserService.listUsers(query);
      set.status = 200; // OK
      return successListResponse(result.users, "Users retrieved successfully", {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    },
    {
      query: UserModel.listQuery,
    }
  )
  // Get specific user by ID
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      const user = await UserService.getUser(id);
      set.status = 200; // OK
      return successResponse(user, "User retrieved successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
    }
  )
  // Create user (admin)
  .post(
    "/",
    async ({ body, set }) => {
      const user = await UserService.createUser(body);
      set.status = 201; // Created
      return successResponse(user, "User created successfully");
    },
    {
      body: UserModel.createBody,
    }
  )
  // Update user by ID (admin)
  .put(
    "/:id",
    async ({ params: { id }, body, set }) => {
      const user = await UserService.updateUser(id, body);
      set.status = 200; // OK
      return successResponse(user, "User updated successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
      body: UserModel.updateBody,
    }
  )
  // Delete user (admin)
  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      await UserService.deleteUser(id);
      set.status = 200; // OK
      return successMessageResponse("User deleted successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
    }
  );
