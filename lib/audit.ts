import { prisma } from "./prisma";

export async function logAction({
  userId,
  action,
  entityType,
  entityId,
  oldValue,
  newValue,
}: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
