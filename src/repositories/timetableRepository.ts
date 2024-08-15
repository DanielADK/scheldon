import { TimetableSet } from '@models/TimetableSet';
import { TimetableEntry } from '@models/TimetableEntry';
import { Student } from '@models/Student';
import { Employee } from '@models/Employee';
import { Class } from '@models/Class';
import { TimetableEntrySet } from '@models/TimetableEntrySet';
import { Op, WhereOptions } from 'sequelize';
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
 * @param where WhereOptions optional
 * @param time Date optional
 */
export const getTimetableByParam = async (
  where: WhereOptions = {},
  time: Date = new Date()
): Promise<TimetableEntrySet[] | null> => {
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

  // TODO: Add temporary lessons

  return await TimetableEntrySet.findAll({
    where: {
      timetableSetId: tSet.timetableSetId
    },
    attributes: [],
    include: [
      {
        model: TimetableEntry,
        as: '',
        required: true,
        where: where,
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
            model: Class,
            attributes: ['name']
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
};
