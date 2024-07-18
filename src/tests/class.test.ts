import { expect } from 'chai';
import { Sequelize } from 'sequelize-typescript';
import { Class } from '../models/Class';
import { Room } from '../models/Room';
import { Employee } from '../models/Employee';
import { after, before, beforeEach, describe, it } from 'node:test';

describe('Class Model', () => {
  let sequelize: Sequelize;

  before(async () => {
    sequelize = new Sequelize({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'your_username',
      password: 'your_password',
      database: 'your_database',
      models: [Class, Room, Employee],
      logging: false
    });
    await sequelize.sync({ force: true });
  });

  after(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Class.destroy({ where: {}, truncate: true });
    await Room.destroy({ where: {}, truncate: true });
    await Employee.destroy({ where: {}, truncate: true });
  });

  it('should create a class without overlapping interval', async () => {
    const room = await Room.create({ name: 'Room 1' });
    const employee = await Employee.create({
      firstname: 'John',
      lastname: 'Doe'
    });

    const classData = {
      letter: 'A',
      prefix: '1',
      date_from: new Date('2023-01-01').toISOString(),
      date_to: new Date('2023-12-31').toISOString(),
      roomId: room.id,
      employeeId: employee.id
    };

    const createdClass = await Class.create(classData);
    expect(createdClass).to.have.property('classId');
    expect(createdClass.letter).to.equal(classData.letter);
    expect(createdClass.prefix).to.equal(classData.prefix);
    expect(createdClass.roomId).to.equal(classData.roomId);
    expect(createdClass.employeeId).to.equal(classData.employeeId);
  });

  it('should not create a class with overlapping interval', async () => {
    const room = await Room.create({ name: 'Room 1' });
    const employee = await Employee.create({
      firstname: 'John',
      lastname: 'Doe'
    });

    const classData1 = {
      letter: 'A',
      prefix: '1',
      date_from: new Date('2023-01-01').toISOString(),
      date_to: new Date('2023-12-31').toISOString(),
      roomId: room.id,
      employeeId: employee.id
    };

    const classData2 = {
      letter: 'A',
      prefix: '1',
      date_from: new Date('2023-06-01').toISOString(),
      date_to: new Date('2023-12-31').toISOString(),
      roomId: room.id,
      employeeId: employee.id
    };

    await Class.create(classData1);
    await expect(Class.create(classData2)).to.be.rejectedWith(
      'Class interval is overlapping with another class'
    );
  });

  it('should update a class without overlapping interval', async () => {
    const room = await Room.create({ name: 'Room 1' });
    const employee = await Employee.create({
      firstname: 'John',
      lastname: 'Doe'
    });

    const classData = {
      letter: 'A',
      prefix: '1',
      date_from: new Date('2023-01-01').toISOString(),
      date_to: new Date('2023-12-31').toISOString(),
      roomId: room.id,
      employeeId: employee.id
    };

    const createdClass = await Class.create(classData);
    createdClass.date_to = new Date('2023-06-30').toISOString();
    await createdClass.save();

    const updatedClass = await Class.findByPk(createdClass.classId);
    expect(updatedClass.date_to).to.equal(new Date('2023-06-30').toISOString());
  });

  it('should not update a class to an overlapping interval', async () => {
    const room = await Room.create({ name: 'Room 1' });
    const employee = await Employee.create({
      firstname: 'John',
      lastname: 'Doe'
    });

    const classData1 = {
      letter: 'A',
      prefix: '1',
      date_from: new Date('2023-01-01').toISOString(),
      date_to: new Date('2023-12-31').toISOString(),
      roomId: room.id,
      employeeId: employee.id
    };

    const classData2 = {
      letter: 'A',
      prefix: '1',
      date_from: new Date('2022-01-01').toISOString(),
      date_to: new Date('2022-12-31').toISOString(),
      roomId: room.id,
      employeeId: employee.id
    };

    const createdClass1 = await Class.create(classData1);
    const createdClass2 = await Class.create(classData2);

    createdClass2.date_to = new Date('2023-06-30').toISOString();
    await expect(createdClass2.save()).to.be.rejectedWith(
      'Class interval is overlapping with another class'
    );
  });
});
