import { StudentAssignmentDTO } from '@repositories/studentAssignmentRepository';

export const assignments: { studentId: number; data: StudentAssignmentDTO }[] =
  [
    { studentId: 1, data: { classId: 1 } },
    { studentId: 2, data: { classId: 1 } },
    { studentId: 3, data: { classId: 1 } },
    { studentId: 4, data: { classId: 2 } },
    { studentId: 5, data: { classId: 2 } },
    { studentId: 6, data: { classId: 3 } },
    { studentId: 7, data: { classId: 4 } }
  ];
