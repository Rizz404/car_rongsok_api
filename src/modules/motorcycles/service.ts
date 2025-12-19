import { eq, like, desc, sql, and } from "drizzle-orm";
import db from "../../database/db-config";
import { motorcyclesTable, vehiclesTable } from "../../database/db-schema";
import { MotorcycleModel } from "./model";

export class MotorcycleService {
  // Get single motorcycle (owned by user via vehicle)
  static async getMotorcycle(motorcycleId: number, userId: number) {
    const motorcycle = await db
      .select()
      .from(motorcyclesTable)
      .innerJoin(
        vehiclesTable,
        eq(motorcyclesTable.vehicleId, vehiclesTable.id)
      )
      .where(
        and(
          eq(motorcyclesTable.id, motorcycleId),
          eq(vehiclesTable.ownerId, userId)
        )
      )
      .limit(1);

    if (!motorcycle[0]) throw new Error("Motorcycle not found");
    return motorcycle[0].motorcycles;
  }

  // List motorcycles owned by user
  static async listMotorcycles(
    userId: number,
    { page = 1, limit = 10, search }: typeof MotorcycleModel.listQuery.static
  ) {
    const offset = (page - 1) * limit;
    const whereConditions: any[] = [eq(vehiclesTable.ownerId, userId)];

    if (search) {
      whereConditions.push(
        sql`${motorcyclesTable.engineCapacity}::text ILIKE ${`%${search}%`}`
      );
    }

    const [motorcycles, total] = await Promise.all([
      db
        .select()
        .from(motorcyclesTable)
        .innerJoin(
          vehiclesTable,
          eq(motorcyclesTable.vehicleId, vehiclesTable.id)
        )
        .where(and(...whereConditions))
        .orderBy(desc(motorcyclesTable.id))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)` })
        .from(motorcyclesTable)
        .innerJoin(
          vehiclesTable,
          eq(motorcyclesTable.vehicleId, vehiclesTable.id)
        )
        .where(and(...whereConditions)),
    ]);

    return {
      motorcycles: motorcycles.map(({ motorcycles }) => motorcycles),
      total: Number(total[0]?.count || 0),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
    };
  }

  // Create motorcycle
  static async createMotorcycle(
    userId: number,
    data: typeof MotorcycleModel.createBody.static
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

    // Check if motorcycle detail already exists for this vehicle
    const existingMotorcycle = await db
      .select()
      .from(motorcyclesTable)
      .where(eq(motorcyclesTable.vehicleId, data.vehicleId))
      .limit(1);

    if (existingMotorcycle[0])
      throw new Error("Motorcycle detail already exists for this vehicle");

    const [motorcycle] = await db
      .insert(motorcyclesTable)
      .values({
        vehicleId: data.vehicleId,
        engineCapacity: data.engineCapacity,
        isMatic: data.isMatic,
        hasSidecar: data.hasSidecar,
      })
      .returning();

    return motorcycle;
  }

  // Update motorcycle
  static async updateMotorcycle(
    motorcycleId: number,
    userId: number,
    data: NonNullable<typeof MotorcycleModel.updateBody.static>
  ) {
    const motorcycle = await this.getMotorcycle(motorcycleId, userId);

    const [updatedMotorcycle] = await db
      .update(motorcyclesTable)
      .set(data)
      .where(eq(motorcyclesTable.id, motorcycleId))
      .returning();

    return updatedMotorcycle;
  }

  // Delete motorcycle
  static async deleteMotorcycle(motorcycleId: number, userId: number) {
    const motorcycle = await this.getMotorcycle(motorcycleId, userId);
    await db
      .delete(motorcyclesTable)
      .where(eq(motorcyclesTable.id, motorcycleId));
    return motorcycle;
  }
}
