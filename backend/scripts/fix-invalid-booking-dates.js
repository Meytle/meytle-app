/**
 * Migration Script: Fix Invalid Booking Dates
 * This script identifies and fixes bookings with invalid or missing dates
 * Run with: node scripts/fix-invalid-booking-dates.js
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

async function fixInvalidDates() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('🔍 Searching for bookings with invalid dates...');

    // Find bookings with NULL or invalid dates
    // Note: We can't directly compare DATE fields with strings in strict mode
    const [invalidBookings] = await connection.execute(`
      SELECT id, booking_date, start_time, end_time, created_at, status
      FROM bookings
      WHERE booking_date IS NULL
         OR DATE_FORMAT(booking_date, '%Y-%m-%d') = '0000-00-00'
         OR booking_date < '1900-01-01'
      ORDER BY id DESC
    `);

    console.log(`Found ${invalidBookings.length} bookings with invalid dates`);

    if (invalidBookings.length === 0) {
      console.log('✅ No invalid dates found!');
      return;
    }

    // Process each invalid booking
    for (const booking of invalidBookings) {
      console.log(`\nProcessing booking #${booking.id}:`);
      console.log(`  Current date: ${booking.booking_date}`);
      console.log(`  Created at: ${booking.created_at}`);
      console.log(`  Status: ${booking.status}`);

      // Strategy: Use created_at date as the booking date if available
      // This is a reasonable assumption for old/test bookings
      let newDate = null;

      if (booking.created_at) {
        // Use the date portion of created_at timestamp
        const createdDate = new Date(booking.created_at);
        if (!isNaN(createdDate.getTime())) {
          // Format as YYYY-MM-DD for MySQL DATE field
          newDate = createdDate.toISOString().split('T')[0];
        }
      }

      // If we still don't have a valid date, use today's date minus 30 days
      // (marks it as an old booking)
      if (!newDate) {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() - 30);
        newDate = defaultDate.toISOString().split('T')[0];
      }

      // Also fix invalid times if necessary
      let newStartTime = booking.start_time;
      let newEndTime = booking.end_time;

      if (!newStartTime || !newStartTime.includes(':')) {
        newStartTime = '09:00:00'; // Default start time
      }

      if (!newEndTime || !newEndTime.includes(':')) {
        newEndTime = '17:00:00'; // Default end time (8 hours later)
      }

      console.log(`  New date: ${newDate}`);
      console.log(`  New times: ${newStartTime} - ${newEndTime}`);

      // Update the booking
      await connection.execute(
        `UPDATE bookings
         SET booking_date = ?,
             start_time = ?,
             end_time = ?
         WHERE id = ?`,
        [newDate, newStartTime, newEndTime, booking.id]
      );

      console.log(`  ✅ Updated booking #${booking.id}`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log(`Fixed ${invalidBookings.length} bookings with invalid dates`);

    // Verify the fix
    const [remainingInvalid] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE booking_date IS NULL
         OR DATE_FORMAT(booking_date, '%Y-%m-%d') = '0000-00-00'
         OR booking_date < '1900-01-01'
    `);

    console.log(`\n✅ Remaining invalid bookings: ${remainingInvalid[0].count}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the migration
fixInvalidDates()
  .then(() => {
    console.log('\n✨ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });