import { NextResponse } from "next/server";
import { createHmac, randomInt } from "crypto";

import { db } from "../../../lib/db";

export const runtime = "nodejs";

function hashOtp(code: string) {
  const secret = process.env.OTP_SECRET;

  if (!secret) {
    throw new Error("OTP_SECRET is not configured");
  }

  return createHmac("sha256", secret)
    .update(code)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const identifier = body.identifier?.trim();

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or phone number is required",
        },
        {
          status: 400,
        }
      );
    }

    const isEmail = identifier.includes("@");

    const normalizedIdentifier = isEmail
      ? identifier.toLowerCase()
      : identifier;

    const user = await db.user.findFirst({
      where: isEmail
        ? {
            email: normalizedIdentifier,
          }
        : {
            phone: normalizedIdentifier,
          },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Account not found",
        },
        {
          status: 404,
        }
      );
    }

    // Prevent repeated OTP requests within 60 seconds.
    const recentCode =
      await db.verificationCode.findFirst({
        where: {
          userId: user.id,
          usedAt: null,

          createdAt: {
            gte: new Date(Date.now() - 60 * 1000),
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    if (recentCode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please wait before requesting another code",
        },
        {
          status: 429,
        }
      );
    }

    const otp = randomInt(100000, 1000000).toString();

    const codeHash = hashOtp(otp);

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await db.verificationCode.create({
      data: {
        userId: user.id,

        codeHash,

        channel: isEmail
          ? "EMAIL"
          : "PHONE",

        destination: normalizedIdentifier,

        expiresAt,
      },
    });

    console.log(
      `DEV OTP for ${normalizedIdentifier}: ${otp}`
    );

    return NextResponse.json({
      success: true,

      message: isEmail
        ? "Verification code generated for email"
        : "Verification code generated for phone",

      // Development only.
      // We will remove this when real email/SMS is connected.
      ...(process.env.NODE_ENV !== "production"
        ? {
            devOtp: otp,
          }
        : {}),
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while generating the verification code",
      },
      {
        status: 500,
      }
    );
  }
}