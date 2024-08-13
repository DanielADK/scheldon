import { TimetableSet } from '@models/TimetableSet';
import { TimetableEntry } from '@models/TimetableEntry';
import { Student } from '@models/Student';
import { Employee } from '@models/Employee';
import { Class } from '@models/Class';
import { TimetableEntrySet } from '@models/TimetableEntrySet';
import { Op } from 'sequelize';
import { Subject } from '@models/Subject';
import { Room } from '@models/Room';
import { SubClass } from '@models/SubClass';

export interface TimetableSetDTO {
  name: string;
  validFrom: string;
  validTo: string;
}

export interface TimetableEntryDTO {
  classId: number;
  subClassId?: number;
  dayInWeek: number;
  hourInDay: number;
  subjectId: number;
  teacherId: number;
  roomId: number;
}

/**
 * TimetableEntry export interface
 */
interface TimetableDetails {
  teacher: {
    name: string;
    surname: string;
    abbreviation: string;
  };
  subject: {
    name: string;
    abbreviation: string;
  };
  subClass: { name: string } | null;
  room: { name: string };
}

/**
 * Timetable as 2D object with day and hour
 */
export interface TimetableExport {
  [day: number]: {
    [hour: number]: TimetableDetails;
  };
}
/**
 * Create a new timetable set
 * @param tsetId int
 * @param data TimetableSetDTO
 */
export const createTEntry = async (
  tsetId: number,
  data: TimetableEntryDTO
): Promise<TimetableEntry> => {
  const tset = await TimetableSet.findByPk(tsetId);
  if (!tset) {
    throw new Error('Timetable set not found');
  }

  const tentry = await TimetableEntry.create(data as TimetableEntry);

  await tset.$add('TimetableEntry', tentry);

  return tentry;
};

export const createTSet = async (
  data: TimetableSetDTO
): Promise<TimetableSet> => {
  return await TimetableSet.create(data as TimetableSet);
};

/**
 * Get timetable by ID
 * @param setId
 */
export const getTimetableBySetId = async (
  setId: number
): Promise<TimetableSet | null> => {
  return await TimetableSet.findByPk(setId, {
    include: [
      {
        model: TimetableEntry,
        include: [Class, Employee, Student]
      }
    ]
  });
};

/**
 * Get timetable by class ID
 * @param classId
 */
export const getTimetableByClassId = async (
  classId: number
): Promise<TimetableExport | null> => {
  return await getTimetableByClassIdAtTime(classId, new Date());
};

/**
 * Get timetable by class ID at time
 * @param classId int
 * @param time Date
 */
export const getTimetableByClassIdAtTime = async (
  classId: number,
  time: Date
): Promise<TimetableExport | null> => {
  // Find the timetable set that is valid at the given time
  const tSet = await TimetableSet.findOne({
    attributes: ['timetableSetId'],
    where: {
      validFrom: { [Op.lte]: time },
      validTo: { [Op.gte]: time }
    }
  });
  if (!tSet) {
    return null;
  }

  const timetableEntries = await TimetableEntrySet.findAll({
    where: {
      timetableSetId: tSet.timetableSetId
    },
    attributes: [],
    include: [
      {
        model: TimetableEntry,
        as: '',
        required: true,
        where: {
          classId: classId
        },
        include: [
          {
            model: Employee,
            attributes: ['name', 'surname', 'abbreviation']
          },
          {
            model: Subject,
            attributes: ['name', 'abbreviation']
          },
          {
            model: SubClass,
            attributes: ['name']
          },
          {
            model: Room,
            attributes: ['name']
          }
        ],
        attributes: ['dayInWeek', 'hourInDay']
      }
    ]
  });

  // Transform to 2D object
  // Define the structure of the Timetable Entry
  interface TimetableDetails {
    teacher: {
      name: string;
      surname: string;
      abbreviation: string;
    };
    subject: {
      name: string;
      abbreviation: string;
    };
    subClass: { name: string } | null;
    room: { name: string };
  }

  interface Timetable2D {
    [day: number]: {
      [hour: number]: TimetableDetails;
    };
  }

  // Transform the results into a 2D object
  const timetable2D: Timetable2D = {};

  for (const entrySet of timetableEntries) {
    const entry = entrySet.timetableEntry;

    const day = entry.dayInWeek;
    const hour = entry.hourInDay;

    if (!(day in timetable2D)) {
      timetable2D[day] = {};
    }

    timetable2D[day][hour] = {
      teacher: entry.teacher,
      subject: entry.subject,
      subClass: entry.subClass,
      room: entry.room
    } as TimetableDetails;
  }

  return timetable2D;
};
