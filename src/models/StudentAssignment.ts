import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript';
import { Class } from './Class';
import { SubClass } from './SubClass';
import { Student } from './Student';

@Table({
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'classId', 'subClassId']
    }
  ]
})
export class StudentAssignment extends Model<StudentAssignment> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  assignmentId!: number;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  studentId!: number;

  @BelongsTo(() => Student)
  student!: Student;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  classId!: number;

  @BelongsTo(() => Class)
  class!: Class;

  @ForeignKey(() => SubClass)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  subClassId!: number;

  @BelongsTo(() => SubClass)
  subClass!: SubClass;
}
