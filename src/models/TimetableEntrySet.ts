import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { TimetableEntry } from '@models/TimetableEntry';
import { TimetableSet } from '@models/TimetableSet';

@Table({
  timestamps: false
})
export class TimetableEntrySet extends Model<TimetableEntrySet> {
  @PrimaryKey
  @ForeignKey(() => TimetableEntry)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    allowNull: false,
    onDelete: 'CASCADE'
  })
  declare timetableEntryId: number;

  @BelongsTo(() => TimetableEntry, { onDelete: 'CASCADE' })
  declare timetableEntry: TimetableEntry;

  @PrimaryKey
  @ForeignKey(() => TimetableSet)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    allowNull: false,
    onDelete: 'CASCADE'
  })
  declare timetableSetId: number;

  @BelongsTo(() => TimetableSet, { onDelete: 'CASCADE' })
  declare timetableSet: TimetableSet;
}
