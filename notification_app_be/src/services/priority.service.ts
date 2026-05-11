const weights = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function calculatePriority(
  type: keyof typeof weights,
  timestamp: string
) {
  const ageMinutes =
    (Date.now() - new Date(timestamp).getTime()) /
    (1000 * 60);

  return weights[type] * 1000 - ageMinutes;
}

export function getTop10(
  notifications: any[]
) {
  return notifications
    .sort((a, b) => {
      return (
        calculatePriority(
          b.type,
          b.createdAt
        ) -
        calculatePriority(
          a.type,
          a.createdAt
        )
      );
    })
    .slice(0, 10);
}