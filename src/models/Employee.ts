import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  timestamps: false
})
export class Employee extends Model<Employee> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true
  })
  employeeId!: number;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    unique: true
  })
  username!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: false
  })
  surname!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true
  })
  degreePre!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true
  })
  degreePost!: string;

  @Column({
    type: DataType.STRING(2),
    allowNull: true,
    unique: true
  })
  declare abbreviation: string;

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
}
