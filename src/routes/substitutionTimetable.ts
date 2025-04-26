import Router from 'koa-router';
import { getTimetableByIdAndDateController } from '@controllers/timetableController';
import * as substitutionEntryService from '@services/substitutionEntryService';
import * as substitutionEntryController from '@controllers/substitutionEntryController';
import { createSubmissionEntryController } from '@controllers/substitutionEntryController';

const router = new Router();
/**
 * @openapi
 * components:
 *   schemas:
 *     SubstitutionTimetableEntryDTO:
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
 *       required:
 *         - classId
 *         - dayInWeek
 *         - hourInDay
 *         - subjectId
 *         - teacherId
 *         - roomId
 *         - type
 *
 *     SubstitutionTimetableEntry:
 *       type: object
 *       properties:
 *         substitutionEntryId:
 *           type: integer
 *           example: 1
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
 *       required:
 *         - substitutionEntryId
 *         - classId
 *         - dayInWeek
 *         - hourInDay
 *         - subjectId
 *         - teacherId
 *         - roomId
 *
 *     LessonEntry:
 *       type: object
 *       properties:
 *         lessonId:
 *           type: integer
 *           example: 53
 *         teacher:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "David"
 *             surname:
 *               type: string
 *               example: "Smith"
 *             abbreviation:
 *               type: string
 *               example: "DS"
 *         subject:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "Czech"
 *             abbreviation:
 *               type: string
 *               example: "CZ"
 *         room:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "Room 012"
 *         type:
 *           type: string
 *           example: "A"
 *
 *     TimetableResponse:
 *       type: array
 *       description: Array representing days of the week (index 0-4 for Monday-Friday)
 *       items:
 *         type: array
 *         description: Array representing hours in the day (index 0-n for periods/lessons)
 *         items:
 *           $ref: '#/components/schemas/LessonEntry'
 */

/**
 * @openapi
 * /timetables/temporary/classes/{id}/at/{date}:
 *   get:
 *     tags:
 *       - Substitution Timetable
 *     summary: Get substitution timetable for a specific class on a specific date
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Class ID
 *       - name: date
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in format YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Substitution timetable entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimetableResponse'
 *       404:
 *         description: Class not found or no temporary timetable for this date
 */
router.get('/timetables/temporary/classes/:id/at/:date', (ctx) =>
  getTimetableByIdAndDateController(ctx, substitutionEntryService.getTimetableByClassIdAt)
);

/**
 * @openapi
 * /timetables/temporary/classes/{id}/at/{date}:
 *   post:
 *     tags:
 *       - Substitution Timetable
 *     summary: Create a new substitution timetable entry
 *     parameters:
 *       - name: date
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in format YYYY-MM-DD
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmissionTimetableEntryDTO'
 *     responses:
 *       200:
 *         description: Submission entry created or found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submissionEntry:
 *                   $ref: '#/components/schemas/SubstitutionTimetableEntry'
 *       400:
 *         description: Invalid request data
 */
router.post('/timetables/temporary/entries', createSubmissionEntryController);

/**
 * @openapi
 * /timetables/temporary/teachers/{id}/at/{date}:
 *   get:
 *     tags:
 *       - Substitution Timetable
 *     summary: Get temporary timetable for a specific teacher on a specific date
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Teacher ID
 *       - name: date
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in format YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Substitution timetable entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimetableResponse'
 *       404:
 *         description: Teacher not found or no temporary timetable for this date
 */

router.get('/timetables/temporary/teachers/:id/at/:date', (ctx) =>
  getTimetableByIdAndDateController(ctx, substitutionEntryService.getTimetableByEmployeeIdAt)
);

/**
 * @openapi
 * /timetables/temporary/rooms/{id}/at/{date}:
 *   get:
 *     tags:
 *       - Substitution Timetable
 *     summary: Get temporary timetable for a specific room on a specific date
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *       - name: date
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in format YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Substitution timetable entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimetableResponse'
 *       404:
 *         description: Room not found or no temporary timetable for this date
 */

router.get('/timetables/temporary/rooms/:id/at/:date', (ctx) =>
  getTimetableByIdAndDateController(ctx, substitutionEntryService.getTimetableByRoomIdAt)
);

/**
 * @openapi
 * /timetables/temporary/at/{date}:
 *   post:
 *     tags:
 *       - Substitution Timetable
 *     summary: Assign a substitution entry to a class register
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - substitutionEntryId
 *               - date
 *               - substitutionType
 *             properties:
 *               substitutionEntryId:
 *                 type: integer
 *                 example: 123
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-10-01"
 *               substitutionType:
 *                 type: string
 *                 enum:
 *                   - A
 *                   - D
 *                   - M
 *                 example: "A"
 *               note:
 *                 type: string
 *                 maxLength: 2048
 *                 example: "Teacher substitution for illness."
 *     responses:
 *       201:
 *         description: Substitution entry successfully assigned to class register
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Substitution entry successfully assigned to class register"
 *                 lessonId:
 *                   type: integer
 *                   example: 456
 *       400:
 *         description: Bad request, validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "substitutionEntryId is required"
 */
router.post('/timetables/temporary/at/:date', substitutionEntryController.assignSubstitutionToClassRegister);

router.delete('/timetables/temporary/at/:date', substitutionEntryController.resetSubstitutionInClassRegister);
export default router;
