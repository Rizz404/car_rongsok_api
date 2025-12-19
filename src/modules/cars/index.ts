import Elysia, { t } from "elysia";
import { CarModel } from "./model";
import { CarService } from "./service";
import jwt from "@elysiajs/jwt";
import {
  successResponse,
  successListResponse,
  successMessageResponse,
} from "../../utils/response";

export const car = new Elysia({ prefix: "/cars" })
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
  // List cars owned by current user
  .get(
    "/",
    async ({ userId, query, set }) => {
      const result = await CarService.listCars(userId, query);
      set.status = 200; // OK
      return successListResponse(result.cars, "Cars retrieved successfully", {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    },
    {
      query: CarModel.listQuery,
    }
  )
  // Get specific car by ID (owned by user)
  .get(
    "/:id",
    async ({ userId, params: { id }, set }) => {
      const car = await CarService.getCar(id, userId);
      set.status = 200; // OK
      return successResponse(car, "Car retrieved successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
    }
  )
  // Create car
  .post(
    "/",
    async ({ userId, body, set }) => {
      const car = await CarService.createCar(userId, body);
      set.status = 201; // Created
      return successResponse(car, "Car created successfully");
    },
    {
      body: CarModel.createBody,
    }
  )
  // Update car by ID (owned by user)
  .put(
    "/:id",
    async ({ userId, params: { id }, body, set }) => {
      const car = await CarService.updateCar(id, userId, body);
      set.status = 200; // OK
      return successResponse(car, "Car updated successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
      body: CarModel.updateBody,
    }
  )
  // Delete car (owned by user)
  .delete(
    "/:id",
    async ({ userId, params: { id }, set }) => {
      await CarService.deleteCar(id, userId);
      set.status = 200; // OK
      return successMessageResponse("Car deleted successfully");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
    }
  );
