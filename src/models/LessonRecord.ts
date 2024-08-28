import {
  BeforeBulkCreate,
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
import { Subject } from '@models/Subject';
import { Employee } from '@models/Employee';
import { TimetableEntry } from '@models/TimetableEntry';
import { Attendance } from '@models/Attendance';
import { Room } from '@models/Room';
import { SubClass } from '@models/SubClass';
import {
  validateDayInWeekRange,
  validateHourInDayRange,
  validateSubClassInClass,
  validateTeacherRole,
  validateType,
  validateXORIdentifiers
} from '@validators/lessonValidators';
import { Op } from 'sequelize';
import { LessonType } from '@models/types/LessonType';

@Table({
  createdAt: true,
  updatedAt: false
})
export class LessonRecord extends Model<LessonRecord> {
  @PrimaryKey
  @Column({
    type: DataType.STRING(8),
    allowNull: false,
    unique: true
  })
  declare lessonId: string;

  // timetableEntry if exists
  @ForeignKey(() => TimetableEntry)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare timetableEntryId: number | null;

  // XOR fields with timetableEntry
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare dayInWeek: number | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare hourInDay: number | null;

  @ForeignKey(() => Class)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare classId: number | null;

  @ForeignKey(() => SubClass)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare subClassId: number | null;

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare subjectId: number | null;

  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare teacherId: number | null;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare roomId: number | null;

  // LessonRecord-specific fields
  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare topic: string | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  declare date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare fillDate: Date | null;

  // Type only with timetableEntry, other fields are null
  @Column({
    type: DataType.ENUM(...Object.values(LessonType)),
    allowNull: true
  })
  declare type: LessonType | null;

  // Mapping
  @BelongsTo(() => Class)
  declare class: Class | null;

  @BelongsTo(() => SubClass)
  declare subClass: SubClass | null;

  @BelongsTo(() => Subject)
  declare subject: Subject | null;

  @BelongsTo(() => Employee)
  declare teacher: Employee | null;

  @BelongsTo(() => TimetableEntry)
  declare timetableEntry: TimetableEntry | null;

  @BelongsTo(() => Room)
  declare room: Room | null;

  @HasMany(() => Attendance)
  declare attendances: Attendance[];

  static async generateLessonId(): Promise<string> {
    return Math.random().toString(36).substring(2, 10);
  }

  @BeforeCreate
  static async generateUniqueLessonId(instance: LessonRecord): Promise<void> {
    let unique = false;
    while (!unique) {
      const randomId = await LessonRecord.generateLessonId();
      const existing = await LessonRecord.findByPk(randomId);

      if (!existing) {
        instance.lessonId = randomId;
        unique = true;
        break;
      }
    }
  }

  @BeforeBulkCreate
  static async generateBulkLessonIds(instances: LessonRecord[]): Promise<void> {
    let remainingInstances = instances;

    while (remainingInstances.length > 0) {
      const neededIds = remainingInstances.length;
      const generatedIds = new Set<string>();

      // Generate 2x the needed amount of IDs to ensure we have enough
      while (generatedIds.size < neededIds * 2) {
        generatedIds.add(await LessonRecord.generateLessonId());
      }

      // Check which IDs are not already in the database
      const existingIds = await LessonRecord.findAll({
        where: {
          lessonId: { [Op.in]: Array.from(generatedIds) }
        },
        attributes: ['lessonId']
      });

      // Assign the first N unique IDs to the instances
      const existingIdSet = new Set(existingIds.map((id) => id.lessonId));
      const generatedIdsArray = Array.from(generatedIds);

      // Filter out existing IDs and assign unique IDs to instances
      remainingInstances = remainingInstances.filter((instance) => {
        const id = generatedIdsArray.find((id) => !existingIdSet.has(id));
        if (id) {
          existingIdSet.add(id);
          instance.lessonId = id;
          return false;
        }
        return true;
      });
    }
  }

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: LessonRecord): Promise<void> {
    await Promise.all([
      validateXORIdentifiers(instance),
      validateTeacherRole(instance),
      validateDayInWeekRange(instance),
      validateHourInDayRange(instance),
      instance.subClassId ? validateSubClassInClass(instance) : null,
      instance.timetableEntry ? validateType(instance) : null
    ]);
  }
}
