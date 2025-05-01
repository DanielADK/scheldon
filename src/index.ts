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
  port: parseInt(process.env.DB_PORT ?? '3306'),
  models: [__dirname + '/models']
});

// init bodyparser
app.use(
  bodyParser({
    enableTypes: ['json'],
    jsonLimit: '5mb',
    strict: false,
    onerror: (err, ctx) => {
      ctx.status = 422;
      ctx.body = { error: 'Invalid JSON format in body' };
    }
  })
);

// validate JSON only content-type with POST/PUT
app.use(async (ctx, next) => {
  if (ctx.method === 'POST' || ctx.method === 'PUT') {
    const contentType = ctx.request.header['content-type'];
    if (!contentType?.includes('application/json')) {
      ctx.status = 415;
      ctx.body = { error: 'Content-Type must be application/json' };
    }
  }
  await next();
});

router.use('', apiRouter.routes());

// App routes
app.use(router.routes());
console.log(router.stack.map((i) => `${i.methods.join(',').padStart(10)} -> ${i.path.padEnd(50)}`));
app.use(router.allowedMethods());

export { sequelize };

sequelize
  .sync({ alter: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => console.error(err));
