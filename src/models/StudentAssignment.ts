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
      unique: true,
      fields: ['studentId', 'classId', 'subClassId']
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
    await validateSubClassBelongsToClass(instance);
    await validateClassDates(instance);
    await validateExclusiveClassAssignment(instance);

    // Validate only if subClassId is provided
    if (instance.subClassId) {
      await validateClassExistsWhenSubClass(instance);
    }
  }
}
