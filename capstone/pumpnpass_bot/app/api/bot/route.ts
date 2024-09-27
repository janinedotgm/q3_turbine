// app/api/bot/route.ts

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { handleUpdate } from "../../../src/bot";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    await handleUpdate(update);
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error handling update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
