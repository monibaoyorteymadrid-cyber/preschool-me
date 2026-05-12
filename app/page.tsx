import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  // Check if admin exists
  try {
    const adminExists = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (!adminExists) {
      redirect("/setup");
    }
  } catch (error) {
    console.error("Error checking admin:", error);
    // If database error, still allow login attempt
  }

  redirect("/login");
}
