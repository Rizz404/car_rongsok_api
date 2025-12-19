import Elysia, { t } from "elysia";
import { MotorcycleModel } from "./model";
import { MotorcycleService } from "./service";
import jwt from "@elysiajs/jwt";
import {
  successResponse,
  successListResponse,
  successMessageResponse,
} from "../../utils/response";

export const motorcycle = new Elysia({ prefix: "/motorcycles" })
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
  // List motorcycles owned by current user
  .get(
    "/",
    async ({ userId, query, set }) => {
      const result = await MotorcycleService.listMotorcycles(userId, query);
      set.status = 200; // OK
      return successListResponse(
        result.motorcycles,
        "Motorcycles retrieved successfully",
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        }
      );
    },
    {
      query: MotorcycleModel.listQuery,
    }
  )
  // Get specific motorcycle by ID (owned by user)
  .get(
    "/:id",
    async ({ userId, params: { id }, set }) => {
      const motorcycle = await MotorcycleService.getMotorcycle(id, userId);
      set.status = 200; // OK
      return successResponse(motorcycle, "Motorcycle retrieved successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
    }
  )
  // Create motorcycle
  .post(
    "/",
    async ({ userId, body, set }) => {
      const motorcycle = await MotorcycleService.createMotorcycle(userId, body);
      set.status = 201; // Created
      return successResponse(motorcycle, "Motorcycle created successfully");
    },
    {
      body: MotorcycleModel.createBody,
    }
  )
  // Update motorcycle by ID (owned by user)
  .put(
    "/:id",
    async ({ userId, params: { id }, body, set }) => {
      const motorcycle = await MotorcycleService.updateMotorcycle(
        id,
        userId,
        body
      );
      set.status = 200; // OK
      return successResponse(motorcycle, "Motorcycle updated successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
      body: MotorcycleModel.updateBody,
    }
  )
  // Delete motorcycle (owned by user)
  .delete(
    "/:id",
    async ({ userId, params: { id }, set }) => {
      await MotorcycleService.deleteMotorcycle(id, userId);
      set.status = 200; // OK
      return successMessageResponse("Motorcycle deleted successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
    }
  );
