import { LessonRecord } from '@models/LessonRecord';
import { Student } from '@models/Student';
import { Op, WhereOptions } from 'sequelize';
import { getCurrentTimetableHour } from '../lib/timeLib';
import { SubClass } from '@models/SubClass';
import { StudentAssignment } from '@models/StudentAssignment';
import { Class } from '@models/Class';

/**
 * Get the current lesson record for a specific teacher
 * @param teacherId number
 * @returns Promise<LessonRecord | null>
 */
export const getCurrentLessonRecord = async (
  teacherId: number
): Promise<LessonRecord | null> => {
  const currentTime = new Date();
  return await LessonRecord.findOne({
    where: {
      teacherId: teacherId,
      date: { [Op.lte]: currentTime },
      hourInDay: getCurrentTimetableHour(currentTime)
    }
  });
};

/**
 * Get the list of students for a given lesson
 * @param lessonId string
 * @returns Promise<Student[]>
 */
export const getStudentsForLesson = async (
  lessonId: string
): Promise<Student[]> => {
  // Find the lesson and include the timetable entry
  const lesson = await LessonRecord.findByPk(lessonId, {
    include: ['timetableEntry']
  });

  if (!lesson) throw new Error('Lesson not found');

  // Determine the entry source (either TimetableEntry or LessonRecord itself)
  const entry = lesson.timetableEntry ?? lesson;
  if (!entry.classId) {
    throw new Error('Lesson does not have a class assigned');
  }
  const dateWhere: WhereOptions = {
    validFrom: { [Op.lte]: new Date() },
    validTo: { [Op.gte]: new Date() }
  };

  // Find the students based on class and subclass
  const studentAssignments = entry.subClassId
    ? await SubClass.findByPk(entry.subClassId, {
        include: [
          {
            model: StudentAssignment,
            include: ['student'],
            where: dateWhere
          }
        ]
      })
    : await Class.findByPk(entry.classId, {
        include: [
          {
            model: StudentAssignment,
            include: ['student'],
            where: dateWhere
          }
        ]
      });

  if (!studentAssignments) throw new Error('No students found for the lesson');

  return studentAssignments.studentAssignments.map(
    (assignment) => assignment.student
  );
};
