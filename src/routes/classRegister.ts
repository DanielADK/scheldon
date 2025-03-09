import Router from 'koa-router';
import * as classRegisterController from '@controllers/classRegisterController';

const router = new Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ClassRegister:
 *       type: object
 *       properties:
 *         classId:
 *           type: integer
 *           example: 1
 *         studentGroupId:
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
 *           example: "Introduction to Jara Cimrman's work"
 *         date:
 *           type: string
 *           format: date
 *           example: "2024-09-15"
 *         type:
 *           type: string
 *           enum:
 *             - APPEND
 *             - DROPPED
 *             - MERGED
 *           example: "APPEND"
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
 *             $ref: '#/components/schemas/ClassRegister'
 *     responses:
 *       201:
 *         description: LessonRecord created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassRegister'
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
router.post('/classregister/finish', classRegisterController.finishLessonRecord);

/**
 * @openapi
 * /classregister/current/teacher/{id}:
 *   get:
 *     tags:
 *       - Class register
 *     summary: Get the current lesson by teacher ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the teacher
 *     responses:
 *       200:
 *         description: Current lesson data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassRegister'
 *       404:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/classregister/teacher/:id/current', classRegisterController.getCurrentLessonByTeacherId);
//router.get('/classregister/teacher/:id/date/:date', classRegisterController.getLessonByTeacherIdAndDate);
/*router.get(
  '/classregister/current/lesson/:id',
  classRegisterController.getCurrentLessonByLessonId
);*/

export default router;
