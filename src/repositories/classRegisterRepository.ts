import { ClassRegister } from '@models/ClassRegister';
import { Student } from '@models/Student';
import { attendanceRecordDTO } from '@repositories/attendanceRepository';
import { sequelize } from '../index';
import { Study } from '@models/Study';
import { Class } from '@models/Class';
import { StudentGroup } from '@models/StudentGroup';
import { getCurrentTimetableHour } from '../lib/timeLib';
import { col, fn, Op, where, WhereOptions } from 'sequelize';
import { TimetableEntry } from '@models/TimetableEntry';
import { SubstitutionEntry } from '@models/SubstitutionEntry';

export interface classRegisterRecordDTO {
  lessonId: number;
  topic: string;
  studentAttendance: attendanceRecordDTO[];
}

export const finishLessonRecord = async (data: classRegisterRecordDTO): Promise<void> => {
  const transaction = await sequelize.transaction();
  // Find the lesson record
  const lessonRecord = await ClassRegister.findByPk(data.lessonId, {
    transaction: transaction
  });
  if (!lessonRecord) throw new Error('Lesson record not found');

  // Check if the lesson record is already finished
  if (lessonRecord.fillDate) throw new Error('Lesson record already locked&finished');

  // Update the lesson record
  lessonRecord.topic = data.topic;

  // Save the lesson record
  await lessonRecord.save();
};

/**
 * Get the current lesson record for a specific teacher
 * @param teacherId number
 * @returns Promise<ClassRegister | null>
 */
export const getCurrentLessonRecord = async (teacherId: number): Promise<ClassRegister | null> => {
  const currentTime = new Date();
  const currentHour = getCurrentTimetableHour(currentTime);

  return await ClassRegister.findOne({
    where: {
      date: { [Op.lte]: currentTime },
      [Op.and]: [
        // find first lesson record where teacherId matches
        where(fn('COALESCE', col('substitutionEntry.teacherId'), col('timetableEntry.teacherId')), teacherId),
        // find first lesson record where hourInDay matches
        where(fn('COALESCE', col('substitutionEntry.hourInDay'), col('timetableEntry.hourInDay')), currentHour)
      ]
    },
    include: [
      { model: TimetableEntry, as: 'timetableEntry', required: false },
      { model: SubstitutionEntry, as: 'substitutionEntry', required: false }
    ]
  });
};

/**
 * Get the list of students for a given lesson
 * @param lessonId string
 * @returns Promise<Student[]>
 */
export const getStudentsForLesson = async (lessonId: number): Promise<Student[]> => {
  // Find the lesson and include the timetable entry
  const lesson = await ClassRegister.findByPk(lessonId, {
    include: ['timetableEntry', 'substitutionEntry']
  });

  if (!lesson) throw new Error('Lesson not found');

  // Determine the entry source (either TimetableEntry or ClassRegister itself)
  const entry = lesson.substitutionEntry ?? lesson.timetableEntry;
  if (!entry || !entry.classId) {
    throw new Error('Lesson does not have a class assigned');
  }

  const now = new Date();
  const dateWhere: WhereOptions = {
    validFrom: { [Op.lte]: now },
    validTo: { [Op.gte]: now }
  };

  // Find the students based on class and studentGroup
  const studentAssignments = entry.studentGroupId
    ? await StudentGroup.findByPk(entry.id, {
        include: [
          {
            model: Study,
            include: ['student'],
            where: dateWhere
          }
        ]
      })
    : await Class.findByPk(entry.id, {
        include: [
          {
            model: Study,
            include: ['student'],
            where: dateWhere
          }
        ]
      });

  if (!studentAssignments) throw new Error('No students found for the lesson');

  return studentAssignments.studentAssignments.map((assignment) => assignment.student);
};
