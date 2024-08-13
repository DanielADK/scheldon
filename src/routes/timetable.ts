import Router from 'koa-router';
import * as timetableController from '@controllers/timetableController';

const router = new Router();

//router.get('/timetable/set', timetableController.getTimetablesSets);
router.post('/timetables/set/:id/entry', timetableController.createTEntry);
router.post('/timetables/set', timetableController.createTSet);
router.get('/timetables/set/:id', timetableController.getTimetableBySetId);
router.get('/timetables/class/:id', timetableController.getTimetableByClassId);
// router.get('/timetable/teacher/:id', timetableController.getTimetableByEmployee);
// router.get('/timetable/student/:id', timetableController.getTimetableByStudent);
// router.get('/timetable/room/:id', timetableController.getTimetableByRoom);

export default router;
