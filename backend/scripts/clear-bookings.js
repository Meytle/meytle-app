/**
 * Script to Clear All Bookings from Database
 * Run with: node scripts/clear-bookings.js
 *
 * WARNING: This will delete ALL bookings from the database!
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

async function clearBookings() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('🔍 Checking current bookings in the database...\n');

    // First, show what will be deleted
    const [bookings] = await connection.execute(`
      SELECT id, client_id, companion_id, booking_date, status, created_at
      FROM bookings
      ORDER BY id DESC
    `);

    if (bookings.length === 0) {
      console.log('✅ No bookings found in the database. Nothing to clear.');
      return;
    }

    console.log(`Found ${bookings.length} booking(s) that will be deleted:\n`);

    // Display each booking that will be deleted
    bookings.forEach(booking => {
      console.log(`  Booking #${booking.id}:`);
      console.log(`    Client ID: ${booking.client_id}`);
      console.log(`    Companion ID: ${booking.companion_id}`);
      console.log(`    Date: ${booking.booking_date || 'No date'}`);
      console.log(`    Status: ${booking.status}`);
      console.log(`    Created: ${booking.created_at}`);
      console.log('  ---');
    });

    console.log('\n⚠️  WARNING: This will permanently delete ALL bookings!');
    console.log('🗑️  Proceeding to delete all bookings...\n');

    // Delete all bookings
    const [deleteResult] = await connection.execute('DELETE FROM bookings');

    console.log(`✅ Successfully deleted ${deleteResult.affectedRows} booking(s)`);

    // Reset auto-increment counter to 1
    await connection.execute('ALTER TABLE bookings AUTO_INCREMENT = 1');
    console.log('✅ Reset booking ID counter to 1');

    // Verify deletion
    const [remainingBookings] = await connection.execute('SELECT COUNT(*) as count FROM bookings');

    if (remainingBookings[0].count === 0) {
      console.log('\n🎉 All bookings have been successfully cleared!');
      console.log('📊 The bookings table is now empty.');
    } else {
      console.log(`\n⚠️  Warning: ${remainingBookings[0].count} booking(s) still remain in the database`);
    }

  } catch (error) {
    console.error('❌ Error clearing bookings:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Add a simple confirmation prompt
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('================================================');
console.log('    BOOKING DATA CLEANUP SCRIPT');
console.log('================================================\n');
console.log('This script will DELETE ALL bookings from the database.');
console.log('This action cannot be undone!\n');

rl.question('Are you sure you want to continue? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    rl.close();

    // Run the clearing function
    clearBookings()
      .then(() => {
        console.log('\n✨ Cleanup completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Cleanup failed:', error);
        process.exit(1);
      });
  } else {
    console.log('\n❌ Cleanup cancelled by user');
    rl.close();
    process.exit(0);
  }
});