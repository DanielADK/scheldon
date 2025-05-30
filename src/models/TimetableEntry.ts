import {
  AutoIncrement,
  BeforeCreate,
  BeforeDestroy,
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
  validateClassAvailability,
  validateClassStudentGroupConflict,
  validateDayInWeekRange,
  validateHourInDayRange,
  validateRoomAvailability,
  validateStudentGroupAvailability,
  validateStudentGroupInClass,
  validateTeacherAvailability,
  validateTimetableSetInClassRange
} from '@validators/timetableEntryValidators';
import { QueryOptions } from '@models/types/QueryOptions';
import { restrictOnDelete } from '@validators/genericValidators';
import { ClassRegister } from '@models/ClassRegister';

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
    allowNull: false,
    onDelete: 'RESTRICT'
  })
  declare classId: number;

  @ForeignKey(() => StudentGroup)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: true,
    onDelete: 'RESTRICT'
  })
  declare studentGroupId: number | null;

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    onDelete: 'RESTRICT'
  })
  declare subjectId: number;

  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    onDelete: 'RESTRICT'
  })
  declare teacherId: number;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    onDelete: 'RESTRICT'
  })
  declare roomId: number;

  // Mappings
  @BelongsToMany(() => TimetableSet, () => TimetableEntrySet)
  declare timetableSets: TimetableSet[];

  @BelongsTo(() => Class, { onDelete: 'RESTRICT' })
  declare class: Class;

  @BelongsTo(() => StudentGroup, { onDelete: 'RESTRICT' })
  declare studentGroup: StudentGroup | null;

  @BelongsTo(() => Subject, { onDelete: 'RESTRICT' })
  declare subject: Subject;

  @BelongsTo(() => Employee, { onDelete: 'RESTRICT' })
  declare teacher: Employee;

  @BelongsTo(() => Room, { onDelete: 'RESTRICT' })
  declare room: Room;

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: TimetableEntry, options?: QueryOptions | null): Promise<void> {
    await Promise.all([
      validateDayInWeekRange(instance, options),
      validateHourInDayRange(instance, options),
      instance.studentGroupId ? validateStudentGroupInClass(instance, options) : null,
      validateTeacherAvailability(instance, options),
      validateRoomAvailability(instance, options),
      validateClassAvailability(instance, options),
      validateStudentGroupAvailability(instance, options),
      validateTimetableSetInClassRange(instance, options),
      validateClassStudentGroupConflict(instance, options)
    ]);
  }

  @BeforeDestroy
  static async tryRemove(instance: TimetableEntry, options?: QueryOptions | null) {
    await Promise.all([
      await restrictOnDelete(
        ClassRegister as (new () => Model) & typeof Model,
        'timetableEntryId' as string as keyof Model,
        instance.timetableEntryId,
        options
      )
    ]);
  }

  getId() {
    return this.timetableEntryId;
  }
}
