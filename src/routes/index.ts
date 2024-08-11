import Router from 'koa-router';
import subjects from '@routes/subject';
import students from '@routes/students';
import employees from '@routes/employee';
import classes from '@routes/class';
import rooms from '@routes/room';
import swagger from '@routes/swagger';
import subclass from '@routes/subclass';
import timetable from '@routes/timetable';
import studentAssignment from '@routes/studentAssignment';

const router = new Router();

router.use(subjects.routes());
router.use(students.routes());
router.use(employees.routes());
router.use(classes.routes());
router.use(subclass.routes());
router.use(rooms.routes());
router.use(studentAssignment.routes());
router.use(timetable.routes());
// Swagger
router.use(swagger.routes());

export default router;
