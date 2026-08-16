import { NextResponse } from "next/server";
import {
  pollMindsPoc,
  publicMindsError,
  startMindsPoc,
  type PocAction,
} from "../../../../lib/minds";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const operation = body.operation === "poll" ? "poll" : "start";

    if (operation === "poll") {
      const jobToken = typeof body.jobToken === "string" ? body.jobToken : "";
      if (!jobToken) throw new TypeError("Job token is required.");
      const result = await pollMindsPoc(jobToken);
      return NextResponse.json(
        { ok: true, ...result },
        { headers: { "cache-control": "no-store" } },
      );
    }

    const action = body.action as PocAction;
    if (!(["seed", "review", "revise"] as const).includes(action)) {
      throw new TypeError("Action must be seed, review, or revise.");
    }

    const result = await startMindsPoc({
      action,
      creatorId: String(body.creatorId ?? ""),
      requestId: String(body.requestId ?? ""),
      worldContext:
        typeof body.worldContext === "string" ? body.worldContext : undefined,
      canonSource:
        typeof body.canonSource === "string" ? body.canonSource : undefined,
      canonRule:
        typeof body.canonRule === "string" ? body.canonRule : undefined,
      submission:
        typeof body.submission === "string" ? body.submission : undefined,
      revision:
        typeof body.revision === "string" ? body.revision : undefined,
    });

    return NextResponse.json(
      { ok: true, ...result },
      { status: 202, headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    const result = publicMindsError(error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: result.code, message: result.message },
      },
      { status: result.status, headers: { "cache-control": "no-store" } },
    );
  }
}
