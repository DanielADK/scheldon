import Router from 'koa-router';
import * as classRegisterController from '@controllers/classRegisterController';

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
 *         type:
 *           type: string
 *           enum:
 *             - TIME_MOVE
 *             - OVER_WORKFLOW
 *             - DROPPED
 *             - MERGED
 *           example: "TIME_MOVE"
 */

/**
 * @openapi
 * /classregister:
 *   post:
 *     tags:
 *       - Class register
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
router.get(
  '/classregister/current/teacher/:id',
  classRegisterController.getCurrentLessonByTeacherId
);
router.get(
  '/classregister/current/lesson/:id',
  classRegisterController.getCurrentLessonByLessonId
);

router.post(
  '/classregister/finish',
  classRegisterController.finishLessonRecord
);

export default router;
