import {
    AutoIncrement,
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    PrimaryKey,
    Table
} from 'sequelize-typescript';
import {Class} from './Class';
import {Subject} from './Subject';
import {Employee} from './Employee';
import {TimetableEntry} from './TimetableEntry';
import {Attendance} from "./Attendance";
import {Room} from "./Room";
import {SubClass} from "./SubClass";

@Table({
    createdAt: true,
    updatedAt: false,
})
export class Lesson extends Model<Lesson> {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    lessonId!: number;

    @ForeignKey(() => TimetableEntry)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    timetableEntryId!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    aim!: string

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    date!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    recordDate!: Date;

    /* Can be calculated from lessons
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    lessonNumber!: number;
    */

    @ForeignKey(() => Class)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    classId!: number;

    @ForeignKey(() => SubClass)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    subClassId!: number;

    @ForeignKey(() => Subject)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    subjectId!: number;

    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    teacherId!: number;

    @ForeignKey(() => Room)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    roomId!: number;

    // Mapping
    @BelongsTo(() => Class)
    class!: Class;

    @BelongsTo(() => SubClass)
    subClass!: SubClass;

    @BelongsTo(() => Subject)
    subject!: Subject;

    @BelongsTo(() => Employee)
    teacher!: Employee;

    @BelongsTo(() => TimetableEntry)
    timetableEntry!: TimetableEntry;

    @HasMany(() => Attendance)
    attendances!: Attendance[];

    @BelongsTo(() => Room)
    room!: Room;
}
