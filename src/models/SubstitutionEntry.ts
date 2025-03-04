import {
  AutoIncrement,
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
import { SubClass } from '@models/SubClass';

@Table({
  timestamps: false,
  indexes: [
    {
      unique: true,
      name: 'unique_class_entry',
      fields: [
        'classId',
        'dayInWeek',
        'hourInDay',
        'subjectId',
        'teacherId',
        'roomId'
      ]
    },
    {
      unique: true,
      name: 'unique_class_with_subclass_entry',
      fields: [
        'classId',
        'subClassId',
        'dayInWeek',
        'hourInDay',
        'subjectId',
        'teacherId',
        'roomId'
      ]
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

  @ForeignKey(() => SubClass)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: true
  })
  declare subClassId: number | null;

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
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
  //@HasMany(() => LessonRecord)
  //declare lessonRecords: Le;

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

  /*
  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: SubstitutionEntry): Promise<void> {
    await Promise.all([
      validateUniqueEntry(instance),
      validateTeacherRole(instance),
      validateDayInWeekRange(instance),
      validateHourInDayRange(instance),
      instance.subClassId ? validateSubClassInClass(instance) : null
    ]);
  }
  */
}
