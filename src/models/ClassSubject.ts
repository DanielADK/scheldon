import {Column, DataType, ForeignKey, Model, PrimaryKey, Table} from 'sequelize-typescript';
import {Class} from './Class';
import {Subject} from './Subject';

@Table
export class ClassSubject extends Model<ClassSubject> {
    @PrimaryKey
    @ForeignKey(() => Class)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    classId!: number;

    @PrimaryKey
    @ForeignKey(() => Subject)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    subjectId!: number;
}
