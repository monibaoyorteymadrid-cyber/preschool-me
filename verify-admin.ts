import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function verifyAdmin() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const admin = await prisma.user.findUnique({
      where: { email: "admin@school.com" },
    });

    if (!admin) {
      console.log("Admin user NOT found in database.");
      
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await prisma.user.create({
        data: {
          firstName: "System",
          lastName: "Admin",
          email: "admin@school.com",
          passwordHash: hashedPassword,
          role: "ADMIN",
          status: "ACTIVE",
        },
      });
      console.log("Admin user created successfully.");
    } else {
      console.log("Admin user found:", admin.email);
      const isMatch = await bcrypt.compare("admin123", admin.passwordHash);
      console.log("Password 'admin123' matches hash:", isMatch);
      
      if (!isMatch) {
        console.log("Updating admin password to 'admin123'...");
        const newHash = await bcrypt.hash("admin123", 10);
        await prisma.user.update({
          where: { email: "admin@school.com" },
          data: { passwordHash: newHash },
        });
        console.log("Password updated.");
      }
    }
  } catch (error) {
    console.error("Verification failed:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

verifyAdmin();
