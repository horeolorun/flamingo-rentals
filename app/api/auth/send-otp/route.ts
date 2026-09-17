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
            "Email address is required",
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

    if (
      user.status === "ACTIVE" &&
      user.emailVerifiedAt
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This email address is already verified",
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

    const expiresAt = new Date(
      Date.now() +
        OTP_EXPIRY_MINUTES *
          60 *
          1000
    );

    // Remove previous unused email OTPs
    // for this account.
   await db.verificationCode.deleteMany({
  where: {
    userId: user.id,
    channel: "EMAIL",
    purpose: "SIGNUP",
    usedAt: null,
  },
});

  await db.verificationCode.create({
  data: {
    userId: user.id,
    codeHash,
    channel: "EMAIL",
    purpose: "SIGNUP",
    destination: email,
    expiresAt,
  },
});


    /*
      REAL EMAIL PROVIDER GOES HERE LATER.

      For development we return devOtp
      so you can continue testing.
    */

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
          "Verification code generated",

        devOtp:
          code,
      });
    }

    return NextResponse.json({
      success: true,

      message:
        "Verification code sent to your email",
    });
  } catch (error) {
    console.error(
      "Send OTP error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not send verification code",
      },
      {
        status: 500,
      }
    );
  }
}