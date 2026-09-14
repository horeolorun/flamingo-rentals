import { NextResponse } from "next/server";

import {
  deleteCurrentSession,
} from "../../../lib/session";

export const runtime = "nodejs";

export async function POST() {
  try {
    await deleteCurrentSession();

    return NextResponse.json({
      success: true,
      message:
        "Signed out successfully",
    });
  } catch (error) {
    console.error(
      "Logout error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to sign out",
      },
      {
        status: 500,
      }
    );
  }
}