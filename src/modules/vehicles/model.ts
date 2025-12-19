import { t } from "elysia";

export const VehicleModel = {
  // Create vehicle
  createBody: t.Object({
    type: t.Union([t.Literal("car"), t.Literal("motorcycle")]),
    make: t.String({ minLength: 1, maxLength: 100 }),
    model: t.String({ minLength: 1, maxLength: 100 }),
    year: t.Number({ minimum: 1900, maximum: new Date().getFullYear() + 1 }),
    price: t.Optional(t.Number({ minimum: 0 })),
    description: t.Optional(t.String({ maxLength: 1000 })),
  }),

  updateBody: t.Partial(
    t.Object({
      type: t.Union([t.Literal("car"), t.Literal("motorcycle")]),
      make: t.String({ minLength: 1, maxLength: 100 }),
      model: t.String({ minLength: 1, maxLength: 100 }),
      year: t.Number({ minimum: 1900, maximum: new Date().getFullYear() + 1 }),
      price: t.Number({ minimum: 0 }),
      description: t.String({ maxLength: 1000 }),
    })
  ),

  // List query params
  listQuery: t.Object({
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    search: t.Optional(t.String()),
  }),

  // Responses
  vehicleResponse: t.Object({
    id: t.Number(),
    ownerId: t.Number(),
    type: t.Union([t.Literal("car"), t.Literal("motorcycle")]),
    make: t.String(),
    model: t.String(),
    year: t.Number(),
    price: t.Union([t.Number(), t.Null()]),
    description: t.Union([t.String(), t.Null()]),
    createdAt: t.Date(),
    updatedAt: t.Union([t.Date(), t.Null()]),
  }),

  vehiclesListResponse: t.Object({
    vehicles: t.Array(
      t.Object({
        id: t.Number(),
        ownerId: t.Number(),
        type: t.Union([t.Literal("car"), t.Literal("motorcycle")]),
        make: t.String(),
        model: t.String(),
        year: t.Number(),
        price: t.Union([t.Number(), t.Null()]),
        description: t.Union([t.String(), t.Null()]),
        createdAt: t.Date(),
        updatedAt: t.Union([t.Date(), t.Null()]),
      })
    ),
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
    totalPages: t.Number(),
  }),

  error: t.Union([t.Literal("Vehicle not found"), t.Literal("Unauthorized")]),
} as const;
