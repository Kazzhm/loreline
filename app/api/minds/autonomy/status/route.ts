import { NextResponse } from "next/server";
import { getAutonomyStatus, publicMindsError } from "../../../../../lib/minds";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getAutonomyStatus();
    return NextResponse.json(status, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    const result = publicMindsError(error);
    return NextResponse.json(
      {
        configured: true,
        verified: false,
        observedAt: null,
        reliabilityTriggerConfigured: Boolean(process.env.CRON_SECRET?.trim()),
        reliabilityTriggerObserved: false,
        reliabilityLastTriggeredAt: null,
        reliabilityReplyObservedAt: null,
      },
      { status: result.status, headers: { "cache-control": "no-store" } },
    );
  }
}
