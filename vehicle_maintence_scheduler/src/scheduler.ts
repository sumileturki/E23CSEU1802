import { maximizeImpact } from "./knapsack.ts";

import type {
  Depot,
  VehicleTask,
} from "./types.ts";

export function scheduleDepot(
  depot: Depot,
  tasks: VehicleTask[]
) {
  const result = maximizeImpact(
    tasks,
    depot.MechanicHours
  );

  return {
    depotID: depot.ID,
    mechanicHours:
      depot.MechanicHours,
    totalImpact:
      result.maxImpact,
    selectedTasks:
      result.selectedTasks,
  };
}