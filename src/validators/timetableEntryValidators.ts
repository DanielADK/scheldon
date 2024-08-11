import { TimetableEntry } from '@models/TimetableEntry';

/**
 * Validate employee is a teacher
 */
export const validateTeacherRole = async (
  instance: TimetableEntry
): Promise<void> => {
  const fetchedTeacher = await instance.$get('teacher');
  if (!fetchedTeacher) {
    throw new Error('Teacher not found');
  }
  instance.teacher = fetchedTeacher;

  if (!instance.teacher.isTeacher) {
    throw new Error('Employee is not a teacher');
  }
};

/**
 * Validate the subclass is in the class
 */
export const validateSubClassInClass = async (
  instance: TimetableEntry
): Promise<void> => {
  if (!instance.subClass) {
    instance.subClass = await instance.$get('subClass');
  }
  if (instance.subClass && instance.classId !== instance.subClass.classId) {
    throw new Error('Subclass is not in the class');
  }
};

/**
 * Validate the teacher is teaching the subject
 */
export const validateDayInWeekRange = async (
  instance: TimetableEntry
): Promise<void> => {
  if (instance.dayInWeek < 0 || instance.dayInWeek > 6) {
    throw new Error(
      'Day in week is out of range. Expected value between 0 (Mo) and 6 (Su)'
    );
  }
};

/**
 * Validate the hour in day is in range
 */
export const validateHourInDayRange = async (
  instance: TimetableEntry
): Promise<void> => {
  if (instance.hourInDay < 0 || instance.hourInDay > 10) {
    throw new Error(
      'Hour in day is out of range. Expected value between 0 and 10'
    );
  }
};
