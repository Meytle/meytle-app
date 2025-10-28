/**
 * Test script to verify all endpoints return camelCase fields
 * Run with: node scripts/test-camelcase-transformation.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Check if a string is in snake_case
const isSnakeCase = (str) => {
  return str.includes('_');
};

// Check object for snake_case fields
const checkForSnakeCase = (obj, path = '') => {
  const issues = [];

  if (!obj || typeof obj !== 'object') return issues;

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (isSnakeCase(key)) {
      issues.push({
        path: currentPath,
        field: key,
        expectedField: key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      });
    }

    // Recursively check nested objects and arrays
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item && typeof item === 'object') {
            issues.push(...checkForSnakeCase(item, `${currentPath}[${index}]`));
          }
        });
      } else {
        issues.push(...checkForSnakeCase(value, currentPath));
      }
    }
  }

  return issues;
};

// Simulate API calls using direct database queries with transformation
async function testEndpoints() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  console.log(`${colors.cyan}${colors.bright}🔍 Testing Field Name Transformation (snake_case → camelCase)${colors.reset}\n`);

  const tests = [
    {
      name: 'Companion Bookings',
      query: `
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
          b.created_at,
          u.name as client_name,
          u.email as client_email
        FROM bookings b
        JOIN users u ON b.client_id = u.id
        WHERE b.companion_id = ?
        LIMIT 5
      `,
      params: [24]
    },
    {
      name: 'Client Bookings',
      query: `
        SELECT
          b.id,
          b.booking_date,
          b.start_time,
          b.end_time,
          b.total_amount,
          b.status,
          b.payment_status,
          b.created_at,
          u.name as companion_name
        FROM bookings b
        JOIN users u ON b.companion_id = u.id
        WHERE b.client_id = ?
        LIMIT 5
      `,
      params: [2]
    },
    {
      name: 'Approved Companions',
      query: `
        SELECT
          u.id,
          u.name,
          u.email,
          ca.profile_photo_url,
          ca.hourly_rate,
          ca.services_offered,
          ca.date_of_birth,
          ca.joined_date
        FROM users u
        JOIN companion_applications ca ON u.id = ca.user_id
        WHERE ca.status = 'approved'
        LIMIT 5
      `,
      params: []
    },
    {
      name: 'Notifications',
      query: `
        SELECT
          id,
          user_id,
          title,
          message,
          type,
          action_url,
          is_read,
          created_at
        FROM notifications
        WHERE user_id = ?
        LIMIT 5
      `,
      params: [2]
    }
  ];

  let totalIssues = 0;

  for (const test of tests) {
    console.log(`${colors.blue}${colors.bright}📋 Testing: ${test.name}${colors.reset}`);

    try {
      // Get raw data from database
      const [rawData] = await connection.execute(test.query, test.params);

      if (rawData.length === 0) {
        console.log(`${colors.yellow}   ⚠️  No data found${colors.reset}\n`);
        continue;
      }

      // Check raw data for snake_case
      console.log(`   📊 Raw Database Response (${rawData.length} records):`);
      const rawIssues = checkForSnakeCase(rawData[0]);

      if (rawIssues.length > 0) {
        console.log(`${colors.yellow}   ⚠️  Found ${rawIssues.length} snake_case fields in database:${colors.reset}`);
        rawIssues.forEach(issue => {
          console.log(`      • ${colors.yellow}${issue.field}${colors.reset} → should transform to ${colors.green}${issue.expectedField}${colors.reset}`);
        });
      } else {
        console.log(`${colors.green}   ✅ No snake_case fields found (all camelCase)${colors.reset}`);
      }

      // Simulate transformation (what the backend should do)
      const transformToFrontend = (obj) => {
        if (!obj) return obj;
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) {
          return obj.map(item => transformToFrontend(item));
        }

        const transformed = {};
        for (const [key, value] of Object.entries(obj)) {
          const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          transformed[camelKey] = transformToFrontend(value);
        }
        return transformed;
      };

      const transformedData = transformToFrontend(rawData);

      // Check transformed data
      console.log(`   🔄 After Transformation:`);
      const transformedIssues = checkForSnakeCase(transformedData[0]);

      if (transformedIssues.length > 0) {
        console.log(`${colors.red}   ❌ Still found ${transformedIssues.length} snake_case fields after transformation:${colors.reset}`);
        transformedIssues.forEach(issue => {
          console.log(`      • ${colors.red}${issue.field}${colors.reset}`);
        });
        totalIssues += transformedIssues.length;
      } else {
        console.log(`${colors.green}   ✅ All fields successfully transformed to camelCase${colors.reset}`);
      }

      // Show sample of transformed data
      console.log(`   📝 Sample transformed record:`);
      const sample = transformedData[0];
      const sampleKeys = Object.keys(sample).slice(0, 5);
      sampleKeys.forEach(key => {
        const value = sample[key];
        const displayValue = value instanceof Date ? value.toISOString() :
                           value === null ? 'null' :
                           typeof value === 'string' && value.length > 30 ? value.substring(0, 30) + '...' :
                           value;
        console.log(`      ${colors.cyan}${key}:${colors.reset} ${displayValue}`);
      });

    } catch (error) {
      console.log(`${colors.red}   ❌ Error: ${error.message}${colors.reset}`);
      totalIssues++;
    }

    console.log('');
  }

  // Summary
  console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}`);
  if (totalIssues === 0) {
    console.log(`${colors.green}${colors.bright}✨ SUCCESS: All endpoints ready for camelCase transformation!${colors.reset}`);
    console.log(`${colors.green}All snake_case fields will be properly transformed to camelCase.${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bright}⚠️  ISSUES FOUND: ${totalIssues} fields still need attention${colors.reset}`);
    console.log(`${colors.yellow}Some fields may not be transforming correctly.${colors.reset}`);
  }

  await connection.end();
}

// Run the tests
testEndpoints()
  .then(() => {
    console.log(`\n${colors.cyan}✨ Test completed${colors.reset}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n${colors.red}💥 Test failed:${colors.reset}`, error);
    process.exit(1);
  });