import { eq, like, desc, sql, and } from "drizzle-orm";
import db from "../../database/db-config";
import { carsTable, vehiclesTable } from "../../database/db-schema";
import { CarModel } from "./model";

export class CarService {
  // Get single car (owned by user via vehicle)
  static async getCar(carId: number, userId: number) {
    const car = await db
      .select()
      .from(carsTable)
      .innerJoin(vehiclesTable, eq(carsTable.vehicleId, vehiclesTable.id))
      .where(and(eq(carsTable.id, carId), eq(vehiclesTable.ownerId, userId)))
      .limit(1);

    if (!car[0]) throw new Error("Car not found");
    return car[0].cars;
  }

  // List cars owned by user
  static async listCars(
    userId: number,
    { page = 1, limit = 10, search }: typeof CarModel.listQuery.static
  ) {
    const offset = (page - 1) * limit;
    const whereConditions: any[] = [eq(vehiclesTable.ownerId, userId)];

    if (search) {
      whereConditions.push(
        sql`${carsTable.transmission} ILIKE ${`%${search}%`}`
      );
    }

    const [cars, total] = await Promise.all([
      db
        .select()
        .from(carsTable)
        .innerJoin(vehiclesTable, eq(carsTable.vehicleId, vehiclesTable.id))
        .where(and(...whereConditions))
        .orderBy(desc(carsTable.id))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)` })
        .from(carsTable)
        .innerJoin(vehiclesTable, eq(carsTable.vehicleId, vehiclesTable.id))
        .where(and(...whereConditions)),
    ]);

    return {
      cars: cars.map(({ cars }) => cars),
      total: Number(total[0]?.count || 0),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
    };
  }

  // Create car
  static async createCar(
    userId: number,
    data: typeof CarModel.createBody.static
  ) {
    // Check if vehicle belongs to user
    const vehicle = await db
      .select()
      .from(vehiclesTable)
      .where(
        and(
          eq(vehiclesTable.id, data.vehicleId),
          eq(vehiclesTable.ownerId, userId)
        )
      )
      .limit(1);

    if (!vehicle[0]) throw new Error("Vehicle not found");

    // Check if car detail already exists for this vehicle
    const existingCar = await db
      .select()
      .from(carsTable)
      .where(eq(carsTable.vehicleId, data.vehicleId))
      .limit(1);

    if (existingCar[0])
      throw new Error("Car detail already exists for this vehicle");

    const [car] = await db
      .insert(carsTable)
      .values({
        vehicleId: data.vehicleId,
        numDoors: data.numDoors,
        transmission: data.transmission,
        isConvertible: data.isConvertible,
        hasAc: data.hasAc,
      })
      .returning();

    return car;
  }

  // Update car
  static async updateCar(
    carId: number,
    userId: number,
    data: NonNullable<typeof CarModel.updateBody.static>
  ) {
    const car = await this.getCar(carId, userId);

    const [updatedCar] = await db
      .update(carsTable)
      .set(data)
      .where(eq(carsTable.id, carId))
      .returning();

    return updatedCar;
  }

  // Delete car
  static async deleteCar(carId: number, userId: number) {
    const car = await this.getCar(carId, userId);
    await db.delete(carsTable).where(eq(carsTable.id, carId));
    return car;
  }
}
