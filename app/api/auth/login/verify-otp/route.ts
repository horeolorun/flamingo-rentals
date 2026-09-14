import { createHmac } from "crypto";
import { NextResponse } from "next/server";

import { db } from "../../../../lib/db";
import { createSession } from "../../../../lib/session";

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

  const identifier =
  String(body.identifier ?? "").trim();
const code =
  String(body.code ?? "").trim();

    if (!identifier || !code) {
      return NextResponse.json(
        {
          success: false,
          message: "Email/phone and verification code are required",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code must contain 6 digits",
        },
        { status: 400 }
      );
    }

    const isEmail = identifier.includes("@");

    const normalizedIdentifier = isEmail
      ? identifier.toLowerCase()
      : identifier;

    const user = await db.user.findFirst({
      where: isEmail
        ? { email: normalizedIdentifier }
        : { phone: normalizedIdentifier },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Account not found",
        },
        { status: 404 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "This account is not currently active",
        },
        { status: 403 }
      );
    }

    const verification =
      await db.verificationCode.findFirst({
        where: {
          userId: user.id,
          destination: normalizedIdentifier,
          usedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    if (!verification) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code is invalid or has expired",
        },
        { status: 400 }
      );
    }

    if (verification.attempts >= 5) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many incorrect attempts. Request a new code.",
        },
        { status: 429 }
      );
    }

    const submittedHash = hashOtp(code);

    if (submittedHash !== verification.codeHash) {
      await db.verificationCode.update({
        where: {
          id: verification.id,
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
          message: "Incorrect verification code",
        },
        { status: 400 }
      );
    }

    await createSession(user.id);

    await db.verificationCode.update({
      where: {
        id: verification.id,
      },
      data: {
        usedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Signed in successfully",
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while signing you in",
        details:
          process.env.NODE_ENV !== "production"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}