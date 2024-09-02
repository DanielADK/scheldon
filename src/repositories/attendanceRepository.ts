import { Attendance } from '@models/Attendance';
import { Student } from '@models/Student';

/**
 * Get the attendance record for a specific lesson
 * @param lessonId number
 * @param withStudents boolean - Include students in the response
 * @returns Promise<Attendance | null>
 */
export const getLessonAttendance = async (
  lessonId: string,
  withStudents: boolean = false
): Promise<Attendance[] | null> => {
  const includeStudents = withStudents
    ? {
        include: [
          {
            model: Student,
            attributes: ['studentId', 'username', 'name', 'surname']
          }
        ]
      }
    : {};
  return await Attendance.findAll({
    where: {
      lessonRecordId: lessonId
    },
    ...includeStudents
  });
};
