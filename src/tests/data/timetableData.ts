import {
  TimetableEntryDTO,
  TimetableSetDTO
} from '@repositories/timetableRepository';

function addDays(date: Date, days: number) {
  const copy = new Date(Number(date));
  copy.setDate(date.getDate() + days);
  return copy;
}

export const sets: TimetableSetDTO[] = [
  {
    name: '2024/2025 1',
    validFrom: addDays(new Date(), -60).toISOString(),
    validTo: addDays(new Date(), -20).toISOString()
  },
  {
    name: '2024/2025 2',
    validFrom: addDays(new Date(), -19).toISOString(),
    validTo: addDays(new Date(), -10).toISOString()
  },
  {
    name: '2024/2025 3',
    validFrom: addDays(new Date(), -9).toISOString(),
    validTo: addDays(new Date(), +60).toISOString()
  }
];

export const entries: TimetableEntryDTO[] = [
  {
    classId: 1,
    dayInWeek: 0, // Monday
    hourInDay: 0,
    subjectId: 1,
    teacherId: 1,
    roomId: 1
  },
  {
    classId: 1,
    dayInWeek: 0, // Monday
    hourInDay: 1,
    subjectId: 5,
    teacherId: 2,
    roomId: 2
  },
  {
    classId: 1,
    dayInWeek: 0, // Monday
    hourInDay: 2,
    subjectId: 5,
    teacherId: 2,
    roomId: 2
  },
  {
    classId: 1,
    dayInWeek: 0, // Monday
    hourInDay: 3,
    subjectId: 8,
    teacherId: 4,
    roomId: 3
  },
  {
    classId: 1,
    dayInWeek: 1, // Tuesday
    hourInDay: 0,
    subjectId: 10,
    teacherId: 7,
    roomId: 2
  },
  {
    classId: 1,
    dayInWeek: 1, // Tuesday
    hourInDay: 2,
    subjectId: 5,
    teacherId: 2,
    roomId: 2
  },
  {
    classId: 1,
    dayInWeek: 2, // Wednesday
    hourInDay: 0,
    subjectId: 10,
    teacherId: 7,
    roomId: 2
  },
  {
    classId: 1,
    dayInWeek: 3, // Thursday
    hourInDay: 1,
    subjectId: 10,
    teacherId: 7,
    roomId: 2
  },
  {
    classId: 1,
    dayInWeek: 3, // Friday
    hourInDay: 2,
    subjectId: 5,
    teacherId: 2,
    roomId: 2
  }
];
