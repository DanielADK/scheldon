import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ClassRegister } from '@models/ClassRegister';
import { Student } from '@models/Student';
import { AttendanceType } from '@models/types/AttendanceType';

@Table({
  timestamps: false,
  indexes: [
    {
      fields: ['classRegisterId', 'studentId'],
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
    allowNull: false,
    onDelete: 'RESTRICT'
  })
  declare classRegisterId: number;

  @BelongsTo(() => ClassRegister, { onDelete: 'RESTRICT' })
  declare classRegister: ClassRegister;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    onDelete: 'RESTRICT'
  })
  declare studentId: number;

  @BelongsTo(() => Student, { onDelete: 'RESTRICT' })
  declare student: Student;

  @Column({
    type: DataType.ENUM(...Object.values(AttendanceType)),
    allowNull: false
  })
  declare attendance: AttendanceType;
}
