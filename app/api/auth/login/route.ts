import {
  createHash,
  randomBytes,
} from "crypto";

import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";

export const runtime = "nodejs";

const SESSION_COOKIE_NAME =
  "flamingo_session";

const SESSION_DAYS = 30;

function hashSessionToken(
  token: string
) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const email = String(
      body.email ?? ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      body.password ?? ""
    );

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      await db.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      user.status ===
      "PENDING_VERIFICATION"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please verify your email before signing in.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      user.status ===
      "SUSPENDED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This account has been suspended.",
        },
        {
          status: 403,
        }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password login has not been set up for this account.",
        },
        {
          status: 400,
        }
      );
    }

    const passwordMatches =
      await compare(
        password,
        user.passwordHash
      );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    const cookieStore =
      await cookies();

    /*
      Remove the session currently being
      used by this browser before creating
      the new one.
    */
    const oldToken =
      cookieStore.get(
        SESSION_COOKIE_NAME
      )?.value;

    if (oldToken) {
      const oldTokenHash =
        hashSessionToken(
          oldToken
        );

      await db.session.deleteMany({
        where: {
          tokenHash:
            oldTokenHash,
        },
      });
    }

    /*
      Create a completely new session for
      the account that just signed in.
    */
    const token =
      randomBytes(32).toString(
        "hex"
      );

    const tokenHash =
      hashSessionToken(token);

    const expiresAt =
      new Date(
        Date.now() +
          SESSION_DAYS *
            24 *
            60 *
            60 *
            1000
      );

    await db.session.create({
      data: {
        userId:
          user.id,

        tokenHash,

        expiresAt,
      },
    });

    /*
      Replace the browser cookie.
    */
    cookieStore.set(
      SESSION_COOKIE_NAME,
      token,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",

        expires:
          expiresAt,
      }
    );

    return NextResponse.json({
      success: true,

      message:
        "Signed in successfully.",

      user: {
        id:
          user.id,

        fullName:
          user.fullName,

        email:
          user.email,

        role:
          user.role,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not sign in.",
      },
      {
        status: 500,
      }
    );
  }
}