import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Testing database connection...");

    // Test basic connection
    await prisma.$connect();
    console.log("Database connected successfully");

    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Database query successful:", result);

    // Test user table exists
    const userCount = await prisma.user.count();
    console.log("User count query successful:", userCount);

    return NextResponse.json({
      status: "success",
      message: "Database connection working",
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      status: "error",
      message: "Database connection failed",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}