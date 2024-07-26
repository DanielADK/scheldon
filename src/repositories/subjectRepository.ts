import { Subject } from '../models/Subject';
import { FindAttributeOptions } from 'sequelize';

/**
 * SubjectDTO interface
 */
export interface SubjectDTO {
  name: string;
  abbreviation: string;
}

const subjectAttributes: FindAttributeOptions = [
  ['subjectId', 'id'],
  'name',
  'abbreviation'
];

/**
 * Create a new subject
 * @param data
 */
export const createSubject = async (data: SubjectDTO): Promise<Subject> => {
  const existingSubject = await Subject.findOne({
    where: { abbreviation: data.abbreviation }
  });
  if (existingSubject) {
    throw new Error('This abbreviation is already in use.');
  }
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
    attributes: subjectAttributes
  });

  return { rows, count };
};

/**
 * Get a subject by abbreviation
 * @param abbreviation
 */
export const getSubjectByAbbreviation = async (
  abbreviation: string
): Promise<Subject | null> => {
  return await Subject.findOne({
    where: { abbreviation },
    attributes: subjectAttributes
  });
};
