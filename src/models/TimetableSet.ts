import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table
} from 'sequelize-typescript';
import { TimetableEntry } from './TimetableEntry';
import { TimetableEntrySet } from './TimetableEntrySet';

@Table({
  timestamps: false
})
export class TimetableSet extends Model<TimetableSet> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true
  })
  timetableSetId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true
  })
  schoolYearId!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  validFrom!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  validTo!: Date;

  // Mapping
  @BelongsToMany(() => TimetableEntry, () => TimetableEntrySet)
  timetableEntries!: TimetableEntry[];
}
