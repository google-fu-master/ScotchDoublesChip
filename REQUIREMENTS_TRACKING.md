# SCOTCH DOUBLES TOURNAMENT PLATFORM - REQUIREMENTS TRACKING

This document tracks all requirements, features, and specifications gathered throughout development to ensure nothing gets missed.

## ✅ COMPLETED REQUIREMENTS

### Authentication & User Management
- [x] Login/Signup buttons on public landing page
- [x] Email verification system with development console logging
- [x] Multi-account types: Player, Tournament Director, Admin
- [x] Admin "God Mode" dashboard with comprehensive controls

### Venue Management  
- [x] Venue database system (no free text fields)
- [x] Search existing venues or add new venues
- [x] Venue details: name, address, contact info, amenities, table count

### Branding & Design
- [x] Unique purple/pink/blue brand identity (distinct from Good Tourney)
- [x] Responsive design with proper mobile navigation
- [x] Professional UI/UX with scrolling, accessibility, touch-friendly interactions

### Tournament Management
- [x] Tournament creation wizard with venue integration
- [x] Tournament search and discovery
- [x] Basic tournament settings and configuration

### Technical Infrastructure
- [x] Production deployment guide (Vercel, AWS, DigitalOcean options)
- [x] Repository cleanup and TypeScript error resolution
- [x] Build system optimization and module resolution fixes

---

## 🔄 IN PROGRESS REQUIREMENTS

### Age Restrictions & Player Safety  
- [ ] **Under 21 checkbox for player profiles**
  - Add "Under 21" checkbox to player registration/profile
  - Remove need to ask for birth year
  - Table assignment restrictions based on age
  - Tournament tables should have age restriction option/checkbox
  - Under 21 players only assigned to age-appropriate tables

---

## 📋 PENDING REQUIREMENTS

### **DISCUSSED BUT NOT IMPLEMENTED**

#### Tournament Lifecycle Management
- [ ] **Tournament creation with CSV specifications**: All 25+ fields from tournament settings CSV
- [ ] **Tournament templates**: Save/load/edit/delete reusable configurations  
- [ ] **Tournament URL generation**: Auto-generate from tournament name
- [ ] **Player registration system**: Team formation for Scotch Doubles (2v2 alternating shot)
- [ ] **Bracket generation**: Random Draw (Fisher-Yates), Seeded Draw, Set Order
- [ ] **Autopilot tournament mode**: Auto-assign entrants avoiding repeat matchups
- [ ] **Random player ordering**: Shuffle players each round option
- [ ] **Side pot management**: Up to 10 additional side pots per tournament
- [ ] **Match scheduling**: Table assignment with chip-based elimination
- [ ] **Tournament completion**: Winner confirmation and bracket closure

#### Chip Tournament System
- [ ] **Chip distribution by Fargo ratings**: Custom skill level ranges with chips per range
- [ ] **Multi-game format support**: Eight Ball, Nine Ball, Ten Ball
- [ ] **Race configuration**: 1-10 games per match setting
- [ ] **Player elimination tracking**: When players lose all chips
- [ ] **Table rotation logic**: 4 players per table (2 teams) management
- [ ] **Rating system integration**: Fargo Rate, APA 8-ball/9-ball, In-House

#### Database & Data Integration
- [ ] **Replace all mock data with real database**: Connect Prisma to frontend
- [ ] **Tournament/Player/Game API endpoints**: Full CRUD operations beyond auth/venues  
- [ ] **Fargo rating integration**: Real-time sync from FargoRate system
- [ ] **Data persistence**: All forms currently show alerts instead of saving

#### Financial System  
- [ ] **Entry fee collection**: Per entrant (per team for doubles/scotch doubles)
- [ ] **Admin fee management**: Subtracted from entry, validation cannot exceed entry
- [ ] **Added money support**: Flat amount added to total pot
- [ ] **Total pot calculation**: (entry fee × entrants) - admin fee + added money
- [ ] **Payout structure automation**: Places vs Percentage-based payouts
- [ ] **Predefined payout structures**: Winner Take All, Top 2/3/4/6/8 Places based on field size
- [ ] **Percentage payout options**: 10-50% of field paid out
- [ ] **Payment processor integration**: Need to choose Stripe/Square/PayPal
- [ ] **Prize pool distribution**: Automated winner payments

#### Real-Time Features
- [ ] **Live scoring updates**: Socket.IO implementation for tournament updates
- [ ] **Player notifications**: Tournament-specific email/SMS notifications
- [ ] **Autopilot tournament mode**: Automated tournament progression

### **PARTIALLY IMPLEMENTED - NEED COMPLETION**

#### Authentication System
- [ ] **Real authentication**: Replace mock auth with JWT tokens and session management
- [ ] **Password hashing and security**: Production-grade authentication
- [ ] **User account management**: Profile updates, password reset, account deletion

#### Tournament Creation
- [ ] **Database persistence**: Save tournaments to database instead of mock alerts
- [ ] **Chip configuration settings**: Actual chip distribution based on Fargo ratings
- [ ] **Tournament settings**: Advanced configuration options

