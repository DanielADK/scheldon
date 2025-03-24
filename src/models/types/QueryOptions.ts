import { Transaction } from 'sequelize';

export type QueryOptions = {
  transaction?: Transaction | null;
};
