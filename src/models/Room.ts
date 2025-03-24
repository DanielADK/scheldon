import {
  AutoIncrement,
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
import { RoomType } from '@models/types/RoomType';
import { Employee } from '@models/Employee';
import { validateClassroom, validateOffice } from '@validators/roomValidators';
import { restrictOnDelete } from '@validators/genericValidators';
import { SubstitutionEntry } from '@models/SubstitutionEntry';
import { TimetableEntry } from '@models/TimetableEntry';

@Table({
  timestamps: false
})
export class Room extends Model<Room> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  })
  declare roomId: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true
  })
  declare phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  declare name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare floor: number;

  @Column({
    type: DataType.ENUM(...Object.values(RoomType)),
    allowNull: false
  })
  declare type: RoomType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  declare studentCapacity: number;

  // Room administrator
  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    onDelete: 'RESTRICT'
  })
  declare administratorId: number;

  // Mapping
  @BelongsTo(() => Employee, { onDelete: 'RESTRICT' })
  declare administrator: Employee;

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: Room): Promise<void> {
    await Promise.all([validateOffice(instance), validateClassroom(instance)]);
  }

  @BeforeDestroy
  static async tryRemove(instance: Room) {
    await Promise.all([
      await restrictOnDelete(Employee as { new (): Model } & typeof Model, 'roomId' as string as keyof Model, instance.roomId),
      await restrictOnDelete(SubstitutionEntry as { new (): Model } & typeof Model, 'roomId' as string as keyof Model, instance.roomId),
      await restrictOnDelete(TimetableEntry as { new (): Model } & typeof Model, 'roomId' as string as keyof Model, instance.roomId)
    ]);
  }
}
