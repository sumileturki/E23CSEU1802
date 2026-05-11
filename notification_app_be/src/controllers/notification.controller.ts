// src/controllers/notification.controller.ts

import type {
  Request,
  Response,
} from "express";

import {
  getNotifications,
  markAsRead,
} from "../services/notification.service.ts";

import { getTop10 }
from "../services/priority.service.ts";

import { Log }
from "../logger.ts";

export async function fetchNotifications(
  req: Request,
  res: Response
) {
  try {
    const studentId = Number(
      req.params.studentId
    );

    await Log(
      "backend",
      "info",
      "controller",
      `GET notifications API called for student ${studentId}`
    );

    const notifications =
      await getNotifications(studentId);

    res.json({
      success: true,
      notifications,
    });
  } catch (error: any) {
    await Log(
      "backend",
      "error",
      "controller",
      `Failed to fetch notifications: ${error.message}`
    );

    res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
}

export async function fetchTop10(
  req: Request,
  res: Response
) {
  try {
    const studentId = Number(
      req.params.studentId
    );

    await Log(
      "backend",
      "info",
      "controller",
      `GET top10 notifications API called`
    );

    const notifications =
      await getNotifications(studentId);

    const top10 =
      getTop10(notifications);

    await Log(
      "backend",
      "info",
      "service",
      "Top 10 notifications calculated"
    );

    res.json({
      success: true,
      notifications: top10,
    });
  } catch (error: any) {
    await Log(
      "backend",
      "error",
      "controller",
      `Failed to fetch top10 notifications: ${error.message}`
    );

    res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
}

export async function readNotification(
  req: Request,
  res: Response
) {
  try {
    const id = req.params.id;

    await Log(
      "backend",
      "info",
      "controller",
      `PATCH mark notification as read API called`
    );

    const updated =
      await markAsRead(id);

    res.json({
      success: true,
      notification: updated,
    });
  } catch (error: any) {
    await Log(
      "backend",
      "error",
      "controller",
      `Failed to mark notification as read: ${error.message}`
    );

    res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
}