import { TimetableEntry } from '@models/TimetableEntry';

/**
 * Validate employee is a teacher
 */
export const validateTeacherRole = async (instance: TimetableEntry): Promise<void> => {
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
 * Validate the studentGroup is in the class
 */
export const validateStudentGroupInClass = async (instance: TimetableEntry): Promise<void> => {
  if (!instance.studentGroup) {
    instance.studentGroup = await instance.$get('studentGroup');
  }
  if (instance.studentGroup && instance.classId !== instance.studentGroup.classId) {
    throw new Error('studentGroup is not in the class');
  }
};

/**
 * Validate the teacher is teaching the subject
 */
export const validateDayInWeekRange = async (instance: TimetableEntry): Promise<void> => {
  if (instance.dayInWeek < 0 || instance.dayInWeek > 6) {
    throw new Error('Day in week is out of range. Expected value between 0 (Mo) and 6 (Su)');
  }
};

/**
 * Validate the hour in day is in range
 */
export const validateHourInDayRange = async (instance: TimetableEntry): Promise<void> => {
  if (instance.hourInDay < 0 || instance.hourInDay > 10) {
    throw new Error('Hour in day is out of range. Expected value between 0 and 10');
  }
};

/**
 * Validate unique entry by class, studentGroup, day, hour, teacher, room, subject in timetable set (with nullable studentGroup)
 */
export const validateUniqueEntry = async (instance: TimetableEntry): Promise<void> => {
  const existing = await TimetableEntry.findOne({
    where: {
      classId: instance.classId,
      studentGroupId: instance.studentGroupId ?? null,
      dayInWeek: instance.dayInWeek,
      hourInDay: instance.hourInDay,
      teacherId: instance.teacherId,
      roomId: instance.roomId,
      subjectId: instance.subjectId
    }
  });

  if (existing) {
    throw new Error('Entry already exists');
  }
};
