import { verifyCronRequest } from "@/lib/cron/verify";
import { syncHumanitixEvents } from "@/lib/integrations/humanitix";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncHumanitixEvents();
  if (!result.ok) {
    return NextResponse.json(result, { status: 502 });
  }
  return NextResponse.json(result);
}
