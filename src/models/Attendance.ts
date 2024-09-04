import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { LessonRecord } from '@models/LessonRecord';
import { Student } from '@models/Student';
import { AttendanceType } from '@models/types/AttendanceType';

@Table({
  timestamps: false,
  indexes: [
    {
      fields: ['lessonRecordId', 'studentId'],
      unique: true
    }
  ]
})
export class Attendance extends Model<Attendance> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  })
  declare attendanceId: number;

  @ForeignKey(() => LessonRecord)
  @Column({
    type: DataType.STRING(8),
    allowNull: false
  })
  declare lessonRecordId: string;

  @BelongsTo(() => LessonRecord)
  declare lessonRecord: LessonRecord;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare studentId: number;

  @BelongsTo(() => Student)
  declare student: Student;

  @Column({
    type: DataType.ENUM(...Object.values(AttendanceType)),
    allowNull: false
  })
  declare attendance: AttendanceType;
}
