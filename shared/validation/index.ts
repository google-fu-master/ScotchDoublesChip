/**
 * Central validation export module
 * Exports all validation schemas and utilities
 */

// Tournament validations
export * from './tournament.validation'

// Player validations  
export * from './player.validation'

// Game validations
export * from './game.validation'

// Common validation utilities
import { z } from 'zod'

// Common field validations
export const commonValidation = {
  id: z.string().min(1, 'ID is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number'),
  url: z.string().url('Invalid URL format'),
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  positiveNumber: z.number().min(0, 'Must be a positive number'),
  nonEmptyString: z.string().min(1, 'Field is required'),
  optionalString: z.string().optional(),
  dateString: z.string().datetime('Invalid date format'),
  timezone: z.string().regex(/^[A-Za-z]+\/[A-Za-z_]+$/, 'Invalid timezone format')
}

// Utility validation functions
export const validationUtils = {
  /**
   * Validates that end date is after start date
   */
  validateDateRange: (startDate: Date, endDate: Date): boolean => {
    return endDate > startDate
  },
  
  /**
   * Validates that a value is within a numeric range
   */
  validateRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max
  },
  
  /**
   * Validates that an array has unique values
   */
  validateUniqueArray: <T>(array: T[]): boolean => {
    return new Set(array).size === array.length
  },
  
  /**
   * Validates that required fields are present based on conditions
   */
  validateConditionalRequired: (
    condition: boolean, 
    value: any, 
    fieldName: string
  ): { valid: boolean; message?: string } => {
    if (condition && (value === undefined || value === null || value === '')) {
      return { valid: false, message: `${fieldName} is required` }
    }
    return { valid: true }
  },
  
  /**
   * Validates file upload constraints
   */
  validateFileUpload: (
    file: { size: number; type: string; name: string },
    constraints: {
      maxSize?: number // bytes
      allowedTypes?: string[]
      maxFilename?: number
    }
  ): { valid: boolean; message?: string } => {
    if (constraints.maxSize && file.size > constraints.maxSize) {
      return { 
        valid: false, 
        message: `File size exceeds ${constraints.maxSize} bytes` 
      }
    }
    
    if (constraints.allowedTypes && !constraints.allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        message: `File type ${file.type} is not allowed` 
      }
    }
    
    if (constraints.maxFilename && file.name.length > constraints.maxFilename) {
      return { 
        valid: false, 
        message: `Filename exceeds ${constraints.maxFilename} characters` 
      }
    }
    
    return { valid: true }
  }
}

// Error formatting utilities
export const formatValidationError = (error: z.ZodError) => {
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    }
  }
}

// Middleware helper for validation
export const validateInput = <T>(schema: z.ZodSchema<T>) => {
  return (input: unknown): { success: boolean; data?: T; error?: any } => {
    try {
      const data = schema.parse(input)
      return { success: true, data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return formatValidationError(error)
      }
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected validation error occurred'
        }
      }
    }
  }
}