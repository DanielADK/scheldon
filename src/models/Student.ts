import {BelongsTo, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {Class} from "./Class";

@Table
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
        allowNull: false,
        unique: true
    })
    name!: string

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
    })
    surname!: string

    @ForeignKey(() => Class)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    classId!: number;

    @BelongsTo(() => Class)
    class!: Class;
}