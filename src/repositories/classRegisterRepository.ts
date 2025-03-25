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
import { TimetableSet } from '@models/TimetableSet';

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
  const study = entry.studentGroupId
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

  if (!study) throw new Error('No students found for the lesson');

  return study.studies.map((assignment) => assignment.student);
};

export const getLessonBulkInTSetPeriod = async (tset: TimetableSet, data: TimetableEntry): Promise<ClassRegister[]> => {
  const lessons: ClassRegister[] = [];
  const validTo: Date = new Date(tset.validTo);
  const date: Date = new Date(tset.validFrom);

  // Find first occurrence of TimeTableEntry dayInWeek from validFrom date
  // Convert Sun-Sat to Mon-Sun
  let dayInWeekFrom = date.getDay();
  dayInWeekFrom = dayInWeekFrom === 0 ? 6 : dayInWeekFrom - 1;

  // Calculate the difference between the two days with overflow
  let dateDiff = data.dayInWeek - dayInWeekFrom;
  dateDiff = dateDiff < 0 ? dateDiff + 7 : dateDiff;

  // Set the date to the first occurrence of the dayInWeek
  date.setDate(date.getDate() + dateDiff);

  // Fill the timetable set with lessons between dates
  while (date < validTo) {
    lessons.push({
      timetableEntryId: data.timetableEntryId,
      date: new Date(date)
    } as ClassRegister);

    // Add week to date
    date.setDate(date.getDate() + 7);
  }

  return lessons;
};
