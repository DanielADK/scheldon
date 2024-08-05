import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript';
import { RoomType } from '@models/types/RoomType';
import { Employee } from '@models/Employee';

@Table({
  timestamps: false
})
export class Room extends Model<Room> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  roomId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true
  })
  phone!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  name!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  floor!: number;

  @Column({
    type: DataType.ENUM(...Object.values(RoomType)),
    allowNull: false
  })
  type!: RoomType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  studentCapacity!: number;

  // Room administrator
  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: null
  })
  administratorId!: number;

  // Mapping
  @BelongsTo(() => Employee)
  administrator!: Employee;
}
