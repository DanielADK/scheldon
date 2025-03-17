import Router from 'koa-router';
import * as timetableController from '@controllers/timetableController';

// Temporary lessons
/*router.post('/timetables/real/class/:id/at/:date', (ctx) =>
  timetableGetByIdController(ctx, substitutionTimetableService.timetableGetByIdController)
);*/

const router = new Router();
/**
 * @openapi
 * components:
 *   schemas:
 *     SubstitutionEntryDTO:
 *       type: object
 *       required:
 *         - classId
 *         - dayInWeek
 *         - hourInDay
 *         - subjectId
 *         - teacherId
 *         - roomId
 *         - date
 *         - type
 *       properties:
 *         classId:
 *           type: integer
 *           description: ID of the class
 *         studentGroupId:
 *           type: integer
 *           description: ID of the student group (optional)
 *         hourInDay:
 *           type: integer
 *           description: Hour of the day
 *         subjectId:
 *           type: integer
 *           description: ID of the subject
 *         teacherId:
 *           type: integer
 *           description: ID of the teacher
 *         roomId:
 *           type: integer
 *           description: ID of the room
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the substitution entry
 *         type:
 *           type: SubstitutionType
 *           description: Type of the substitution entry
 *     SubstitutionType:
 *       type: string
 *       enum:
 *         - A
 *         - D
 *         - M
 *       description: Enum representing substitution types. A = Append, D = DROP, M = MERGE
 */
router.post('/timetables/temporary', timetableController.createSEntry);
