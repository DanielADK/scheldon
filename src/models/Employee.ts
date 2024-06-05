import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table
export class Employee extends Model<Employee> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
    })
    employeeId!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
    })
    username!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    surname!: string

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    degreePre!: string

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    degreePost!: string

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    isActive!: boolean

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    isTeacher!: boolean
}