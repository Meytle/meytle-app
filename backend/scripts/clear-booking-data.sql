-- ================================================
-- Clear All Booking Data Script
-- ================================================
-- This script will PERMANENTLY DELETE all booking-related data
-- and reset auto-increment IDs to 1
--
-- WARNING: This action cannot be undone!
-- ================================================

-- Disable foreign key checks to allow TRUNCATE
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all booking reviews
TRUNCATE TABLE booking_reviews;

-- Clear all booking requests
TRUNCATE TABLE booking_requests;

-- Clear audit logs for availability changes
TRUNCATE TABLE availability_audit_log;

-- Clear main bookings table
TRUNCATE TABLE bookings;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Show confirmation - count records in each table (should all be 0)
SELECT
    'bookings' as table_name,
    COUNT(*) as record_count
FROM bookings
UNION ALL
SELECT
    'booking_requests' as table_name,
    COUNT(*) as record_count
FROM booking_requests
UNION ALL
SELECT
    'booking_reviews' as table_name,
    COUNT(*) as record_count
FROM booking_reviews
UNION ALL
SELECT
    'availability_audit_log' as table_name,
    COUNT(*) as record_count
FROM availability_audit_log;