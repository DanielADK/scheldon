import Router from 'koa-router';
import subjects from './subject';
import students from './students';
import employees from './employee';
import classes from './class';
import rooms from './room';
import swagger from './swagger';

const router = new Router();

router.use(subjects.routes());
router.use(students.routes());
router.use(employees.routes());
router.use(classes.routes());
router.use(rooms.routes());
// Swagger
router.use(swagger.routes());

export default router;
