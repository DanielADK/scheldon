import {
  AutoIncrement,
  BeforeCreate,
  BeforeDestroy,
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
import { restrictOnDelete } from '@validators/genericValidators';

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
    autoIncrement: true,
    onDelete: 'RESTRICT'
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
    unique: false,
    onDelete: 'RESTRICT'
  })
  declare classId: number;

  @ForeignKey(() => GroupCategory)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: true,
    unique: false,
    onDelete: 'RESTRICT'
  })
  declare categoryId: number | null;

  @BelongsTo(() => GroupCategory, { onDelete: 'RESTRICT' })
  declare category: GroupCategory;

  @BelongsTo(() => Class, { onDelete: 'RESTRICT' })
  declare class: Class;

  @BelongsTo(() => GroupCategory, { onDelete: 'RESTRICT' })
  declare groupCategory: GroupCategory;

  @HasMany(() => TimetableEntry, { onDelete: 'RESTRICT' })
  declare timetableEntries: TimetableEntry[];

  @HasMany(() => SubstitutionEntry, { onDelete: 'RESTRICT' })
  declare substitutionEntries: SubstitutionEntry[];

  @HasMany(() => Study, { onDelete: 'RESTRICT' })
  declare studies: Study[];

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: StudentGroup) {
    await Promise.all([await validatestudentGroupNameAndClass(instance)]);
  }

  @BeforeDestroy
  static async tryRemove(instance: StudentGroup) {
    await Promise.all([
      await restrictOnDelete(Study as { new (): Model } & typeof Model, 'studentGroupId' as string as keyof Model, instance.studentGroupId),
      await restrictOnDelete(
        TimetableEntry as { new (): Model } & typeof Model,
        'studentGroupId' as string as keyof Model,
        instance.studentGroupId
      ),
      await restrictOnDelete(
        SubstitutionEntry as { new (): Model } & typeof Model,
        'studentGroupId' as string as keyof Model,
        instance.studentGroupId
      )
    ]);
  }
}
