import { Router } from 'express';
import { getPricingPlans } from '../controllers/pricingController.js';

export const pricingRouter = Router();

pricingRouter.get('/', getPricingPlans);


