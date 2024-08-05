import {
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { TimetableEntry } from '@models/TimetableEntry';
import { TimetableSet } from '@models/TimetableSet';

@Table({
  timestamps: false
})
export class TimetableEntrySet extends Model<TimetableEntrySet> {
  @PrimaryKey
  @ForeignKey(() => TimetableEntry)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare timetableEntryId: number;

  @PrimaryKey
  @ForeignKey(() => TimetableSet)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare timetableSetId: number;
}
