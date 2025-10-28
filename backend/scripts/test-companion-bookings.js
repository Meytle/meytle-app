/**
 * Test script to check companion bookings
 * Run with: node scripts/test-companion-bookings.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testCompanionBookings() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log('🔍 Testing companion booking visibility...\n');

    // Test the companion query directly
    const companionId = 24;
    const query = `
      SELECT
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.status,
        b.companion_id,
        b.client_id,
        u.name as client_name,
        u.email as client_email
      FROM bookings b
      JOIN users u ON b.client_id = u.id
      WHERE b.companion_id = ?
      ORDER BY b.booking_date DESC, b.start_time DESC
    `;

    const [bookings] = await connection.execute(query, [companionId]);
    console.log(`📚 Bookings for companion ID ${companionId}:`);
    if (bookings.length > 0) {
      console.table(bookings);
    } else {
      console.log('  ❌ No bookings found for this companion');
    }

    // Check user_roles table
    const [roles] = await connection.execute(
      'SELECT * FROM user_roles WHERE user_id = 24',
      []
    );
    console.log('\n👤 User roles for companion (user 24):');
    console.table(roles);

    // Check if companion application exists
    const [application] = await connection.execute(
      'SELECT id, user_id, status FROM companion_applications WHERE user_id = 24',
      []
    );
    console.log('\n📋 Companion application for user 24:');
    console.table(application);

    // Check all bookings with companion details
    const [allBookings] = await connection.execute(`
      SELECT
        b.id,
        b.client_id,
        b.companion_id,
        b.booking_date,
        b.status,
        client.name as client_name,
        companion.name as companion_name
      FROM bookings b
      LEFT JOIN users client ON b.client_id = client.id
      LEFT JOIN users companion ON b.companion_id = companion.id
      ORDER BY b.id DESC
    `);
    console.log('\n📊 All bookings in the system:');
    console.table(allBookings);

  } catch (error) {
    console.error('❌ Error testing companion bookings:', error);
  } finally {
    await connection.end();
  }
}

// Run the test
testCompanionBookings()
  .then(() => {
    console.log('\n✨ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });