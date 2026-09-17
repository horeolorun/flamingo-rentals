import {
  createHmac,
  randomInt,
} from "crypto";

import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";
import { sendOtpEmail } from "../../../lib/email";

export const runtime = "nodejs";

const OTP_EXPIRY_MINUTES = 10;

function hashOtp(code: string) {
  const secret =
    process.env.OTP_SECRET;

  if (!secret) {
    throw new Error(
      "OTP_SECRET is not configured."
    );
  }

  return createHmac(
    "sha256",
    secret
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

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Account not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      user.status === "ACTIVE" &&
      user.emailVerifiedAt
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This email address is already verified.",
        },
        {
          status: 409,
        }
      );
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

    await db.verificationCode.deleteMany({
      where: {
        userId:
          user.id,

        channel:
          "EMAIL",

        purpose:
          "SIGNUP",

        usedAt:
          null,
      },
    });

    const verificationCode =
      await db.verificationCode.create({
        data: {
          userId:
            user.id,

          codeHash,

          channel:
            "EMAIL",

          purpose:
            "SIGNUP",

          destination:
            email,

          expiresAt,
        },
      });

    try {
      await sendOtpEmail({
        to: email,
        code,
        purpose:
          "SIGNUP",
      });
    } catch (emailError) {
      /*
        Remove the OTP if the email
        could not actually be sent.
      */
      await db.verificationCode.delete({
        where: {
          id:
            verificationCode.id,
        },
      });

      throw emailError;
    }

    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      console.log(
        `Development OTP for ${email}: ${code}`
      );

      return NextResponse.json({
        success: true,

        message:
          "Verification code sent to your email.",

        devOtp:
          code,
      });
    }

    return NextResponse.json({
      success: true,

      message:
        "Verification code sent to your email.",
    });
  } catch (error) {
    console.error(
      "Send OTP error:",
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
            : "Could not send verification code.",
      },
      {
        status: 500,
      }
    );
  }
}