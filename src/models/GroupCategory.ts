import {
  AutoIncrement,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { StudentGroup } from '@models/StudentGroup';

@Table({
  timestamps: false
})
export class GroupCategory extends Model<GroupCategory> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  })
  declare categoryId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  declare name: string;

  @HasMany(() => StudentGroup)
  declare studentGroups: StudentGroup[];

  /*@BeforeCreate
  @BeforeUpdate
  static async validate(instance: StudentGroup) {
    await validatestudentGroupNameAndClass(instance);
  }*/
}
