import express from "express";
import cors from "cors";

import notificationRoutes from "./routes/notification.routes.ts";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/api/v1/notifications",
  notificationRoutes
);

export default app;