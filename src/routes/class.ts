import Router from 'koa-router';
import * as classController from '@controllers/classController';

const router = new Router();

/**
 * Create a new class
 * POST /classes
 * @openapi
 * components:
 *   schemas:
 *     ClassDTO:
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
 *       required:
 *         - name
 *         - validFrom
 *         - validTo
 *         - roomId
 *         - employeeId
 *
 *     PaginatedClassesResponse:
 *       type: object
 *       required:
 *         - data
 *         - meta
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Class'
 *         meta:
 *           $ref: '#/components/schemas/PaginationMeta'
 *
 *     StudentGroupShort:
 *       type: object
 *       properties:
 *         studentGroupId:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: 'Group A'
 *
 *     Class:
 *       type: object
 *       required:
 *         - classId
 *         - name
 *         - validFrom
 *         - validTo
 *         - studentGroups
 *       properties:
 *         classId:
 *           type: integer
 *           description: Unique identifier for the class
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the class
 *           example: "Timetable Test Class"
 *         validFrom:
 *           type: string
 *           format: date-time
 *           description: Start date of the class validity period
 *           example: "2025-04-01T00:00:00.000Z"
 *         validTo:
 *           type: string
 *           format: date-time
 *           description: End date of the class validity period
 *           example: "2026-03-01T00:00:00.000Z"
 *         roomId:
 *           type: integer
 *           description: ID of the assigned classroom
 *           nullable: true
 *           example: 1
 *         employeeId:
 *           type: integer
 *           description: ID of the teacher assigned to the class
 *           nullable: true
 *           example: 1
 *         studentGroups:
 *           type: array
 *           description: List of student groups associated with this class
 *           items:
 *             $ref: '#/components/schemas/StudentGroupShort'
 *
 *     PaginationMeta:
 *       type: object
 *       required:
 *         - total
 *         - page
 *         - limit
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of items across all pages
 *           example: 3
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *           example: 10
 */
/**
 * @openapi
 * /classes:
 *   get:
 *     tags:
 *        - Class
 *     summary: Get all classes
 *     description: Returns a paginated list of classes with their associated student groups
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of classes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedClassesResponse'
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */

/**
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
 *             $ref: '#/components/schemas/ClassDTO'
 *     responses:
 *       201:
 *         description: Class created
 *       400:
 *         description: Error while processing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of classes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedClassesResponse'
 *       400:
 *         description: Error while processing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/classes', classController.getAllClasses);

/**
 * Get a class by ID
 * GET /classes/{id}
 * @openapi
 * /classes/{id}:
 *   gettt:
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       400:
 *         description: Error while processing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Class not found
 */
router.get('/classes/:id', classController.getClassById);

/**
 * Get classes at a specific time
 * GET /classes/at-time/{time}
 * @openapi
 * /classes/at-time/{time}:
 *   gett:
 *     tags:
 *        - Class
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
 *       400:
 *         description: Error while processing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       400:
 *         description: Error while processing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *       400:
 *         description: Error while processing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Class not found
 */
router.delete('/classes/:id', classController.deleteClass);

export default router;
