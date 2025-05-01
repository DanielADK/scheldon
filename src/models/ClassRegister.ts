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
import { Transaction } from 'sequelize';

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

  // Other methods
  /**
   * Check if the lesson record is filled
   * @returns boolean
   * @throws Error if the lesson record is already filled
   */
  isFilled(): boolean {
    return this.fillDate !== null;
  }

  /**
   * Get the entry of the ClassRegister which is either a substitutionEntry or a timetableEntry.
   * This ensures NAND logic: both entries cannot exist simultaneously.
   * @returns substitutionEntry, timetableEntry, or null
   * @throws Error if both entries exist or neither exists
   */
  async getEntry(transaction?: Transaction): Promise<SubstitutionEntry | TimetableEntry> {
    // fetch if not
    if (this.substitutionEntryId && !this.substitutionEntry) {
      await this.$get('substitutionEntry', { transaction: transaction });
    }
    if (this.timetableEntryId && !this.timetableEntry) {
      await this.$get('timetableEntry', { transaction: transaction });
    }

    if (!this.substitutionEntry && !this.timetableEntry) {
      throw new Error('Neither substitutionEntry nor timetableEntry exists');
    }
    if (this.substitutionEntry && this.timetableEntry) {
      throw new Error('Both substitutionEntry and timetableEntry exist');
    }

    return this.substitutionEntry || this.timetableEntry!;
  }

  /**
   * Sets the entry to either a SubstitutionEntry or a TimetableEntry.
   * Updates the corresponding entry and ensures nand.
   *
   * @param {SubstitutionEntry | TimetableEntry | null} entry - The entry to set.
   * @param options
   * @return {Promise<void>}
   */
  async setEntry(entry: SubstitutionEntry | TimetableEntry | null, options?: QueryOptions | null): Promise<void> {
    if (entry instanceof SubstitutionEntry) {
      this.substitutionEntry = entry;
      this.timetableEntry = null;
    } else if (entry instanceof TimetableEntry) {
      this.timetableEntry = entry;
      this.substitutionEntry = null;
    } else {
      this.substitutionEntry = null;
      this.timetableEntry = null;
    }
    // ORM update - explicitly call the update method to persist the changes to the database.
    await this.update(
      {
        substitutionEntryId: this.substitutionEntry ? this.substitutionEntry.substitutionEntryId : null,
        timetableEntryId: this.timetableEntry ? this.timetableEntry.timetableEntryId : null
      },
      { transaction: options?.transaction }
    );
  }
}
