import { exec } from "node:child_process";
import { NextResponse } from "next/server";

function runCommand(command: string, cwd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

export async function POST() {
  try {
    const root = process.cwd();
    const command = "npx prisma db push --accept-data-loss --schema=prisma/schema.prisma";
    const result = await runCommand(command, root);

    return NextResponse.json({
      message: "Database initialized successfully.",
      stdout: result.stdout,
      stderr: result.stderr,
    });
  } catch (result) {
    const errorResult = result as { error: Error; stdout: string; stderr: string };
    console.error("DB init error:", errorResult.error);
    console.error(errorResult.stdout);
    console.error(errorResult.stderr);

    return NextResponse.json(
      {
        error: "Database initialization failed.",
        details: errorResult.stderr || errorResult.stdout || errorResult.error.message,
      },
      { status: 500 }
    );
  }
}
