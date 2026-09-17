import {
  createHmac,
  randomInt,
} from "crypto";

import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";

export const runtime = "nodejs";

const OTP_EXPIRY_MINUTES = 10;

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

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email address is required.",
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

    /*
      Do not reveal whether an email
      exists in the Flamingo database.
    */
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists for that email, a reset code has been generated.",
      });
    }

    if (
      user.status === "SUSPENDED"
    ) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists for that email, a reset code has been generated.",
      });
    }

    const code = randomInt(
      100000,
      1000000
    ).toString();

    const codeHash =
      hashOtp(code);

    const expiresAt =
      new Date(
        Date.now() +
          OTP_EXPIRY_MINUTES *
            60 *
            1000
      );

    /*
      Remove any old unused
      password-reset codes.
    */
    await db.verificationCode.deleteMany({
      where: {
        userId: user.id,
        channel: "EMAIL",
        purpose:
          "PASSWORD_RESET",
        usedAt: null,
      },
    });

    /*
      Save the new reset code.
    */
    await db.verificationCode.create({
      data: {
        userId:
          user.id,

        codeHash,

        channel:
          "EMAIL",

        purpose:
          "PASSWORD_RESET",

        destination:
          email,

        expiresAt,
      },
    });

    /*
      Later, the real email provider
      will send this code.

      For development, return it so
      we can test the reset flow.
    */
    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      console.log(
        `Password reset OTP for ${email}: ${code}`
      );

      return NextResponse.json({
        success: true,

        message:
          "Password reset code generated.",

        devOtp:
          code,
      });
    }

    return NextResponse.json({
      success: true,

      message:
        "If an account exists for that email, a reset code has been sent.",
    });
  } catch (error) {
    console.error(
      "Password reset request error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown server error";

    return NextResponse.json(
      {
        success: false,

        message:
          process.env.NODE_ENV ===
          "development"
            ? message
            : "Could not process the password reset request.",
      },
      {
        status: 500,
      }
    );
  }
}