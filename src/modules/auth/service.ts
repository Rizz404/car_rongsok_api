import { eq } from "drizzle-orm";
import db from "../../database/db-config";
import { usersTable } from "../../database/db-schema";
import { AuthModel } from "./model";
import { hash, password } from "bun";

export class AuthService {
  static async signUp(data: typeof AuthModel.signUpBody.static) {
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email));

    if (existingUser.length > 0) {
      throw new Error("User already exists");
    }

    const hashedPassword = await password.hash(data.password);

    const user = (
      await db
        .insert(usersTable)
        .values({
          name: data.name,
          email: data.email,
          password: hashedPassword,
          age: data.age,
        })
        .returning()
    )[0];

    return { user, payload: { userId: user.id } };
  }

  static async signIn(data: typeof AuthModel.signInBody.static) {
    const user = (
      await db.select().from(usersTable).where(eq(usersTable.email, data.email))
    )[0];

    if (!user || !(await password.verify(data.password, user.password))) {
      throw new Error("Invalid credentials");
    }

    return {
      user: user,
      payload: { userId: user.id },
    };
  }
}
