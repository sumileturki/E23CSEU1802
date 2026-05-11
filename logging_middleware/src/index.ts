import express from "express";

import { requestLogger } from "./requestLogger.ts";

import { Log } from "./logger.ts";

const app = express();

app.use(express.json());

app.use(requestLogger);

app.get("/", async (_, res) => {
  await Log(
    "backend",
    "info",
    "handler",
    "Root route accessed"
  );

  res.json({
    success: true,
    message:
      "Logging middleware working",
  });
});

app.get("/error", async (_, res) => {
  try {
    throw new Error(
      "Database connection failed"
    );
  } catch (error: any) {
    await Log(
      "backend",
      "error",
      "db",
      error.message
    );

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(3000, async () => {
  await Log(
    "backend",
    "info",
    "handler",
    "Server started on port 3000"
  );

  console.log(
    "Server running on port 3000"
  );
});