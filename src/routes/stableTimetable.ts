import Router from 'koa-router';
import * as timetableController from '@controllers/timetableController';
import { getTimetableByIdAndDateController, getTimetableByIdController } from '@controllers/timetableController';
import * as timetableService from '@services/timetableService';

const router = new Router();
/**
 * @openapi
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Invalid request parameters"
 *         status:
 *           type: integer
 *           example: 400
 *       required:
 *         - message
 *         - status
 *
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
 *
 *     TimetableEntry:
 *       type: object
 *       properties:
 *         timetableEntryId:
 *           type: integer
 *           example: 1
 *         classId:
 *           type: integer
 *           example: 1
 *         studentGroupId:
 *           type: integer|null
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
 *         - timetableEntryId
 *         - classId
 *         - dayInWeek
 *         - hourInDay
 *         - subjectId
 *         - teacherId
 *
 *     TTTeacher:
 *       type: object
 *       required:
 *         - name
 *         - surname
 *         - abbreviation
 *       properties:
 *         name:
 *           type: string
 *           description: Teacher's first name
 *           example: Jane
 *         surname:
 *           type: string
 *           description: Teacher's last name
 *           example: Smith
 *         abbreviation:
 *           type: string
 *           description: Teacher's abbreviation/code
 *           example: JS
 *     TTSubject:
 *       type: object
 *       required:
 *         - name
 *         - abbreviation
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the subject
 *           example: Math
 *         abbreviation:
 *           type: string
 *           description: Subject abbreviation/code
 *           example: M
 *     TTRoom:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Room identifier
 *           example: Room 241
 *     TTLesson:
 *       type: object
 *       properties:
 *         teacher:
 *           $ref: '#/components/schemas/TTTeacher'
 *         subject:
 *           $ref: '#/components/schemas/TTSubject'
 *         room:
 *           $ref: '#/components/schemas/TTRoom'
 *     TimetableResponse:
 *       type: array
 *       description: Array representing days of the week (index 0-6 for Monday-Sunday)
 *       items:
 *         type: array
 *         description: Array representing hours in the day (index 0-n for periods/lessons)
 *         items:
 *           $ref: '#/components/schemas/TTLesson'
 *
 *     TimetableSet:
 *       type: object
 *       properties:
 *         timetableSetId:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Spring Semester Timetable"
 *         validFrom:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01"
 *         validTo:
 *           type: string
 *           format: date-time
 *           example: "2024-06-30"
 *       required:
 *         - timetableSetId
 *         - name
 *         - validFrom
 *         - validTo
 */

// Timetable Sets Endpoints
/**
 * @openapi
 * /timetables/stable/sets:
 *   get:
 *     tags:
 *       - Stable Timetable
 *     summary: Get all timetable sets
 *     responses:
 *       200:
 *         description: List of all timetable sets retrieved successfully
 */
router.get('/timetables/stable/sets', (ctx) => timetableController.getAllSets(ctx));

