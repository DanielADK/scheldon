import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { TimetableEntry } from '@models/TimetableEntry';
import { Attendance } from '@models/Attendance';
import { SubstitutionType } from '@models/types/SubstitutionType';
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
    type: DataType.INTEGER.UNSIGNED,
    allowNull: true
  })
  declare timetableEntryId: number | null;

  // XOR fields with timetableEntry
  @ForeignKey(() => SubstitutionEntry)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
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
    type: DataType.ENUM(...Object.values(SubstitutionType)),
    allowNull: true
  })
  declare type: SubstitutionType | null;

  @Column({
    type: DataType.STRING(2048),
    allowNull: true
  })
  declare note: string | null;

  // Mapping
  @BelongsTo(() => TimetableEntry, {
    foreignKey: 'entryId',
    constraints: false,
    scope: {
      entryType: 'TimetableEntry'
    }
  })
  declare timetableEntry: TimetableEntry | null;

  @BelongsTo(() => SubstitutionEntry, {
    foreignKey: 'entryId',
    constraints: false,
    scope: {
      entryType: 'SubstitutionEntry'
    }
  })
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
      //instance.studentGroupId ? validatestudentGroupInClass(instance) : null,
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
