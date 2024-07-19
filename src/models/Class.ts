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
import { Room } from './Room';
import { Employee } from './Employee';
import { Lesson } from './Lesson';
import { TimetableEntry } from './TimetableEntry';
import { SubClass } from './SubClass';
import { StudentAssignment } from './StudentAssignment';
import { Op } from 'sequelize';

@Table({
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['name', 'validFrom', 'validTo', 'roomId', 'employeeId']
    }
  ],
  validate: {
    datesAreValid(this: Class) {
      if (new Date(this.validFrom) > new Date(this.validTo)) {
        throw new Error('validFrom must be less than validTo');
      }
    }
  }
})
export class Class extends Model<Class> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  declare classId: number;

  @Column({
    type: DataType.STRING(3),
    allowNull: true,
    unique: false
  })
  declare name: string;

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

  // Default Room
  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: false
  })
  declare roomId: number;

  @BelongsTo(() => Room)
  declare room: Room;

  // Class Teacher
  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: false
  })
  declare employeeId: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  declare createdAt: string;

  @BelongsTo(() => Employee)
  declare employee: Employee;

  @HasMany(() => TimetableEntry)
  declare timetableEntries: TimetableEntry[];

  @HasMany(() => SubClass)
  declare subClasses: SubClass[];

  @HasMany(() => Lesson)
  declare lessons: Lesson[];

  @HasMany(() => StudentAssignment)
  declare studentAssignments: StudentAssignment[];

  // Virtual fields & validation
  @BeforeCreate
  @BeforeUpdate
  static async validateClassInterval(instance: Class) {
    const existingClass = await Class.findOne({
      where: {
        name: instance.name,
        roomId: instance.roomId,
        employeeId: instance.employeeId,
        validFrom: {
          [Op.lte]: instance.validTo
        },
        validTo: {
          [Op.gte]: instance.validFrom
        }
      }
    });

    if (existingClass) {
      throw new Error('Class interval is overlapping with another class');
    }
  }
}
