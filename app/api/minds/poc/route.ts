import { NextResponse } from "next/server";
import {
  publicMindsError,
  runMindsPoc,
  type PocAction,
} from "../../../../lib/minds";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = body.action as PocAction;
    if (!(["seed", "review", "history"] as const).includes(action)) {
      throw new TypeError("Action must be seed, review, or history.");
    }

    const result = await runMindsPoc({
      action,
      creatorId: String(body.creatorId ?? ""),
      canonRule:
        typeof body.canonRule === "string" ? body.canonRule : undefined,
      submission:
        typeof body.submission === "string" ? body.submission : undefined,
    });

    return NextResponse.json({ ok: true, ...result }, {
      headers: { "cache-control": "no-store" },
    });
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
