import Router from 'koa-router';
import * as subClassController from '@controllers/subclassController';

const router = new Router();

// SubClass routes
/**
 * Create a new subclass
 * POST /subclasses
 * @openapi
 * components:
 *   schemas:
 *     SubClass:
 *       type: object
 *       properties:
 *         subClassId:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: 'Group A'
 *         classId:
 *           type: integer
 *           example: 1
 *       required:
 *         - subClassId
 *         - name
 *         - classId
 *
 *     SubClassDTO:
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
 * /subclasses:
 *   post:
 *     tags:
 *        - SubClass
 *     summary: Create a new subclass
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubClassDTO'
 *     responses:
 *       201:
 *         description: Subclass created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/subclasses', subClassController.createSubClass);

/**
 * Get a subclass by ID
 * GET /subclasses/{id}
 * @openapi
 * /subclasses/{id}:
 *   get:
 *     tags:
 *        - SubClass
 *     summary: Get a subclass by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Subclass data
 *       404:
 *         description: Subclass not found
 */
router.get('/subclasses/:id', subClassController.getSubClassById);

/**
 * Get all subclasses of a specific class
 * GET /subclasses/class/{classId}
 * @openapi
 * /subclasses/class/{classId}:
 *   get:
 *     tags:
 *        - SubClass
 *     summary: Get all subclasses of a specific class
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of subclasses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubClass'
 *       404:
 *         description: Class not found
 */
router.get(
  '/subclasses/class/:classId',
  subClassController.getSubClassesByClassId
);

/**
 * Update a subclass by ID
 * PUT /subclasses/{id}
 * @openapi
 * /subclasses/{id}:
 *   put:
 *     tags:
 *        - SubClass
 *     summary: Update a subclass by ID
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
 *             $ref: '#/components/schemas/SubClass'
 *     responses:
 *       200:
 *         description: Subclass updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Subclass not found
 */
router.put('/subclasses/:id', subClassController.updateSubClass);

/**
 * Delete a subclass by ID
 * DELETE /subclasses/{id}
 * @openapi
 * /subclasses/{id}:
 *   delete:
 *     tags:
 *        - SubClass
 *     summary: Delete a subclass by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Subclass deleted successfully
 *       404:
 *         description: Subclass not found
 */
router.delete('/subclasses/:id', subClassController.deleteSubClass);

export default router;
