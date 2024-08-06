import { TimetableSet } from '@models/TimetableSet';
import * as timetableRepository from '@repositories/timetableRepository';

export const getTimetableBySetId = async (
  setId: number
): Promise<TimetableSet | null> => {
  return await timetableRepository.getTimetableBySetId(setId);
};
