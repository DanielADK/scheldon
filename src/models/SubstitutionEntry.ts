import {
  AutoIncrement,
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { Class } from '@models/Class';
import { Subject } from '@models/Subject';
import { Employee } from '@models/Employee';
import { Room } from '@models/Room';
import { StudentGroup } from '@models/StudentGroup';
import { SubstitutionType } from '@models/types/SubstitutionType';
import { validateDayInWeekRange, validateHourInDayRange } from '@validators/timetableEntryValidators';
import { validateStudentGroupInClass } from '@validators/substitutionEntryValidators';
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
export class SubstitutionEntry extends Model<SubstitutionEntry> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  })
  declare substitutionEntryId: number;

  @Column({
    type: DataType.TINYINT.UNSIGNED,
    allowNull: false
  })
  declare dayInWeek: number;

  @Column({
    type: DataType.TINYINT.UNSIGNED,
    allowNull: false
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

  @Column({
    type: DataType.ENUM(...Object.values(SubstitutionType)),
    allowNull: false
  })
  declare type: SubstitutionType;

  // Mappings
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
  static async validate(instance: SubstitutionEntry, options?: QueryOptions | null): Promise<void> {
    await Promise.all([
      validateDayInWeekRange(instance, options),
      validateHourInDayRange(instance, options),
      instance.studentGroupId ? validateStudentGroupInClass(instance, options) : null
    ]);
  }
}
