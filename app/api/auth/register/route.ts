import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";
import { vendorSegments } from "@/app/data/vendorSegments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName = String(
      body.fullName ?? ""
    ).trim();

    const role =
      body.role === "VENDOR"
        ? "VENDOR"
        : "CUSTOMER";

    const email = body.email
      ? String(body.email)
          .trim()
          .toLowerCase()
      : null;

    const phone = body.phone
      ? String(body.phone).trim()
      : null;

    const submittedSegments =
      Array.isArray(body.segments)
        ? body.segments.map((segment: unknown) =>
            String(segment)
          )
        : [];

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email or phone number is required",
        },
        {
          status: 400,
        }
      );
    }

    if (email && phone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please use either email or phone number",
        },
        {
          status: 400,
        }
      );
    }

    const validSegments =
      submittedSegments.filter((segment) =>
        vendorSegments.includes(
          segment as
            (typeof vendorSegments)[number]
        )
      );

    if (
      role === "VENDOR" &&
      validSegments.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select at least one business segment",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser =
      await db.user.findFirst({
        where: {
          OR: [
            ...(email
              ? [{ email }]
              : []),

            ...(phone
              ? [{ phone }]
              : []),
          ],
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account already exists with these details",
        },
        {
          status: 409,
        }
      );
    }

    const user = await db.user.create({
      data: {
        fullName,
        email,
        phone,
        role,

        ...(role === "VENDOR"
          ? {
              vendorProfile: {
                create: {
                  segments:
                    validSegments,
                },
              },
            }
          : {}),
      },

      include: {
        vendorProfile: true,
      },
    });

    return NextResponse.json(
      {
        success: true,

        message:
          "Account created successfully",

        user: {
          id: user.id,
          fullName:
            user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,

          segments:
            user.vendorProfile
              ?.segments ?? [],
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not create account",
      },
      {
        status: 500,
      }
    );
  }
}