import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { auth } from "./modules/auth";
import { user } from "./modules/user";
import openapi from "@elysiajs/openapi";
import { logger } from "elysia-logger";
import { Logestic } from "logestic";

const app = new Elysia()
  .use(Logestic.preset("fancy"))
  .use(cors())
  .use(openapi())
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET || "kintil" }))
  .use(auth)
  .use(user)
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
