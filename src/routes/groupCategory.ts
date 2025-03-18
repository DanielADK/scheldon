import Router from 'koa-router';
import * as groupCategoryController from '@controllers/groupCategoryController';

const router = new Router();

/**
 * Create a new group category
 * POST /group-categories
 * @openapi
 * components:
 *   schemas:
 *     GroupCategory:
 *       type: object
 *       properties:
 *         categoryId:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Laboratory"
 *         description:
 *           type: string
 *           example: "Groups for laboratory exercises"
 *       required:
 *         - categoryId
 *         - name
 *
 *     GroupCategoryDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Laboratory"
 *         description:
 *           type: string
 *           example: "Groups for laboratory exercises"
 *       required:
 *         - name
 * /group-categories:
 *   post:
 *     tags:
 *        - GroupCategory
 *     summary: Create a new group category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupCategoryDTO'
 *     responses:
 *       201:
 *         description: Group category created
 *       400:
 *         description: Bad request
 */
router.post('/group-categories', groupCategoryController.createGroupCategory);
/**
 * Get all group categories
 * GET /group-categories
 * @openapi
 * /group-categories:
 *   get:
 *     tags:
 *        - GroupCategory
 *     summary: Get all group categories
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
 *         description: List of group categories
 */
router.get('/group-categories', groupCategoryController.getAllGroupCategories);
/**
 * Get a group category by ID
 * GET /group-categories/{id}
 * @openapi
 * /group-categories/{id}:
 *   get:
 *     tags:
 *        - GroupCategory
 *     summary: Get a group category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Group category data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GroupCategory'
 *       404:
 *         description: Group category not found
 */
router.get('/group-categories/:id', groupCategoryController.getGroupCategoryById);
/**
 * Get a group category with student groups
 * GET /group-categories/{id}/student-groups
 * @openapi
 * /group-categories/{id}/student-groups:
 *   get:
 *     tags:
 *        - GroupCategory
 *     summary: Get a group category with student groups
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Group category with student groups
 *       404:
 *         description: Group category not found
 */
router.get('/group-categories/:id/student-groups', groupCategoryController.getGroupCategoryWithStudentGroups);
/**
 * Update a group category
 * PUT /group-categories/{id}
 * @openapi
 * /group-categories/{id}:
 *   put:
 *     tags:
 *        - GroupCategory
 *     summary: Update a group category
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
 *             $ref: '#/components/schemas/GroupCategoryDTO'
 *     responses:
 *       200:
 *         description: Group category updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Group category not found
 */
router.put('/group-categories/:id', groupCategoryController.updateGroupCategory);
/**
 * Delete a group category
 * DELETE /group-categories/{id}
 * @openapi
 * /group-categories/{id}:
 *   delete:
 *     tags:
 *        - GroupCategory
 *     summary: Delete a group category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Group category deleted
 *       404:
 *         description: Group category not found
 */
router.delete('/group-categories/:id', groupCategoryController.deleteGroupCategory);

export default router;
