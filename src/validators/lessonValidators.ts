import { LessonRecord } from '@models/LessonRecord';
import { LessonType } from '@models/types/LessonType';

/**
 * Validate that the lesson has identifiers: (timetableEntryId)
 * XOR (dayInWeek, hourInDay, classId, subClassId, subjectId, teacherId, roomId):
 * @param instance
 */
export const validateXORIdentifiers = async (instance: LessonRecord) => {
  if (
    Boolean(instance.timetableEntryId) &&
    Boolean(
      instance.dayInWeek &&
        instance.hourInDay &&
        instance.classId &&
        instance.subClassId &&
        instance.subjectId &&
        instance.teacherId &&
        instance.roomId
    )
  ) {
    throw new Error(
      'The lesson must have either timetableEntryId or dayInWeek, hourInDay, classId, subClassId, subjectId, teacherId, roomId or nothing'
    );
  }
};

/**
 * Validate employee is a teacher
 */
export const validateTeacherRole = async (
  instance: LessonRecord
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
  instance: LessonRecord
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
  instance: LessonRecord
): Promise<void> => {
  if (!instance.dayInWeek) {
    return;
  }
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
  instance: LessonRecord
): Promise<void> => {
  if (!instance.hourInDay) {
    return;
  }
  if (instance.hourInDay < 0 || instance.hourInDay > 10) {
    throw new Error(
      'Hour in day is out of range. Expected value between 0 and 10'
    );
  }
};

/**
 * Validate the lesson type.
 * DROPPED is only allowed with TEntry
 * other types are not allowed with TEntry
 * other types are allowed with custom lessons
 * @param instance
 * @throws Error
 */
export const validateType = async (instance: LessonRecord): Promise<void> => {
  const hasTimetableEntry: boolean = !!instance.timetableEntryId;

  switch (instance.type) {
    case LessonType.DROPPED:
      if (!hasTimetableEntry) {
        throw new Error('You can DROP only a lesson in standard timetable.');
      }
      break;

    case LessonType.TIME_MOVE:
    case LessonType.OVER_WORKFLOW:
    case LessonType.MERGED:
    case LessonType.VOCATIONAL_REPLACE:
      if (hasTimetableEntry) {
        throw new Error(
          `${instance.type} is not allowed with a timetable entry.`
        );
      }
      break;
    default:
      throw new Error('Invalid lesson type.');
  }
};
