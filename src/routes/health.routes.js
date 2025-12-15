import { Router } from 'express';
import HealthController from '../controllers/health.controller.js';

const healthRouter = Router();

healthRouter.get('/', HealthController.getHealth);

export default healthRouter;