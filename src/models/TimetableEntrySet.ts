import {Column, DataType, ForeignKey, Model, PrimaryKey, Table} from 'sequelize-typescript';
import {TimetableEntry} from './TimetableEntry';
import {TimetableSet} from './TimetableSet';

@Table({
    schema: 'public', // Specify schema if needed
})
export class TimetableEntrySet extends Model<TimetableEntrySet> {
    @PrimaryKey
    @ForeignKey(() => TimetableEntry)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    timetableEntryId!: number;

    @PrimaryKey
    @ForeignKey(() => TimetableSet)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    timetableSetId!: number;
}
