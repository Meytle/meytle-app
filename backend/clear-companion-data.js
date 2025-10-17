/**
 * Clear All Companion Data Script
 * WARNING: This will permanently delete all companion-related data
 */

require('dotenv').config();
const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

const clearCompanionData = async () => {
  console.log('⚠️  WARNING: This will DELETE ALL companion data!');
  console.log('📊 Starting companion data cleanup...\n');

  try {
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Get all companion user IDs
      const [companions] = await connection.query(`
        SELECT DISTINCT user_id 
        FROM user_roles 
        WHERE role = 'companion' AND is_active = TRUE
      `);
      
      const companionIds = companions.map(c => c.user_id);
      console.log(`📋 Found ${companionIds.length} companions to process\n`);

      if (companionIds.length === 0) {
        console.log('✅ No companion data found to delete.');
        await connection.rollback();
        connection.release();
        return;
      }

      // 2. Delete booking reviews related to companion bookings
      const [reviewsResult] = await connection.query(`
        DELETE FROM booking_reviews 
        WHERE booking_id IN (
          SELECT id FROM bookings WHERE companion_id IN (?)
        )
      `, [companionIds]);
      console.log(`✅ Deleted ${reviewsResult.affectedRows} booking reviews`);

      // 3. Delete all bookings where user is a companion
      const [bookingsResult] = await connection.query(`
        DELETE FROM bookings 
        WHERE companion_id IN (?)
      `, [companionIds]);
      console.log(`✅ Deleted ${bookingsResult.affectedRows} bookings`);

      // 4. Delete companion interests
      const [interestsResult] = await connection.query(`
        DELETE FROM companion_interests 
        WHERE companion_id IN (?)
      `, [companionIds]);
      console.log(`✅ Deleted ${interestsResult.affectedRows} companion interests`);

      // 5. Delete companion availability
      const [availabilityResult] = await connection.query(`
        DELETE FROM companion_availability 
        WHERE companion_id IN (?)
      `, [companionIds]);
      console.log(`✅ Deleted ${availabilityResult.affectedRows} availability slots`);

      // 6. Delete companion applications
      const [applicationsResult] = await connection.query(`
        DELETE FROM companion_applications 
        WHERE user_id IN (?)
      `, [companionIds]);
      console.log(`✅ Deleted ${applicationsResult.affectedRows} companion applications`);

      // 7. Delete companion roles from user_roles
      const [rolesResult] = await connection.query(`
        DELETE FROM user_roles 
        WHERE user_id IN (?) AND role = 'companion'
      `, [companionIds]);
      console.log(`✅ Deleted ${rolesResult.affectedRows} companion role entries`);

      // 8. Get users who ONLY had companion role (no other roles)
      const [usersToUpdate] = await connection.query(`
        SELECT u.id, u.name, u.email 
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
        WHERE u.id IN (?) 
        AND ur.user_id IS NULL
      `, [companionIds]);

      if (usersToUpdate.length > 0) {
        console.log(`\n📝 Found ${usersToUpdate.length} users who were ONLY companions:`);
        usersToUpdate.forEach(user => {
          console.log(`   - ${user.name} (${user.email})`);
        });

        // Update their role to 'client' and add to user_roles
        for (const user of usersToUpdate) {
          await connection.query(`
            UPDATE users SET role = 'client' WHERE id = ?
          `, [user.id]);

          await connection.query(`
            INSERT INTO user_roles (user_id, role, is_active) VALUES (?, 'client', TRUE)
          `, [user.id]);
        }
        console.log(`✅ Converted ${usersToUpdate.length} companion-only users to clients`);
      }

      // 9. Clean up uploaded files
      console.log('\n🗑️  Cleaning up uploaded files...');
      const profilesDir = path.join(__dirname, 'uploads', 'profiles');
      const documentsDir = path.join(__dirname, 'uploads', 'documents');

      let deletedFiles = 0;
      
      // Delete profile photos for companions
      if (fs.existsSync(profilesDir)) {
        const files = fs.readdirSync(profilesDir);
        companionIds.forEach(id => {
          const userFiles = files.filter(file => file.startsWith(`${id}-`));
          userFiles.forEach(file => {
            const filePath = path.join(profilesDir, file);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              deletedFiles++;
            }
          });
        });
      }

      // Delete documents for companions
      if (fs.existsSync(documentsDir)) {
        const files = fs.readdirSync(documentsDir);
        companionIds.forEach(id => {
          const userFiles = files.filter(file => file.startsWith(`${id}-`));
          userFiles.forEach(file => {
            const filePath = path.join(documentsDir, file);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              deletedFiles++;
            }
          });
        });
      }

      console.log(`✅ Deleted ${deletedFiles} uploaded files`);

      // Commit transaction
      await connection.commit();
      connection.release();

      console.log('\n✅ ✅ ✅ All companion data cleared successfully! ✅ ✅ ✅\n');
      console.log('📊 Summary:');
      console.log(`   - Booking reviews: ${reviewsResult.affectedRows}`);
      console.log(`   - Bookings: ${bookingsResult.affectedRows}`);
      console.log(`   - Interests: ${interestsResult.affectedRows}`);
      console.log(`   - Availability slots: ${availabilityResult.affectedRows}`);
      console.log(`   - Applications: ${applicationsResult.affectedRows}`);
      console.log(`   - Role entries: ${rolesResult.affectedRows}`);
      console.log(`   - Converted users: ${usersToUpdate.length}`);
      console.log(`   - Deleted files: ${deletedFiles}`);

    } catch (error) {
      // Rollback on error
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('\n❌ Error clearing companion data:', error);
    throw error;
  } finally {
    process.exit(0);
  }
};

// Run the script
console.log('🚀 Companion Data Cleanup Script\n');
console.log('This script will:');
console.log('  1. Delete all booking reviews for companion bookings');
console.log('  2. Delete all bookings where user is a companion');
console.log('  3. Delete all companion interests');
console.log('  4. Delete all companion availability slots');
console.log('  5. Delete all companion applications');
console.log('  6. Remove companion roles from users');
console.log('  7. Convert companion-only users to clients');
console.log('  8. Delete uploaded profile photos and documents\n');

// Give user 3 seconds to cancel
console.log('⏰ Starting in 3 seconds... Press Ctrl+C to cancel');
setTimeout(() => {
  clearCompanionData();
}, 3000);

