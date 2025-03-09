import Router from 'koa-router';
import * as subjectController from '@controllers/subjectController';

const router = new Router();

/**
 * Create a new subject
 * POST /subjects
 * @openapi
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       properties:
 *         subjectId:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Mathematics"
 *         abbreviation:
 *           type: string
 *           example: "M"
 *       required:
 *         - subjectId
 *         - name
 *         - abbreviation
 *
 *     SubjectDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Mathematics"
 *         abbreviation:
 *           type: string
 *           example: "M"
 *       required:
 *         - name
 *         - abbreviation
 * /subjects:
 *   post:
 *     tags:
 *        - Subject
 *     summary: Create a new subject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubjectDTO'
 *     responses:
 *       201:
 *         description: Subject created
 *       400:
 *         description: Bad request
 */
router.post('/subjects', subjectController.createSubject);
/**
 * Get all subjects
 * GET /subjects
 * @openapi
 * /subjects:
 *   get:
 *     tags:
 *        - Subject
 *     summary: Get all subjects
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
 *         description: List of subjects
 */
router.get('/subjects', subjectController.getAllSubjects);
/**
 * Get a subject by ID
 * GET /subjects/{id}
 * @openapi
 * /subjects/{id}:
 *   get:
 *     tags:
 *        - Subject
 *     summary: Get a subject by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Subject data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 *       404:
 *         description: Subject not found
 */
router.get('/subjects/:id', subjectController.getSubjectById);
/**
 * Get a subject by abbreviation
 * GET /subjects/abbreviation/{abbreviation}
 * @openapi
 * /subjects/abbreviation/{abbreviation}:
 *   get:
 *     tags:
 *        - Subject
 *     summary: Get a subject by abbreviation
 *     parameters:
 *       - in: path
 *         name: abbreviation
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 *       404:
 *         description: Subject not found
 */
router.get('/subjects/abbreviation/:abbreviation', subjectController.getSubjectByAbbreviation);
/**
 * Update a subject
 * PUT /subjects/{id}
 * @openapi
 * /subjects/{id}:
 *   put:
 *     tags:
 *        - Subject
 *     summary: Update a subject
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
 *             $ref: '#/components/schemas/SubjectDTO'
 *     responses:
 *       200:
 *         description: Subject updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Subject not found
 */
router.put('/subjects/:id', subjectController.updateSubject);
/**
 * Delete a subject
 * DELETE /subjects/{id}
 * @openapi
 * /subjects/{id}:
 *   delete:
 *     tags:
 *        - Subject
 *     summary: Delete a subject
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Subject deleted
 *       404:
 *         description: Subject not found
 */
router.delete('/subjects/:id', subjectController.deleteSubject);

export default router;
