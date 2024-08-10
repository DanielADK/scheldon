import Router from 'koa-router';
import * as studentAssignmentController from '@controllers/studentAssignmentController';

const router = new Router();

// Create new assignment (start of study)
/**
 * @openapi
 * components:
 *   schemas:
 *     StudentAssignment:
 *       type: object
 *       properties:
 *         studentId:
 *           type: integer
 *           example: 1
 *         classId:
 *           type: integer
 *           example: 1
 *         subClassId:
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
 *
 *
 * /students/{studentId}/assign:
 *   post:
 *     tags:
 *       - Student Assignment
 *     summary: Assign a student to a class or subclass
 *     description: Assign a student to a specified class or subclass within a given time period.
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
 *             type: object
 *             properties:
 *               classId:
 *                 type: integer
 *                 description: The ID of the class
 *                 example: 1
 *               subClassId:
 *                 type: integer
 *                 description: (Optional) The ID of the subclass
 *                 example: 2
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *                 description: (Optional) The start date of the assignment
 *                 example: "2024-01-01T08:00:00Z"
 *     responses:
 *       201:
 *         description: Student successfully assigned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentAssignment'
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
router.post(
  '/students/:studentId/assign',
  studentAssignmentController.assignStudent
);

/**
 * @openapi
 * /students/{studentId}/unassign:
 *   delete:
 *     tags:
 *       - Student Assignment
 *     summary: Unassign a student from a class or subclass
 *     description: Terminates the assignment of a student from a class or subclass.
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
 *             type: object
 *             properties:
 *               classId:
 *                 type: integer
 *                 description: The ID of the class
 *                 example: 1
 *               subClassId:
 *                 type: integer
 *                 description: (Optional) The ID of the subclass
 *                 example: 2
 *               validTo:
 *                 type: string
 *                 format: date-time
 *                 description: (Optional) The end date of the assignment
 *                 example: "2024-06-30T15:00:00Z"
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
// Terminate assignment (end of study)
router.delete(
  '/students/:studentId/unassign',
  studentAssignmentController.unassignStudent
);

export default router;
