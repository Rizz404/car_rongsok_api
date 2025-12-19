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

  authResponse: t.Object({
    user: t.Object({
      id: t.String(),
      name: t.String(),
      email: t.String(),
    }),
    token: t.String(),
  }),

  error: t.Union([
    t.Literal("Invalid credentials"),
    t.Literal("User already exists"),
  ]),
} as const;
