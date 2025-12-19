import { eq, like, desc, asc, sql } from "drizzle-orm";
import db from "../../database/db-config";
import { usersTable } from "../../database/db-schema";
import { UserModel } from "./model";
import { password } from "bun";

export class UserService {
  // Get single user (protected)
  static async getUser(userId: number) {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user[0]) throw new Error("User not found");
    const { password: _, ...userWithoutPassword } = user[0];
    return userWithoutPassword;
  }

  // Get current user profile
  static async getProfile(userId: number) {
    return await this.getUser(userId);
  }

  // List users (admin pagination)
  static async listUsers({
    page = 1,
    limit = 10,
    search,
  }: typeof UserModel.listQuery.static) {
    const offset = (page - 1) * limit;
    const whereConditions: any[] = [];

    if (search) {
      whereConditions.push(
        sql`(${usersTable.name} ILIKE ${`%${search}%`} OR ${
          usersTable.email
        } ILIKE ${`%${search}%`})`
      );
    }

    const [users, total] = await Promise.all([
      db
        .select()
        .from(usersTable)
        .where(
          whereConditions.length
            ? sql`WHERE ${sql.join(whereConditions, "AND")}`
            : undefined
        )
        .orderBy(desc(usersTable.created_at))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)` })
        .from(usersTable)
        .where(
          whereConditions.length
            ? sql`WHERE ${sql.join(whereConditions, "AND")}`
            : undefined
        ),
    ]);

    return {
      users: users.map(({ password: _, ...user }) => user),
      total: Number(total[0]?.count || 0),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
    };
  }

  // Create user (admin only)
  static async createUser(data: typeof UserModel.createBody.static) {
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email));

    if (existingUser.length > 0) {
      throw new Error("User already exists");
    }

    const hashedPassword = await password.hash(data.password);

    const [user] = await db
      .insert(usersTable)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        age: data.age,
      })
      .returning();

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Update user
  static async updateUser(
    userId: number,
    data: NonNullable<typeof UserModel.updateBody.static>
  ) {
    const user = await this.getUser(userId);

    // Check email uniqueness if changed
    if (data.email && data.email !== user.email) {
      const emailExists = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, data.email));

      if (emailExists.length > 0) {
        throw new Error("User already exists");
      }
    }

    const [updatedUser] = await db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, userId))
      .returning();

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  // Delete user
  static async deleteUser(userId: number) {
    const user = await this.getUser(userId);
    await db.delete(usersTable).where(eq(usersTable.id, userId));
    return user;
  }
}
