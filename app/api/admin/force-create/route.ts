import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("[Force Admin] Endpoint called");
    
    // Just return success without database operations for now
    return NextResponse.json({
      success: true,
      message: "Test response"
    });
  } catch (error) {
    console.error("[Force Admin] Error:", error);
    return NextResponse.json({
      success: false,
      error: "Error"
    }, { status: 500 });
  }
}