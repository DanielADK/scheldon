import { Sequelize } from 'sequelize-typescript';
import { environment } from '@configs/environment';
import path from 'path';

// Initialize Sequelize with environment configuration
export const sequelize = new Sequelize({
  database: environment.database.name,
  dialect: 'mysql',
  username: environment.database.user,
  password: environment.database.password,
  host: environment.database.host,
  port: environment.database.port,
  models: [path.join(__dirname, '..', 'models')]
});

// Database setup function
export const setupDatabase = async (): Promise<void> => {
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Failed to synchronize database:', error);
    throw error;
  }
};
