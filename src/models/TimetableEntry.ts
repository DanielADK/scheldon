import {
  AutoIncrement,
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { TimetableSet } from '@models/TimetableSet';
import { Class } from '@models/Class';
import { Subject } from '@models/Subject';
import { Employee } from '@models/Employee';
import { Room } from '@models/Room';
import { TimetableEntrySet } from '@models/TimetableEntrySet';
import { StudentGroup } from '@models/StudentGroup';
import {
  validateDayInWeekRange,
  validateHourInDayRange,
  validateStudentGroupInClass,
  validateUniqueEntry
} from '@validators/timetableEntryValidators';
import { QueryOptions } from '@models/types/QueryOptions';

@Table({
  timestamps: false,
  indexes: [
    {
      unique: true,
      name: 'unique_class_entry',
      fields: ['classId', 'dayInWeek', 'hourInDay', 'subjectId', 'teacherId', 'roomId']
    },
    {
      unique: true,
      name: 'unique_class_with_studentGroup_entry',
      fields: ['classId', 'studentGroupId', 'dayInWeek', 'hourInDay', 'subjectId', 'teacherId', 'roomId']
    }
  ]
})
export class TimetableEntry extends Model<TimetableEntry> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  })
  declare timetableEntryId: number;

  @Column({
    type: DataType.TINYINT.UNSIGNED,
    allowNull: true
  })
  declare dayInWeek: number;

  @Column({
    type: DataType.TINYINT.UNSIGNED,
    allowNull: true
  })
  declare hourInDay: number;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false
  })
  declare classId: number;

  @ForeignKey(() => StudentGroup)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: true
  })
  declare studentGroupId: number | null;

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false
  })
  declare subjectId: number;

  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false
  })
  declare teacherId: number;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false
  })
  declare roomId: number;

  // Mappings
  @BelongsToMany(() => TimetableSet, () => TimetableEntrySet)
  declare timetableSets: TimetableSet[];

  @BelongsTo(() => Class)
  declare class: Class;

  @BelongsTo(() => StudentGroup)
  declare studentGroup: StudentGroup | null;

  @BelongsTo(() => Subject)
  declare subject: Subject;

  @BelongsTo(() => Employee)
  declare teacher: Employee;

  @BelongsTo(() => Room)
  declare room: Room;

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: TimetableEntry, options?: QueryOptions | null): Promise<void> {
    await Promise.all([
      validateUniqueEntry(instance, options),
      validateDayInWeekRange(instance, options),
      validateHourInDayRange(instance, options),
      instance.studentGroupId ? validateStudentGroupInClass(instance, options) : null
    ]);
  }
}
