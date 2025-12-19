import Elysia, { t } from "elysia";
import { AuthModel } from "./model";
import { AuthService } from "./service";
import jwt from "@elysiajs/jwt";

export const auth = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "test",
    })
  )
  .guard({
    cookie: t.Cookie({
      authToken: t.String(),
    }),
  })
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

      return result.user;
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

      return result.user;
    },
    {
      body: AuthModel.signInBody,
      cookie: t.Cookie({ authToken: t.Optional(t.String()) }),
    }
  );
