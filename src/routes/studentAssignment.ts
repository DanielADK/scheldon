import Router from 'koa-router';
import * as studentAssignmentController from '@controllers/studentAssignmentController';

const router = new Router();

// Create new assignment (start of study)
router.post(
  '/students/:studentId/assign',
  studentAssignmentController.assignStudent
);

// Terminate assignment (end of study)
router.put(
  '/students/:studentId/unassign',
  studentAssignmentController.unassignStudent
);

export default router;
