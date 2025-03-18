import {
  AutoIncrement,
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { Class } from '@models/Class';
import { Study } from '@models/Study';
import { validatestudentGroupNameAndClass } from '@validators/studentGroupValidators';
import { SubstitutionEntry } from '@models/SubstitutionEntry';
import { TimetableEntry } from '@models/TimetableEntry';
import { GroupCategory } from '@models/GroupCategory';

@Table({
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['name', 'classId']
    }
  ]
})
export class StudentGroup extends Model<StudentGroup> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  })
  declare studentGroupId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare name: string;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    unique: false
  })
  declare classId: number;

  @ForeignKey(() => GroupCategory)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: true
  })
  declare groupCategoryId: number | null;

  @BelongsTo(() => GroupCategory)
  declare category: GroupCategory;

  @BelongsTo(() => Class)
  declare class: Class;

  @BelongsTo(() => GroupCategory)
  declare groupCategory: GroupCategory;

  @HasMany(() => TimetableEntry)
  declare timetableEntries: TimetableEntry[];

  @HasMany(() => SubstitutionEntry)
  declare substitutionEntries: SubstitutionEntry[];

  @HasMany(() => Study)
  declare studies: Study[];

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: StudentGroup) {
    await validatestudentGroupNameAndClass(instance);
  }
}
