# 🔧 Shared

This directory contains shared components, utilities, and type definitions used across all applications.

## 📁 **Directory Structure**

### **📘 /types/**

TypeScript type definitions and interfaces:

- Tournament and player data models
- API request/response types
- Fargo integration types
- Notification and authentication types

### **⚙️ /utils/**

Shared utility functions and helpers:

- Date and time formatting
- Chip calculation algorithms
- Fargo rating utilities
- Validation and sanitization

### **🧩 /components/**

Reusable UI components:

- Tournament display components
- Player search and selection
- Notification systems
- Form components and inputs

## 🎯 **Purpose**

The shared directory promotes:

- **Code Reusability** - Single source of truth for common code
- **Type Safety** - Consistent TypeScript definitions
- **Maintainability** - Centralized utility functions
- **UI Consistency** - Shared component library

## 🧩 **Component Categories**

### **🏆 Tournament Components**

- `TournamentCard` - Tournament display and selection
- `BracketDisplay` - Tournament bracket visualization
- `ChipDistributionCalculator` - Real-time chip calculation
- `RegistrationForm` - Team registration interface

### **👥 Player Components**

- `PlayerSearch` - Fargo-integrated player lookup
- `PlayerProfile` - Player information display
- `TeamFormation` - Partner selection and team creation
- `AuthenticationFlow` - SMS-based login system

### **🔔 Notification Components**

- `NotificationCenter` - Multi-channel notification management
- `AlertSystem` - Real-time alerts and warnings
- `PreferencesManager` - Notification settings

### **📱 Common UI Components**

- `LoadingStates` - Consistent loading indicators
- `ErrorBoundaries` - Error handling and recovery
- `FormControls` - Validated form inputs
- `NavigationElements` - App navigation

## ⚙️ **Utility Categories**

### **🎮 Tournament Utilities**

- `chipCalculations` - Chip distribution algorithms
- `bracketGeneration` - Tournament bracket creation
- `pairingsAlgorithm` - Player matching logic
- `scoreValidation` - Match result validation

### **📊 Data Utilities**

- `fargoIntegration` - Fargo API interaction
- `dataValidation` - Input sanitization and validation
- `dateTimeHelpers` - Date/time formatting and manipulation
- `numberFormatting` - Currency and number display

### **🔒 Security Utilities**

- `authentication` - Session management
- `encryption` - Data protection
- `inputSanitization` - XSS prevention
- `permissionChecking` - Role-based access control

### **📱 Platform Utilities**

- `deviceDetection` - Platform-specific features
- `notificationDelivery` - Multi-channel notifications
- `offlineSupport` - PWA functionality
- `performanceMonitoring` - App performance tracking

## 📘 **Type Definitions**

### **🏆 Tournament Types**

```typescript
interface Tournament {
  id: string;
  name: string;
  settings: TournamentSettings;
  registrations: TeamRegistration[];
  // ... additional properties
}

interface TournamentSettings {
  maxTeams: number;
  entryFee: number;
  chipDistribution: ChipDistributionRule[];
  // ... 28+ configuration options
}
```

### **👥 Player Types**

```typescript
interface Player {
  id: string;
  phone: string;
  fargoPlayerId?: string;
  currentRating?: number;
  // ... profile information
}

interface TeamRegistration {
  player1Id: string;
  player2Id: string;
  teamChips: number;
  registeredAt: Date;
}
```

### **🔔 Notification Types**

```typescript
interface NotificationPreferences {
  sms: boolean;
  email: boolean;
  push: boolean;
  partnerUnregistered: boolean;
  tournamentReminders: boolean;
}
```

## 🛠️ **Technology Stack**

- **TypeScript** - Type-safe development
- **React** - Component-based UI
- **Tailwind CSS** - Utility-first styling
- **Date-fns** - Date manipulation
- **Zod** - Runtime type validation
- **Lodash** - Utility functions

## 🚀 **Usage Patterns**

### **Component Import**

```typescript
import { TournamentCard, PlayerSearch } from '@/shared/components';
```

### **Utility Import**

```typescript
import { calculateChips, formatDate } from '@/shared/utils';
```

### **Type Import**

```typescript
import type { Tournament, Player } from '@/shared/types';
```

## 📋 **Development Guidelines**

1. **Pure Functions** - Utilities should be side-effect free
2. **Type Safety** - All code must be fully typed
3. **Component Props** - Clear, documented interfaces
4. **Testing** - Unit tests for all utilities and components
5. **Documentation** - JSDoc comments for all exports
6. **Performance** - Optimized for tree-shaking and bundle size

This shared directory ensures consistency and efficiency across all tournament management applications.
