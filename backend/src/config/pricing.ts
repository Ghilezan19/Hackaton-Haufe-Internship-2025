export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  reviews: number; // -1 = unlimited
  features: string[];
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    currency: 'USD',
    interval: 'once',
    reviews: 10,
    features: [
      '10 code reviews',
      'All analysis types',
      'Auto-fix suggestions',
      'Multi-language support',
      'Basic support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    currency: 'USD',
    interval: 'month',
    reviews: 1000,
    popular: true,
    features: [
      '1,000 code reviews/month',
      'All analysis types',
      'Auto-fix suggestions',
      'Incremental reviews',
      'Priority support',
      'Custom guidelines',
      'Export reports',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    currency: 'USD',
    interval: 'month',
    reviews: -1, // unlimited
    features: [
      'Unlimited code reviews',
      'All analysis types',
      'Auto-fix suggestions',
      'Incremental reviews',
      '24/7 Priority support',
      'Custom guidelines',
      'API access',
      'Team collaboration',
      'Advanced analytics',
      'Custom integrations',
    ],
  },
];

export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.id === planId);
}

