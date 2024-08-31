import {
  getCurrentLessonRecord,
  getStudentsForLesson
} from '@repositories/classRegisterRepository';

/**
 * Get the current lesson data for a specific teacher
 * @param teacherId number
 * @returns Promise<object | null>
 */
export const getCurrentLessonForTeacher = async (
  teacherId: number
): Promise<object | null> => {
  const lessonRecord = await getCurrentLessonRecord(teacherId);
  if (!lessonRecord) {
    return null;
  }

  const students = await getStudentsForLesson(lessonRecord.lessonId);
  return {
    lessonId: lessonRecord.lessonId,
    students: students
  };
};

/**
 * Get the current lesson data for a specific teacher
 * @param lessonId number
 * @returns Promise<object | null>
 */
export const getCurrentLessonByLesson = async (
  lessonId: string
): Promise<object | null> => {
  const students = await getStudentsForLesson(lessonId);
  return {
    lessonId: lessonId,
    students: students
  };
};
