/**
 * Pagination Utilities
 */

/**
 * Calculate offset/limit for SQL queries
 * @param {number|string} page - Current page (1-based)
 * @param {number|string} limit - Items per page
 * @returns {object} { limit, offset, page }
 */
export const getPaginationParams = (page, limit) => {
    // If limit is -1, return params for SQLite "No Limit"
    if (parseInt(limit) === -1) {
        return { limit: -1, offset: 0, page: 1 };
    }
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.max(1, parseInt(limit) || 10); // Default 10
    const offset = (p - 1) * l;
    return { limit: l, offset, page: p };
};

/**
 * Format paginated response
 * @param {Array} data - Array of results
 * @param {number} total - Total count of items
 * @param {object} params - { page, limit }
 * @returns {object} Standard paginated response
 */
export const formatPaginatedResponse = (data, total, { page, limit }) => {
    const totalPages = Math.ceil(total / limit);
    return {
        success: true,
        data,
        meta: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};
