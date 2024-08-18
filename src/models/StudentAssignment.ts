import {
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript';
import { Class } from '@models/Class';
import { SubClass } from '@models/SubClass';
import { Student } from '@models/Student';
import {
  validateClassDates,
  validateClassExistsWhenSubClass,
  validateExclusiveClassAssignment,
  validateSubClassBelongsToClass
} from '@validators/studentAssignmentValidators';

@Table({
  timestamps: false,
  indexes: [
    {
      name: 'unique_assignment',
      unique: true,
      fields: ['studentId', 'classId', 'subClassId']
    },
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
      name: 'subclassid',
      fields: ['subClassId'],
      using: 'HASH'
    }
  ]
})
export class StudentAssignment extends Model<StudentAssignment> {
  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare studentId: number;

  @BelongsTo(() => Student)
  declare student: Student;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare classId: number;

  @BelongsTo(() => Class)
  declare class: Class;

  @ForeignKey(() => SubClass)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare subClassId: number | null;

  @BelongsTo(() => SubClass)
  declare subClass: SubClass | null;

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
  static async validate(instance: StudentAssignment) {
    await Promise.all([
      validateSubClassBelongsToClass(instance),
      validateClassDates(instance),
      validateExclusiveClassAssignment(instance),
      instance.subClassId ? validateClassExistsWhenSubClass(instance) : null
    ]);
  }
}
