import Router from 'koa-router';
import * as studentGroupController from '@controllers/studentGroupController';

const router = new Router();

// StudentGroup routes
/**
 * Create a new studentGroup
 * POST /student-groups/
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
 *         groupCategoryId:
 *           type: integer
 *           nullable: true
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
 *         categoryId:
 *           type: integer
 *           nullable: true
 *           example: 1
 *       required:
 *         - name
 *         - classId
 */

/**
 * Create a new group
 * GET /student-groups
 * @openapi
 * /student-groups:
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
router.post('/student-groups', studentGroupController.createstudentGroup);

/**
 * Get a studentGroup by ID
 * GET /student-groups/{id}
 * @openapi
 * /student-groups/{id}:
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
router.get('/student-groups/:id', studentGroupController.getstudentGroupById);

/**
 * Get all studentGroups of a specific class
 * GET /student-groups/class/{classId}
 * @openapi
 * /student-groups/class/{classId}:
 *   get:
 *     tags:
 *        - StudentGroup
 *     summary: Get all studentGroups of a specific class
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of studentGroups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentGroup'
 *       404:
 *         description: Class not found
 */
router.get('/student-groups/class/:classId', studentGroupController.getstudentGroupsByClassId);

/**
 * Get all studentGroups of a specific category
 * GET /student-groups/category/{categoryId}
 * @openapi
 * /student-groups/category/{categoryId}:
 *   get:
 *     tags:
 *        - StudentGroup
 *     summary: Get all studentGroups of a specific category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of studentGroups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentGroup'
 *       404:
 *         description: Category not found
 */
router.get('/student-groups/category/:categoryId', studentGroupController.getstudentGroupsByCategoryId);

/**
 * Update a studentGroup by ID
 * PUT /student-groups/{id}
 * @openapi
 * /student-groups/{id}:
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
router.put('/student-groups/:id', studentGroupController.updatestudentGroup);

/**
 * Delete a studentGroup by ID
 * DELETE /student-groups/{id}
 * @openapi
 * /student-groups/{id}:
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
router.delete('/student-groups/:id', studentGroupController.deletestudentGroup);

export default router;
