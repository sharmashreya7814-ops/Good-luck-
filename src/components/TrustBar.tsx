import React from 'react';
import { Calendar, Users, CreditCard, Home } from 'lucide-react';
import { BUSINESS_INFO } from '../data/business';

export const TrustBar: React.FC = () => {
  const items = [
    {
      icon: Calendar,
      title: 'Open 7 Days',
      description: 'Mon–Sun 9:00 AM – 9:00 PM (Sat Half Day to 2:00 PM)',
    },
    {
      icon: Users,
      title: '2 Service Providers',
      description: 'Dedicated one-on-one attention per appointment',
    },
    {
      icon: CreditCard,
      title: 'Cash + UPI Accepted',
      description: 'Easy digital payment via GPay, PhonePe, Paytm',
    },
    {
      icon: Home,
      title: 'Home Service Available',
      description: 'Doorstep grooming visits by prior reservation',
    },
  ];

  return (
    <section className="relative z-20 -mt-6 sm:-mt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-[#14161a] border border-[#232731] hover:border-[#353b49] rounded-xl p-4 sm:p-5 transition-all duration-200 shadow-lg shadow-black/40 flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#1c1f26] border border-[#292e3a] flex items-center justify-center shrink-0 text-[#c5a880] group-hover:scale-105 transition-transform duration-200">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#8c919d] mt-1 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
