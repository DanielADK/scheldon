import { CLASS_HOURS } from '../config/timetableConfig';

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

/**
 * Binary search for the current hour in the timetable
 * @param timeString string
 * @param start number
 * @param end number
 */
const binarySearchPeriod = (timeString: string, start: number, end: number): number | null => {
  if (start > end) {
    return null;
  }

  const mid = Math.floor((start + end) / 2);
  const period = CLASS_HOURS[mid];

  if (timeString >= period.start && timeString <= period.end) {
    return period.hour;
  } else if (timeString < period.start) {
    return binarySearchPeriod(timeString, start, mid - 1);
  } else {
    return binarySearchPeriod(timeString, mid + 1, end);
  }
};

/**
 * Get the current timetable hour
 * @param currentTime Date
 */
export const getCurrentTimetableHour = (currentTime: Date): number | null => {
  const timeString = currentTime.toTimeString().split(' ')[0];
  return binarySearchPeriod(timeString, 0, CLASS_HOURS.length - 1);
};
