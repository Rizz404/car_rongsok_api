import Elysia, { t } from "elysia";
import { AuthModel } from "./model";
import { AuthService } from "./service";
import jwt from "@elysiajs/jwt";
import { successResponse } from "../../utils/response";

export const auth = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "test",
    })
  )
  .post(
    "/sign-up",
    async ({ body, jwt, cookie: { authToken }, set }) => {
      const result = await AuthService.signUp(body);
      const token = await jwt.sign(result.payload);

      authToken.set({
        value: token,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "none",
        secure: process.env.NODE_ENV == "production",
      });

      set.status = 201; // Created
      return successResponse(
        {
          user: result.user,
          token,
        },
        "User registered successfully"
      );
    },
    {
      body: AuthModel.signUpBody,
      cookie: t.Cookie({ authToken: t.Optional(t.String()) }),
    }
  )
  .post(
    "/sign-in",
    async ({ body, jwt, cookie: { authToken }, set }) => {
      const result = await AuthService.signIn(body);
      const token = await jwt.sign(result.payload);

      authToken.set({
        value: token,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "none",
        secure: process.env.NODE_ENV == "production",
      });

      set.status = 200; // OK
      return successResponse(
        {
          user: result.user,
          token,
        },
        "Login successful"
      );
    },
    {
      body: AuthModel.signInBody,
      cookie: t.Cookie({ authToken: t.Optional(t.String()) }),
    }
  );
