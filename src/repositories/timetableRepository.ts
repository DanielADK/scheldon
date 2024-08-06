import { TimetableSet } from '@models/TimetableSet';
import { TimetableEntry } from '@models/TimetableEntry';
import { Student } from '@models/Student';
import { Employee } from '@models/Employee';
import { Class } from '@models/Class';

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
