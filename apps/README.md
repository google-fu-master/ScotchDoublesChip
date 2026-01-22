# 📱 Applications

This directory contains all application code for the tournament management system.

## 🏗️ **Architecture Overview**

The system is built as a **multi-app monorepo** with shared components and utilities:

```text
apps/
├── 🏆 tournament-director/    # Tournament management interfaces
├── 👥 player/                 # Player registration & participation  
└── 🌐 public/                 # Public tournament viewing
```

## 📱 **Application Structure**

### **🏆 Tournament Director Apps**

**Purpose:** Complete tournament management and administration

#### **Web Application** (`tournament-director/web/`)

- Tournament creation wizard with 28+ settings
- Real-time tournament management dashboard  
- Player management and registration oversight
- Chip distribution configuration
- Bracket management and scoring
- Financial tracking and payouts
- Analytics and reporting

#### **Mobile Application** (`tournament-director/mobile/`)

- Quick tournament setup on-the-go
- Live scoring and match updates
- Player check-in and management
- Real-time notifications
- Offline capability for tournaments

### **👥 Player Apps**

**Purpose:** Player registration, team formation, and tournament participation

#### **Web Application** (`player/web/`)

- Tournament discovery and registration
- Partner search and team formation
- Profile management with Fargo integration
- Tournament history and statistics
- Payment and registration management

#### **Mobile Application** (`player/mobile/`)

- SMS-based authentication (no passwords)
- Quick tournament registration
- Real-time match notifications
- Live tournament updates
- Push notifications for important updates

### **🌐 Public Interface** (`public/`)

**Purpose:** Public tournament viewing and information

- Live tournament brackets
- Real-time match results
- Tournament schedules and information
- Player statistics and rankings
- Venue information and directions

## 🔧 **Technology Stack**

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Prisma ORM
- **Database:** PostgreSQL
- **Real-time:** Socket.IO for live updates
- **Authentication:** SMS-based OTP authentication
- **Notifications:** Multi-channel (SMS, Email, Push)
- **Mobile:** Progressive Web App (PWA) + React Native

## 🎯 **Key Features**

### **Shared Across All Apps:**

- **Responsive Design** - Mobile-first approach
- **Real-time Updates** - Live tournament data
- **Offline Capability** - PWA features
- **Push Notifications** - Important alerts
- **Fargo Integration** - Live rating updates

### **Security & Authentication:**

- **Phone-based Login** - SMS OTP authentication
- **Role-based Access** - TD, Player, Public permissions
- **Secure Sessions** - JWT with refresh tokens
- **Data Validation** - Input sanitization and validation

## 🚀 **Development Status**

- ⏳ **Setup & Configuration** - Ready for implementation
- ⏳ **Tournament Director Web** - Core tournament management
- ⏳ **Tournament Director Mobile** - Mobile tournament management
- ⏳ **Player Web** - Registration and team formation
- ⏳ **Player Mobile** - Mobile player experience
- ⏳ **Public Interface** - Tournament viewing and information

## 📋 **Getting Started**

1. **Setup Development Environment**
2. **Database Schema Implementation**  
3. **Shared Components Development**
4. **Tournament Director Apps**
5. **Player Apps**
6. **Public Interface**
7. **Testing & Deployment**

Each app directory will contain its own `README.md` with specific setup and development instructions.
