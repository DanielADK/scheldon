import {
  AutoIncrement,
  BeforeBulkDestroy,
  BeforeCreate,
  BeforeDestroy,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { Class } from '@models/Class';
import { StudentGroup } from '@models/StudentGroup';
import { Student } from '@models/Student';
import {
  validateClassDates,
  validateClassExistsWhenStudentGroup,
  validateExclusiveClassAssignment,
  validatestudentGroupBelongsToClass,
  validateStudentGroupCategoryDisjunction,
  validateUniqueStudentGroupAssignment,
  validateValidToWithinClassValidTo
} from '@validators/studyValidators';
import { restrictOnDelete } from '@validators/genericValidators';

@Table({
  timestamps: false,
  indexes: [
    {
      name: 'validity_range',
      fields: ['validFrom', 'validTo'],
      using: 'BTREE'
    },
    {
      name: 'studentid',
      fields: ['studentId'],
      using: 'HASH'
    },
    {
      name: 'classid',
      fields: ['classId'],
      using: 'HASH'
    },
    {
      name: 'studentGroupid',
      fields: ['studentGroupId'],
      using: 'HASH'
    }
  ]
})
export class Study extends Model<Study> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  })
  declare studyId: number;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false
  })
  declare studentId: number;

  @BelongsTo(() => Student)
  declare student: Student;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false
  })
  declare classId: number;

  @BelongsTo(() => Class)
  declare class: Class;

  @ForeignKey(() => StudentGroup)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: true
  })
  declare studentGroupId: number | null;

  @BelongsTo(() => StudentGroup)
  declare studentGroup: StudentGroup | null;

  // Connection validation range
  @Column({
    type: DataType.DATE,
    allowNull: false,
    unique: false
  })
  declare validFrom: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    unique: false
  })
  declare validTo: string;

  // Continuity validation
  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: Study) {
    await Promise.all([
      validateClassDates(instance),
      validatestudentGroupBelongsToClass(instance),
      validateValidToWithinClassValidTo(instance),
      !instance.studentGroupId ? validateExclusiveClassAssignment(instance) : null,
      instance.studentGroupId ? validateUniqueStudentGroupAssignment(instance) : null,
      instance.studentGroupId ? validateClassExistsWhenStudentGroup(instance) : null,
      instance.studentGroupId ? validateStudentGroupCategoryDisjunction(instance) : null
    ]);
  }

  @BeforeDestroy
  @BeforeBulkDestroy
  static async tryRemove(instance: StudentGroup) {
    await restrictOnDelete(
      StudentGroup as { new (): Model } & typeof Model,
      'studentGroupId' as string as keyof Model,
      instance.studentGroupId
    );
  }
}
