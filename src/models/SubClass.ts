import {
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table
} from 'sequelize-typescript';
import { Class } from '@models/Class';
import { StudentAssignment } from '@models/StudentAssignment';
import { Lesson } from '@models/Lesson';
import { validateSubClassNameAndClass } from '@validators/subClassValidators';

@Table({
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['name', 'classId']
    }
  ]
})
export class SubClass extends Model<SubClass> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  declare subClassId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare name: string;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: false
  })
  declare classId: number;

  @BelongsTo(() => Class)
  declare class: Class;

  @HasMany(() => StudentAssignment)
  declare studentAssignments: StudentAssignment[];

  @HasMany(() => Lesson)
  declare lessons: Lesson[];

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: SubClass) {
    await validateSubClassNameAndClass(instance);
  }
}
