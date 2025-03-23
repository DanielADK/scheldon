import Router from 'koa-router';
import * as studentAssignmentController from '@controllers/studyController';

const router = new Router();

// Create new study (start of study)
/**
 * @openapi
 * components:
 *   schemas:
 *     Study:
 *       type: object
 *       properties:
 *         studentId:
 *           type: integer
 *           example: 1
 *         classId:
 *           type: integer
 *           example: 1
 *         studentGroupId:
 *           type: integer
 *           example: 2
 *         validFrom:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T08:00:00Z"
 *         validTo:
 *           type: string
 *           format: date-time
 *           example: "2024-06-30T15:00:00Z"
 *       required:
 *         - studentId
 *         - classId
 *     StartStudyDTO:
 *       type: object
 *       properties:
 *         classId:
 *           type: integer
 *           description: The ID of the class
 *           example: 1
 *         studentGroupId:
 *           type: integer
 *           description: (Optional) The ID of the student group
 *           example: 2
 *         validFrom:
 *           type: string
 *           format: date-time
 *           description: (Optional) The start date of the assignment
 *           example: "2024-01-01T08:00:00Z"
 *           default: now
 *         validTo:
 *           type: string
 *           format: date-time
 *           description: (Optional) The end date of the assignment
 *           example: "2024-06-30T15:00:00Z"
 *           default: class default
 *       required:
 *         - classId
 *     StopStudyDTO:
 *       type: object
 *       properties:
 *         classId:
 *           type: integer
 *           description: The ID of the class
 *           example: 1
 *         studentGroupId:
 *           type: integer
 *           description: (Optional) The ID of the student group
 *           example: 2
 *         validTo:
 *           type: string
 *           format: date-time
 *           description: (Optional) The end date of the assignment
 *           example: "2024-06-30T15:00:00Z"
 *           default: now
 *       required:
 *         - classId
 */

/**
 * @openapi
 * /study/{studentId}/start:
 *   post:
 *     tags:
 *       - Study
 *     summary: Assign a student to a class or studentGroup
 *     description: Assign a student to a specified class or studentGroup within a given time period.
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the student to be assigned
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartStudyDTO'
 *     responses:
 *       201:
 *         description: Student successfully assigned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Study'
 *       400:
 *         description: Invalid input or assignment conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Assignment already exists in the validity period"
 */
router.post('/study/:studentId/start', studentAssignmentController.startStudy);

/**
 * @openapi
 * /study/{studentId}/stop:
 *   post:
 *     tags:
 *       - Study
 *     summary: Unassign a student from a class or studentGroup
 *     description: Terminates the assignment of a student from a class or studentGroup.
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the student to be unassigned
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $/components/schemas/StopStudyDTO
 *     responses:
 *       204:
 *         description: Student assignment successfully terminated
 *       400:
 *         description: Invalid input or unassignment conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Student is not assigned to the class"
 */
router.post('/study/:studentId/stop', studentAssignmentController.stopStudy);

export default router;
