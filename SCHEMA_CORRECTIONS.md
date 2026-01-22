# Database Schema - Corrected for Real Tournament Requirements

## Key Corrections Made

### ✅ **Simplified Architecture**

- **Removed Organizations**: Single pool hall focus, no multi-tenancy needed
- **Players not Users**: What I called "Users" are actually "Players" in your system
- **Removed Home/Away**: Pool hall format = winners stay, losers move to open tables
- **Added Venues & Tables**: Proper pool hall table management

### ✅ **Proper Role Structure**

```text
DirectorRole:
- TOURNAMENT_DIRECTOR
- TOURNAMENT_MANAGER  
- ADMIN
- VIEWER
```

### ✅ **Birthday Chip System**

- Month/day birthday tracking (no year for privacy)
- 365-day restriction on birthday chips
- Track when last birthday chip was received
- Players can only get 1 birthday chip per year

### ✅ **Chip Transaction Types**

```text
ChipTransactionType:
- INITIAL_CHIPS    // Given at team registration
- GAME_WIN        // Chips won from victory
- GAME_LOSS       // Chips lost from defeat
- BIRTHDAY_CHIP   // Special birthday award
- ADJUSTMENT      // Manual correction
- PRIZE          // Final payouts
```

### ✅ **Pool Hall Game Format**

- **No Matches**: Just individual games
- **Winners Stay**: Winner stays at table, loser moves to open table
- **Table Tracking**: Track which table each game is played on
- **Chip Tracking**: Teams track current chips, total won/lost

### ✅ **Added Missing Features**

- **Venues**: Pool hall management with table tracking
- **Tables**: Individual table status and assignment
- **Payouts**: Tournament prize structure (1st, 2nd, 3rd, etc.)
- **Side Pots**: Additional betting pools (Break & Run, High Run, etc.)

## Updated Data Model

### **Core Entities**

```text
Players (what you call players)
├── firstName, lastName, email, phone
├── birthdayMonth, birthdayDay (no year)
├── lastBirthdayChip (365-day restriction)
└── Tournament participation history

Venues (pool halls)
├── name, address, phone
├── totalTables
└── Table management

Tables
├── number/name
├── status (AVAILABLE, IN_USE, OUT_OF_ORDER)
└── Current game assignment

Tournaments
├── venue assignment
├── startingChips (default 3 per team)
├── registration limits (maxTeams, minTeams)
└── chip configuration
```

### **Tournament Flow**

```text
1. Tournament Setup → Venue + Table assignment
2. Team Registration → Teams get starting chips
3. Games → Winners stay, losers move tables
4. Chip Tracking → Automatic win/loss tracking
5. Payouts → Prize distribution based on chip totals
6. Side Pots → Additional competitions within tournament
```

### **Birthday Chip Logic**

```text
- Players enter birthday month/day in profile
- Can request birthday chip during their birthday month
- System checks: lastBirthdayChip + 365 days < today
- If eligible: award 1 chip, update lastBirthdayChip
- If not: show "Birthday chip already used this year"
```

## Schema Benefits

✅ **Matches Your Requirements**: Based on your CSV and actual tournament format  
✅ **Birthday Chip Compliance**: Proper 365-day restriction tracking  
✅ **Pool Hall Format**: Winners stay, losers move (no home/away confusion)  
✅ **Flexible Payouts**: Support multiple prize levels and side pots  
✅ **Venue Management**: Proper table tracking and assignment  
✅ **Chip Accuracy**: Teams start with chips, lose them when they lose games  

The schema now accurately reflects your Scotch Doubles Chip tournament system rather than a generic sports tournament platform.
