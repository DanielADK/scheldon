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
import { TimetableEntry } from '@models/TimetableEntry';
import { Attendance } from '@models/Attendance';
import { SubstitutionEntry } from '@models/SubstitutionEntry';
import {
  validateClassAvailability,
  validateClassStudentGroupConflict,
  validateRoomAvailability,
  validateStudentGroupAvailability,
  validateXORIdentifiers
} from '@validators/classRegisterValidator';
import { QueryOptions } from '@models/types/QueryOptions';
import { SubstitutionType } from '@models/types/SubstitutionType';

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
  @Column({
    type: DataType.STRING(2048),
    allowNull: true
  })
  declare note: string | null;

  @Column({
    type: DataType.ENUM(...Object.values(SubstitutionType)),
    allowNull: true
  })
  declare substitutionType: SubstitutionType | null;

  // Mapping
  @BelongsTo(() => TimetableEntry, {
    onDelete: 'RESTRICT'
  })
  declare timetableEntry: TimetableEntry | null;

  @BelongsTo(() => SubstitutionEntry, {
    onDelete: 'RESTRICT'
  })
  declare substitutionEntry: SubstitutionEntry | null;

  @HasMany(() => Attendance, { onDelete: 'RESTRICT' })
  declare attendances: Attendance[];

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: ClassRegister, options?: QueryOptions | null): Promise<void> {
    await Promise.all([
      validateXORIdentifiers(instance, options),
      validateRoomAvailability(instance, options),
      validateClassAvailability(instance, options),
      validateStudentGroupAvailability(instance, options),
      validateClassStudentGroupConflict(instance, options)
    ]);
  }

  /*@BeforeDestroy
  static async tryRemove(instance: ClassRegister, options?: QueryOptions | null) {
    await Promise.all([
      await restrictOnDelete(
        Attendance as { new (): Model } & typeof Model, // No need for complex casting
        'classRegisterId', // Use the actual column name without casting
        instance.lessonId,
        options
      )
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
