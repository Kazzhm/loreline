import { NextResponse } from "next/server";
import {
  isAuthorizedCron,
  publicMindsError,
  triggerDueCaseReview,
} from "../../../../lib/minds";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json(
      { ok: false, error: { code: "unauthorized", message: "Unauthorized." } },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const result = await triggerDueCaseReview();
    return NextResponse.json(
      { ok: true, accepted: result.accepted, duplicate: result.duplicate },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    const result = publicMindsError(error);
    return NextResponse.json(
      { ok: false, error: { code: result.code, message: result.message } },
      { status: result.status, headers: { "cache-control": "no-store" } },
    );
  }
}
