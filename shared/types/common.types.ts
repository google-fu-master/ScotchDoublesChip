/**
 * Common utility types used across the application
 */

// Utility type helpers
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

// ID types for type safety
export type UserId = string
export type TournamentId = string
export type PlayerProfileId = string
export type TeamId = string
export type GameId = string
export type MatchId = string
export type OrganizationId = string

// Entity with common fields
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// Audit information
export interface AuditInfo {
  createdBy?: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

// Address information
export interface Address {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

// Contact information
export interface ContactInfo {
  email?: string
  phone?: string
  address?: Address
}

// Social media and external links
export interface SocialLinks {
  website?: string
  facebook?: string
  twitter?: string
  instagram?: string
}

// File upload and media
export interface FileUpload {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedAt: Date
}

export interface MediaAsset {
  id: string
  type: 'image' | 'video' | 'document'
  url: string
  thumbnailUrl?: string
  alt?: string
  caption?: string
  metadata?: Record<string, any>
}

// Notification preferences
export interface NotificationPreferences {
  email: {
    tournamentReminders: boolean
    matchUpdates: boolean
    results: boolean
    systemAnnouncements: boolean
  }
  sms: {
    urgentOnly: boolean
    matchReminders: boolean
  }
  push: {
    enabled: boolean
    matchUpdates: boolean
    tournamentUpdates: boolean
  }
}

// Theme and UI preferences
export interface UIPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  compactMode: boolean
}

// Feature flags and permissions
export interface FeatureFlags {
  enableAdvancedStats: boolean
  enableLiveScoring: boolean
  enableSocialFeatures: boolean
  enableMobileApp: boolean
  betaFeatures: boolean
}

export interface Permission {
  resource: string
  actions: string[]
  conditions?: Record<string, any>
}

// Time and scheduling
export interface TimeSlot {
  start: Date
  end: Date
  duration: number // minutes
  available: boolean
}

export interface Schedule {
  date: string // ISO date string
  timeSlots: TimeSlot[]
  capacity: number
  booked: number
}

// Geographic and location
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Location {
  name: string
  address: Address
  coordinates?: Coordinates
  capacity?: number
  facilities?: string[]
  contact?: ContactInfo
}

// Analytics and metrics
export interface Metric {
  key: string
  label: string
  value: number | string
  unit?: string
  trend?: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
    period: string
  }
  format?: 'number' | 'percentage' | 'currency' | 'time'
}

export interface Dashboard {
  title: string
  metrics: Metric[]
  charts?: Array<{
    type: string
    title: string
    data: any[]
    config: Record<string, any>
  }>
  lastUpdated: Date
}

// Export all types from other modules for convenience
export * from './tournament.types'
export * from './api.types'

// Import what exists from other type files to avoid conflicts
// Most types are already exported from tournament.types.ts