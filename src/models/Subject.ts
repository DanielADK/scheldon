import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Lesson } from './Lesson';
import { TimetableEntry } from './TimetableEntry';

@Table({
  timestamps: false
})
export class Subject extends Model<Subject> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  declare subjectId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  declare abbreviation: string;

  // Timetables of subject
  @HasMany(() => TimetableEntry)
  declare timetableEntries: TimetableEntry[];

  @HasMany(() => Lesson)
  declare lessons: Lesson[];
}
