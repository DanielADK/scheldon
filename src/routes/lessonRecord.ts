import Router from 'koa-router';
import * as lessonRecordController from '@controllers/lessonRecordController';

const router = new Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     LessonRecord:
 *       type: object
 *       properties:
 *         classId:
 *           type: integer
 *           example: 1
 *         subClassId:
 *           type: integer
 *           example: 2
 *         dayInWeek:
 *           type: integer
 *           example: 3
 *         hourInDay:
 *           type: integer
 *           example: 2
 *         subjectId:
 *           type: integer
 *           example: 5
 *         teacherId:
 *           type: integer
 *           example: 7
 *         roomId:
 *           type: integer
 *           example: 101
 *         topic:
 *           type: string
 *           example: "Introduction to Quantum Mechanics"
 *         date:
 *           type: string
 *           format: date
 *           example: "2024-09-15"
 */

/**
 * @openapi
 * /lesson-records:
 *   post:
 *     tags:
 *       - LessonRecords
 *     summary: Create a new lesson record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonRecord'
 *     responses:
 *       201:
 *         description: LessonRecord created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonRecord'
 *       400:
 *         description: Bad request, validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: TimetableEntry or other referenced entity not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post(
  '/classregister/',
  lessonRecordController.administrativeCreateLessonRecord
);

router.get('/classregister/current');

router.post('/classregister/finish');

export default router;
