import type { VehicleTask } from "./types.js";

export function maximizeImpact(
  tasks: VehicleTask[],
  hours: number
) {
  const n = tasks.length;

  const dp = Array.from(
    { length: n + 1 },
    () => Array(hours + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const task = tasks[i - 1]!;

    for (let h = 0; h <= hours; h++) {
      if (task.Duration <= h) {
        dp[i]![h] = Math.max(
          dp[i - 1]![h],
          task.Impact +
            dp[i - 1]![
              h - task.Duration
            ]
        );
      } else {
        dp[i]![h] = dp[i - 1]![h];
      }
    }
  }

  let h = hours;

  const selected: VehicleTask[] = [];

  for (let i = n; i > 0; i--) {
    if (dp[i]![h] !== dp[i - 1]![h]) {
      const task = tasks[i - 1]!;

      selected.push(task);

      h -= task.Duration;
    }
  }

  return {
    maxImpact: dp[n]![hours],
    selectedTasks:
      selected.reverse(),
  };
}