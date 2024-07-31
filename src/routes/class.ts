import Router from 'koa-router';
import * as classController from '../controllers/classController';

const router = new Router();

/**
 * Create a new class
 * POST /classes
 * @openapi
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "A1"
 *         validFrom:
 *           type: string
 *           format: date
 *           example: "2023-09-01"
 *         validTo:
 *           type: string
 *           format: date
 *           example: "2024-06-30"
 *         roomId:
 *           type: integer
 *           example: 1
 *         employeeId:
 *           type: integer
 *           example: 1
 * /classes:
 *   post:
 *     tags:
 *        - Class
 *     summary: Create a new class
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       201:
 *         description: Class created
 *       400:
 *         description: Bad request
 */
router.post('/classes', classController.createClass);

/**
 * Get all classes
 * GET /classes
 * @openapi
 * /classes:
 *   get:
 *     tags:
 *        - Class
 *     summary: Get all classes
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Page size
 *     responses:
 *       200:
 *         description: List of classes
 */
router.get('/classes', classController.getAllClasses);

/**
 * Get a class by ID
 * GET /classes/{id}
 * @openapi
 * /classes/{id}:
 *   get:
 *     tags:
 *        - Class
 *     summary: Get a class by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Class data
 *       404:
 *         description: Class not found
 */
router.get('/classes/:id', classController.getClassById);

/**
 * Get classes at a specific time
 * GET /classes/at-time/{time}
 * @openapi
 * /classes/at-time/{time}:
 *   get:
 *     summary: Get classes at a specific time
 *     parameters:
 *       - in: path
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The specific time to check the classes
 *     responses:
 *       '200':
 *         description: List of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 *       '404':
 *         description: No classes found at the specified time
 */
router.get('/classes/at-time/:time', classController.getClassesAtTime);

/**
 * Update a class
 * PUT /classes/{id}
 * @openapi
 * /classes/{id}:
 *   put:
 *     tags:
 *        - Class
 *     summary: Update a class
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
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       200:
 *         description: Class updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Class not found
 */
router.put('/classes/:id', classController.updateClass);

/**
 * Delete a class
 * DELETE /classes/{id}
 * @openapi
 * /classes/{id}:
 *   delete:
 *     tags:
 *        - Class
 *     summary: Delete a class
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Class deleted
 *       404:
 *         description: Class not found
 */
router.delete('/classes/:id', classController.deleteClass);

export default router;
