import { Employee } from '@models/Employee';

export const validateTeacherWithAbbreviation = async (instance: Employee) => {
  if (instance.isTeacher && !instance.abbreviation) {
    throw new Error('Abbreviation is required for teachers');
  }
};
