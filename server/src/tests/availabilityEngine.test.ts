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

    // [8] Admin Image Management System Verification
    console.log('\n[8] Admin Image Management System Verification:');
    const adminToken = 'goodluck-admin-secret-key-change-in-production';

    // 8.1 Unauthorized image upload rejected
    const unauthUploadRes = await fetch(`http://127.0.0.1:${port}/api/admin/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slot: 'HERO',
        fileBase64: 'data:image/jpeg;base64,dGVzdA==',
      }),
    });
    assert(unauthUploadRes.status === 401, 'Unauthorized image upload rejected with 401');

    // 8.2 Fallback works when no image exists for slot
    const fallbackRes = await fetch(`http://127.0.0.1:${port}/api/images/active?slot=HERO`);
    const fallbackJson = await fallbackRes.json();
    assert(fallbackRes.status === 200, 'Public active images endpoint responds with 200');
    assert(fallbackJson.data === null, 'Active hero image returns null fallback when none uploaded yet');

    // 8.3 Invalid file type rejected
    const invalidTypeRes = await fetch(`http://127.0.0.1:${port}/api/admin/images`, {
      method: 'POST',
      headers: {
        'x-admin-token': adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slot: 'HERO',
        filename: 'malicious.exe',
        mimetype: 'application/octet-stream',
        fileBase64: 'data:application/octet-stream;base64,ZXhlY3V0YWJsZQ==',
      }),
    });
    assert(invalidTypeRes.status === 400, 'Invalid file type rejected with 400 Bad Request');
    const invalidTypeJson = await invalidTypeRes.json();
    assert(invalidTypeJson.success === false, 'Invalid type response has success: false');

    // 8.4 Oversized file rejected (> 5MB)
    const oversizedBuffer = Buffer.alloc(5.5 * 1024 * 1024);
    const oversizedBase64 = oversizedBuffer.toString('base64');
    const oversizedRes = await fetch(`http://127.0.0.1:${port}/api/admin/images`, {
      method: 'POST',
      headers: {
        'x-admin-token': adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slot: 'HERO',
        filename: 'oversized.jpg',
        mimetype: 'image/jpeg',
        fileBase64: `data:image/jpeg;base64,${oversizedBase64}`,
      }),
    });
    assert(oversizedRes.status === 400, 'Oversized file (>5MB) rejected with 400 Bad Request');

    // 8.5 Authorized admin upload accepted & metadata saved correctly
    // 1x1 valid transparent PNG
    const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const uploadHero1Res = await fetch(`http://127.0.0.1:${port}/api/admin/images`, {
      method: 'POST',
      headers: {
        'x-admin-token': adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slot: 'HERO',
        filename: 'salon_hero_1.png',
        altText: 'Atmospheric barbershop interior chair 1',
        isActive: true,
        fileBase64: `data:image/png;base64,${samplePngBase64}`,
      }),
    });
    const uploadHero1Json = await uploadHero1Res.json();
    assert(uploadHero1Res.status === 201, 'Authorized admin upload accepted with 201 Created');
    assert(uploadHero1Json.success === true, 'Upload response indicates success: true');
    assert(uploadHero1Json.data.slot === 'HERO', 'Uploaded image slot correctly set to HERO');
    assert(uploadHero1Json.data.isActive === true, 'Uploaded image is marked active');
    assert(uploadHero1Json.data.altText === 'Atmospheric barbershop interior chair 1', 'Alt text persisted');
    assert(uploadHero1Json.data.publicUrl.startsWith('/uploads/'), 'Public URL properly routed under /uploads/');
    const hero1Id = uploadHero1Json.data.id;

    // 8.6 Public active hero query returns this uploaded image
    const activeHeroRes1 = await fetch(`http://127.0.0.1:${port}/api/images/active?slot=HERO`);
    const activeHeroJson1 = await activeHeroRes1.json();
    assert(activeHeroJson1.data?.id === hero1Id, 'Homepage active hero now returns newly uploaded hero image');

    // 8.7 Only ONE Hero can be active at a time: Upload second Hero image
    const uploadHero2Res = await fetch(`http://127.0.0.1:${port}/api/admin/images`, {
      method: 'POST',
      headers: {
        'x-admin-token': adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slot: 'HERO',
        filename: 'salon_hero_2.png',
        altText: 'Second salon chair with warm illumination',
        isActive: true,
        fileBase64: `data:image/png;base64,${samplePngBase64}`,
      }),
    });
    const uploadHero2Json = await uploadHero2Res.json();
    assert(uploadHero2Res.status === 201, 'Second hero image uploaded successfully');
    const hero2Id = uploadHero2Json.data.id;
    assert(uploadHero2Json.data.isActive === true, 'Second hero is active');

    // Verify first hero was automatically deactivated
    const adminImagesListRes = await fetch(`http://127.0.0.1:${port}/api/admin/images?slot=HERO`, {
      headers: { 'x-admin-token': adminToken },
    });
    const adminImagesListJson = await adminImagesListRes.json();
    const prevHero = adminImagesListJson.data.find((img: any) => img.id === hero1Id);
    const currHero = adminImagesListJson.data.find((img: any) => img.id === hero2Id);
    assert(prevHero.isActive === false, 'First hero image automatically deactivated to enforce single active hero rule');
    assert(currHero.isActive === true, 'Second hero image remains the sole active hero');

    // 8.8 Delete works
    const deleteRes = await fetch(`http://127.0.0.1:${port}/api/admin/images/${hero2Id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': adminToken },
    });
    assert(deleteRes.status === 200, 'Delete image endpoint returns 200 OK');

    // Verify deleted image is gone from active
    const activeHeroResAfterDelete = await fetch(`http://127.0.0.1:${port}/api/images/active?slot=HERO`);
    const activeHeroJsonAfterDelete = await activeHeroResAfterDelete.json();
    assert(
      activeHeroJsonAfterDelete.data === null || activeHeroJsonAfterDelete.data?.id !== hero2Id,
      'Deleted image is no longer returned as active hero'
    );
    console.log('  ✓ Admin Image Management Security, Validation, Activation & Fallback fully verified');

    // [9] Admin Service Management System Verification
    console.log('\n[9] Admin Service Management System Verification:');

    // 9.1 Unauthorized service creation rejected with 401
    const unauthServiceRes = await fetch(`http://127.0.0.1:${port}/api/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'VIP Hair Spa',
        category: 'hair',
        price: '₹400',
        duration: 45,
      }),
    });
    assert(unauthServiceRes.status === 401, 'Unauthorized service creation rejected with 401');

    // 9.2 Validation: Empty service name rejected
    const emptyNameRes = await fetch(`http://127.0.0.1:${port}/api/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken,
      },
      body: JSON.stringify({
        name: '   ',
        category: 'hair',
        price: '300',
        duration: 30,
      }),
    });
    assert(emptyNameRes.status === 400, 'Empty service name rejected with 400');

    // 9.3 Validation: Negative price rejected
    const negativePriceRes = await fetch(`http://127.0.0.1:${port}/api/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken,
      },
      body: JSON.stringify({
        name: 'Premium Beard Styling',
        category: 'beard',
        price: '-50',
        duration: 20,
      }),
    });
    assert(negativePriceRes.status === 400, 'Negative price rejected with 400');

    // 9.4 Validation: Invalid duration rejected
    const invalidDurRes = await fetch(`http://127.0.0.1:${port}/api/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken,
      },
      body: JSON.stringify({
        name: 'Scalp Detox',
        category: 'hair',
        price: '250',
        duration: -10,
      }),
    });
    assert(invalidDurRes.status === 400, 'Negative or zero duration rejected with 400');

    // 9.5 Validation: Invalid category rejected
    const invalidCatRes = await fetch(`http://127.0.0.1:${port}/api/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken,
      },
      body: JSON.stringify({
        name: 'Random Service',
        category: 'invalid_category_xyz',
        price: '200',
        duration: 30,
      }),
    });
    assert(invalidCatRes.status === 400, 'Invalid category rejected with 400');

    // 9.6 Authorized creation accepted
    const createServiceRes = await fetch(`http://127.0.0.1:${port}/api/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken,
      },
      body: JSON.stringify({
        name: 'Royal Charcoal Facial & Beard Spa',
        category: 'beard',
        price: '350',
        duration: 40,
        tagline: 'Deep detox with hot steam and beard nourishment',
        description: 'Exfoliating charcoal scrub followed by beard conditioning and facial rejuvenation.',
        features: ['Charcoal deep exfoliation', 'Steam & blackhead extraction', 'Beard softening mask'],
        homeServiceAvailable: true,
        isPopular: true,
        active: true,
      }),
    });
    const createServiceJson = await createServiceRes.json();
    assert(createServiceRes.status === 201, 'Authorized service creation accepted with 201 Created');
    assert(createServiceJson.success === true, 'Service creation response indicates success');
    const createdServiceId = createServiceJson.data.id;
    assert(createServiceJson.data.name === 'Royal Charcoal Facial & Beard Spa', 'Service name matches');
    assert(createServiceJson.data.price === '₹350', 'Price normalized with currency symbol');
    assert(createServiceJson.data.duration === 40, 'Duration persisted correctly');
    assert(createServiceJson.data.isPopular === true, 'Recommended flag set');

    // 9.7 Edit Service
    const updateServiceRes = await fetch(`http://127.0.0.1:${port}/api/services/${createdServiceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken,
      },
      body: JSON.stringify({
        price: '₹380',
        duration: 45,
        tagline: 'Luxury deep detox with hot steam',
      }),
    });
    const updateServiceJson = await updateServiceRes.json();
    assert(updateServiceRes.status === 200, 'Service update accepted with 200 OK');
    assert(updateServiceJson.data.price === '₹380', 'Updated price reflected');
    assert(updateServiceJson.data.duration === 45, 'Updated duration reflected');

    // 9.8 Verify service is present in public services listing
    const publicServicesRes = await fetch(`http://127.0.0.1:${port}/api/services`);
    const publicServicesJson = await publicServicesRes.json();
    const foundInPublic = publicServicesJson.data.find((s: any) => s.id === createdServiceId);
    assert(!!foundInPublic, 'New service is immediately visible in public services catalog');
    assert(foundInPublic.price === '₹380', 'Public service uses actual updated price');

    // 9.9 Delete / Soft-deactivation
    const deleteServiceRes = await fetch(`http://127.0.0.1:${port}/api/services/${createdServiceId}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': adminToken },
    });
    assert(deleteServiceRes.status === 200, 'Delete service accepted with 200 OK');

    // 9.10 Verify service is excluded from public catalog after deactivation
    const publicServicesAfterDelete = await fetch(`http://127.0.0.1:${port}/api/services`);
    const publicServicesAfterDeleteJson = await publicServicesAfterDelete.json();
    const foundAfterDelete = publicServicesAfterDeleteJson.data.find((s: any) => s.id === createdServiceId);
    assert(!foundAfterDelete, 'Deactivated service is excluded from public active catalog');

    // 9.11 Verify service record still exists in admin listing with active: false (preserving appointment relationships)
    const adminServicesAfterDelete = await fetch(`http://127.0.0.1:${port}/api/admin/services`, {
      headers: { 'x-admin-token': adminToken },
    });
    const adminServicesAfterDeleteJson = await adminServicesAfterDelete.json();
    const foundInAdmin = adminServicesAfterDeleteJson.data.find((s: any) => s.id === createdServiceId);
    assert(!!foundInAdmin && foundInAdmin.active === false, 'Service preserved in database as inactive to protect historical appointment integrity');

    console.log('  ✓ Admin Service Management CRUD, Validation & Soft-delete fully verified');
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
