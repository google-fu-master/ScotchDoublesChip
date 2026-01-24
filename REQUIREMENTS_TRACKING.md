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

*(Requirements identified but not yet started)*

### Player Profile Enhancements
- [ ] Enhanced player profile fields
- [ ] Skill level tracking
- [ ] Tournament history

### Tournament Features
- [ ] Tournament brackets and pairing system
- [ ] Live scoring and updates
- [ ] Prize pool management
- [ ] Registration management

### Reporting & Analytics
- [ ] Tournament statistics
- [ ] Player performance tracking
- [ ] Financial reporting

---

## 🎯 FEATURE REQUESTS TO CLARIFY

*(Items that need more discussion/specification)*

### Tournament Structure
- Tournament formats (single elimination, round robin, etc.)
- Scoring systems
- Pairing algorithms

### Payment Integration
- Entry fee collection
- Prize distribution
- Payment processing

### Communication System
- Player notifications
- Tournament announcements
- Messaging between TDs and players

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