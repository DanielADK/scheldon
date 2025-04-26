import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv-flow';
import apiRouter from './routes';

// configure dotenv
dotenv.config();

const app = new Koa();
const router = new Router();
const port = process.env.PORT ?? 3000;

// Initialize sequelize
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  dialect: 'mysql',
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432'),
  models: [__dirname + '/models']
});

app.use(bodyParser());

router.use('', apiRouter.routes());

// App routes
app.use(router.routes());
console.log(router.stack.map((i) => i.path));
app.use(router.allowedMethods());

export { sequelize };

sequelize
  .sync({ force: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => console.error(err));
