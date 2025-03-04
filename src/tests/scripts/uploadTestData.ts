import axios from 'axios';
import { subjects } from '../data/subjectsData';
import { employees } from '../data/employeeData';
import { rooms } from '../data/roomData';
import { classes } from '../data/classData';
import { studentGroupes } from '../data/studentGroupData';
import { students } from '../data/studentData';
import { assignments } from '../data/studentAssignmentData';
import { SubjectDTO } from '@repositories/subjectRepository';
import { EmployeeDTO } from '@repositories/employeeRepository';
import { RoomDTO } from '@repositories/roomRepository';
import { ClassDTO } from '@repositories/classRepository';
import { studentGroupDTO } from '@repositories/studentGroupRepository';
import { StudentDTO } from '@repositories/studentRepository';
import { StudentAssignmentDTO } from '@repositories/studentAssignmentRepository';
import { entries, sets } from '../data/timetableData';
import {
  TimetableEntryDTO,
  TimetableSetDTO
} from '@repositories/timetableRepository';
import { temporaryLessons } from '../data/lessonRecordData';

type entries =
  | SubjectDTO
  | EmployeeDTO
  | RoomDTO
  | ClassDTO
  | studentGroupDTO
  | StudentDTO
  | StudentAssignmentDTO
  | TimetableSetDTO
  | TimetableEntryDTO;

const uploadData = async (
  domain: string,
  url: string,
  entity: string,
  data: entries[]
) => {
  for (const item of data) {
    try {
      console.log(`Uploading ${entity} to ${url}`);
      const response = await axios.post(domain + url, item);
      console.log(
        `Uploaded [${entity}]: ${response.data.name ?? response.data}`
      );
    } catch (error: any) {
      console.error(
        `Error uploading data [${entity}]:`,
        error.response ? error.response.data : error.message
      );
    }
  }
};

const uploadTestData = async () => {
  const url = 'https://localhost:3000';
  // Subjects, Employees, Rooms
  await uploadData(url, '/subjects', 'Subject', subjects);
  await uploadData(url, '/employees', 'Employee', employees);
  await uploadData(url, '/rooms', 'Room', rooms);

  // Classes
  await uploadData(url, '/classes', 'Class', classes);
  await uploadData(url, '/studentGroupes', 'studentGroup', studentGroupes);

  // Students
  await uploadData(url, '/students', 'Student', students);

  // Assignments
  for (const assignment of assignments) {
    await uploadData(
      url,
      '/students/' + assignment.studentId + '/assign',
      'StudentAssignment',
      [assignment.data]
    );
  }

  // Timetables
  await uploadData(url, '/timetables/set', 'TimetableSet', sets);
  await uploadData(url, '/timetables/set/3/entry', 'TimetableEntry', entries);

  // Temporary lessons
  await uploadData(
    url,
    '/timetables/temporary/lesson',
    'TemporaryLesson',
    temporaryLessons
  );
};

uploadTestData();
