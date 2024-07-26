import Router from 'koa-router';
import * as subjectController from '../controllers/subjectController';

const router = new Router();

// All subjects
router.get('/subjects', subjectController.getAllSubjects);
// Get a subject by abbreviation
router.get(
  '/subjects/:abbreviation',
  subjectController.getSubjectByAbbreviation
);
// Create a new subject
router.post('/subjects', subjectController.createSubject);

export default router;
