/**
 * Shared transformation utilities for converting database snake_case to frontend camelCase
 * This ensures consistent field naming across all API responses
 */

/**
 * Convert snake_case string to camelCase
 * @param {string} str - The snake_case string to convert
 * @returns {string} The camelCase version of the string
 */
const snakeToCamel = (str) => {
  if (!str) return str;
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Transform a single object from snake_case to camelCase
 * @param {Object} obj - The object with snake_case keys
 * @returns {Object} New object with camelCase keys
 */
const transformToFrontend = (obj) => {
  if (!obj) return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => transformToFrontend(item));
  }

  const transformed = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    // Recursively transform nested objects
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      transformed[camelKey] = transformToFrontend(value);
    } else if (Array.isArray(value)) {
      transformed[camelKey] = value.map(item => transformToFrontend(item));
    } else {
      transformed[camelKey] = value;
    }
  }

  // Special handling for common date fields to ensure consistency
  if (obj.booking_date !== undefined) {
    transformed.bookingDate = obj.booking_date;
  }
  if (obj.start_time !== undefined) {
    transformed.startTime = obj.start_time;
  }
  if (obj.end_time !== undefined) {
    transformed.endTime = obj.end_time;
  }
  if (obj.created_at !== undefined) {
    transformed.createdAt = obj.created_at;
  }
  if (obj.updated_at !== undefined) {
    transformed.updatedAt = obj.updated_at;
  }

  return transformed;
};

/**
 * Transform an array of objects from snake_case to camelCase
 * @param {Array} array - Array of objects with snake_case keys
 * @returns {Array} Array of objects with camelCase keys
 */
const transformArrayToFrontend = (array) => {
  if (!Array.isArray(array)) return array;
  return array.map(item => transformToFrontend(item));
};

/**
 * Transform paginated response maintaining pagination structure
 * @param {Object} response - Paginated response object
 * @returns {Object} Transformed paginated response
 */
const transformPaginatedResponse = (response) => {
  if (!response) return response;

  const transformed = {
    data: transformArrayToFrontend(response.data || response.results || []),
    total: response.total || response.totalCount || 0,
    page: response.page || response.currentPage || 1,
    limit: response.limit || response.pageSize || 10,
    totalPages: response.total_pages || response.totalPages || 1
  };

  // Add any additional metadata
  if (response.has_next !== undefined) {
    transformed.hasNext = response.has_next;
  }
  if (response.has_prev !== undefined) {
    transformed.hasPrev = response.has_prev;
  }

  return transformed;
};

module.exports = {
  snakeToCamel,
  transformToFrontend,
  transformArrayToFrontend,
  transformPaginatedResponse
};