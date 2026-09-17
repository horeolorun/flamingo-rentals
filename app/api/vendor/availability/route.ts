import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";

export const runtime = "nodejs";

function parseDate(
  value: unknown
) {
  const dateString =
    String(value ?? "").trim();

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      dateString
    )
  ) {
    return null;
  }

  const date = new Date(
    `${dateString}T00:00:00.000Z`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

function formatDateForResponse(
  date: Date
) {
  return date
    .toISOString()
    .slice(0, 10);
}

/*
  GET VENDOR AVAILABILITY BLOCKS
*/
export async function GET() {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      currentUser.role !==
      "VENDOR"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Vendor access required.",
        },
        {
          status: 403,
        }
      );
    }

    const profile =
      await db.vendorProfile.findUnique({
        where: {
          userId:
            currentUser.id,
        },
      });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Vendor profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const blocks =
      await db.vendorAvailabilityBlock.findMany(
        {
          where: {
            vendorProfileId:
              profile.id,
          },

          orderBy: [
            {
              startDate:
                "asc",
            },
            {
              endDate:
                "asc",
            },
          ],
        }
      );

    return NextResponse.json({
      success: true,

      data: blocks.map(
        (block) => ({
          id: block.id,

          startDate:
            formatDateForResponse(
              block.startDate
            ),

          endDate:
            formatDateForResponse(
              block.endDate
            ),

          reason:
            block.reason,

          source:
            block.source,

          createdAt:
            block.createdAt,
        })
      ),
    });
  } catch (error) {
    console.error(
      "Vendor availability GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not load availability.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
  CREATE AN UNAVAILABLE DATE RANGE
*/
export async function POST(
  request: Request
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      currentUser.role !==
      "VENDOR"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Vendor access required.",
        },
        {
          status: 403,
        }
      );
    }

    const profile =
      await db.vendorProfile.findUnique({
        where: {
          userId:
            currentUser.id,
        },
      });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Vendor profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      await request.json();

    const startDate =
      parseDate(
        body.startDate
      );

    const endDate =
      parseDate(
        body.endDate
      );

    const reason =
      String(
        body.reason ?? ""
      ).trim();

    if (
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide valid start and end dates.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      endDate.getTime() <
      startDate.getTime()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "End date cannot be before the start date.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      reason.length > 150
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reason must be 150 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Check whether this new range overlaps
      an existing unavailable range.

      Two ranges overlap when:

      existing.start <= new.end
      AND
      existing.end >= new.start
    */
    const overlappingBlock =
      await db.vendorAvailabilityBlock.findFirst(
        {
          where: {
            vendorProfileId:
              profile.id,

            startDate: {
              lte: endDate,
            },

            endDate: {
              gte: startDate,
            },
          },
        }
      );

    if (overlappingBlock) {
      return NextResponse.json(
        {
          success: false,
          message:
            "These dates overlap an existing unavailable period.",
        },
        {
          status: 409,
        }
      );
    }

    const block =
      await db.vendorAvailabilityBlock.create(
        {
          data: {
            vendorProfileId:
              profile.id,

            startDate,

            endDate,

            reason:
              reason ||
              null,

            source:
              "MANUAL",
          },
        }
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Unavailable dates added.",

        data: {
          id: block.id,

          startDate:
            formatDateForResponse(
              block.startDate
            ),

          endDate:
            formatDateForResponse(
              block.endDate
            ),

          reason:
            block.reason,

          source:
            block.source,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Vendor availability POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not save unavailable dates.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
  DELETE A MANUAL AVAILABILITY BLOCK
*/
export async function DELETE(
  request: Request
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      currentUser.role !==
      "VENDOR"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Vendor access required.",
        },
        {
          status: 403,
        }
      );
    }

    const profile =
      await db.vendorProfile.findUnique({
        where: {
          userId:
            currentUser.id,
        },
      });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Vendor profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      await request.json();

    const blockId =
      String(
        body.id ?? ""
      ).trim();

    if (!blockId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Availability block ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const block =
      await db.vendorAvailabilityBlock.findFirst(
        {
          where: {
            id: blockId,

            vendorProfileId:
              profile.id,
          },
        }
      );

    if (!block) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Availability block not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
      BOOKING-generated blocks should later
      only disappear when the related booking
      is cancelled.

      Vendors may directly remove only
      MANUAL blocks.
    */
    if (
      block.source !==
      "MANUAL"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Dates created by a booking cannot be removed here.",
        },
        {
          status: 400,
        }
      );
    }

    await db.vendorAvailabilityBlock.delete(
      {
        where: {
          id: block.id,
        },
      }
    );

    return NextResponse.json({
      success: true,

      message:
        "Unavailable dates removed.",
    });
  } catch (error) {
    console.error(
      "Vendor availability DELETE error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not remove unavailable dates.",
      },
      {
        status: 500,
      }
    );
  }
}