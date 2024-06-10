import {BelongsTo, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {RoomType} from "./types/RoomType";
import {Employee} from "./Employee";

@Table({
    timestamps: false,
})
export class Room extends Model<Room> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
    })
    roomId!: number;

    @Column({
        type: DataType.STRING,
    })
    phone!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
    })
    name!: string

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    floor!: number

    @Column({
        type: DataType.ENUM(...Object.values(RoomType)),
        allowNull: false,
    })
    type!: RoomType

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0
    })
    studentCapacity!: number

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0
    })
    teacherCapacity!: number

    // Room administrator
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: null
    })
    employeeId!: number;

    // Mapping
    @BelongsTo(() => Employee)
    employee!: Employee
}