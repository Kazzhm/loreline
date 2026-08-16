import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  publicMindsError,
  runMindsOperatorAction,
  type OperatorAction,
} from "../../../../lib/minds";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const OPERATOR_TOKEN_HASH =
  "b596a4f99223a0c33ebe76f1c584aa78b044f619b3c6f3c83ef1fa8572877a53";

function isAuthorized(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const actual = Buffer.from(createHash("sha256").update(token).digest("hex"));
  const expected = Buffer.from(OPERATOR_TOKEN_HASH);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: { code: "unauthorized", message: "Not authorized." } },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = body.action as OperatorAction;
    const allowed: OperatorAction[] = [
      "skills",
      "propose",
      "build",
      "inspect",
      "schedule",
      "diagnose",
      "history",
    ];
    if (!allowed.includes(action)) {
      throw new TypeError("Unsupported operator action.");
    }

    const result = await runMindsOperatorAction(action);
    return NextResponse.json(
      { ok: true, ...result },
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
