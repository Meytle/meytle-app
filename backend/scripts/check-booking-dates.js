/**
 * Script to check all booking dates in the database
 * Run with: node scripts/check-booking-dates.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
};

async function checkBookingDates() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('📊 Checking all bookings in the database...\n');

    // Get all bookings
    const [bookings] = await connection.execute(`
      SELECT id, client_id, companion_id, booking_date, start_time, end_time,
             status, created_at
      FROM bookings
      ORDER BY id DESC
      LIMIT 20
    `);

    console.log(`Found ${bookings.length} bookings (showing up to 20)\n`);

    bookings.forEach(booking => {
      console.log(`Booking #${booking.id}:`);
      console.log(`  Client ID: ${booking.client_id}`);
      console.log(`  Companion ID: ${booking.companion_id}`);
      console.log(`  Date: ${booking.booking_date} (type: ${typeof booking.booking_date})`);

      // Check if date is valid
      if (booking.booking_date) {
        const dateObj = new Date(booking.booking_date);
        console.log(`  Date validation: ${isNaN(dateObj.getTime()) ? '❌ INVALID' : '✅ Valid'}`);
        console.log(`  Parsed as: ${dateObj.toString()}`);
      } else {
        console.log(`  Date validation: ⚠️ NULL or empty`);
      }

      console.log(`  Time: ${booking.start_time} - ${booking.end_time}`);
      console.log(`  Status: ${booking.status}`);
      console.log(`  Created: ${booking.created_at}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error checking bookings:', error);
  } finally {
    await connection.end();
  }
}

// Run the check
checkBookingDates()
  .then(() => {
    console.log('\n✨ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
    process.exit(1);
  });