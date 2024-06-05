import {AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from 'sequelize-typescript';
import {Lesson} from './Lesson';
import {Student} from './Student';

@Table
export class Attendance extends Model<Attendance> {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    attendanceId!: number;

    @ForeignKey(() => Lesson)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    lessonId!: number;

    @ForeignKey(() => Student)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    studentId!: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    present!: boolean;

    @BelongsTo(() => Lesson)
    lesson!: Lesson;

    @BelongsTo(() => Student)
    student!: Student;
}
