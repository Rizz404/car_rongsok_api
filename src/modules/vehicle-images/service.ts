import { eq, like, desc, sql, and } from "drizzle-orm";
import db from "../../database/db-config";
import { vehicleImagesTable, vehiclesTable } from "../../database/db-schema";
import { VehicleImageModel } from "./model";

export class VehicleImageService {
  // Get single vehicle image (owned by user via vehicle)
  static async getVehicleImage(imageId: number, userId: number) {
    const image = await db
      .select()
      .from(vehicleImagesTable)
      .innerJoin(
        vehiclesTable,
        eq(vehicleImagesTable.vehicleId, vehiclesTable.id)
      )
      .where(
        and(
          eq(vehicleImagesTable.id, imageId),
          eq(vehiclesTable.ownerId, userId)
        )
      )
      .limit(1);

    if (!image[0]) throw new Error("Vehicle image not found");
    return image[0].vehicle_images;
  }

  // List vehicle images owned by user
  static async listVehicleImages(
    userId: number,
    { page = 1, limit = 10, search }: typeof VehicleImageModel.listQuery.static
  ) {
    const offset = (page - 1) * limit;
    const whereConditions: any[] = [eq(vehiclesTable.ownerId, userId)];

    if (search) {
      whereConditions.push(
        sql`${vehicleImagesTable.url} ILIKE ${`%${search}%`}`
      );
    }

    const [images, total] = await Promise.all([
      db
        .select()
        .from(vehicleImagesTable)
        .innerJoin(
          vehiclesTable,
          eq(vehicleImagesTable.vehicleId, vehiclesTable.id)
        )
        .where(and(...whereConditions))
        .orderBy(desc(vehicleImagesTable.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)` })
        .from(vehicleImagesTable)
        .innerJoin(
          vehiclesTable,
          eq(vehicleImagesTable.vehicleId, vehiclesTable.id)
        )
        .where(and(...whereConditions)),
    ]);

    return {
      vehicleImages: images.map(({ vehicle_images }) => vehicle_images),
      total: Number(total[0]?.count || 0),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
    };
  }

  // Create vehicle image
  static async createVehicleImage(
    userId: number,
    data: typeof VehicleImageModel.createBody.static
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

    const [image] = await db
      .insert(vehicleImagesTable)
      .values({
        vehicleId: data.vehicleId,
        url: data.url,
        isPrimary: data.isPrimary,
      })
      .returning();

    return image;
  }

  // Update vehicle image
  static async updateVehicleImage(
    imageId: number,
    userId: number,
    data: NonNullable<typeof VehicleImageModel.updateBody.static>
  ) {
    const image = await this.getVehicleImage(imageId, userId);

    const [updatedImage] = await db
      .update(vehicleImagesTable)
      .set(data)
      .where(eq(vehicleImagesTable.id, imageId))
      .returning();

    return updatedImage;
  }

  // Delete vehicle image
  static async deleteVehicleImage(imageId: number, userId: number) {
    const image = await this.getVehicleImage(imageId, userId);
    await db
      .delete(vehicleImagesTable)
      .where(eq(vehicleImagesTable.id, imageId));
    return image;
  }
}
