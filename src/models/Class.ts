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
import { Room } from '@models/Room';
import { Employee } from '@models/Employee';
import { TimetableEntry } from '@models/TimetableEntry';
import { StudentGroup } from '@models/StudentGroup';
import { Study } from '@models/Study';
import {
  validateClassDates,
  validateClassInterval,
  validateClassName,
  validateRoomExistence,
  validateRoomSchedule,
  validateTeacherExistence,
  validateTeacherSchedule
} from '@validators/classValidators';
import { SubstitutionEntry } from '@models/SubstitutionEntry';

@Table({
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['name', 'validFrom', 'validTo', 'roomId', 'employeeId']
    },
    {
      name: 'validity_range',
      fields: ['validFrom', 'validTo'],
      using: 'BTREE'
    },
    { name: 'name', fields: ['name'], using: 'BTREE' }
  ]
})
export class Class extends Model<Class> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  })
  declare classId: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
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
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    unique: false
  })
  declare roomId: number;

  @BelongsTo(() => Room)
  declare room: Room;

  // Class Teacher
  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
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

  @HasMany(() => SubstitutionEntry)
  declare substitutionEntries: SubstitutionEntry[];

  @HasMany(() => StudentGroup)
  declare studentGroups: StudentGroup[];

  @HasMany(() => Study)
  declare studentAssignments: Study[];

  // Hooks for validation
  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: Class) {
    await Promise.all([
      validateClassDates(instance),
      validateClassName(instance),
      validateClassInterval(instance),
      validateTeacherExistence(instance),
      validateRoomExistence(instance),
      validateTeacherSchedule(instance),
      validateRoomSchedule(instance)
    ]);
  }
}
