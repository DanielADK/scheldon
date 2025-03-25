import Router from 'koa-router';
import * as timetableController from '@controllers/timetableController';
import { getTimetableByIdAndDateController, getTimetableByIdController } from '@controllers/timetableController';
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
 *         studentGroupId:
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
 */

/**
 * @openapi
 * /timetables/stable/sets:
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
router.post('/timetables/stable/sets', timetableController.createTSet);

/**
 * @openapi
 * /timetables/stable/sets:
 *   get:
 *     tags:
 *       - Timetable
 *     summary: Get all timetable sets
 *     responses:
 *       200:
 *         description: List of all timetable sets retrieved successfully
 */
router.get('/timetables/stable/sets', (ctx) => timetableController.getAllSets(ctx));

/**
 * @openapi
 * /timetables/stable/sets/{id}/entries:
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
 *       200:
 *         description: Timetable entry found
 *       201:
 *         description: Timetable entry created
 *       400:
 *         description: Bad request or Timetable set not found
 */
router.post('/timetables/stable/sets/:id/entries', timetableController.createTEntry);

/**
 * @openapi
 * /timetables/stable/sets/{id}/entries:
 *   get:
 *     tags:
 *       - Timetable
 *     summary: Get all timetable entries in a specific timetable set
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the timetable set
 *     responses:
 *       200:
 *         description: List of all timetable entries in the specified set retrieved successfully
 *       400:
 *         description: Timetable set not found or no entries found
 */
router.get('/timetables/stable/sets/:id/entries', (ctx) => timetableController.getEntriesBySet(ctx));

/**
 * @openapi
 * /timetables/stable/classes/{id}:
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
 *       400:
 *         description: Timetable not found
 */
router.get('/timetables/stable/classes/:id', (ctx) => getTimetableByIdController(ctx, timetableService.getTimetableByClassId));

/**
 * @openapi
 * /timetables/stable/classes/{id}/at/{date}:
 *   get:
 *     tags:
 *       - Timetable
 *     summary: Get timetable by class ID and date
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the class
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: now or 2024-01-01
 *         description: date in week of the timetable
 *     responses:
 *       200:
 *         description: Timetable retrieved successfully
 *       400:
 *         description: Timetable not found
 */
router.get('/timetables/stable/classes/:id/at/:date', (ctx) =>
  getTimetableByIdAndDateController(ctx, timetableService.getTimetableByClassIdAt)
);

/**
 * @openapi
 * /timetables/stable/teachers/{id}:
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
 *       400:
 *         description: Timetable not found
 */
router.get('/timetables/stable/teachers/:id', (ctx) => getTimetableByIdController(ctx, timetableService.getTimetableByEmployeeId));

/**
 * @openapi
 * /timetables/stable/teachers/{id}/at/{date}:
 *   get:
 *     tags:
 *       - Timetable
 *     summary: Get timetable by teacher ID and date
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the teacher
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: now or 2024-01-01
 *         description: date in week of the timetable
 *     responses:
 *       200:
 *         description: Timetable retrieved successfully
 *       400:
 *         description: Timetable not found
 */
router.get('/timetables/stable/teachers/:id/at/:date', (ctx) =>
  getTimetableByIdAndDateController(ctx, timetableService.getTimetableByEmployeeIdAt)
);

/**
 * @openapi
 * /timetables/stable/rooms/{id}:
 *   get:
 *     tags:
 *       - Timetable
 *     summary: Get timetable by room ID and date
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the room
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: now or 2024-01-01
 *         description: date in week of the timetable
 *     responses:
 *       200:
 *         description: Timetable retrieved successfully
 *       400:
 *         description: Timetable not found
 */
router.get('/timetables/stable/rooms/:id', (ctx) => getTimetableByIdController(ctx, timetableService.getTimetableByRoomId));

/**
 * @openapi
 * /timetables/stable/rooms/{id}/at/{date}:
 *   get:
 *     tags:
 *       - Timetable
 *     summary: Get current timetable by room ID and date
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the room
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: now or 2024-01-01
 *         description: date in week of the timetable
 *     responses:
 *       200:
 *         description: Timetable retrieved successfully
 *       400:
 *         description: Timetable not found
 */
router.get('/timetables/stable/rooms/:id/at/:date', (ctx) =>
  getTimetableByIdAndDateController(ctx, timetableService.getTimetableByRoomIdAt)
);

export default router;
