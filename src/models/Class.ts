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
import { Room } from '@models/Room';
import { Employee } from '@models/Employee';
import { LessonRecord } from '@models/LessonRecord';
import { TimetableEntry } from '@models/TimetableEntry';
import { SubClass } from '@models/SubClass';
import { StudentAssignment } from '@models/StudentAssignment';
import {
  validateClassDates,
  validateClassInterval,
  validateClassName,
  validateRoomExistence,
  validateRoomSchedule,
  validateTeacherExistence,
  validateTeacherSchedule
} from '@validators/classValidators';

@Table({
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['name', 'validFrom', 'validTo', 'roomId', 'employeeId']
    },
    {
      name: 'validity_range',
      fields: ['validFrom', 'validTo'],
      using: 'BTREE'
    },
    { name: 'name', fields: ['name'], using: 'BTREE' }
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
    type: DataType.STRING(50),
    allowNull: false,
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

  @HasMany(() => LessonRecord)
  declare lessons: LessonRecord[];

  @HasMany(() => StudentAssignment)
  declare studentAssignments: StudentAssignment[];

  // Hooks for validation
  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: Class) {
    await Promise.all([
      validateClassDates(instance),
      validateClassName(instance),
      validateClassInterval(instance),
      validateTeacherExistence(instance),
      validateRoomExistence(instance),
      validateTeacherSchedule(instance),
      validateRoomSchedule(instance)
    ]);
  }
}
