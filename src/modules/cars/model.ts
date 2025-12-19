import { t } from "elysia";

export const CarModel = {
  // Create car
  createBody: t.Object({
    vehicleId: t.Number(),
    numDoors: t.Optional(t.Number({ minimum: 2, maximum: 10 })),
    transmission: t.Optional(t.String({ maxLength: 50 })),
    isConvertible: t.Optional(t.Boolean()),
    hasAc: t.Optional(t.Boolean()),
  }),

  updateBody: t.Partial(
    t.Object({
      numDoors: t.Number({ minimum: 2, maximum: 10 }),
      transmission: t.String({ maxLength: 50 }),
      isConvertible: t.Boolean(),
      hasAc: t.Boolean(),
    })
  ),

  // List query params
  listQuery: t.Object({
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    search: t.Optional(t.String()),
  }),

  // Responses
  carResponse: t.Object({
    id: t.Number(),
    vehicleId: t.Number(),
    numDoors: t.Union([t.Number(), t.Null()]),
    transmission: t.Union([t.String(), t.Null()]),
    isConvertible: t.Union([t.Boolean(), t.Null()]),
    hasAc: t.Union([t.Boolean(), t.Null()]),
  }),

  carsListResponse: t.Object({
    cars: t.Array(
      t.Object({
        id: t.Number(),
        vehicleId: t.Number(),
        numDoors: t.Union([t.Number(), t.Null()]),
        transmission: t.Union([t.String(), t.Null()]),
        isConvertible: t.Union([t.Boolean(), t.Null()]),
        hasAc: t.Union([t.Boolean(), t.Null()]),
      })
    ),
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
    totalPages: t.Number(),
  }),

  error: t.Union([
    t.Literal("Car not found"),
    t.Literal("Unauthorized"),
    t.Literal("Vehicle not found"),
    t.Literal("Car detail already exists for this vehicle"),
  ]),
} as const;
