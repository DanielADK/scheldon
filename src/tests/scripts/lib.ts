/**
 * Calculates the start of the week for the given date.
 * @param date - The date for which to calculate the start of the week.
 * @returns The start of the week (a Date object).
 */
export function startOfWeek(date: Date): Date {
  const dayOfWeek = date.getDay();
  const difference = (dayOfWeek < 1 ? 7 : 0) + dayOfWeek - 1;
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - difference);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
}

/**
 * Adds a specified number of days to a date.
 * @param date - The original date.
 * @param days - The number of days to add.
 * @returns A new Date object with the specified number of days added.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
}
