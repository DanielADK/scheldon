import dotenv from 'dotenv-flow';

// Configure environment variables
dotenv.config();

export const environment = {
  port: process.env.PORT ?? 3000,
  database: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '3306')
  }
};
