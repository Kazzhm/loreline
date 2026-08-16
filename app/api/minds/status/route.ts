import { NextResponse } from "next/server";
import { getMindsStatus, publicMindsError } from "../../../../lib/minds";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getMindsStatus(), {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    const result = publicMindsError(error);
    return NextResponse.json(
      {
        configured: true,
        connected: false,
        error: { code: result.code, message: result.message },
      },
      { status: result.status, headers: { "cache-control": "no-store" } },
    );
  }
}
