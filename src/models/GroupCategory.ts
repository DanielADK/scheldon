import {
  AutoIncrement,
  BeforeDestroy,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { StudentGroup } from '@models/StudentGroup';
import { Class } from '@models/Class';
import { restrictOnDelete } from '@validators/genericValidators';

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
    allowNull: false
  })
  declare name: string;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    onDelete: 'RESTRICT'
  })
  declare classId: number;

  @BelongsTo(() => Class, { onDelete: 'RESTRICT' })
  declare class: Class;

  @HasMany(() => StudentGroup, { onDelete: 'RESTRICT' })
  declare studentGroups: StudentGroup[];

  /*@BeforeCreate
  @BeforeUpdate
  static async validate(instance: StudentGroup) {
    await validatestudentGroupNameAndClass(instance);
  }*/

  @BeforeDestroy
  static async tryRemove(instance: GroupCategory) {
    await restrictOnDelete(StudentGroup as (new () => Model) & typeof Model, 'categoryId' as string as keyof Model, instance.categoryId);
  }
}
