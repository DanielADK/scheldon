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
import { Class } from './Class';
import { SubClass } from './SubClass';
import { Student } from './Student';
import { Op } from 'sequelize';

@Table({
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'classId', 'subClassId']
    }
  ],
  validate: {
    datesAreValid(this: Class) {
      if (new Date(this.validFrom) > new Date(this.validTo)) {
        throw new Error('validFrom must be less than validTo');
      }
    },
    connectionValidityIsInnerOrEqualThanClasses(this: StudentAssignment) {
      if (new Date(this.validFrom) < new Date(this.class.validFrom)) {
        throw new Error('validFrom must be greater than class validFrom');
      }
      if (new Date(this.validTo) > new Date(this.class.validTo)) {
        throw new Error('validTo must be less than class validTo');
      }
    }
  }
})
export class StudentAssignment extends Model<StudentAssignment> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  assignmentId!: number;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  studentId!: number;

  @BelongsTo(() => Student)
  student!: Student;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  classId!: number;

  @BelongsTo(() => Class)
  class!: Class;

  @ForeignKey(() => SubClass)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  subClassId!: number;

  @BelongsTo(() => SubClass)
  subClass!: SubClass;

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
  static async validateContinuity(instance: StudentAssignment) {
    const previousAssignment = await StudentAssignment.findOne({
      where: {
        studentId: instance.studentId,
        classId: instance.classId,
        subClassId: instance.subClassId,
        validTo: {
          [Op.lt]: instance.validFrom
        }
      },
      order: [['validTo', 'DESC']]
    });

    const nextAssignment = await StudentAssignment.findOne({
      where: {
        studentId: instance.studentId,
        classId: instance.classId,
        subClassId: instance.subClassId,
        validFrom: {
          [Op.gt]: instance.validTo
        }
      },
      order: [['validFrom', 'ASC']]
    });

    if (
      previousAssignment &&
      new Date(previousAssignment.validTo).getTime() !==
        new Date(instance.validFrom).getTime() - 1000
    ) {
      throw new Error(
        'The new assignment does not start immediately after the previous assignment'
      );
    }

    if (
      nextAssignment &&
      new Date(instance.validTo).getTime() !==
        new Date(nextAssignment.validFrom).getTime() - 1000
    ) {
      throw new Error(
        'The new assignment does not end immediately before the next assignment'
      );
    }
  }
}
