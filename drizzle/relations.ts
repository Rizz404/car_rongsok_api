import { relations } from "drizzle-orm/relations";
import { users, vehicles, cars, motorcycles, vehicleImages } from "./schema";

export const vehiclesRelations = relations(vehicles, ({one, many}) => ({
	user: one(users, {
		fields: [vehicles.ownerId],
		references: [users.id]
	}),
	cars: many(cars),
	motorcycles: many(motorcycles),
	vehicleImages: many(vehicleImages),
}));

export const usersRelations = relations(users, ({many}) => ({
	vehicles: many(vehicles),
}));

export const carsRelations = relations(cars, ({one}) => ({
	vehicle: one(vehicles, {
		fields: [cars.vehicleId],
		references: [vehicles.id]
	}),
}));

export const motorcyclesRelations = relations(motorcycles, ({one}) => ({
	vehicle: one(vehicles, {
		fields: [motorcycles.vehicleId],
		references: [vehicles.id]
	}),
}));

export const vehicleImagesRelations = relations(vehicleImages, ({one}) => ({
	vehicle: one(vehicles, {
		fields: [vehicleImages.vehicleId],
		references: [vehicles.id]
	}),
}));