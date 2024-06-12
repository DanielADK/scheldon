import {BelongsToMany, Column, DataType, HasMany, Model, Table} from "sequelize-typescript";
import {Class} from "./Class";
import {Lesson} from "./Lesson";
import {TimetableEntry} from "./TimetableEntry";

@Table({
    timestamps: false,
})
export class Subject extends Model<Subject> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
    })
    subjectId!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
    })
    abbreviation!: string

    // Timetables of subject
    @HasMany(() => TimetableEntry)
    timetableEntries!: TimetableEntry[];

    @HasMany(() => Lesson)
    lessons!: Lesson[];
}