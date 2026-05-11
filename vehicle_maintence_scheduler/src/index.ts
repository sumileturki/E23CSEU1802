import express from "express";

import {
  fetchDepots,
  fetchVehicles,
} from "./api.ts";

import { scheduleDepot } from "./scheduler.ts";

const app = express();

app.use(express.json());

app.get("/", async (_, res) => {
  try {
    const depots =
      await fetchDepots();

    const vehicles =
      await fetchVehicles();

    const results = depots.map(
      (depot: any) =>
        scheduleDepot(
          depot,
          vehicles
        )
    );

    res.json({
      success: true,
      results,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(3001, () => {
  console.log(
    "Scheduler service running on port 3001"
  );
});