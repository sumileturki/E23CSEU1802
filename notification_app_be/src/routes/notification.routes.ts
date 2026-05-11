import { Router } from "express";

import {
  fetchNotifications,
  fetchTop10,
  readNotification,
} from "../controllers/notification.controller.ts";

const router = Router();

router.get(
  "/:studentId",
  fetchNotifications
);

router.get(
  "/:studentId/top10",
  fetchTop10
);

router.patch(
  "/:id/read",
  readNotification
);

export default router;