import Router from 'koa-router';
import * as employeeController from '@controllers/employeeController';

const router = new Router();

/**
 * Create a new employee
 * POST /employees
 * @openapi
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       properties:
 *         employeeId:
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
 *         degreePre:
 *           type: string
 *           example: "Dr."
 *         degreePost:
 *           type: string
 *           example: "PhD"
 *         abbreviation:
 *           type: string
 *           example: "JD"
 *         isTeacher:
 *           type: boolean
 *           example: true
 *       required:
 *         - employeeId
 *         - username
 *         - name
 *         - surname
 *         - isTeacher
 *
 *     EmployeeDTO:
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
 *         degreePre:
 *           type: string
 *           example: "Dr."
 *         degreePost:
 *           type: string
 *           example: "PhD"
 *         abbreviation:
 *           type: string
 *           example: "JD"
 *         isTeacher:
 *           type: boolean
 *           example: true
 *       required:
 *         - username
 *         - name
 *         - surname
 *         - isTeacher
 * /employees:
 *   post:
 *     tags:
 *        - Employee
 *     summary: Create a new employee
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeDTO'
 *     responses:
 *       201:
 *         description: Employee created
 *       400:
 *         description: Error while processing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/employees', employeeController.createEmployee);

/**
 * Get all employees
 * GET /employees
 * @openapi
 * /employees:
 *   get:
 *     tags:
 *        - Employee
 *     summary: Get all employees
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
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Error while processing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/employees', employeeController.getAllEmployees);

/**
 * Get an employee by ID
 * GET /employees/{id}
 * @openapi
 * /employees/{id}:
 *   get:
 *     tags:
 *        - Employee
 *     summary: Get an employee by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Error while processing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Employee not found
 */
router.get('/employees/:id', employeeController.getEmployeeById);

/**
 * Get an employee by username
 * GET /employees/username/{username}
 * @openapi
 * /employees/username/{username}:
 *   get:
 *     tags:
 *        - Employee
 *     summary: Get an employee by username
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 */
router.get('/employees/username/:username', employeeController.getEmployeeByUsername);

/**
 * Get an employee by abbreviation
 * GET /employees/abbreviation/{abbreviation}
 * @openapi
 * /employees/abbreviation/{abbreviation}:
 *   get:
 *     tags:
 *        - Employee
 *     summary: Get an employee by abbreviation
 *     parameters:
 *       - in: path
 *         name: abbreviation
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 */
router.get('/employees/abbreviation/:abbreviation', employeeController.getEmployeeByAbbreviation);

/**
 * Update an employee
 * PUT /employees/{id}
 * @openapi
 * /employees/{id}:
 *   put:
 *     tags:
 *        - Employee
 *     summary: Update an employee
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
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       204:
 *         description: Employee updated
 *       400:
 *         description: Error while processing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Employee not found
 */
router.put('/employees/:id', employeeController.updateEmployee);

/**
 * Delete an employee
 * DELETE /employees/{id}
 * @openapi
 * /employees/{id}:
 *   delete:
 *     tags:
 *        - Employee
 *     summary: Delete an employee
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Employee deleted
 *       404:
 *         description: Employee not found
 */
router.delete('/employees/:id', employeeController.deleteEmployee);

export default router;
