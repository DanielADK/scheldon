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
 *           example: 1
 *         studentGroupId:
 *           type: integer
 *           description: ID of the student group (optional)
 *           example: 2
 *         hourInDay:
 *           type: integer
 *           description: Hour of the day
 *           example: 3
 *         subjectId:
 *           type: integer
 *           description: ID of the subject
 *           example: 4
 *         teacherId:
 *           type: integer
 *           description: ID of the teacher
 *           example: 5
 *         roomId:
 *           type: integer
 *           description: ID of the room
 *           example: 6
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the substitution entry
 *           example: "2024-01-01T00:00:00Z"
 *         type:
 *           type: SubstitutionType
 *           description: Type of the substitution entry
 *           example: "A"
 *     SubstitutionType:
 *       type: string
 *       enum:
 *         - A
 *         - D
 *         - M
 *       description: Enum representing substitution types. A = Append, D = DROP, M = MERGE
 */

/**
 * @openapi
 * /timetables/temporary:
 *   post:
 *     summary: Create a new substitution entry in the temporary timetable
 *     tags:
 *       - Timetable
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubstitutionEntryDTO'
 *     responses:
 *       200:
 *         description: Substitution entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubstitutionEntryDTO'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *               example:
 *                 success: false
 *                 error: "Invalid fields in input data"
 */
router.post('/timetables/temporary', timetableController.createSEntry);

export default router;
