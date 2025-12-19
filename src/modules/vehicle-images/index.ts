import Elysia, { t } from "elysia";
import { VehicleImageModel } from "./model";
import { VehicleImageService } from "./service";
import jwt from "@elysiajs/jwt";
import {
  successResponse,
  successListResponse,
  successMessageResponse,
} from "../../utils/response";

export const vehicleImage = new Elysia({ prefix: "/vehicle-images" })
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
  // List vehicle images owned by current user
  .get(
    "/",
    async ({ userId, query, set }) => {
      const result = await VehicleImageService.listVehicleImages(userId, query);
      set.status = 200; // OK
      return successListResponse(
        result.vehicleImages,
        "Vehicle images retrieved successfully",
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        }
      );
    },
    {
      query: VehicleImageModel.listQuery,
    }
  )
  // Get specific vehicle image by ID (owned by user)
  .get(
    "/:id",
    async ({ userId, params: { id }, set }) => {
      const image = await VehicleImageService.getVehicleImage(id, userId);
      set.status = 200; // OK
      return successResponse(image, "Vehicle image retrieved successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
    }
  )
  // Create vehicle image
  .post(
    "/",
    async ({ userId, body, set }) => {
      const image = await VehicleImageService.createVehicleImage(userId, body);
      set.status = 201; // Created
      return successResponse(image, "Vehicle image created successfully");
    },
    {
      body: VehicleImageModel.createBody,
    }
  )
  // Update vehicle image by ID (owned by user)
  .put(
    "/:id",
    async ({ userId, params: { id }, body, set }) => {
      const image = await VehicleImageService.updateVehicleImage(
        id,
        userId,
        body
      );
      set.status = 200; // OK
      return successResponse(image, "Vehicle image updated successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
      body: VehicleImageModel.updateBody,
    }
  )
  // Delete vehicle image (owned by user)
  .delete(
    "/:id",
    async ({ userId, params: { id }, set }) => {
      await VehicleImageService.deleteVehicleImage(id, userId);
      set.status = 200; // OK
      return successMessageResponse("Vehicle image deleted successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
    }
  );
