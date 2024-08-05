import {
  BeforeCreate,
  BeforeUpdate,
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table
} from 'sequelize-typescript';
import { TimetableEntry } from '@models/TimetableEntry';
import { TimetableEntrySet } from '@models/TimetableEntrySet';
import {
  validateDates,
  validateUniqueInterval
} from '@validators/timetableSetValidator';

@Table({
  timestamps: false
})
export class TimetableSet extends Model<TimetableSet> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true
  })
  declare timetableSetId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  declare name: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare validFrom: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare validTo: Date;

  // Mapping
  @BelongsToMany(() => TimetableEntry, () => TimetableEntrySet)
  declare timetableEntries: TimetableEntry[];

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: TimetableSet): Promise<void> {
    await validateDates(instance);
    await validateUniqueInterval(instance);
  }
}
