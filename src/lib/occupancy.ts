export function toOccupancyPercent(filledSeats: number, totalSeats: number): number {
  return totalSeats > 0 ? Math.round((filledSeats / totalSeats) * 100) : 0;
}

