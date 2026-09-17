import {
  createHmac,
  timingSafeEqual,
} from "crypto";

import {
  hash,
} from "bcryptjs";

import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";

export const runtime = "nodejs";

function hashOtp(code: string) {
  return createHmac(
    "sha256",
    process.env.OTP_SECRET!
  )
    .update(code)
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

    const code = String(
      body.code ?? ""
    ).trim();

    const password = String(
      body.password ?? ""
    );

    if (
      !email ||
      !code ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email, verification code and new password are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters.",
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
            "Invalid or expired verification code.",
        },
        {
          status: 400,
        }
      );
    }

    const verification =
      await db.verificationCode.findFirst({
        where: {
          userId:
            user.id,

          channel:
            "EMAIL",

          purpose:
            "PASSWORD_RESET",

          destination:
            email,

          usedAt:
            null,
        },

        orderBy: {
          createdAt:
            "desc",
        },
      });

    if (!verification) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid or expired verification code.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      verification.expiresAt.getTime() <
      Date.now()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code has expired. Request a new one.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      verification.attempts >= 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many incorrect attempts. Request a new code.",
        },
        {
          status: 429,
        }
      );
    }

    const submittedHash =
      hashOtp(code);

    const storedBuffer =
      Buffer.from(
        verification.codeHash,
        "hex"
      );

    const submittedBuffer =
      Buffer.from(
        submittedHash,
        "hex"
      );

    const codeMatches =
      storedBuffer.length ===
        submittedBuffer.length &&
      timingSafeEqual(
        storedBuffer,
        submittedBuffer
      );

    if (!codeMatches) {
      await db.verificationCode.update({
        where: {
          id:
            verification.id,
        },

        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Incorrect verification code.",
        },
        {
          status: 400,
        }
      );
    }

    const passwordHash =
      await hash(
        password,
        12
      );

    await db.$transaction([
      db.user.update({
        where: {
          id:
            user.id,
        },

        data: {
          passwordHash,
        },
      }),

      db.verificationCode.update({
        where: {
          id:
            verification.id,
        },

        data: {
          usedAt:
            new Date(),
        },
      }),

      /*
        Sign the user out everywhere after
        changing the password.
      */
      db.session.deleteMany({
        where: {
          userId:
            user.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,

      message:
        "Password changed successfully.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not reset password.",
      },
      {
        status: 500,
      }
    );
  }
}