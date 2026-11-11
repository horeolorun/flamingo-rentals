
import { NextResponse } from "next/server";

import { getCurrentUser } from "../../../lib/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        state: user.state,
        city: user.city,
      },
    });
  } catch (error) {
    console.error("Current user error:", error);

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      {
        status: 500,
      }
    );
  }
}
