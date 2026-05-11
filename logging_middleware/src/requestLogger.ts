import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { Log } from "./logger.ts";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  Log(
    "backend",
    "info",
    "handler",
    `Incoming ${req.method} request to ${req.url}`
  );

  res.on("finish", () => {
    const duration =
      Date.now() - start;

    Log(
      "backend",
      "info",
      "handler",
      `Completed ${req.method} ${req.url} with status ${res.statusCode} in ${duration}ms`
    );
  });

  next();
};