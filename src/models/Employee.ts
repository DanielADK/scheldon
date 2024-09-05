import {
  BeforeCreate,
  BeforeUpdate,
  Column,
  DataType,
  Model,
  Table
} from 'sequelize-typescript';
import { validateTeacherWithAbbreviation } from '@validators/teacherValidator';

@Table({
  timestamps: false
})
export class Employee extends Model<Employee> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  declare employeeId: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true
  })
  declare username: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  declare name: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  declare surname: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true
  })
  declare degreePre: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: true
  })
  declare degreePost: string | null;

  @Column({
    type: DataType.STRING(2),
    allowNull: true,
    unique: true
  })
  declare abbreviation: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  declare isActive: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  declare isTeacher: boolean;

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: Employee): Promise<void> {
    await Promise.all([validateTeacherWithAbbreviation(instance)]);
  }
}