/**
 * @openapi
 * /timetables/stable/sets:
 *   post:
 *     tags:
 *       - Stable Timetable
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/timetables/stable/sets', timetableController.createTSet);

/**
 * @openapi
 * /timetables/stable/sets/{id}:
 *   get:
 *     tags:
 *       - Stable Timetable
 *     summary: Get a timetable set by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the timetable set to retrieve
 *     responses:
 *       200:
 *         description: Timetable set retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimetableSet'
 *       400:
 *         description: Timetable set not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/timetables/stable/sets/:id', timetableController.getTimetableSetById);

/**
 * @openapi
 * /timetables/stable/sets/{id}:
 *   put:
 *     tags:
 *       - Stable Timetable
 *     summary: Update a timetable set by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the timetable set to update
 *     requestBody:
 *       description: Updated timetable set details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TimetableSet'
 *     responses:
 *       200:
 *         description: Timetable set updated successfully
 *       400:
 *         description: Bad request or timetable set not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/timetables/stable/sets/:id', timetableController.updateTSet);

/**
 * @openapi
 * /timetables/stable/sets/{id}:
 *   delete:
 *     tags:
 *       - Stable Timetable
 *     summary: Delete a timetable set by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the timetable set to delete
 *     responses:
 *       204:
 *         description: Timetable set deleted successfully
 *       400:
 *         description: Timetable set not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Cannot delete timetable set because it has entries
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/timetables/stable/sets/:id', timetableController.deleteTSet);

// Timetable Entries Endpoints
/**
 * @openapi
 * /timetables/stable/sets/{id}/entries:
 *   get:
 *     tags:
 *       - Stable Timetable
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/timetables/stable/sets/:id/entries', (ctx) => timetableController.getEntriesBySet(ctx));

/**
 * @openapi
 * /timetables/stable/sets/{id}/entries:
 *   post:
 *     tags:
 *       - Stable Timetable
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/timetables/stable/sets/:id/entries', timetableController.createTEntry);

/**
 * @openapi
 * /timetables/stable/entries/{id}:
 *   get:
 *     tags:
 *       - Stable Timetable
 *     summary: Get a timetable entry by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the timetable entry to retrieve
 *     responses:
 *       200:
 *         description: Timetable entry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimetableEntryDTO'
 *       400:
 *         description: Timetable entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/timetables/stable/entries/:id', timetableController.getTimetableEntryById);

/**
 * @openapi
 * /timetables/stable/entries/{id}:
 *   delete:
 *     tags:
 *       - Stable Timetable
 *     summary: Delete a timetable entry by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the timetable entry to delete
 *     responses:
 *       204:
 *         description: Timetable entry deleted successfully
 *       400:
 *         description: Timetable set or entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/timetables/stable/entries/:id', timetableController.deleteTEntry);

// Class Timetable Endpoints
/**
 * @openapi
 * /timetables/stable/classes/{id}:
 *   get:
 *     tags:
 *       - Stable Timetable
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimetableResponse'
 *       400:
 *         description: Timetable not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Timetable not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/timetables/stable/classes/:id', (ctx) => getTimetableByIdController(ctx, timetableService.getTimetableByClassId));

/**
 * @openapi
 * /timetables/stable/classes/{id}/at/{date}:
 *   get:
 *     tags:
 *       - Stable Timetable
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
 *           example: 2024-01-01
 *         description: date in week of the timetable
 *     responses:
 *       200:
 *         description: Timetable retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimetableResponse'
 *       400:
 *         description: Invalid date format. Use YYYY-MM-DD format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Timetable not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/timetables/stable/classes/:id/at/:date', (ctx) =>
  getTimetableByIdAndDateController(ctx, timetableService.getTimetableByClassIdAt)
);

// Teacher Timetable Endpoints
/**
 * @openapi
 * /timetables/stable/teachers/{id}:
 *   get:
 *     tags:
 *       - Stable Timetable
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimetableResponse'
 *       400:
 *         description: Timetable not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Timetable not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/timetables/stable/teachers/:id', (ctx) => getTimetableByIdController(ctx, timetableService.getTimetableByEmployeeId));

/**
 * @openapi
 * /timetables/stable/teachers/{id}/at/{date}:
 *   get:
 *     tags:
 *       - Stable Timetable
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
 *           example: 2024-01-01
 *         description: date in week of the timetable
 *     responses:
 *       200:
 *         description: Timetable retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimetableResponse'
 *       400:
 *         description: Invalid date format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Timetable not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/timetables/stable/teachers/:id/at/:date', (ctx) =>
  getTimetableByIdAndDateController(ctx, timetableService.getTimetableByEmployeeIdAt)
);

// Room Timetable Endpoints
/**
 * @openapi
 * /timetables/stable/rooms/{id}:
 *   get:
 *     tags:
 *       - Stable Timetable
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimetableResponse'
 *       404:
 *         description: Timetable not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/timetables/stable/rooms/:id', (ctx) => getTimetableByIdController(ctx, timetableService.getTimetableByRoomId));

/**
 * @openapi
 * /timetables/stable/rooms/{id}/at/{date}:
 *   get:
 *     tags:
 *       - Stable Timetable
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
 *           example: 2024-01-01
 *         description: date in week of the timetable
 *     responses:
 *       200:
 *         description: Timetable retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimetableResponse'
 *       400:
 *         description: Invalid date format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Timetable not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/timetables/stable/rooms/:id/at/:date', (ctx) =>
  getTimetableByIdAndDateController(ctx, timetableService.getTimetableByRoomIdAt)
);

export default router;
