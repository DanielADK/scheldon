import axios from 'axios';
import { subjects } from '../data/subjectsData';
import { employees } from '../data/employeeData';
import { rooms } from '../data/roomData';
import { classes } from '../data/classData';
import { SubjectDTO } from '../../repositories/subjectRepository';
import { EmployeeDTO } from '../../repositories/employeeRepository';
import { RoomDTO } from '../../repositories/roomRepository';
import { ClassDTO } from '../../repositories/classRepository';

type entries = SubjectDTO | EmployeeDTO | RoomDTO | ClassDTO;

const uploadData = async (url: string, entity: string, data: entries[]) => {
  try {
    for (const item of data) {
      const response = await axios.post(url, item);
      console.log(`Uploaded [${entity}]: ${response.data.name}`);
    }
  } catch (error: any) {
    console.error(
      'Error uploading data:',
      error.response ? error.response.data : error.message
    );
  }
};

const uploadTestData = async () => {
  await uploadData('http://localhost:3000/subjects', 'Subject', subjects);
  await uploadData('http://localhost:3000/employee', 'Employee', employees);
  await uploadData('http://localhost:3000/room', 'Room', rooms);
  await uploadData('http://localhost:3000/classes', 'Class', classes);
  // Add more calls to uploadData for other data sets
};

uploadTestData();
