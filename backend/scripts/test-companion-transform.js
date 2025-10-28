/**
 * Test script to verify companion booking transformation
 * Run with: node scripts/test-companion-transform.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// Transform function from backend
const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

const transformBookingForFrontend = (booking) => {
  const transformed = {};

  for (const [key, value] of Object.entries(booking)) {
    const camelKey = snakeToCamel(key);
    transformed[camelKey] = value;
  }

  // Ensure booking_date is properly handled
  if (booking.booking_date) {
    transformed.bookingDate = booking.booking_date;
  }

  return transformed;
};

async function testCompanionTransform() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  try {
    const companionId = 24;
    const query = `
      SELECT
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.duration_hours,
        b.total_amount,
        b.status,
        b.special_requests,
        b.meeting_location,
        b.meeting_type,
        b.created_at,
        b.service_category_id,
        u.name as client_name,
        u.email as client_email
      FROM bookings b
      JOIN users u ON b.client_id = u.id
      WHERE b.companion_id = ?
      ORDER BY b.booking_date DESC, b.start_time DESC LIMIT 20
    `;

    console.log('📊 Testing companion booking query with transformation...\n');
    const [bookings] = await connection.execute(query, [companionId]);

    if (bookings.length === 0) {
      console.log('❌ No bookings found for companion');
      return;
    }

    console.log(`✅ Found ${bookings.length} booking(s) for companion ${companionId}\n`);

    // Show raw data
    console.log('📦 Raw booking from database (snake_case):');
    console.log(JSON.stringify(bookings[0], null, 2));

    // Transform to camelCase
    const transformed = bookings.map(booking => transformBookingForFrontend(booking));

    console.log('\n🔄 Transformed booking (camelCase as sent to frontend):');
    console.log(JSON.stringify(transformed[0], null, 2));

    // Check field access
    console.log('\n📋 Field Access Test:');
    console.log('  clientName:', transformed[0].clientName);
    console.log('  clientEmail:', transformed[0].clientEmail);
    console.log('  bookingDate:', transformed[0].bookingDate);
    console.log('  startTime:', transformed[0].startTime);
    console.log('  endTime:', transformed[0].endTime);
    console.log('  totalAmount:', transformed[0].totalAmount);
    console.log('  meetingLocation:', transformed[0].meetingLocation);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await connection.end();
  }
}

// Run the test
testCompanionTransform()
  .then(() => {
    console.log('\n✨ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });