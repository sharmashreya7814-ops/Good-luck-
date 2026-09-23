import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import { isValidDateString, isValidTimeString } from '../utils/dateUtils';
import { CreateAppointmentDTO } from '../types';

export function validateAppointmentCreation(req: Request, res: Response, next: NextFunction) {
  const body = req.body as Partial<CreateAppointmentDTO>;

  // 1. Customer Name
  if (!body.customerName || typeof body.customerName !== 'string' || body.customerName.trim().length < 2) {
    return sendError(res, 'Please enter a valid customer name (at least 2 characters).', 400);
  }

  // 2. 10-digit Indian Mobile Number
  const cleanMobile = (body.mobile || '').replace(/\D/g, '');
  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!cleanMobile || !indianMobileRegex.test(cleanMobile)) {
    return sendError(res, 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).', 400);
  }

  // 3. Service ID
  if (!body.serviceId || typeof body.serviceId !== 'string' || body.serviceId.trim() === '') {
    return sendError(res, 'A valid service selection is required.', 400);
  }

  // 4. Appointment Date
  if (!body.appointmentDate || !isValidDateString(body.appointmentDate)) {
    return sendError(res, 'A valid appointment date in YYYY-MM-DD format is required.', 400);
  }

  // Date cannot be in the past (using today's date in local/IST string)
  const todayStr = new Date().toISOString().split('T')[0];
  if (body.appointmentDate < todayStr) {
    return sendError(res, 'Appointment date cannot be in the past.', 400);
  }

  // 5. Start Time
  if (!body.startTime || !isValidTimeString(body.startTime)) {
    return sendError(res, 'A valid start time in HH:mm 24-hour format is required.', 400);
  }

  // 6. Location Type
  if (!body.locationType || !['SALON', 'HOME'].includes(body.locationType)) {
    return sendError(res, 'Location type must be either "SALON" or "HOME".', 400);
  }

  // 7. Home Address when HOME is selected
  if (body.locationType === 'HOME') {
    if (!body.address || typeof body.address !== 'string' || body.address.trim().length < 5) {
      return sendError(res, 'A complete delivery/home address is required for home service.', 400);
    }
  }

  next();
}
