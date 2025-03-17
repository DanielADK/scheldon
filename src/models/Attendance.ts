import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ClassRegister } from '@models/ClassRegister';
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
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  })
  declare attendanceId: number;

  @ForeignKey(() => ClassRegister)
  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false
  })
  declare lessonRecordId: string;

  @BelongsTo(() => ClassRegister)
  declare lessonRecord: ClassRegister;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
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
