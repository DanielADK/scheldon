import {
  AutoIncrement,
  BeforeCreate,
  BeforeDestroy,
  BeforeUpdate,
  BelongsToMany,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { TimetableEntry } from '@models/TimetableEntry';
import { TimetableEntrySet } from '@models/TimetableEntrySet';
import { validateDates, validateUniqueInterval, validateUniqueName } from '@validators/timetableSetValidator';
import { QueryOptions } from '@models/types/QueryOptions';
import { restrictOnDelete } from '@validators/genericValidators';

@Table({
  timestamps: false,
  indexes: [
    {
      name: 'unique_timetable_set',
      unique: true,
      fields: ['name']
    },
    {
      name: 'validity_range',
      fields: ['validFrom', 'validTo'],
      using: 'BTREE'
    }
  ]
})
export class TimetableSet extends Model<TimetableSet> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
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
  declare validFrom: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare validTo: string;

  // Mapping
  @BelongsToMany(() => TimetableEntry, () => TimetableEntrySet)
  declare timetableEntries: TimetableEntry[];

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: TimetableSet, options?: QueryOptions | null): Promise<void> {
    await Promise.all([validateDates(instance, options), validateUniqueInterval(instance, options), validateUniqueName(instance, options)]);
  }

  @BeforeDestroy
  static async tryRemove(instance: TimetableSet): Promise<void> {
    await Promise.all([
      await restrictOnDelete(
        TimetableEntrySet as { new (): Model } & typeof Model,
        'timetableSetId' as string as keyof Model,
        instance.timetableSetId
      )
    ]);
  }
}
