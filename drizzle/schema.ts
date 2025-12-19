import { pgTable, index, foreignKey, integer, varchar, timestamp, unique, boolean, uniqueIndex, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const userRole = pgEnum("user_role", ['admin', 'user'])
export const vehicleType = pgEnum("vehicle_type", ['car', 'motorcycle'])


export const vehicles = pgTable("vehicles", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "vehicles_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	ownerId: integer("owner_id"),
	type: vehicleType().notNull(),
	make: varchar({ length: 100 }).notNull(),
	model: varchar({ length: 100 }).notNull(),
	year: integer().notNull(),
	price: integer(),
	description: varchar({ length: 1000 }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("vehicle_make_model_idx").using("btree", table.make.asc().nullsLast().op("text_ops"), table.model.asc().nullsLast().op("text_ops")),
	index("vehicle_owner_idx").using("btree", table.ownerId.asc().nullsLast().op("int4_ops")),
	index("vehicle_price_idx").using("btree", table.price.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "vehicles_owner_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const cars = pgTable("cars", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "cars_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	vehicleId: integer("vehicle_id").notNull(),
	numDoors: integer("num_doors").default(4),
	transmission: varchar({ length: 50 }).default('automatic'),
	isConvertible: boolean("is_convertible").default(false),
	hasAc: boolean("has_ac").default(true),
}, (table) => [
	foreignKey({
			columns: [table.vehicleId],
			foreignColumns: [vehicles.id],
			name: "cars_vehicle_id_vehicles_id_fk"
		}).onDelete("cascade"),
	unique("cars_vehicle_id_unique").on(table.vehicleId),
]);

export const motorcycles = pgTable("motorcycles", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "motorcycles_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	vehicleId: integer("vehicle_id").notNull(),
	engineCapacity: integer("engine_capacity").notNull(),
	isMatic: boolean("is_matic").default(true),
	hasSidecar: boolean("has_sidecar").default(false),
}, (table) => [
	foreignKey({
			columns: [table.vehicleId],
			foreignColumns: [vehicles.id],
			name: "motorcycles_vehicle_id_vehicles_id_fk"
		}).onDelete("cascade"),
	unique("motorcycles_vehicle_id_unique").on(table.vehicleId),
]);

export const vehicleImages = pgTable("vehicle_images", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "vehicle_images_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	vehicleId: integer("vehicle_id").notNull(),
	url: varchar({ length: 500 }).notNull(),
	isPrimary: boolean("is_primary").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("vehicle_images_vehicle_id_idx").using("btree", table.vehicleId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.vehicleId],
			foreignColumns: [vehicles.id],
			name: "vehicle_images_vehicle_id_vehicles_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	age: integer(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	picture: varchar({ length: 500 }).default('https://i.pinimg.com/736x/53/af/79/53af7981efc7fd7811108b7692b7ffff.jpg'),
	role: userRole().default('user').notNull(),
}, (table) => [
	uniqueIndex("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
]);
