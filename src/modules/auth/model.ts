import { t } from "elysia";

export const AuthModel = {
  signUpBody: t.Object({
    name: t.String({ minLength: 3, maxLength: 50 }),
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 5 }),
  }),

  signInBody: t.Object({
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 5 }),
  }),

  userResponse: t.Object({
    user: t.Object({
      id: t.Number(),
      name: t.String(),
      email: t.String(),
      picture: t.Union([t.String(), t.Null()]),
      role: t.Union([t.Literal("admin"), t.Literal("user")]),
      age: t.Union([t.Number(), t.Null()]),
      createdAt: t.Date(),
      updatedAt: t.Union([t.Date(), t.Null()]),
    }),
    token: t.String(),
  }),

  error: t.Union([
    t.Literal("Invalid credentials"),
    t.Literal("User already exists"),
  ]),
} as const;
