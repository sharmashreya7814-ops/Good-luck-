import { BusinessConfig } from '../types';

export const BUSINESS_INFO: BusinessConfig = {
  name: 'Good Luck Hair Salon',
  brandTagline: 'Classic Men’s Grooming & Personal Care',
  shortDescription:
    'Dedicated men’s haircutting, beard styling, and head and body massage in a clean, quiet neighborhood salon.',
  fatherTitle: 'Founder & Senior Barber',
  fatherRole: 'Stylist & Proprietor',
  openingTime: '09:00',
  closingTime: '21:00',
  breakStart: '14:00',
  breakEnd: '15:00',
  workingDays: 7,
  saturdaySchedule: {
    openingTime: '09:00',
    closingTime: '14:00',
    label: 'Half Day (9:00 AM – 2:00 PM)',
  },
  staffCount: 2,
  homeServiceAvailable: true,
  paymentMethods: ['Cash', 'UPI (Google Pay, PhonePe, Paytm)'],
  hours: {
    weekdays: '9:00 AM – 9:00 PM',
    saturday: 'Half Day (9:00 AM – 2:00 PM)',
    sunday: '9:00 AM – 9:00 PM',
    breakTime: '2:00 PM – 3:00 PM Daily',
    openDaysCount: 7,
  },
  capacity: {
    simultaneousChairs: 2,
    dailyCapacityEstimate: 'Personal service for 15–20 clients daily',
  },
  contact: {
    phone: '+91 98765 43210',
    whatsappNumber: '+91 98765 43210',
    whatsappLink: 'https://wa.me/919876543210?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20an%20appointment%20at%20Good%20Luck%20Hair%20Salon',
    addressNote: 'Exact street address and landmark will be shared upon appointment confirmation.',
    area: 'Central City Market',
  },
};

export const QUICK_STATS = [
  {
    label: 'Open 7 Days',
    subtext: 'Mon–Sun with consistent schedule',
    icon: 'calendar',
  },
  {
    label: '2 Dedicated Chairs',
    subtext: 'Dedicated, one-on-one attention',
    icon: 'users',
  },
  {
    label: 'Cash & UPI Accepted',
    subtext: 'Digital or cash payment options',
    icon: 'credit-card',
  },
  {
    label: 'Home Service Available',
    subtext: 'Doorstep grooming by reservation',
    icon: 'home',
  },
];
