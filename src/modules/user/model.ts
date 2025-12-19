import { t } from "elysia";

export const UserModel = {
  // Create user (admin only)
  createBody: t.Object({
    name: t.String({ minLength: 3, maxLength: 50 }),
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 5 }),
    age: t.Number({ minimum: 0, maximum: 150 }),
  }),

  updateBody: t.Partial(
    t.Object({
      name: t.String({ minLength: 3, maxLength: 50 }),
      email: t.String({ format: "email" }),
      age: t.Number({ minimum: 0, maximum: 150 }),
    })
  ),

  // List query params
  listQuery: t.Object({
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    search: t.Optional(t.String()),
  }),

  // Responses
  userResponse: t.Object({
    id: t.Number(),
    name: t.String(),
    email: t.String(),
    age: t.Union([t.Number(), t.Null()]),
    created_at: t.Date(),
    updated_at: t.Union([t.Date(), t.Null()]),
  }),

  usersListResponse: t.Object({
    users: t.Array(
      t.Object({
        id: t.Number(),
        name: t.String(),
        email: t.String(),
        age: t.Union([t.Number(), t.Null()]),
        created_at: t.Date(),
        updated_at: t.Union([t.Date(), t.Null()]),
      })
    ),
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
    totalPages: t.Number(),
  }),

  error: t.Union([
    t.Literal("User not found"),
    t.Literal("User already exists"),
  ]),
} as const;
