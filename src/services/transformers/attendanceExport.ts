import { AbstractAdapter, InputModels } from '@services/transformers/AbstractAdapter';
import { StudentAttendance } from '@services/transformers/classRegisterExport';

export const transformAttendance = async <T extends InputModels, R extends StudentAttendance>(
  entries: T[] | null,
  adapter: AbstractAdapter<T, R>
): Promise<R[] | null> => {
  if (entries === null) return null;
  return await adapter.transformAll(entries);
};
