import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import {Class} from "./Class";
import {StudentAssignment} from "./StudentAssignment";

@Table({
    timestamps: false,
})
export class Student extends Model<Student> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
    })
    studentId!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
    })
    username!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name!: string

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    surname!: string

    @HasMany(() => StudentAssignment)
    studentAssignments!: StudentAssignment[];
}