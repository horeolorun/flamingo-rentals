import { NextResponse } from "next/server";

import { vendors } from "@/app/data/vendor";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  const { slug } = await params;

  const vendor = vendors.find(
    (vendor) => vendor.slug === slug
  );

  if (!vendor) {
    return NextResponse.json(
      {
        message: "Vendor not found",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json({
    data: vendor,
  });
}