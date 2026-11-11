
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { vendorSegments } from "@/app/data/vendorSegments";
import { db } from "@/app/lib/db";

export const runtime = "nodejs";

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const requestBody = body as Record<string, unknown>;

    const fullName = String(requestBody.fullName ?? "").trim();

    const email = String(requestBody.email ?? "")
      .trim()
      .toLowerCase();

    const password = String(requestBody.password ?? "");

    const requestedRole = String(requestBody.role ?? "").toUpperCase();

    if (
      requestedRole !== "CUSTOMER" &&
      requestedRole !== "VENDOR"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please choose Customer or Vendor.",
        },
        { status: 400 }
      );
    }

    const role = requestedRole as "CUSTOMER" | "VENDOR";

    const phone =
      role === "VENDOR"
        ? String(requestBody.phone ?? "").trim()
        : null;

    // Customer location
    const state =
      role === "CUSTOMER"
        ? String(requestBody.state ?? "").trim()
        : null;

    const city =
      role === "CUSTOMER"
        ? String(requestBody.city ?? "").trim() || null
        : null;

    const marketingEmailsOptIn =
      requestBody.marketingEmailsOptIn === true;

    const submittedSegments: string[] =
      Array.isArray(requestBody.segments)
        ? requestBody.segments.map(
            (segment: unknown): string =>
              String(segment).trim()
          )
        : [];

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name is required",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address is required",
        },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    if (role === "VENDOR" && !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is required for vendor accounts",
        },
        { status: 400 }
      );
    }

    // Validate customer location
    if (role === "CUSTOMER" && !state) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select your state.",
        },
        { status: 400 }
      );
    }

    if (
      role === "CUSTOMER" &&
      !nigerianStates.includes(state!)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid Nigerian state.",
        },
        { status: 400 }
      );
    }

    const validSegments: string[] =
      submittedSegments.filter(
        (segment: string): boolean =>
          vendorSegments.includes(
            segment as (typeof vendorSegments)[number]
          )
      );

    const uniqueSegments: string[] =
      Array.from(new Set<string>(validSegments));

    if (
      role === "VENDOR" &&
      uniqueSegments.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select at least one business segment",
        },
        { status: 400 }
      );
    }

    const existingEmail = await db.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "An account already exists with this email address",
        },
        { status: 409 }
      );
    }

    if (phone) {
      const existingPhone = await db.user.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        return NextResponse.json(
          {
            success: false,
            message: "An account already exists with this phone number",
          },
          { status: 409 }
        );
      }
    }

    const passwordHash = await hash(password, 12);

    const user = await db.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,

        role,

        status: "PENDING_VERIFICATION",

        marketingEmailsOptIn,

        marketingEmailsOptInAt: marketingEmailsOptIn
          ? new Date()
          : null,

        // Save location for customer accounts only
        ...(role === "CUSTOMER"
          ? {
              state,
              city,
            }
          : {}),

        ...(role === "VENDOR"
          ? {
              vendorProfile: {
                create: {
                  segments: uniqueSegments,
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

        message: "Account created. Please verify your email.",

        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          state: user.state,
          city: user.city,
          segments: user.vendorProfile?.segments ?? [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not create account",
      },
      { status: 500 }
    );
  }
}
