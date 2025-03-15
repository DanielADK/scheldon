import { Subject } from '@models/Subject';
import { FindAttributeOptions } from 'sequelize';

/**
 * SubjectDTO interface
 */
export interface SubjectDTO {
  name: string;
  abbreviation: string;
}

const subjectAttributes: FindAttributeOptions = ['subjectId', 'name', 'abbreviation'];

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
export const getSubjects = async (limit: number, offset: number): Promise<{ rows: Subject[]; count: number }> => {
  const { rows, count } = await Subject.findAndCountAll({
    limit,
    offset,
    attributes: subjectAttributes
  });

  return { rows, count };
};

/**
 * Get a subject by ID
 * @param subjectId
 */
export const getSubjectById = async (subjectId: number): Promise<Subject | null> => {
  return await Subject.findOne({
    where: { subjectId: subjectId },
    attributes: subjectAttributes
  });
};

/**
 * Get a subject by abbreviation
 * @param abbreviation
 */
export const getSubjectByAbbreviation = async (abbreviation: string): Promise<Subject | null> => {
  return await Subject.findOne({
    where: { abbreviation: abbreviation },
    attributes: subjectAttributes
  });
};

/**
 * Update a subject
 * @param subjectId
 * @param data
 */
export const updateSubject = async (subjectId: number, data: Partial<SubjectDTO>): Promise<[affectedRows: number]> => {
  return await Subject.update(data, {
    where: { subjectId: subjectId }
  });
};

/**
 * Delete a subject
 * @param subjectId
 */
export const deleteSubject = async (subjectId: number): Promise<number> => {
  return await Subject.destroy({
    where: { subjectId: subjectId }
  });
};
