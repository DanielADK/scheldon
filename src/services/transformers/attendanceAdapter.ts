import { Attendance } from '@models/Attendance';
import { StudentAttendance } from '@services/transformers/classRegisterExport';
import { AbstractAdapter } from '@services/transformers/AbstractAdapter';

export class AttendanceAdapter extends AbstractAdapter<Attendance, StudentAttendance> {
  async transform(attendance: Attendance): Promise<StudentAttendance> {
    return {
      student: {
        studentId: attendance.student.studentId,
        name: attendance.student.name,
        surname: attendance.student.surname
      },
      attendance: attendance.attendance
    };
  }
}
