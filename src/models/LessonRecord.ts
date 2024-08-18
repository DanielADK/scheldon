import {
  AutoIncrement,
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { Class } from '@models/Class';
import { Subject } from '@models/Subject';
import { Employee } from '@models/Employee';
import { TimetableEntry } from '@models/TimetableEntry';
import { Attendance } from '@models/Attendance';
import { Room } from '@models/Room';
import { SubClass } from '@models/SubClass';
import {
  validateDayInWeekRange,
  validateHourInDayRange,
  validateSubClassInClass,
  validateTeacherRole,
  validateXORIdentifiers
} from '@validators/lessonValidators';

@Table({
  createdAt: true,
  updatedAt: false
})
export class LessonRecord extends Model<LessonRecord> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true
  })
  declare lessonId: number;

  // timetableEntry if exists
  @ForeignKey(() => TimetableEntry)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare timetableEntryId: number | null;

  // XOR fields with timetableEntry
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare dayInWeek: number | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare hourInDay: number | null;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare classId: number | null;

  @ForeignKey(() => SubClass)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare subClassId: number | null;

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare subjectId: number | null;

  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare teacherId: number | null;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare roomId: number | null;

  // LessonRecord-specific fields
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare topic: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare date: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare fillDate: Date | null;

  // Mapping
  @BelongsTo(() => Class)
  declare class: Class | null;

  @BelongsTo(() => SubClass)
  declare subClass: SubClass | null;

  @BelongsTo(() => Subject)
  declare subject: Subject | null;

  @BelongsTo(() => Employee)
  declare teacher: Employee | null;

  @BelongsTo(() => TimetableEntry)
  declare timetableEntry: TimetableEntry | null;

  @BelongsTo(() => Room)
  declare room: Room | null;

  @HasMany(() => Attendance)
  declare attendances: Attendance[];

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: LessonRecord): Promise<void> {
    await Promise.all([
      validateXORIdentifiers(instance),
      await validateTeacherRole(instance),
      await validateDayInWeekRange(instance),
      await validateHourInDayRange(instance),
      instance.subClassId ? await validateSubClassInClass(instance) : null
    ]);
  }
}
