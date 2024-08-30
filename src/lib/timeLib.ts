/**
 * Get date range Monday to Friday
 * @param time
 */
export const getWeekRange = (time: Date): { start: Date; end: Date } => {
  const date = new Date(time);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const friday = new Date(date.setDate(diff + 4));

  return { start: monday, end: friday };
};
