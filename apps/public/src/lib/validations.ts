import { z } from 'zod';

// Tournament creation validation schema
export const TournamentCreateSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Tournament name is required').max(100),
  description: z.string().optional(),
  startDateTime: z.string().min(1, 'Start date and time is required'),
  endDateTime: z.string().optional(),
  venue: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable(),
  
  // Tournament Configuration
  playerType: z.enum(['singles', 'doubles', 'scotch_doubles']),
  gameType: z.enum(['eight_ball', 'nine_ball', 'ten_ball']),
  tournamentType: z.literal('chip_tournament'),
  race: z.number().int().min(1),
  estimatedPlayers: z.number().int().min(4),
  playersPerTable: z.number().int().min(2).max(8),
  
  // Chip Settings
  defaultChipsPerPlayer: z.number().int().min(1),
  chipRanges: z.array(z.object({
    minRating: z.number().int(),
    maxRating: z.number().int(),
    chips: z.number().int().min(1),
  })),
  birthdayChip: z.boolean(),
  
  // Tournament Settings
  bracketOrdering: z.enum(['random', 'seeded', 'set_order']),
  autopilotMode: z.boolean(),
  randomPlayerOrdering: z.boolean(),
  rules: z.enum(['bca', 'apa', 'wpa', 'usapl', 'vnea', 'local']),
  ratingSystem: z.enum(['none', 'fargo', 'apa', 'inhouse']),
  
  // Financial Settings
  entryFee: z.number().min(0),
  adminFee: z.number().min(0),
  addedMoney: z.number().min(0),
  payoutType: z.enum(['places', 'percentage']),
  payoutStructurePlaces: z.string(),
  payoutStructurePercentage: z.string(),
  
  // Display & Access
  showSkillLevels: z.boolean(),
  access: z.enum(['public', 'private']),
  sidePots: z.array(z.object({
    id: z.string(),
    name: z.string(),
    entryFee: z.number().min(0),
    amount: z.number().min(0),
    description: z.string(),
    criteria: z.string().optional(), // Required field for Prisma schema
  })),
  
  // Template
  saveAsTemplate: z.boolean(),
  templateName: z.string().optional(),
});

export type TournamentCreateData = z.infer<typeof TournamentCreateSchema>;

// Tournament Template validation schema
export const TournamentTemplateCreateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  description: z.string().optional(),
  settings: TournamentCreateSchema,
  isPublic: z.boolean().default(false),
});

export type TournamentTemplateCreateData = z.infer<typeof TournamentTemplateCreateSchema>;

// Auth validation schemas
export const SendCodeSchema = z.object({
  contact: z.string().min(1, 'Contact is required'),
  method: z.enum(['email', 'sms']),
});

export const VerifyCodeSchema = z.object({
  contact: z.string().min(1, 'Contact is required'),
  code: z.string().min(4, 'Code must be at least 4 characters').max(8),
});

// Venue validation schema
export const VenueCreateSchema = z.object({
  name: z.string().min(1, 'Venue name is required').max(100),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default('US'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  tableCount: z.number().int().min(1).optional(),
  maxCapacity: z.number().int().min(1).optional(),
  hourlyRate: z.number().min(0).optional(),
  contactName: z.string().optional(),
});

export type VenueCreateData = z.infer<typeof VenueCreateSchema>;