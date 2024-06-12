import {
    AutoIncrement,
    BelongsTo,
    BelongsToMany,
    Column,
    DataType,
    ForeignKey,
    Model,
    PrimaryKey,
    Table
} from 'sequelize-typescript';
import {TimetableSet} from './TimetableSet';
import {Class} from './Class';
import {Subject} from './Subject';
import {Employee} from './Employee';
import {Room} from './Room';
import {TimetableEntrySet} from "./TimetableEntrySet";

@Table({
    timestamps: false,
})
export class TimetableEntry extends Model<TimetableEntry> {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    timetableEntryId!: number;

    @ForeignKey(() => Class)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    classId!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    dayInWeek!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    lessonNumber!: number;

    @ForeignKey(() => Subject)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    subjectId!: number;

    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    teacherId!: number;

    @ForeignKey(() => Room)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    roomId!: number;

    // Mappings
    @BelongsToMany(() => TimetableSet, () => TimetableEntrySet)
    timetableSets!: TimetableSet[];

    @BelongsTo(() => Class)
    class!: Class;

    @BelongsTo(() => Subject)
    subject!: Subject;

    @BelongsTo(() => Employee)
    teacher!: Employee;

    @BelongsTo(() => Room)
    room!: Room;
}
