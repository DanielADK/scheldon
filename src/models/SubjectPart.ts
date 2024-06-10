import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {Subject} from "./Subject";

@Table({
    timestamps: false,
})
export class SubjectPart extends Model<SubjectPart> {
    @PrimaryKey
    @Column({
        type: DataType.INTEGER,
        allowNull: false,

    })
    subjectFieldId!: number;

    @PrimaryKey
    @ForeignKey(() => Subject)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    subjectId!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string

    @BelongsTo(() => Subject)
    subject!: Subject;
}