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
} from '@validators/TimetableEntryValidators';

@Table({
  timestamps: false,
  validate: {
    employeeIsTeacher(this: TimetableEntry) {
      if (this.teacherId === null) {
        throw new Error('teacherId is required');
      }
    }
  }
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
    allowNull: true
  })
  declare roomId: number;

  // Mappings
  @BelongsToMany(() => TimetableSet, () => TimetableEntrySet)
  declare timetableSets: TimetableSet[];

  @BelongsTo(() => Class)
  declare class: Class;

  @BelongsTo(() => SubClass)
  declare subclass: SubClass;

  @BelongsTo(() => Subject)
  declare subject: Subject;

  @BelongsTo(() => Employee)
  declare teacher: Employee;

  @BelongsTo(() => Room)
  declare room: Room;

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: TimetableEntry): Promise<void> {
    await validateTeacherRole(instance);
    await validateDayInWeekRange(instance);
    await validateHourInDayRange(instance);
    await validateSubClassInClass(instance);
  }
}
