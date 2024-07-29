import { Column, DataType, Model, Table } from 'sequelize-typescript';

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
  declare degreePre: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true
  })
  declare degreePost: string;

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
