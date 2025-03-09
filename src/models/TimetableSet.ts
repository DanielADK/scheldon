import { AutoIncrement, BeforeCreate, BeforeUpdate, BelongsToMany, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { TimetableEntry } from '@models/TimetableEntry';
import { TimetableEntrySet } from '@models/TimetableEntrySet';
import { validateDates, validateUniqueInterval } from '@validators/timetableSetValidator';

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
  static async validate(instance: TimetableSet): Promise<void> {
    await Promise.all([validateDates(instance), validateUniqueInterval(instance)]);
  }
}
