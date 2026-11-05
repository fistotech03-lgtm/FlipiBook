import GuideVideoTemplate from '../GuideVideoTemplate';
import React from 'react';
import { CreditCard } from 'lucide-react';

export const homePricingSections = [
  {
    id: 'pricing-main',
    title: 'Pricing',
    icon: <CreditCard className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'pricing-overview', label: 'Pricing Overview' }
    ]
  }
];

export default function HomePricing({ selectedSubItem }) {
  return <GuideVideoTemplate selectedSubItem={selectedSubItem} />;
}

