import { LessonRecord } from '@models/LessonRecord';
import { Student } from '@models/Student';
import { Op } from 'sequelize';
import { getCurrentTimetableHour } from '../lib/timeLib';
import { SubClass } from '@models/SubClass';
import { StudentAssignment } from '@models/StudentAssignment';
import { Class } from '@models/Class';
import { TimetableEntry } from '@models/TimetableEntry';

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
 * @param lessonId number
 * @returns Promise<object[]>
 */
export const getStudentsForLesson = async (
  lessonId: string
): Promise<Student[]> => {
  // Set lesson class and subClass
  const lesson = await LessonRecord.findByPk(lessonId, {
    include: ['timetableEntry']
  });
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  const entry: TimetableEntry | LessonRecord | null = lesson.timetableEntry
    ? lesson.timetableEntry
    : lesson;
  if (!entry) {
    throw new Error('Timetable entry not found');
  }

  // Get class and subclass
  let lessonClass: Class | null = null;
  let lessonSubClass: SubClass | null = null;
  let sa: StudentAssignment[];
  if (entry.classId) {
    lessonClass = await Class.findByPk(entry.classId);
    if (!lessonClass) {
      throw new Error('Class not found');
    }
  }

  if (entry.subClassId) {
    lessonSubClass = await SubClass.findByPk(entry.subClassId);
    if (!lessonSubClass) {
      throw new Error('SubClass not found');
    }
  }

  // Get students for the lesson by subclass
  if (lessonSubClass) {
    sa = await lessonSubClass.$get('studentAssignments', {
      include: ['student']
    });
  } else {
    if (!lessonClass) {
      throw new Error('No class or subclass set for the lesson');
    }
    // Get students by class if no subclass is set
    sa = await lessonClass.$get('studentAssignments', { include: ['student'] });
  }

  // Get students from StudentAssignments
  return sa.map((assignment) => assignment.student);
};
