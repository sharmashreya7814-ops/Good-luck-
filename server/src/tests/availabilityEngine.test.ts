/**
 * Test suite verifying core salon business logic and availability rules:
 * - Availability calculation across operating hours
 * - Break handling (2:00 PM - 3:00 PM excluded on Mon-Fri/Sun)
 * - Saturday half-day schedule (closes at 2:00 PM)
 * - Service duration boundary checks
 * - Two-chair concurrent capacity & overlap prevention
 * - Invalid booking inputs validation
 * - Home-service service eligibility validation
 */

import { availabilityService } from '../services/availabilityService';
import { appointmentService } from '../services/appointmentService';
import { db } from '../db/dbClient';
import { timeToMinutes, isTimeOverlap } from '../utils/dateUtils';
import { app } from '../app';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[TEST FAILED]: ${message}`);
  }
  console.log(`  âœ“ ${message}`);
}

async function runTests() {
  console.log('--- Starting Good Luck Salon Engine Verification Tests ---');

  // Test 1: Break Handling (Monday - 2026-09-28)
  console.log('\n[1] Break Handling Verification:');
  const mondayDate = '2026-09-28';
  const availResult = await availabilityService.getAvailability('classic-haircut', mondayDate, 'SALON');

  // 14:00 slot overlaps with break 14:00 - 15:00
  const breakSlot = availResult.slots.find((s) => s.time === '14:00');
  assert(breakSlot !== undefined, '14:00 slot exists in slot grid');
  assert(breakSlot!.isAvailable === false, '14:00 slot is marked UNAVAILABLE during afternoon break');
  assert(
    breakSlot!.reason?.includes('break') === true,
    `Reason states afternoon break: "${breakSlot?.reason}"`
  );

  // 13:30 slot for a 45-min or 35-min service would overlap into 14:00 break
  const massageAvail = await availabilityService.getAvailability('body-shoulder-massage', mondayDate, 'SALON');
  const slotBeforeBreak = massageAvail.slots.find((s) => s.time === '13:30');
  if (slotBeforeBreak) {
    // 13:30 + 35m = 14:05 which intersects 14:00 - 15:00 break
    assert(slotBeforeBreak.isAvailable === false, '13:30 slot for 35-min service is blocked because it crosses into 14:00 break');
  }

  // Test 2: Saturday Half-Day Schedule (Saturday - 2026-09-26)
  console.log('\n[2] Saturday Half-Day Schedule Verification:');
  const satDate = '2026-09-26';
  const satAvail = await availabilityService.getAvailability('classic-haircut', satDate, 'SALON');

  // Salon closes at 14:00 on Saturdays
  const lateSlot = satAvail.slots.find((s) => s.time === '16:00');
  assert(lateSlot === undefined, 'No slots generated after Saturday 14:00 closing time');

  // Slot at 13:30 (30 min) ends at 14:00, which is valid
  const lastSatSlot = satAvail.slots.find((s) => s.time === '13:30');
  assert(lastSatSlot !== undefined, '13:30 slot exists on Saturday');
  assert(lastSatSlot!.isAvailable === true, '13:30 slot is available on Saturday as it finishes at 14:00');

  // Test 3: Home Service Validation
  console.log('\n[3] Home Service Eligibility Verification:');
  // 'body-shoulder-massage' has homeServiceAvailable = false
  let homeServiceBlocked = false;
  try {
    await availabilityService.getAvailability('body-shoulder-massage', mondayDate, 'HOME');
  } catch (err: any) {
    homeServiceBlocked = true;
    assert(err.status === 400, 'Throws 400 Bad Request when home service requested for in-salon only service');
  }
  assert(homeServiceBlocked, 'In-salon only service correctly rejected for HOME request');

  // Test 4: Two-Staff Capacity & Overlap Prevention
  console.log('\n[4] Two-Chair Capacity & Overlap Prevention:');
  const testDate = '2026-09-29'; // Tuesday

  // Book Chair 1 for 11:00 AM
  const booking1 = await appointmentService.createAppointment({
    customerName: 'Rohit Verma',
    mobile: '9811223344',
    serviceId: 'classic-haircut',
    locationType: 'SALON',
    appointmentDate: testDate,
    startTime: '11:00',
  });
  assert(booking1.staffId !== undefined, `Booking 1 confirmed and assigned to staff ${booking1.staffId}`);

  // Query availability at 11:00 - should still have 1 chair remaining
  const availAfter1 = await availabilityService.getAvailability('classic-haircut', testDate, 'SALON');
  const slot11After1 = availAfter1.slots.find((s) => s.time === '11:00');
  assert(slot11After1?.isAvailable === true, '11:00 slot is still available because 2nd chair is free');
  assert(slot11After1?.remainingCapacity === 1, 'Remaining capacity is 1 chair');

  // Book Chair 2 for 11:00 AM
  const booking2 = await appointmentService.createAppointment({
    customerName: 'Kunal Kapoor',
    mobile: '9822334455',
    serviceId: 'classic-haircut',
    locationType: 'SALON',
    appointmentDate: testDate,
    startTime: '11:00',
  });
  assert(booking2.staffId !== undefined, `Booking 2 confirmed and assigned to 2nd staff ${booking2.staffId}`);
  assert(booking1.staffId !== booking2.staffId, 'Both bookings assigned to different staff members');

  // Query availability at 11:00 - should now be fully booked (0 capacity)
  const availAfter2 = await availabilityService.getAvailability('classic-haircut', testDate, 'SALON');
  const slot11After2 = availAfter2.slots.find((s) => s.time === '11:00');
  assert(slot11After2?.isAvailable === false, '11:00 slot is now UNAVAILABLE (both chairs full)');
  assert(slot11After2?.remainingCapacity === 0, 'Remaining capacity is 0');

  // Attempt to book a 3rd concurrent appointment at 11:00 - MUST BE REJECTED
  let thirdBookingRejected = false;
  try {
    await appointmentService.createAppointment({
      customerName: 'Vikas Malhotra',
      mobile: '9833445566',
      serviceId: 'classic-haircut',
      locationType: 'SALON',
      appointmentDate: testDate,
      startTime: '11:00',
    });
  } catch (err: any) {
    thirdBookingRejected = true;
    assert(err.status === 409, `Overbooking rejected with HTTP 409 Conflict: "${err.message}"`);
  }
  assert(thirdBookingRejected, 'Overbooking correctly prevented by concurrency-safe appointment engine');

  // Test 5: Invalid Booking Validation
  console.log('\n[5] Invalid Booking Inputs Validation:');
  let invalidPhoneRejected = false;
  try {
    await appointmentService.createAppointment({
      customerName: 'Sameer',
      mobile: '12345', // Invalid Indian phone
      serviceId: 'classic-haircut',
      locationType: 'SALON',
      appointmentDate: testDate,
      startTime: '12:00',
    });
  } catch (err: any) {
    invalidPhoneRejected = true;
    assert(err.status === 400, 'Invalid phone number rejected with 400 Bad Request');
  }
  assert(invalidPhoneRejected, 'Validation caught malformed mobile number');

  // Test 6: Development Health Endpoint & JSON Error Handling
  console.log('\n[6] Development Health Endpoint & Error Handling Verification:');
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3001;

  try {
    const healthRes = await fetch(`http://127.0.0.1:${port}/api/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint responds with 200 OK');
    assert(healthJson.success === true, 'Health response has success: true');
    assert(
      healthJson.message === 'Good Luck Hair Salon API is running',
      `Health response matches expected: "${healthJson.message}"`
    );

    // Test 404 handler for invalid /api route
    const notFoundRes = await fetch(`http://127.0.0.1:${port}/api/non-existent-endpoint`);
    const notFoundJson = await notFoundRes.json();
    assert(notFoundRes.status === 404, 'Unknown API route responds with 404 JSON');
    assert(notFoundJson.success === false, 'Error response returns success: false');
    assert(typeof notFoundJson.message === 'string', 'Error response returns clean JSON message');

    // Test 7: End-to-End Pipeline: Website Booking -> POST /api/appointments -> Database -> Booking ID -> Admin Dashboard
    console.log('\n[7] End-to-End Booking Pipeline Verification:');
    const today = new Date().toISOString().split('T')[0];
    const bookingPayload = {
      customerName: 'Arjun Verma',
      mobile: '9876543210',
      serviceId: 'classic-haircut',
      locationType: 'SALON',
      appointmentDate: today,
      startTime: '16:00',
      notes: 'First time visit',
    };

    const bookRes = await fetch(`http://127.0.0.1:${port}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload),
    });
    const bookJson = await bookRes.json();

    assert(bookRes.status === 201, `Booking created with status 201 (got ${bookRes.status})`);
    assert(bookJson.success === true, 'Booking response success: true');
    assert(
      typeof bookJson.data?.bookingReference === 'string' && /^GLS-[A-Z0-9]{4}$/i.test(bookJson.data.bookingReference),
      `Valid Booking Reference generated: ${bookJson.data?.bookingReference}`
    );
    assert(bookJson.data.customerName === 'Arjun Verma', 'Customer name matches');
    assert(bookJson.data.serviceName === 'Classic Haircut & Styling', 'Service name correctly resolved');

    const generatedBookingId = bookJson.data.bookingReference;

    // Verify appointment appears immediately in Admin Dashboard
    const adminDashRes = await fetch(`http://127.0.0.1:${port}/api/admin/dashboard`, {
      headers: { 'x-admin-token': 'goodluck-admin-secret-key-change-in-production' },
    });
    const adminDashJson = await adminDashRes.json();
    assert(adminDashRes.status === 200, 'Admin dashboard accessible with 200 OK');

    const foundInToday = adminDashJson.data?.todayAppointments?.find(
      (a: any) => a.bookingReference === generatedBookingId
    );
    assert(!!foundInToday, `Booking ${generatedBookingId} found in todayAppointments in Admin Dashboard`);
    assert(foundInToday.customerName === 'Arjun Verma', 'Customer name in dashboard matches');
    assert(foundInToday.serviceName === 'Classic Haircut & Styling', 'Service name in dashboard matches');

    // Verify appointment appears in Admin Bookings Ledger
    const adminLedgerRes = await fetch(`http://127.0.0.1:${port}/api/admin/appointments`, {
      headers: { 'x-admin-token': 'goodluck-admin-secret-key-change-in-production' },
    });
    const adminLedgerJson = await adminLedgerRes.json();
    const foundInLedger = adminLedgerJson.data?.find(
      (a: any) => a.bookingReference === generatedBookingId
    );
    assert(!!foundInLedger, `Booking ${generatedBookingId} found in Admin Bookings Ledger`);
    console.log(`  ✓ Complete Pipeline Verified: Booking ID ${generatedBookingId} created and reflected in Admin Dashboard`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  console.log('\n✅ ALL ARCHITECTURAL ENGINE, HEALTH & END-TO-END PIPELINE TESTS PASSED SUCCESSFULLY!\n');
}

// Execute tests if run directly
runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