#### Admin Dashboard  
- [ ] **Real functionality**: Replace mock alerts with actual database operations
- [ ] **User management**: Create/edit/delete users, manage permissions
- [ ] **System monitoring**: Real metrics and analytics

### **MISSING CRITICAL FEATURES**

#### Player Profile & Team System
- [ ] **Comprehensive player profiles**: Stats, history, preferences
- [ ] **Team formation system**: Scotch Doubles partnership management  
- [ ] **Player search/discovery**: Find partners and view player ratings
- [ ] **Skill level tracking**: Beyond Fargo - tournament performance analytics

#### Mobile & PWA Features
- [ ] **Progressive Web App setup**: Service worker, app manifest
- [ ] **Mobile-optimized tournament management**: TD mobile interface
- [ ] **Offline tournament execution**: Continue tournaments without internet
- [ ] **Mobile player check-in**: QR codes or mobile-friendly registration

#### Advanced Tournament Features
- [ ] **Multiple tournament formats**: 8-ball, 9-ball, various rule sets
- [ ] **Side pot integration**: Additional wagering within tournaments
- [ ] **Tournament templates**: Reusable tournament configurations
- [ ] **Multi-day tournament support**: Session management across days

---

## 🎯 FEATURE REQUESTS TO CLARIFY

### **Age Restrictions & Safety** ⚠️ NEEDS SPECIFICATION
- How do age restrictions affect tournament eligibility?
- Should venues have age-based table sections?
- What verification is needed for under-21 status?
- How do mixed-age tournaments handle table assignments?

### **Tournament Structure & Rules** ✅ SPECIFIED IN CSV
- **Game formats**: Eight Ball, Nine Ball, Ten Ball initially
- **Player types**: Singles (1v1), Doubles (2v2), Scotch Doubles (2v2 alternating shot)
- **Tournament type**: Chip Tournament (initial focus)
- **Race settings**: 1-10 games per match
- **Chip distribution**: Based on combined team Fargo ratings with custom ranges
- **Bracket ordering**: Random Draw (Fisher-Yates), Seeded Draw, Set Order
- **Autopilot mode**: Auto-assign entrants to tables avoiding repeat matchups
- **Rating systems**: None, Fargo Rate, APA, In-House support

### **Payment & Financial** ✅ SPECIFIED IN CSV
- **Entry fee structure**: Per entrant (per team for doubles/scotch doubles)
- **Admin fee**: Subtracted from entry fee, cannot exceed entry fee
- **Added money**: Flat amount added to total pot
- **Total pot calculation**: (entry fee × entrants) - admin fee + added money
- **Payout types**: Places or Percentage-based
- **Payout structures**: Predefined structures based on field size
- **Side pots**: Up to 10 additional side pots per tournament

### **Data & Privacy** ✅ SPECIFIED IN CSV
- **Tournament access**: Public (anyone can view/join) or Private (invite-only)
- **Player skill visibility**: Toggle to show/hide ratings in bracket
- **URL structure**: Tournament name determines URL path
- **Templates**: Save/reuse tournament configurations

### **Integration Points** ⚠️ NEEDS SPECIFICATION
- Real-time vs periodic Fargo rating sync frequency?
- Third-party venue booking system integration?
- Tournament result submission to APA/UPA/other leagues?
- Social media integration for tournament promotion?

---

## 🛠️ TECHNICAL DEBT TO ADDRESS

### **Database Integration**
- [ ] Connect Prisma client to all frontend components
- [ ] Replace in-memory storage with PostgreSQL  
- [ ] Implement database migrations for production
- [ ] Add proper indexing and query optimization

### **Service Layer Implementation**
- [ ] Integrate existing shared/services into frontend
- [ ] Add Zod runtime validation beyond TypeScript types
- [ ] Implement proper error handling and logging
- [ ] Add business logic isolation from UI components

### **Production Readiness**
- [ ] Environment-specific configuration management
- [ ] Error monitoring (Sentry integration)
- [ ] Performance optimization (caching, CDN)
- [ ] Security hardening (rate limiting, CSRF protection)
- [ ] Real email service for production (vs console logging)

### **Code Quality**
- [ ] Replace mock alerts with real UI feedback
- [ ] Add comprehensive error boundaries
- [ ] Implement loading states across all async operations
- [ ] Add proper form validation feedback

---

## 📝 NOTES & CONTEXT

### Technical Decisions Made
- Next.js 16 with TypeScript for frontend
- API routes for backend functionality
- Tailwind CSS for styling
- Development-first email system (console logging)

### Business Rules Established
- Players can participate in tournaments
- Tournament Directors can create/manage tournaments + all Player features
- Admins have "God Mode" access to everything
- Venues must be selected from database, not free text

### User Experience Principles
- Mobile-first responsive design
- Touch-friendly interactions (44px minimum)
- Proper accessibility (ARIA labels, keyboard navigation)
- Loading states and error handling
- Scrollable modals with proper overflow handling

---

*This document should be updated whenever new requirements are discussed or existing requirements are modified.*