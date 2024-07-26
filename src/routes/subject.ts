import Router from 'koa-router';
import * as subjectController from '../controllers/subjectController';

const router = new Router();

// All subjects
router.get('/subject', subjectController.getAllSubjects);
// Get a subject by abbreviation
router.get(
  '/subject/:abbreviation',
  subjectController.getSubjectByAbbreviation
);
// Create a new subject
router.post('/subject', subjectController.createSubject);

export default router;
