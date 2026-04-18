import { NextResponse } from "next/server";

/**
 * Reserved for future admin or webhook-triggered notification jobs.
 * Reply emails are sent from server actions / POST /api/messages.
 */
export async function POST() {
  return NextResponse.json(
    { message: "Not implemented — use thread reply flow for subscriber emails." },
    { status: 501 }
  );
}
