import { Request, Response } from 'express';
import { PRICING_PLANS } from '../config/pricing.js';

export async function getPricingPlans(req: Request, res: Response): Promise<void> {
  res.json({ plans: PRICING_PLANS });
}

