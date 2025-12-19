import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { auth } from "./modules/auth";
import { user } from "./modules/user";
import { vehicle } from "./modules/vehicles";
import { vehicleImage } from "./modules/vehicle-images";
import { car } from "./modules/cars";
import { motorcycle } from "./modules/motorcycles";
import openapi from "@elysiajs/openapi";
import { logger } from "elysia-logger";
import { Logestic } from "logestic";
import figlet from "figlet";
import { successResponse, errorResponse } from "./utils/response";

const app = new Elysia()
  .use(Logestic.preset("fancy"))
  .use(cors())
  .use(openapi())
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET || "kintil" }))
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 422; // Unprocessable Entity
      return errorResponse("Validation error", error.all);
    }

    if (code === "NOT_FOUND") {
      set.status = 404; // Not Found
      return errorResponse("Route not found");
    }

    // Check for specific error messages
    if (error.message === "Unauthorized") {
      set.status = 401; // Unauthorized
      return errorResponse("Unauthorized access");
    }

    if (
      error.message === "User not found" ||
      error.message === "Vehicle not found" ||
      error.message === "Vehicle image not found" ||
      error.message === "Car not found" ||
      error.message === "Motorcycle not found" ||
      error.message.includes("not found")
    ) {
      set.status = 404; // Not Found
      return errorResponse(error.message);
    }

    if (
      error.message === "User already exists" ||
      error.message === "Car detail already exists for this vehicle" ||
      error.message === "Motorcycle detail already exists for this vehicle" ||
      error.message.includes("already exists")
    ) {
      set.status = 409; // Conflict
      return errorResponse(error.message);
    }

    if (error.message === "Invalid credentials") {
      set.status = 401; // Unauthorized
      return errorResponse(error.message);
    }

    // Default internal server error
    set.status = 500; // Internal Server Error
    return errorResponse(error.message || "Internal server error");
  })
  .get("/health", () => {
    return successResponse(
      {
        status: "ok",
      },
      "Server is healthy and running! 🏃💨"
    );
  })
  .get("/metrics", () => {
    const memoryUsage = process.memoryUsage();
    return successResponse(
      {
        uptime: process.uptime(), // Udah nyala berapa detik
        memory: {
          rss: memoryUsage.rss, // Resident Set Size
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
        },
        platform: process.platform,
        arch: process.arch,
        version: Bun.version, // Pamer versi Bun hehe
      },
      "Server metrics retrieved successfully"
    );
  })
  .group("/api/v1", (app) =>
    app
      // Masukkan module-module kamu di sini
      .use(auth)
      .use(user)
      .use(vehicle)
      .use(vehicleImage)
      .use(car)
      .use(motorcycle)
  )
  .get("/", () => {
    // Kamu bisa ganti teks "ELYSIA" jadi nama apps kamu
    const text = figlet.textSync(
      "Elysia imut wangi-wangi jadi pengen di aksowkfodfaofdkfak terus di kenteoasfoasdfndf sampe fdiafinai9venw9",
      {
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 150,
        whitespaceBreak: true,
      }
    );

    // Kita return sebagai Response object biar bisa atur header text/plain
    // Supaya font-nya monospaced dan rapi pas dibuka di browser!
    return new Response(text, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  })
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
