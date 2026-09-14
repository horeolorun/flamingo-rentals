import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      fullName,
      email,
      phone,
      accountType,
      businessName,
      primaryCategory,
    } = body;

    // Basic validation
    if (!fullName?.trim()) {
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

    if (!email?.trim() && !phone?.trim()) {
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

    if (
      accountType !== "customer" &&
      accountType !== "vendor"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid account type",
        },
        {
          status: 400,
        }
      );
    }

    if (
      accountType === "vendor" &&
      !businessName?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Business name is required for vendors",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedEmail =
      email?.trim().toLowerCase() || null;

    const normalizedPhone =
      phone?.trim() || null;

    // Check for duplicate email
    if (normalizedEmail) {
      const existingEmail =
        await db.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        });

      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            message:
              "An account with this email already exists",
          },
          {
            status: 409,
          }
        );
      }
    }

    // Check for duplicate phone
    if (normalizedPhone) {
      const existingPhone =
        await db.user.findUnique({
          where: {
            phone: normalizedPhone,
          },
        });

      if (existingPhone) {
        return NextResponse.json(
          {
            success: false,
            message:
              "An account with this phone number already exists",
          },
          {
            status: 409,
          }
        );
      }
    }

    // Create the customer or vendor
    const user = await db.user.create({
      data: {
        fullName: fullName.trim(),

        email: normalizedEmail,
        phone: normalizedPhone,

        role:
          accountType === "vendor"
            ? "VENDOR"
            : "CUSTOMER",

        ...(accountType === "vendor"
          ? {
              vendorProfile: {
                create: {
                  businessName:
                    businessName.trim(),

                  primaryCategory:
                    primaryCategory?.trim() ||
                    null,
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
          accountType === "vendor"
            ? "Vendor account created successfully"
            : "Customer account created successfully",

        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          vendorProfile:
            user.vendorProfile,
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
          "Something went wrong while creating the account",
      },
      {
        status: 500,
      }
    );
  }
}