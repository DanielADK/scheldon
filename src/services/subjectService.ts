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
 * Get a subject by ID
 * @param subjectId
 */
export const getSubjectById = async (subjectId: number) => {
  return await subjectRepository.getSubjectById(subjectId);
};

/**
 * Get a subject by abbreviation
 * @param abbreviation
 */
export const getSubjectByAbbreviation = async (abbreviation: string) => {
  return await subjectRepository.getSubjectByAbbreviation(abbreviation);
};

/**
 * Update a subject
 * @param subjectId
 * @param data
 */
export const updateSubject = async (subjectId: number, data: SubjectDTO) => {
  return await subjectRepository.updateSubject(subjectId, data);
};

/**
 * Delete a subject
 * @param subjectId
 */
export const deleteSubject = async (subjectId: number) => {
  return await subjectRepository.deleteSubject(subjectId);
};
