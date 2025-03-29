import Router from 'koa-router';
import { getTimetableByIdAndDateController } from '@controllers/timetableController';
import * as substitutionEntryService from '@services/substitutionEntryService';

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
 *         type:
 *           type: string
 *           enum:
 *             - APPEND
 *             - DROPPED
 *             - MERGED
 *           example: "SUBSTITUTION"
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
 *         type:
 *           type: string
 *           enum: [SUBSTITUTION, CANCELLATION, EXTRA_CLASS]
 *           example: "SUBSTITUTION"
 *         date:
 *           type: string
 *           format: date
 *           example: "2024-10-15"
 *         topic:
 *           type: string
 *           example: "Special topic for this class"
 *           nullable: true
 *         note:
 *           type: string
 *           example: "Temporary change due to teacher absence"
 *           nullable: true
 *       required:
 *         - substitutionEntryId
 *         - classId
 *         - dayInWeek
 *         - hourInDay
 *         - subjectId
 *         - teacherId
 *         - roomId
 *         - type
 *         - date
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubstitutionTimetableEntry'
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
 *     summary: Create a new temporary timetable entry for a class on a specific date
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
 *     requestBody:
 *       description: Substitution timetable entry details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubstitutionTimetableEntryDTO'
 *     responses:
 *       201:
 *         description: Substitution timetable entry created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubstitutionTimetableEntry'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Class not found
 */
//router.post('/timetables/temporary/classes/:id/at/:date', substitutionTimetableController.createSubstitutionTimetableEntryForClass);

/**
 * @openapi
 * /timetables/temporary/classes/{id}/at/{date}:
 *   put:
 *     tags:
 *       - Substitution Timetable
 *     summary: Update temporary timetable entries for a class on a specific date
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
 *     requestBody:
 *       description: Updated temporary timetable entries
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/SubstitutionTimetableEntryDTO'
 *     responses:
 *       200:
 *         description: Substitution timetable entries updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubstitutionTimetableEntry'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Class not found
 */
//router.put('/timetables/temporary/classes/:id/at/:date', substitutionTimetableController.updateSubstitutionTimetableForClass);

/**
 * @openapi
 * /timetables/temporary/classes/{id}/at/{date}:
 *   delete:
 *     tags:
 *       - Substitution Timetable
 *     summary: Delete all temporary timetable entries for a class on a specific date
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
 *       204:
 *         description: Substitution timetable entries deleted successfully
 *       404:
 *         description: Class not found or no temporary timetable for this date
 */
//router.delete('/timetables/temporary/classes/:id/at/:date', substitutionTimetableController.deleteSubstitutionTimetableForClass);

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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubstitutionTimetableEntry'
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubstitutionTimetableEntry'
 *       404:
 *         description: Room not found or no temporary timetable for this date
 */
router.get('/timetables/temporary/rooms/:id/at/:date', (ctx) =>
  getTimetableByIdAndDateController(ctx, substitutionEntryService.getTimetableByRoomIdAt)
);

export default router;
