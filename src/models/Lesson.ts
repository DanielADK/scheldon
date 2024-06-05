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
import {SubjectPart} from "./SubjectPart";

@Table
export class Lesson extends Model<Lesson> {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    lessonId!: number;

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

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    lessonNumber!: number;

    @ForeignKey(() => Class)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    classId!: number;

    @ForeignKey(() => Subject)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    subjectId!: number;

    @ForeignKey(() => SubjectPart)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    subjectPartId!: number;

    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    teacherId!: number;

    @ForeignKey(() => TimetableEntry)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    timetableEntryId!: number;

    @BelongsTo(() => Class)
    class!: Class;

    @BelongsTo(() => Subject)
    subject!: Subject;

    @BelongsTo(() => SubjectPart)
    subjectPart!: SubjectPart;

    @BelongsTo(() => Employee)
    teacher!: Employee;

    @BelongsTo(() => TimetableEntry)
    timetableEntry!: TimetableEntry;

    @HasMany(() => Attendance)
    attendances!: Attendance[];
}
