import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table
} from 'sequelize-typescript';
import { Class } from './Class';
import { StudentAssignment } from './StudentAssignment';
import { Lesson } from './Lesson';

@Table({
  timestamps: false
})
export class SubClass extends Model<SubClass> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  subClassId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  classId!: number;

  @BelongsTo(() => Class)
  class!: Class;

  @HasMany(() => StudentAssignment)
  studentAssignments!: StudentAssignment[];

  @HasMany(() => Lesson)
  lessons!: Lesson[];
}
