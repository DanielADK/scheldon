import Router from 'koa-router';
import * as roomController from '../controllers/roomController';

const router = new Router();

/**
 * Create a new room
 * POST /rooms
 * @openapi
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Classroom 101"
 *         type:
 *           type: string
 *           enum:
 *             - CLASSROOM
 *             - LAB
 *             - OFFICE
 *           example: "CLASSROOM"
 *         floor:
 *           type: integer
 *           example: 1
 *         studentCapacity:
 *           type: integer
 *           example: 30
 *         administratorId:
 *           type: integer
 *           example: 1
 * /rooms:
 *   post:
 *     summary: Create a new room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       201:
 *         description: Room created
 *       400:
 *         description: Bad request
 */
router.post('/room', roomController.createRoom);

/**
 * @openapi
 * /rooms:
 *   get:
 *     description: Get all rooms
 *     responses:
 *       200:
 *         description: Returns all rooms
 */
router.get('/room', roomController.getAllRooms);

/**
 * @openapi
 * /rooms/{id}:
 *   get:
 *     summary: Get a room by ID
 *     parameters:
 *         in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room data
 *       404:
 *         description: Room not found
 */
router.get('/room/:id', roomController.getRoomById);

/**
 * Update a room
 * PUT /rooms/{id}
 * @openapi
 * /rooms/{id}:
 *   put:
 *     summary: Update a room
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
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       200:
 *         description: Room updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Room not found
 */
router.put('/room/:id', roomController.updateRoom);

/**
 * Delete a room
 * DELETE /rooms/{id}
 * @openapi
 * /rooms/{id}:
 *   delete:
 *     summary: Delete a room
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Room deleted
 *       404:
 *         description: Room not found
 */
router.delete('/room/:id', roomController.deleteRoom);

export default router;
