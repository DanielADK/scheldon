import Router from 'koa-router';
import subjects from '@routes/subject';
import students from '@routes/students';
import employees from '@routes/employee';
import classes from '@routes/class';
import rooms from '@routes/room';
import swagger from '@routes/swagger';
import studentGroup from '@routes/studentGroup';
import stableTimetable from '@routes/stableTimetable';
import temporaryTimetable from '@routes/stableTimetable';
import studentAssignment from '@routes/study';
import classRegister from './classRegister';
import groupCategory from '@routes/groupCategory';

const router = new Router();

router.use(subjects.routes());
router.use(students.routes());
router.use(employees.routes());
router.use(classes.routes());
router.use(studentGroup.routes());
router.use(groupCategory.routes());
router.use(rooms.routes());
router.use(studentAssignment.routes());
router.use(stableTimetable.routes());
router.use(temporaryTimetable.routes());
router.use(classRegister.routes());
// Swagger
router.use(swagger.routes());

export default router;
