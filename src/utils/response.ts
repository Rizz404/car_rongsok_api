/**
 * Standard API Response Wrapper
 * Provides consistent response format across all endpoints
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  pagination?: PaginationMeta;
  timestamp: string;
}

/**
 * Success response untuk single data (tanpa pagination)
 * Contoh: get user by id, create user, update user, dll
 */
export function successResponse<T>(
  data: T,
  message: string = "Request successful"
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Success response untuk list data (dengan pagination wajib)
 * Contoh: list users, list posts, dll
 */
export function successListResponse<T>(
  data: T[],
  message: string = "Data retrieved successfully",
  pagination: PaginationMeta
): ApiResponse<T[]> {
  return {
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Success response hanya message (tanpa data)
 * Contoh: logout, delete, dll
 */
export function successMessageResponse(
  message: string = "Operation successful"
): ApiResponse<null> {
  return {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Error response wrapper
 * @param message - Error message
 * @param validationErrors - Optional validation errors array
 */
export function errorResponse(
  message: string = "An error occurred",
  validationErrors?: any[]
): ApiResponse {
  const response: ApiResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (validationErrors && validationErrors.length > 0) {
    response.errors = validationErrors;
  }

  return response;
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
