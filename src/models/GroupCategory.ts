import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { StudentGroup } from '@models/StudentGroup';
import { Class } from '@models/Class';

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
    allowNull: false
  })
  declare classId: number;

  @BelongsTo(() => Class)
  declare class: Class;

  @HasMany(() => StudentGroup)
  declare studentGroups: StudentGroup[];

  /*@BeforeCreate
  @BeforeUpdate
  static async validate(instance: StudentGroup) {
    await validatestudentGroupNameAndClass(instance);
  }*/
}
