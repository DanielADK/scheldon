import {
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table
} from 'sequelize-typescript';
import { Room } from './Room';
import { Employee } from './Employee';
import { Lesson } from './Lesson';
import { TimetableEntry } from './TimetableEntry';
import { SubClass } from './SubClass';
import { StudentAssignment } from './StudentAssignment';
import {
  validateClassDates,
  validateClassInterval,
  validateClassName,
  validateEmployeeExistence,
  validateEmployeeSchedule,
  validateRoomExistence,
  validateRoomSchedule
} from '../validators/classValidators';

@Table({
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['name', 'validFrom', 'validTo', 'roomId', 'employeeId']
    }
  ]
})
export class Class extends Model<Class> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  declare classId: number;

  @Column({
    type: DataType.STRING(3),
    allowNull: true,
    unique: false
  })
  declare name: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    unique: false
  })
  declare validFrom: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    unique: false
  })
  declare validTo: string;

  // Default Room
  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: false
  })
  declare roomId: number;

  @BelongsTo(() => Room)
  declare room: Room;

  // Class Teacher
  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: false
  })
  declare employeeId: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  declare createdAt: string;

  @BelongsTo(() => Employee)
  declare employee: Employee;

  @HasMany(() => TimetableEntry)
  declare timetableEntries: TimetableEntry[];

  @HasMany(() => SubClass)
  declare subClasses: SubClass[];

  @HasMany(() => Lesson)
  declare lessons: Lesson[];

  @HasMany(() => StudentAssignment)
  declare studentAssignments: StudentAssignment[];

  // Virtual fields & validation
  @BeforeCreate
  @BeforeUpdate
  // Hooks for validation
  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: Class) {
    await validateClassDates(instance);
    await validateClassName(instance);
    await validateClassInterval(instance);
    await validateEmployeeExistence(instance);
    await validateRoomExistence(instance);
    await validateEmployeeSchedule(instance);
    await validateRoomSchedule(instance);
  }
}
