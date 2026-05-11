// src/services/notification.service.ts

import { prisma } from "../prisma/prisma.ts";
import { redis } from "../config/redis.ts";
import { Log } from "../logger.ts";

export async function getNotifications(
  studentId: number
) {
  try {
    await Log(
      "backend",
      "info",
      "service",
      `Fetching notifications for student ${studentId}`
    );

    const cacheKey =
      `notifications:${studentId}`;

    const cached =
      await redis.get(cacheKey);

    if (cached) {
      await Log(
        "backend",
        "debug",
        "cache",
        `Cache hit for student ${studentId}`
      );

      return JSON.parse(cached);
    }

    await Log(
      "backend",
      "debug",
      "cache",
      `Cache miss for student ${studentId}`
    );

    await Log(
      "backend",
      "info",
      "db",
      "Fetching notifications from PostgreSQL"
    );

    const notifications =
      await prisma.notification.findMany({
        where: {
          studentId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      });

    await redis.set(
      cacheKey,
      JSON.stringify(notifications),
      "EX",
      60
    );

    await Log(
      "backend",
      "info",
      "cache",
      `Notifications cached for student ${studentId}`
    );

    return notifications;
  } catch (error: any) {
    await Log(
      "backend",
      "error",
      "service",
      `Failed to fetch notifications: ${error.message}`
    );

    throw error;
  }
}

export async function markAsRead(
  id: string
) {
  try {
    await Log(
      "backend",
      "info",
      "controller",
      `Marking notification ${id} as read`
    );

    const updated =
      await prisma.notification.update({
        where: {
          id,
        },
        data: {
          isRead: true,
        },
      });

    await Log(
      "backend",
      "info",
      "db",
      `Notification ${id} updated successfully`
    );

    return updated;
  } catch (error: any) {
    await Log(
      "backend",
      "error",
      "db",
      `Failed to mark notification as read: ${error.message}`
    );

    throw error;
  }
}