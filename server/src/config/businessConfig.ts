import { BusinessSettingsModel } from '../types';

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettingsModel = {
  id: 'default_config',
  openingTime: process.env.DEFAULT_OPENING_TIME || '09:00',
  closingTime: process.env.DEFAULT_CLOSING_TIME || '21:00',
  breakStart: process.env.DEFAULT_BREAK_START || '14:00',
  breakEnd: process.env.DEFAULT_BREAK_END || '15:00',
  saturdayClosingTime: process.env.DEFAULT_SATURDAY_CLOSING_TIME || process.env.DEFAULT_SATURDAY_CLOSING || '14:00',
  staffCount: process.env.DEFAULT_STAFF_COUNT ? parseInt(process.env.DEFAULT_STAFF_COUNT, 10) : 2,
  homeServiceEnabled: true,
  slotIntervalMinutes: 30,
  updatedAt: new Date().toISOString(),
};

export const PAYMENT_METHODS = ['Cash', 'UPI'] as const;

export const SALON_CHAIRS_COUNT = 2;
