import Elysia, { t } from "elysia";
import { VehicleModel } from "./model";
import { VehicleService } from "./service";
import jwt from "@elysiajs/jwt";
import {
  successResponse,
  successListResponse,
  successMessageResponse,
} from "../../utils/response";

export const vehicle = new Elysia({ prefix: "/vehicles" })
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
  // List vehicles owned by current user
  .get(
    "/",
    async ({ userId, query, set }) => {
      const result = await VehicleService.listVehicles(userId, query);
      set.status = 200; // OK
      return successListResponse(
        result.vehicles,
        "Vehicles retrieved successfully",
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        }
      );
    },
    {
      query: VehicleModel.listQuery,
    }
  )
  // Get specific vehicle by ID (owned by user)
  .get(
    "/:id",
    async ({ userId, params: { id }, set }) => {
      const vehicle = await VehicleService.getVehicle(id, userId);
      set.status = 200; // OK
      return successResponse(vehicle, "Vehicle retrieved successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
    }
  )
  // Create vehicle
  .post(
    "/",
    async ({ userId, body, set }) => {
      const vehicle = await VehicleService.createVehicle(userId, body);
      set.status = 201; // Created
      return successResponse(vehicle, "Vehicle created successfully");
    },
    {
      body: VehicleModel.createBody,
    }
  )
  // Update vehicle by ID (owned by user)
  .put(
    "/:id",
    async ({ userId, params: { id }, body, set }) => {
      const vehicle = await VehicleService.updateVehicle(id, userId, body);
      set.status = 200; // OK
      return successResponse(vehicle, "Vehicle updated successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
      body: VehicleModel.updateBody,
    }
  )
  // Delete vehicle (owned by user)
  .delete(
    "/:id",
    async ({ userId, params: { id }, set }) => {
      await VehicleService.deleteVehicle(id, userId);
      set.status = 200; // OK
      return successMessageResponse("Vehicle deleted successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
    }
  );
