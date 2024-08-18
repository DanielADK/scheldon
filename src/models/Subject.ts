import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { LessonRecord } from '@models/LessonRecord';
import { TimetableEntry } from '@models/TimetableEntry';

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
    type: DataType.STRING(50),
    allowNull: false
  })
  declare name: string;

  @Column({
    type: DataType.STRING(3),
    allowNull: false,
    unique: true
  })
  declare abbreviation: string;

  // Timetables of subject
  @HasMany(() => TimetableEntry)
  declare timetableEntries: TimetableEntry[];

  @HasMany(() => LessonRecord)
  declare lessons: LessonRecord[];
}
