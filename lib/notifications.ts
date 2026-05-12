import { prisma } from "./prisma";
import { Role } from "@prisma/client";

export async function createNotification({
  userId,
  reportId,
  title,
  message,
  type,
}: {
  userId: string;
  reportId?: string | null;
  title: string;
  message: string;
  type: string;
}) {
  return prisma.notification.create({
    data: {
      userId,
      reportId,
      title,
      message,
      type,
    },
  });
}

export async function notifyRole({
  role,
  reportId,
  title,
  message,
  type,
}: {
  role: Role;
  reportId?: string | null;
  title: string;
  message: string;
  type: string;
}) {
  const users = await prisma.user.findMany({ where: { role } });
  return Promise.all(
    users.map((user) =>
      prisma.notification.create({
        data: {
          userId: user.id,
          reportId,
          title,
          message,
          type,
        },
      })
    )
  );
}
