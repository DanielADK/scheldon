import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Study } from '@models/Study';

@Table({
  timestamps: false
})
export class Student extends Model<Student> {
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  })
  declare studentId: number;

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

  @HasMany(() => Study)
  declare studies: Study[];
}
