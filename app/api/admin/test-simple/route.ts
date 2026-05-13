import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json({ success: true, message: "API working" });
  } catch (error) {
    return NextResponse.json({ error: "API error" }, { status: 500 });
  }
}
