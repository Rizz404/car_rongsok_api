import { t } from "elysia";

export const MotorcycleModel = {
  // Create motorcycle
  createBody: t.Object({
    vehicleId: t.Number(),
    engineCapacity: t.Number({ minimum: 50, maximum: 3000 }),
    isMatic: t.Optional(t.Boolean()),
    hasSidecar: t.Optional(t.Boolean()),
  }),

  updateBody: t.Partial(
    t.Object({
      engineCapacity: t.Number({ minimum: 50, maximum: 3000 }),
      isMatic: t.Boolean(),
      hasSidecar: t.Boolean(),
    })
  ),

  // List query params
  listQuery: t.Object({
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    search: t.Optional(t.String()),
  }),

  // Responses
  motorcycleResponse: t.Object({
    id: t.Number(),
    vehicleId: t.Number(),
    engineCapacity: t.Number(),
    isMatic: t.Union([t.Boolean(), t.Null()]),
    hasSidecar: t.Union([t.Boolean(), t.Null()]),
  }),

  motorcyclesListResponse: t.Object({
    motorcycles: t.Array(
      t.Object({
        id: t.Number(),
        vehicleId: t.Number(),
        engineCapacity: t.Number(),
        isMatic: t.Union([t.Boolean(), t.Null()]),
        hasSidecar: t.Union([t.Boolean(), t.Null()]),
      })
    ),
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
    totalPages: t.Number(),
  }),

  error: t.Union([
    t.Literal("Motorcycle not found"),
    t.Literal("Unauthorized"),
    t.Literal("Vehicle not found"),
    t.Literal("Motorcycle detail already exists for this vehicle"),
  ]),
} as const;
