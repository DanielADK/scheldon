import { Attendance } from '@models/Attendance';
import { Student } from '@models/Student';
import { AttendanceType } from '@models/types/AttendanceType';
import { Transaction } from 'sequelize/types';

export interface AttendanceRecordDTO {
  studentId: number;
  attendance: AttendanceType;
}
/**
 * Get the attendance record for a specific lesson
 * @param lessonId number
 * @param withStudents boolean - Include students in the response
 * @param transaction
 * @returns Promise<Attendance | null>
 */
export const getLessonAttendance = async (
  lessonId: number,
  withStudents: boolean = false,
  transaction?: Transaction
): Promise<Attendance[] | null> => {
  const includeStudents = withStudents
    ? {
        include: [
          {
            model: Student,
            attributes: ['studentId', 'name', 'surname']
          }
        ]
      }
    : {};
  return await Attendance.findAll({
    where: {
      classRegisterId: lessonId
    },
    ...includeStudents,
    transaction
  });
};
