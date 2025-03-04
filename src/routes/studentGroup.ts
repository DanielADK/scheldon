import Router from 'koa-router';
import * as studentGroupController from '@controllers/studentGroupController';

const router = new Router();

// StudentGroup routes
/**
 * Create a new studentGroup
 * POST /studentGroupes
 * @openapi
 * components:
 *   schemas:
 *     StudentGroup:
 *       type: object
 *       properties:
 *         studentGroupId:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: 'Group A'
 *         classId:
 *           type: integer
 *           example: 1
 *       required:
 *         - studentGroupId
 *         - name
 *         - classId
 *
 *     studentGroupDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: 'Group A'
 *         classId:
 *           type: integer
 *           example: 1
 *       required:
 *         - name
 *         - classId
 * /studentGroupes:
 *   post:
 *     tags:
 *        - StudentGroup
 *     summary: Create a new studentGroup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/studentGroupDTO'
 *     responses:
 *       201:
 *         description: studentGroup created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/studentGroupes', studentGroupController.createstudentGroup);

/**
 * Get a studentGroup by ID
 * GET /studentGroupes/{id}
 * @openapi
 * /studentGroupes/{id}:
 *   get:
 *     tags:
 *        - StudentGroup
 *     summary: Get a studentGroup by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: studentGroup data
 *       404:
 *         description: studentGroup not found
 */
router.get('/studentGroupes/:id', studentGroupController.getstudentGroupById);

/**
 * Get all studentGroupes of a specific class
 * GET /studentGroupes/class/{classId}
 * @openapi
 * /studentGroupes/class/{classId}:
 *   get:
 *     tags:
 *        - StudentGroup
 *     summary: Get all studentGroupes of a specific class
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of studentGroupes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentGroup'
 *       404:
 *         description: Class not found
 */
router.get(
  '/studentGroupes/class/:classId',
  studentGroupController.getstudentGroupesByClassId
);

/**
 * Update a studentGroup by ID
 * PUT /studentGroupes/{id}
 * @openapi
 * /studentGroupes/{id}:
 *   put:
 *     tags:
 *        - StudentGroup
 *     summary: Update a studentGroup by ID
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
 *             $ref: '#/components/schemas/StudentGroup'
 *     responses:
 *       200:
 *         description: studentGroup updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: studentGroup not found
 */
router.put('/studentGroupes/:id', studentGroupController.updatestudentGroup);

/**
 * Delete a studentGroup by ID
 * DELETE /studentGroupes/{id}
 * @openapi
 * /studentGroupes/{id}:
 *   delete:
 *     tags:
 *        - StudentGroup
 *     summary: Delete a studentGroup by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: studentGroup deleted successfully
 *       404:
 *         description: studentGroup not found
 */
router.delete('/studentGroupes/:id', studentGroupController.deletestudentGroup);

export default router;
