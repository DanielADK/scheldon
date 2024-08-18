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
import { SubClass } from '@models/SubClass';
import {
  validateDayInWeekRange,
  validateHourInDayRange,
  validateSubClassInClass,
  validateTeacherRole
} from '@validators/timetableEntryValidators';

@Table({
  timestamps: false
})
export class TimetableEntry extends Model<TimetableEntry> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare timetableEntryId: number;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare classId: number;

  @ForeignKey(() => SubClass)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare subClassId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare dayInWeek: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare hourInDay: number;

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare subjectId: number;

  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare teacherId: number;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare roomId: number;

  // Mappings
  @BelongsToMany(() => TimetableSet, () => TimetableEntrySet)
  declare timetableSets: TimetableSet[];

  @BelongsTo(() => Class)
  declare class: Class;

  @BelongsTo(() => SubClass)
  declare subClass: SubClass | null;

  @BelongsTo(() => Subject)
  declare subject: Subject;

  @BelongsTo(() => Employee)
  declare teacher: Employee;

  @BelongsTo(() => Room)
  declare room: Room;

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: TimetableEntry): Promise<void> {
    await Promise.all([
      validateTeacherRole(instance),
      validateDayInWeekRange(instance),
      validateHourInDayRange(instance),
      instance.subClassId ? validateSubClassInClass(instance) : null
    ]);
  }
}
