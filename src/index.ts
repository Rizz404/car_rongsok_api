import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { auth } from "./modules/auth";

const app = new Elysia()
  .use(cors())
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET || "kintil" }))
  .guard({ cookie: t.Cookie({ authToken: t.String() }) })
  .use(auth)
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
