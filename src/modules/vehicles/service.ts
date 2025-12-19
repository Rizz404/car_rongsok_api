import { eq, like, desc, sql } from "drizzle-orm";
import db from "../../database/db-config";
import { vehiclesTable } from "../../database/db-schema";
import { VehicleModel } from "./model";

export class VehicleService {
  // Get single vehicle (owned by user)
  static async getVehicle(vehicleId: number, ownerId: number) {
    const vehicle = await db
      .select()
      .from(vehiclesTable)
      .where(
        sql`${vehiclesTable.id} = ${vehicleId} AND ${vehiclesTable.ownerId} = ${ownerId}`
      )
      .limit(1);

    if (!vehicle[0]) throw new Error("Vehicle not found");
    return vehicle[0];
  }

  // List vehicles owned by user
  static async listVehicles(
    ownerId: number,
    { page = 1, limit = 10, search }: typeof VehicleModel.listQuery.static
  ) {
    const offset = (page - 1) * limit;
    const whereConditions: any[] = [eq(vehiclesTable.ownerId, ownerId)];

    if (search) {
      whereConditions.push(
        sql`(${vehiclesTable.make} ILIKE ${`%${search}%`} OR ${
          vehiclesTable.model
        } ILIKE ${`%${search}%`} OR ${
          vehiclesTable.description
        } ILIKE ${`%${search}%`})`
      );
    }

    const [vehicles, total] = await Promise.all([
      db
        .select()
        .from(vehiclesTable)
        .where(sql.join(whereConditions, " AND "))
        .orderBy(desc(vehiclesTable.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)` })
        .from(vehiclesTable)
        .where(sql.join(whereConditions, " AND ")),
    ]);

    return {
      vehicles,
      total: Number(total[0]?.count || 0),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
    };
  }

  // Create vehicle
  static async createVehicle(
    ownerId: number,
    data: typeof VehicleModel.createBody.static
  ) {
    const [vehicle] = await db
      .insert(vehiclesTable)
      .values({
        ownerId,
        type: data.type,
        make: data.make,
        model: data.model,
        year: data.year,
        price: data.price,
        description: data.description,
      })
      .returning();

    return vehicle;
  }

  // Update vehicle
  static async updateVehicle(
    vehicleId: number,
    ownerId: number,
    data: NonNullable<typeof VehicleModel.updateBody.static>
  ) {
    const vehicle = await this.getVehicle(vehicleId, ownerId);

    const [updatedVehicle] = await db
      .update(vehiclesTable)
      .set(data)
      .where(
        sql`${vehiclesTable.id} = ${vehicleId} AND ${vehiclesTable.ownerId} = ${ownerId}`
      )
      .returning();

    return updatedVehicle;
  }

  // Delete vehicle
  static async deleteVehicle(vehicleId: number, ownerId: number) {
    const vehicle = await this.getVehicle(vehicleId, ownerId);
    await db
      .delete(vehiclesTable)
      .where(
        sql`${vehiclesTable.id} = ${vehicleId} AND ${vehiclesTable.ownerId} = ${ownerId}`
      );
    return vehicle;
  }
}
