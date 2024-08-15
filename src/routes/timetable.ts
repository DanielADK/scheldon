import Router from 'koa-router';
import * as timetableController from '@controllers/timetableController';
import { timetableGetByIdController } from '@controllers/timetableController';
import * as timetableService from '@services/timetableService';

const router = new Router();
/**
 * @openapi
 * components:
 *   schemas:
 *     TimetableEntryDTO:
 *       type: object
 *       properties:
 *         classId:
 *           type: integer
 *           example: 1
 *         subClassId:
 *           type: integer
 *           example: 2
 *           nullable: true
 *         dayInWeek:
 *           type: integer
 *           example: 1
 *         hourInDay:
 *           type: integer
 *           example: 3
 *         subjectId:
 *           type: integer
 *           example: 4
 *         teacherId:
 *           type: integer
 *           example: 5
 *         roomId:
 *           type: integer
 *           example: 6
 *           nullable: true
 *       required:
 *         - classId
 *         - dayInWeek
 *         - hourInDay
 *         - subjectId
 *         - teacherId
 *
 *     TimetableSetDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Spring Semester Timetable"
 *         validFrom:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00Z"
 *         validTo:
 *           type: string
 *           format: date-time
 *           example: "2024-06-30T23:59:59Z"
 *       required:
 *         - name
 *         - validFrom
 *         - validTo
 * /timetables/set/{id}/entry:
 *   post:
 *     tags:
 *       - Timetable
 *     summary: Create a new timetable entry for a specific timetable set
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the timetable set
 *     requestBody:
 *       description: Timetable entry details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TimetableEntryDTO'
 *     responses:
 *       201:
 *         description: Timetable entry created
 *       400:
 *         description: Bad request
 *       404:
 *         description: Timetable set not found
 */
router.post('/timetables/set/:id/entry', timetableController.createTEntry);

/**
 * @openapi
 * /timetables/set:
 *   post:
 *     tags:
 *       - Timetable
 *     summary: Create a new timetable set
 *     requestBody:
 *       description: Timetable set details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TimetableSetDTO'
 *     responses:
 *       201:
 *         description: Timetable set created
 *       400:
 *         description: Bad request
 */
router.post('/timetables/set', timetableController.createTSet);
// router.get('/timetables/set/:id', timetableController.getTimetableBySetId);
/**
 * @openapi
 * /timetables/class/{id}:
 *   get:
 *     tags:
 *       - Timetable
 *     summary: Get timetable by class ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the class
 *     responses:
 *       200:
 *         description: Timetable retrieved successfully
 *       404:
 *         description: Timetable not found
 */
router.get('/timetables/class/:id', (ctx) =>
  timetableGetByIdController(ctx, timetableService.getTimetableByClassId)
);

/**
 * @openapi
 * /timetables/teacher/{id}:
 *   get:
 *     tags:
 *       - Timetable
 *     summary: Get timetable by teacher ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the teacher
 *     responses:
 *       200:
 *         description: Timetable retrieved successfully
 *       404:
 *         description: Timetable not found
 */
router.get('/timetables/teacher/:id', (ctx) =>
  timetableGetByIdController(ctx, timetableService.getTimetableByEmployeeId)
);

/**
 * @openapi
 * /timetables/room/{id}:
 *   get:
 *     tags:
 *       - Timetable
 *     summary: Get timetable by room ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the room
 *     responses:
 *       200:
 *         description: Timetable retrieved successfully
 *       404:
 *         description: Timetable not found
 */
router.get('/timetables/room/:id', (ctx) =>
  timetableGetByIdController(ctx, timetableService.getTimetableByRoomId)
);

export default router;
