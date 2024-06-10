import {BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import {Room} from "./Room";
import {Employee} from "./Employee";
import {Subject} from "./Subject";
import {Student} from "./Student";
import {Lesson} from "./Lesson";
import {TimetableEntry} from "./TimetableEntry";

@Table({
    timestamps: false,
})
export class Class extends Model<Class> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
    })
    classId!: number;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    letter!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    prefix!: string

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    date_from!: string

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    date_to!: string

    // Default Room
    @ForeignKey(() => Room)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        unique: true
    })
    roomId!: number

    @BelongsTo(() => Room)
    room!: Room

    // Class Teacher
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        unique: true
    })
    employeeId!: number

    @BelongsTo(() => Employee)
    employee!: Employee

    // Students
    @HasMany(() => Student)
    students!: Student[]

    @HasMany(() => TimetableEntry)
    timetableEntries!: TimetableEntry[]

    @HasMany(() => Lesson)
    lessons!: Lesson[]
}