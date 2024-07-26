import * as subjectRepository from '../repositories/subjectRepository';
import { SubjectDTO } from '../repositories/subjectRepository';

/**
 * Create a new subject
 * @param data
 */
export const createSubject = async (data: SubjectDTO) => {
  return await subjectRepository.createSubject(data);
};

/**
 * Get all subjects
 */
export const getAllSubjects = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return await subjectRepository.getSubjects(limit, offset);
};

/**
 * Get a subject by abbreviation
 * @param abbreviation
 */
export const getSubjectByAbbreviation = async (abbreviation: string) => {
  return await subjectRepository.getSubjectByAbbreviation(abbreviation);
};
