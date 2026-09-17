import {
  createHmac,
  timingSafeEqual,
} from "crypto";

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

    if (!email || !code) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email and verification code are required",
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
            "Account not found",
        },
        {
          status: 404,
        }
      );
    }

    const verification =
  await db.verificationCode.findFirst({
    where: {
      userId: user.id,
      channel: "EMAIL",
      purpose: "SIGNUP",
      destination: email,
      usedAt: null,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

    if (!verification) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No active verification code was found",
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
            "Verification code has expired",
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
            "Too many verification attempts. Request a new code.",
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
            "Incorrect verification code",
        },
        {
          status: 400,
        }
      );
    }

    await db.$transaction([
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

      db.user.update({
        where: {
          id:
            user.id,
        },

        data: {
          status:
            "ACTIVE",

          emailVerifiedAt:
            new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,

      message:
        "Email verified successfully",
    });
  } catch (error) {
    console.error(
      "Verify OTP error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not verify email",
      },
      {
        status: 500,
      }
    );
  }
}