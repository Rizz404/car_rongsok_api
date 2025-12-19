import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);
export const vehicleTypeEnum = pgEnum("vehicle_type", ["car", "motorcycle"]);

export const usersTable = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),

    picture: varchar("picture", { length: 500 }),
    role: userRoleEnum("role").default("user").notNull(),

    age: integer("age"),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)]
);

export const vehiclesTable = pgTable(
  "vehicles",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    ownerId: integer("owner_id").references(() => usersTable.id, {
      onDelete: "cascade",
    }),

    type: vehicleTypeEnum("type").notNull(),
    make: varchar("make", { length: 100 }).notNull(),
    model: varchar("model", { length: 100 }).notNull(),
    year: integer("year").notNull(),
    price: integer("price"),

    description: varchar("description", { length: 1000 }),

    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("vehicle_make_model_idx").on(table.make, table.model),

    index("vehicle_price_idx").on(table.price),

    index("vehicle_owner_idx").on(table.ownerId),
  ]
);

export const vehicleImagesTable = pgTable(
  "vehicle_images",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    vehicleId: integer("vehicle_id")
      .references(() => vehiclesTable.id, { onDelete: "cascade" })
      .notNull(),

    url: varchar("url", { length: 500 }).notNull(),

    isPrimary: boolean("is_primary").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("vehicle_images_vehicle_id_idx").on(table.vehicleId)]
);

export const carsTable = pgTable("cars", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  vehicleId: integer("vehicle_id")
    .references(() => vehiclesTable.id, { onDelete: "cascade" })
    .notNull()
    .unique(),

  numDoors: integer("num_doors").default(4),
  transmission: varchar("transmission", { length: 50 }).default("automatic"),
  isConvertible: boolean("is_convertible").default(false),
  hasAc: boolean("has_ac").default(true),
});

export const motorcyclesTable = pgTable("motorcycles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  vehicleId: integer("vehicle_id")
    .references(() => vehiclesTable.id, { onDelete: "cascade" })
    .notNull()
    .unique(),

  engineCapacity: integer("engine_capacity").notNull(),
  isMatic: boolean("is_matic").default(true),
  hasSidecar: boolean("has_sidecar").default(false),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  vehicles: many(vehiclesTable),
}));

export const vehiclesRelations = relations(vehiclesTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [vehiclesTable.ownerId],
    references: [usersTable.id],
  }),

  images: many(vehicleImagesTable),

  carDetail: one(carsTable, {
    fields: [vehiclesTable.id],
    references: [carsTable.vehicleId],
  }),
  motorcycleDetail: one(motorcyclesTable, {
    fields: [vehiclesTable.id],
    references: [motorcyclesTable.vehicleId],
  }),
}));

export const vehicleImagesRelations = relations(
  vehicleImagesTable,
  ({ one }) => ({
    vehicle: one(vehiclesTable, {
      fields: [vehicleImagesTable.vehicleId],
      references: [vehiclesTable.id],
    }),
  })
);

export const carsRelations = relations(carsTable, ({ one }) => ({
  vehicle: one(vehiclesTable, {
    fields: [carsTable.vehicleId],
    references: [vehiclesTable.id],
  }),
}));

export const motorcyclesRelations = relations(motorcyclesTable, ({ one }) => ({
  vehicle: one(vehiclesTable, {
    fields: [motorcyclesTable.vehicleId],
    references: [vehiclesTable.id],
  }),
}));
