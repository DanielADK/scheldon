import { Subject } from '../models/Subject';

/**
 * SubjectDTO interface
 */
export interface SubjectDTO {
  name: string;
  abbreviation: string;
}

/**
 * Create a new subject
 * @param data
 */
export const createSubject = async (data: SubjectDTO): Promise<Subject> => {
  return await Subject.create(data as Subject);
};

/**
 * Get all subjects
 */
export const getSubjects = async (
  limit: number,
  offset: number
): Promise<{ rows: Subject[]; count: number }> => {
  const { rows, count } = await Subject.findAndCountAll({
    limit,
    offset,
    attributes: [['subjectId', 'id'], 'name', 'abbreviation']
  });

  return { rows, count };
};
