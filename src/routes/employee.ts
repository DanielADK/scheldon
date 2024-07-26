import Router from 'koa-router';
import * as employeeController from '../controllers/employeeController';

const router = new Router();

// All employees
router.get('/employee', employeeController.getAllEmployees);
// Create a new employee
router.post('/employee', employeeController.createEmployee);
export default router;
