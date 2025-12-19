import Elysia, { t } from "elysia";
import { UserModel } from "./model";
import { UserService } from "./service";
import jwt from "@elysiajs/jwt";

export const user = new Elysia({ prefix: "/user" })
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
  .derive(async ({ jwt, cookie: { authToken } }) => {
    const payload = await jwt.verify(authToken.value);
    if (!payload) throw new Error("Unauthorized");
    return { userId: payload.userId as number };
  })
  // Get current user profile
  .get(
    "/profile",
    async ({ userId }) => {
      return await UserService.getProfile(userId);
    },
    {
      response: {
        200: UserModel.userResponse,
        400: UserModel.error,
      },
    }
  )
  // Update current user
  .put(
    "/profile",
    async ({ userId, body }) => {
      return await UserService.updateUser(userId, body);
    },
    {
      body: UserModel.updateBody,
      response: {
        200: UserModel.userResponse,
        400: UserModel.error,
      },
    }
  )
  // List users with pagination and search (admin)
  .get(
    "/",
    async ({ query }) => {
      return await UserService.listUsers(query);
    },
    {
      query: UserModel.listQuery,
      response: {
        200: UserModel.usersListResponse,
      },
    }
  )
  // Get specific user by ID
  .get(
    "/:id",
    async ({ params: { id } }) => {
      return await UserService.getUser(id);
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
      response: {
        200: UserModel.userResponse,
        400: UserModel.error,
      },
    }
  )
  // Create user (admin)
  .post(
    "/",
    async ({ body }) => {
      return await UserService.createUser(body);
    },
    {
      body: UserModel.createBody,
      response: {
        200: UserModel.userResponse,
        400: UserModel.error,
      },
    }
  )
  // Update user by ID (admin)
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      return await UserService.updateUser(id, body);
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
      body: UserModel.updateBody,
      response: {
        200: UserModel.userResponse,
        400: UserModel.error,
      },
    }
  )
  // Delete user (admin)
  .delete(
    "/:id",
    async ({ params: { id } }) => {
      return await UserService.deleteUser(id);
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
      response: {
        200: UserModel.userResponse,
        400: UserModel.error,
      },
    }
  );
