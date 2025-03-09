import { Attendance } from '@models/Attendance';
import { Student } from '@models/Student';
import { AttendanceType } from '@models/types/AttendanceType';

export interface attendanceRecordDTO {
  studentId: number;
  attendance: AttendanceType;
}
/**
 * Get the attendance record for a specific lesson
 * @param lessonId number
 * @param withStudents boolean - Include students in the response
 * @returns Promise<Attendance | null>
 */
export const getLessonAttendance = async (lessonId: number, withStudents: boolean = false): Promise<Attendance[] | null> => {
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

/**
 * Update the attendance record for a specific lesson with upsert
 * @param lesson LessonRecord - The lesson record
 * @param attendance attendanceRecordDTO[] - The attendance records to upsert
 * @param transaction Transaction - The transaction to use
 */
/*export const updateAttendance = async (
  lesson: LessonRecord,
  attendance: attendanceRecordDTO[],
  transaction: Transaction
) => {
  const attendanceRecords = attendance.map(
    (record) =>
      ({
        lessonRecordId: lesson.lessonId,
        studentId: record.studentId,
        attendance: record.attendance
      }) as Attendance
  );

  await Attendance.bulkCreate(attendanceRecords, {
    updateOnDuplicate: ['attendance'],
    transaction
  });
};*/
