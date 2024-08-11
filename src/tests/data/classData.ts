import { ClassDTO } from '@repositories/classRepository';

function addDays(date: Date, days: number) {
  const copy = new Date(Number(date));
  copy.setDate(date.getDate() + days);
  return copy;
}

export const classes: ClassDTO[] = [
  {
    name: 'C1a',
    validFrom: addDays(new Date(), -60).toISOString(),
    validTo: addDays(new Date(), +60).toISOString(),
    roomId: 1,
    employeeId: 1
  },
  {
    name: 'C1b',
    validFrom: addDays(new Date(), -60).toISOString(),
    validTo: addDays(new Date(), +60).toISOString(),
    roomId: 2,
    employeeId: 2
  },
  {
    name: 'C1c',
    validFrom: addDays(new Date(), -60).toISOString(),
    validTo: addDays(new Date(), +60).toISOString(),
    roomId: 4,
    employeeId: 4
  },
  {
    name: 'C2a',
    validFrom: addDays(new Date(), -60).toISOString(),
    validTo: addDays(new Date(), +60).toISOString(),
    roomId: 7,
    employeeId: 7
  },
  {
    name: 'C2b',
    validFrom: addDays(new Date(), -60).toISOString(),
    validTo: addDays(new Date(), +60).toISOString(),
    roomId: 8,
    employeeId: 8
  }
];
