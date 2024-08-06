import Router from 'koa-router';
import * as timetableController from '@controllers/timetableController';

const router = new Router();

//router.get('/timetable/set', timetableController.getTimetablesSets);
router.get('/timetable/set/:id', timetableController.getTimetableBySetId);
// router.get('/timetable/class/:id', timetableController.getTimetableByClassId);
// router.get('/timetable/teacher/:id', timetableController.getTimetableByEmployee);
// router.get('/timetable/student/:id', timetableController.getTimetableByStudent);
// router.get('/timetable/room/:id', timetableController.getTimetableByRoom);

export default router;
