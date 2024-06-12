import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import {Sequelize} from 'sequelize-typescript';
import dotenv from 'dotenv-flow';

// configure dotenv
dotenv.config();

const app = new Koa();
const port = process.env.PORT || 3000;

// Initialize sequelize
const sequelize = new Sequelize({
    database: process.env.DB_NAME,
    dialect: 'postgres',
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    models: [__dirname + '/models']
});

app.use(bodyParser());
//app.use(router.routes().use(router.allowedMethods()));

sequelize.sync({alter: true})
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((err) => console.error(err));