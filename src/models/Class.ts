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
  timestamps: true,
  createdAt: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['name', 'date_from', 'date_to', 'roomId', 'employeeId']
    }
  ],
  validate: {
    datesAreValid(this: Class) {
      if (new Date(this.date_from) > new Date(this.date_to)) {
        throw new Error('date_from must be less than date_to');
      }
    }
  }
})
export class Class extends Model<Class> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true
  })
  declare classId: number;

  @Column({
    type: DataType.STRING(3),
    allowNull: true
  })
  declare name: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare date_from: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare date_to: string;

  // Default Room
  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true
  })
  declare roomId: number;

  @BelongsTo(() => Room)
  declare room: Room;

  // Class Teacher
  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true
  })
  declare employeeId: number;

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
        date_from: {
          [Op.lte]: instance.date_to
        },
        date_to: {
          [Op.gte]: instance.date_from
        }
      }
    });

    if (existingClass) {
      throw new Error('Class interval is overlapping with another class');
    }
  }
}
