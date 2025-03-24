import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { TimetableEntry } from '@models/TimetableEntry';
import { Attendance } from '@models/Attendance';
import { SubstitutionType } from '@models/types/SubstitutionType';
import { SubstitutionEntry } from '@models/SubstitutionEntry';

@Table({
  createdAt: true,
  updatedAt: false
})
export class ClassRegister extends Model<ClassRegister> {
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
    allowNull: true,
    onDelete: 'RESTRICT'
  })
  declare timetableEntryId: number | null;

  // XOR fields with timetableEntry
  @ForeignKey(() => SubstitutionEntry)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: true,
    onDelete: 'RESTRICT'
  })
  declare substitutionEntryId: number | null;

  // ClassRegister-specific fields
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
    onDelete: 'RESTRICT'
  })
  declare timetableEntry: TimetableEntry | null;

  @BelongsTo(() => SubstitutionEntry, {
    foreignKey: 'entryId',
    constraints: false,
    onDelete: 'RESTRICT'
  })
  declare substitutionEntry: SubstitutionEntry | null;

  @HasMany(() => Attendance, { onDelete: 'RESTRICT' })
  declare attendances: Attendance[];

  /*
  @BeforeBulkCreate
  static async validateBulk(instances: ClassRegister[]): Promise<void> {
    await Promise.all(
      instances.map((instance) => ClassRegister.validate(instance))
    );
  }*/

  /*
  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: ClassRegister): Promise<void> {
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
