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
import { RoomType } from '@models/types/RoomType';
import { Employee } from '@models/Employee';
import { validateClassroom, validateOffice } from '@validators/roomValidators';

@Table({
  timestamps: false
})
export class Room extends Model<Room> {
  @Column({
    type: DataType.INTEGER,
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
    type: DataType.INTEGER,
    allowNull: false
  })
  declare administratorId: number;

  // Mapping
  @BelongsTo(() => Employee)
  declare administrator: Employee;

  @BeforeCreate
  @BeforeUpdate
  static async validate(instance: Room): Promise<void> {
    await Promise.all([validateOffice(instance), validateClassroom(instance)]);
  }
}
