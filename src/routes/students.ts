import Router from 'koa-router';
import * as studentController from '../controllers/studentController';

const router = new Router();

/**
 * Create a new student
 * POST /students
 * @openapi
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         studentId:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: "jdoe"
 *         name:
 *           type: string
 *           example: "John"
 *         surname:
 *           type: string
 *           example: "Doe"
 *       required:
 *         - studentId
 *         - username
 *         - name
 *         - surname
 *
 *     StudentDTO:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: "jdoe"
 *         name:
 *           type: string
 *           example: "John"
 *         surname:
 *           type: string
 *           example: "Doe"
 *       required:
 *         - username
 *         - name
 *         - surname
 * /students:
 *   post:
 *     tags:
 *       - Student
 *     summary: Create a new student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentDTO'
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/student', studentController.createStudent);

/**
 * Get a student by ID
 * GET /students/{id}
 * @openapi
 * /students/{id}:
 *   get:
 *     tags:
 *       - Student
 *     summary: Get a student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 */
router.get('/student/:id', studentController.getStudentById);

/**
 * Get student's history
 * GET /students/{id}/history
 * @openapi
 * /students/{id}/history:
 *   get:
 *     tags:
 *       - Student
 *     summary: Get student's history
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student's class and subclass history
 *       404:
 *         description: Student not found
 *        404:
 *        description: Student has no history
 */
router.get('/student/:id/history', studentController.getStudentsHistory);

/**
 * Update a student by ID
 * PUT /students/{id}
 * @openapi
 * /students/{id}:
 *   put:
 *     tags:
 *       - Student
 *     summary: Update a student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentDTO'
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Student not found
 */
router.put('/student/:id', studentController.updateStudent);

/**
 * Delete a student by ID
 * DELETE /students/{id}
 * @openapi
 * /students/{id}:
 *   delete:
 *     tags:
 *       - Student
 *     summary: Delete a student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       404:
 *         description: Student not found
 */
router.delete('/student/:id', studentController.deleteStudent);

export default router;
