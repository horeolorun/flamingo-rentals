import { NextResponse } from "next/server";

import { vendors } from "@/app/data/vendor";

export async function GET() {
  return NextResponse.json({
    data: vendors,

    meta: {
      count: vendors.length,
    },
  });
}