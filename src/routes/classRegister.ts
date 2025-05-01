import Router from 'koa-router';
import { getLesson, getLessonAttendance } from '@controllers/classRegisterController';

const router = new Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ClassRegisterEntry:
 *       type: object
 *       required:
 *         - lessonId
 *         - date
 *         - teacher
 *         - subject
 *         - class
 *         - room
 *       properties:
 *         lessonId:
 *           type: integer
 *           description: Unique identifier of the lesson
 *           example: 123
 *         topic:
 *           type: string
 *           description: Topic of the lesson
 *           example: "Philosophy of Externalism"
 *         date:
 *           type: string
 *           format: date
 *           description: Date when the lesson took place
 *           example: "2024-05-15"
 *         fillDate:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: Date when the lesson record was filled
 *           example: "2024-05-15"
 *         note:
 *           type: string
 *           description: Additional notes for the lesson
 *           example: "The students were familiarized with the rules of using laboratory."
 *         teacher:
 *           $ref: '#/components/schemas/EmployeeInfo'
 *         subject:
 *           $ref: '#/components/schemas/SubjectInfo'
 *         class:
 *           $ref: '#/components/schemas/ClassInfo'
 *         studentGroup:
 *           type: string
 *           description: Student group name, if applicable
 *           example: "A"
 *         room:
 *           $ref: '#/components/schemas/RoomInfo'
 *     StudentAttendance:
 *       type: object
 *       required:
 *         - student
 *         - attendance
 *       properties:
 *         student:
 *           $ref: '#/components/schemas/Student'
 *         attendance:
 *           type: string
 *           description: Attendance status code
 *           enum: [P, NP, ENP, UNP, LA, ELA, ULA]
 *           example: P
 *     Student:
 *       type: object
 *       required:
 *         - studentId
 *         - name
 *         - surname
 *       properties:
 *         studentId:
 *           type: integer
 *           format: int64
 *           description: Unique identifier of the student
 *           example: 1
 *         name:
 *           type: string
 *           description: First name of the student
 *           example: John
 *         surname:
 *           type: string
 *           description: Last name of the student
 *           example: Doe
 */

/**
 * @openapi
 * /class-registers/{lessonId}:
 *   get:
 *     tags:
 *       - Class Register
 *     summary: Get class register entry by lesson ID
 *     description: Retrieves a specific class register entry with detailed information about the lesson
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique identifier of the lesson
 *     responses:
 *       200:
 *         description: Class register entry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassRegisterEntry'
 *       400:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/class-registers/:lessonId', getLesson);

router.put('/class-registers/:lessonId');

/**
 * @openapi
 * /class-registers/{lessonId}/attendances:
 *   get:
 *     summary: Retrieve attendance records for a specific lesson
 *     description: Returns a list of student attendance records for the specified lesson ID
 *     tags:
 *       - Class Register
 *     parameters:
 *       - name: lessonId
 *         in: path
 *         required: true
 *         description: Unique identifier of the lesson
 *         schema:
 *           type: integer
 *           format: int
 *     responses:
 *       200:
 *         description: Successfully retrieved attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentAttendance'
 *       400:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/class-registers/:lessonId/attendances', getLessonAttendance);

router.put('/class-registers/:lessonId/attendances');

export default router;
