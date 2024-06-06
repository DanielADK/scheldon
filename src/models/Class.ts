import {BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import {Room} from "./Room";
import {Employee} from "./Employee";
import {Subject} from "./Subject";
import {Student} from "./Student";
import {Lesson} from "./Lesson";
import {ClassSubject} from "./ClassSubject";
import {TimetableEntry} from "./TimetableEntry";

@Table
export class Class extends Model<Class> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
    })
    classId!: number;

    @Column({
        type: DataType.STRING
    })
    letter!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
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
    })
    roomId!: number

    @BelongsTo(() => Room)
    room!: Room

    // Class Teacher
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    employeeId!: number

    @BelongsTo(() => Employee)
    employee!: Employee

    // Students
    @HasMany(() => Student)
    students!: Student[]

    @BelongsToMany(() => Subject, () => ClassSubject)
    subjects!: Subject[]

    @HasMany(() => TimetableEntry)
    timetableEntries!: TimetableEntry[]

    @HasMany(() => Lesson)
    lessons!: Lesson[]
}