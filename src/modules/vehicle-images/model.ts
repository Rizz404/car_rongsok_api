import { t } from "elysia";

export const VehicleImageModel = {
  // Create vehicle image
  createBody: t.Object({
    vehicleId: t.Number(),
    url: t.String({ minLength: 1, maxLength: 500 }),
    isPrimary: t.Optional(t.Boolean()),
  }),

  updateBody: t.Partial(
    t.Object({
      url: t.String({ minLength: 1, maxLength: 500 }),
      isPrimary: t.Boolean(),
    })
  ),

  // List query params
  listQuery: t.Object({
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    search: t.Optional(t.String()),
  }),

  // Responses
  vehicleImageResponse: t.Object({
    id: t.Number(),
    vehicleId: t.Number(),
    url: t.String(),
    isPrimary: t.Boolean(),
    createdAt: t.Date(),
  }),

  vehicleImagesListResponse: t.Object({
    vehicleImages: t.Array(
      t.Object({
        id: t.Number(),
        vehicleId: t.Number(),
        url: t.String(),
        isPrimary: t.Boolean(),
        createdAt: t.Date(),
      })
    ),
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
    totalPages: t.Number(),
  }),

  error: t.Union([
    t.Literal("Vehicle image not found"),
    t.Literal("Unauthorized"),
    t.Literal("Vehicle not found"),
  ]),
} as const;
