import {
  createHash,
} from "crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";

export const runtime = "nodejs";

const SESSION_COOKIE_NAME =
  "flamingo_session";

function hashSessionToken(
  token: string
) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function POST() {
  try {
    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        SESSION_COOKIE_NAME
      )?.value;

    if (token) {
      const tokenHash =
        hashSessionToken(
          token
        );

      await db.session.deleteMany({
        where: {
          tokenHash,
        },
      });
    }

    const response =
      NextResponse.json({
        success: true,
        message:
          "Signed out successfully.",
      });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      "",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",

        expires:
          new Date(0),

        maxAge: 0,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "Logout error:",
      error
    );

    /*
      Even if deleting the database
      session fails, expire the browser
      cookie.
    */
    const response =
      NextResponse.json({
        success: true,
      });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      "",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",

        expires:
          new Date(0),

        maxAge: 0,
      }
    );

    return response;
  }
}