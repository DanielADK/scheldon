import Router from 'koa-router';
import subjects from '@routes/subject';
import students from '@routes/students';
import employees from '@routes/employee';
import classes from '@routes/class';
import rooms from '@routes/room';
import swagger from '@routes/swagger';
import studentGroup from '@routes/studentGroup';
import timetable from '@routes/timetable';
import studentAssignment from '@routes/study';
import classRegister from './classRegister';

const router = new Router();

router.use(subjects.routes());
router.use(students.routes());
router.use(employees.routes());
router.use(classes.routes());
router.use(studentGroup.routes());
router.use(rooms.routes());
router.use(studentAssignment.routes());
router.use(timetable.routes());
router.use(classRegister.routes());
// Swagger
router.use(swagger.routes());

export default router;
