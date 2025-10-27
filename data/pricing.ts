export interface PricingPlan {
  name: string;
  description: string;
  // price: {
  //   monthly: number;
  //   yearly: number;
  // };
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
  popular?: boolean;
  features: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Explorer',
    description: 'Perfect for getting started',
    // price: { monthly: 0, yearly: 0 },
    buttonText: 'Get Started Free',
    buttonVariant: 'secondary',
    features: [
      'Up to 100 bookmarks',
      '3 collections',
      'Basic import (Chrome/Safari)',
      'Public sharing',
      'Web app access'
    ]
  },
  {
    name: 'Navigator',
    description: 'For serious bookmark curators',
    // price: { monthly: 8, yearly: 6 },
    buttonText: 'Start Free Trial',
    buttonVariant: 'primary',
    popular: true,
    features: [
      'Unlimited bookmarks',
      'Unlimited collections',
      'Browser extension',
      'Private/public collections',
      'AI-powered organization',
      'Advanced search',
      'Collaboration (5 teammates)'
    ]
  },
  {
    name: 'Team',
    description: 'For teams and organizations',
    // price: { monthly: 15, yearly: 12 },
    buttonText: 'Start Free Trial',
    buttonVariant: 'primary',
    features: [
      'Everything in Navigator',
      'Unlimited team members',
      'Team analytics dashboard',
      'Custom domains',
      'API access',
      'Priority support',
      'Single Sign-On (SSO)'
    ]
  }
];

export const faqData: FAQ[] = [
  {
    question: 'Can I import my existing bookmarks?',
    answer: 'Yes! Navejo supports importing from Chrome, Safari, Firefox, and even Twitter bookmarks. Our smart AI will help organize and categorize them automatically.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Absolutely! All paid plans come with a 14-day free trial. No credit card required to start.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time. Your data remains accessible during your billing period, and you can export everything if needed.'
  },
  {
    question: 'How does team collaboration work?',
    answer: 'Team members can create shared collections, add bookmarks collaboratively, and comment on resources. Perfect for design teams, developers, and research groups.'
  }
];