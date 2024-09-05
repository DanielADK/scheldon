import { Room } from '@models/Room';

export const validateOffice = async (instance: Room) => {
  if (instance.type === 'OFFICE' && instance.studentCapacity) {
    throw new Error('Offices cannot have student capacity');
  }
};

export const validateClassroom = async (instance: Room) => {
  if (instance.type === 'CLASSROOM' && !instance.studentCapacity) {
    throw new Error('Classrooms must have student capacity');
  }
};
