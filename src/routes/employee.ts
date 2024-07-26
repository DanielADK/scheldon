import Router from 'koa-router';
import * as employeeController from '../controllers/employeeController';

const router = new Router();

// All employees
router.get('/employees', employeeController.getAllEmployees);

export default router;
