import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { TimetableEntry } from '@models/TimetableEntry';
import { Attendance } from '@models/Attendance';
import { LessonType } from '@models/types/LessonType';
import { SubstitutionEntry } from '@models/SubstitutionEntry';

@Table({
  createdAt: true,
  updatedAt: false
})
export class LessonRecord extends Model<LessonRecord> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    unique: true
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
  @ForeignKey(() => SubstitutionEntry)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare substitutionEntryId: number | null;

  // LessonRecord-specific fields
  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare topic: string | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  declare date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare fillDate: Date | null;

  // Type only with timetableEntry, other fields are null
  @Column({
    type: DataType.ENUM(...Object.values(LessonType)),
    allowNull: true
  })
  declare type: LessonType | null;

  // Mapping
  @BelongsTo(() => TimetableEntry)
  declare timetableEntry: TimetableEntry | null;

  @BelongsTo(() => SubstitutionEntry)
  declare substitutionEntry: SubstitutionEntry | null;

  @HasMany(() => Attendance)
  declare attendances: Attendance[];

  /*
  @BeforeBulkCreate
  static async validateBulk(instances: LessonRecord[]): Promise<void> {
    await Promise.all(
      instances.map((instance) => LessonRecord.validate(instance))
    );
  }*/

  /*
  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: LessonRecord): Promise<void> {
    await Promise.all([
      validateXORIdentifiers(instance),
      //instance.teacherId ? validateTeacherRole(instance) : null,
      validateDayInWeekRange(instance),
      validateHourInDayRange(instance),
      //instance.subClassId ? validateSubClassInClass(instance) : null,
      instance.timetableEntry ? validateType(instance) : null
    ]);
  }*/

  // Other methods
  /**
   * Check if the lesson record is filled
   * @returns boolean
   * @throws Error if the lesson record is already filled
   */
  isFilled(): boolean {
    return this.fillDate !== null;
  }
}
