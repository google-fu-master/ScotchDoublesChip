# 🎯 COMPREHENSIVE CHIP TOURNAMENT IMPLEMENTATION PLAN
## Based on DigitalPool Analysis & CSV Requirements

---

## 📊 **ANALYSIS SUMMARY**

### ✅ **What DigitalPool Has**
- Basic tournament creation framework
- Some Fargo integration mentions
- Basic autopilot references  
- Side pot mentions

### ❌ **Critical Gaps We Must Fill**
- **ZERO chip tournament specific features**
- **NO autopilot mode implementation**
- **NO Scotch Doubles specialization**
- **NO chip distribution by skill level**
- **NO venue search functionality**
- **NO advanced payout calculations**
- **NO template system**
- **NO players per table configuration**

### 🎯 **Our Competitive Advantages**
1. **First dedicated chip tournament system**
2. **Intelligent autopilot opponent matching** 
3. **Skill-based chip distribution**
4. **Full Scotch Doubles optimization**
5. **Advanced payout calculations**
6. **Tournament template system**

---

## 🏗️ **IMPLEMENTATION ARCHITECTURE**

### **Technology Stack**
```typescript
// Frontend: Next.js 14 App Router + TypeScript
// Database: PostgreSQL with Prisma ORM  
// Real-time: Socket.IO for live updates
// Styling: Tailwind CSS
// Validation: Zod schemas
// State: Zustand for client state
```

### **Database Schema**
```sql
-- Tournament table implementing ALL CSV requirements
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT CHECK (LENGTH(description) <= 5000),
    
    -- Dates
    start_date_time TIMESTAMP NOT NULL,
    end_date_time TIMESTAMP,
    
    -- Venue
    venue_id INT REFERENCES venues(id),
    
    -- Tournament Configuration
    player_type player_type_enum DEFAULT 'scotch_doubles',
    game_type game_type_enum DEFAULT 'nine_ball', 
    tournament_type tournament_type_enum DEFAULT 'chip_tournament',
    race INTEGER CHECK (race BETWEEN 1 AND 10) DEFAULT 1,
    
    -- Player/Team Configuration
    estimated_players INTEGER NOT NULL,
    players_per_table INTEGER DEFAULT 4, -- Key chip tournament setting
    
    -- Chip System
    default_chips_per_player INTEGER,
    chip_distribution_rules JSONB, -- Fargo-based ranges
    
    -- Bracket & Autopilot
    bracket_ordering bracket_ordering_enum DEFAULT 'random_draw',
    autopilot_mode BOOLEAN DEFAULT false,
    random_ordering_each_round BOOLEAN DEFAULT false,
    
    -- Rules & Rating
    rules rules_enum DEFAULT 'bca',
    rating_system rating_system_enum DEFAULT 'fargo_rate',
    show_skill_levels BOOLEAN DEFAULT true,
    
    -- Financial
    entry_fee DECIMAL(10,2) DEFAULT 0,
    admin_fee DECIMAL(10,2) DEFAULT 0,
    added_money DECIMAL(10,2) DEFAULT 0,
    payout_type payout_type_enum DEFAULT 'places',
    payout_structure JSONB,
    
    -- Access & Templates
    access_type access_type_enum DEFAULT 'public',
    template_id INT REFERENCES tournament_templates(id),
    
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Chip Management Tables
CREATE TABLE team_chips (
    id SERIAL PRIMARY KEY,
    tournament_id INT REFERENCES tournaments(id),
    team_id INT REFERENCES teams(id),
    current_chips INTEGER NOT NULL,
    starting_chips INTEGER NOT NULL,
    total_won INTEGER DEFAULT 0,
    total_lost INTEGER DEFAULT 0,
    elimination_order INTEGER,
    eliminated_at TIMESTAMP
);

CREATE TABLE chip_transfers (
    id SERIAL PRIMARY KEY,
    tournament_id INT REFERENCES tournaments(id),
    match_id INT REFERENCES matches(id),
    from_team_id INT REFERENCES teams(id),
    to_team_id INT REFERENCES teams(id),
    amount INTEGER NOT NULL,
    transfer_type transfer_type_enum,
    transferred_at TIMESTAMP DEFAULT NOW()
);

-- Venue System
CREATE TABLE venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(20),
    tables INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tournament Templates
CREATE TABLE tournament_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INT REFERENCES users(id),
    settings JSONB NOT NULL, -- All tournament settings
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 **TOURNAMENT CREATION FORM**

### **Component Structure**
```typescript
// Tournament creation wizard implementing ALL CSV fields
const TournamentCreationWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<TournamentFormData>({});
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <TournamentProgress currentStep={step} totalSteps={5} />
      
      {step === 1 && <BasicInformationStep />}
      {step === 2 && <GameConfigurationStep />}
      {step === 3 && <ChipSettingsStep />}
      {step === 4 && <FinancialSettingsStep />}
      {step === 5 && <ReviewAndCreateStep />}
    </div>
  );
};

// Step 1: Basic Information
const BasicInformationStep = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tournament Information</h2>
      
      {/* Template Selection */}
      <TemplateSelector onApply={applyTemplate} />
      
      {/* Name - determines URL slug */}
      <div>
        <label className="block text-sm font-medium mb-2">Tournament Name *</label>
        <input
          type="text"
          required
          className="w-full p-3 border rounded-lg"
          placeholder="e.g., Midway Scotch Chip 1/16/2026"
          onChange={handleNameChange}
        />
        <p className="text-sm text-gray-500 mt-1">
          URL: yourdomain.com/tournaments/{slug}
        </p>
      </div>
      
      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          maxLength={5000}
          rows={4}
          className="w-full p-3 border rounded-lg"
          placeholder="Tournament details..."
        />
        <CharacterCounter current={description.length} max={5000} />
      </div>
      
      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateTimePicker
          label="Start Date & Time *"
          required
          onChange={handleStartDate}
        />
        <DateTimePicker
          label="End Date & Time"
          onChange={handleEndDate}
        />
      </div>
      
      {/* Venue Search */}
      <VenueSearchSelector required onSelect={handleVenueSelect} />
    </div>
  );
};

// Step 2: Game Configuration
const GameConfigurationStep = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Game Configuration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Player Type *</label>
          <select required className="w-full p-3 border rounded-lg">
            <option value="">Select format...</option>
            <option value="singles">Singles (1v1)</option>
            <option value="doubles">Doubles (2v2)</option>
            <option value="scotch_doubles">Scotch Doubles (2v2 alternating shot)</option>
          </select>
        </div>
        
        {/* Game Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Game Type *</label>
          <select required className="w-full p-3 border rounded-lg">
            <option value="">Select game...</option>
            <option value="eight_ball">Eight Ball</option>
            <option value="nine_ball">Nine Ball</option>
            <option value="ten_ball">Ten Ball</option>
          </select>
        </div>
        
        {/* Tournament Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Tournament Type *</label>
          <select required className="w-full p-3 border rounded-lg">
            <option value="chip_tournament">Chip Tournament</option>
          </select>
        </div>
        
        {/* Race */}
        <div>
          <label className="block text-sm font-medium mb-2">Race *</label>
          <select required className="w-full p-3 border rounded-lg">
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        
        {/* Estimated Players */}
        <div>
          <label className="block text-sm font-medium mb-2">Estimated Number of Teams *</label>
          <input
            type="number"
            required
            min="4"
            max="128"
            className="w-full p-3 border rounded-lg"
            placeholder="16"
          />
        </div>
        
        {/* Players Per Table */}
        <div>
          <label className="block text-sm font-medium mb-2">Players Per Table *</label>
          <input
            type="number"
            required
            value="4"
            className="w-full p-3 border rounded-lg"
            disabled
          />
          <p className="text-sm text-gray-500 mt-1">
            4 players (2 teams) for Scotch Doubles
          </p>
        </div>
      </div>
      
      {/* Rules & Rating */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Rules *</label>
          <select required className="w-full p-3 border rounded-lg">
            <option value="bca">BCA</option>
            <option value="apa">APA</option>
            <option value="wpa">WPA</option>
            <option value="usapl">USAPL</option>
            <option value="vnea">VNEA</option>
            <option value="local">Local</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Rating System *</label>
          <select required className="w-full p-3 border rounded-lg">
            <option value="none">None</option>
            <option value="fargo_rate">Fargo Rate</option>
            <option value="apa">APA</option>
            <option value="in_house">In-House</option>
          </select>
        </div>
        
        <div className="flex items-center mt-8">
          <input
            type="checkbox"
            id="show_skill_levels"
            className="mr-2"
          />
          <label htmlFor="show_skill_levels" className="text-sm">
            Show skill levels in bracket
          </label>
        </div>
      </div>
    </div>
  );
};

// Step 3: Chip Settings (UNIQUE TO OUR SYSTEM)
const ChipSettingsStep = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">💰 Chip Tournament Settings</h2>
      <p className="text-gray-600">Configure chip distribution and tournament automation</p>
      
      {/* Default Chips */}
      <div>
        <label className="block text-sm font-medium mb-2">Default Chips Per Player *</label>
        <input
          type="number"
          required
          min="10"
          max="1000"
          className="w-full p-3 border rounded-lg"
          placeholder="100"
        />
      </div>
      
      {/* Skill Level Ranges */}
      <ChipDistributionBySkill />
      
      {/* Bracket Ordering */}
      <div>
        <label className="block text-sm font-medium mb-2">Bracket Ordering *</label>
        <select required className="w-full p-3 border rounded-lg">
          <option value="random_draw">Random Draw (Fisher-Yates)</option>
          <option value="seeded_draw">Seeded Draw</option>
          <option value="set_order">Set Order (Manual)</option>
        </select>
      </div>
      
      {/* Autopilot Mode */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">🤖 Autopilot Mode</h3>
            <p className="text-sm text-gray-600">Automatically assign opponents to minimize repeated matchups</p>
          </div>
          <ToggleSwitch
            checked={autopilotMode}
            onChange={setAutopilotMode}
          />
        </div>
        
        {autopilotMode && (
          <div className="mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="random_ordering"
                className="mr-2"
              />
              <label htmlFor="random_ordering" className="text-sm">
                Enable random player ordering each round
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Shuffles teams while still avoiding repeated matchups
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 💰 **CHIP DISTRIBUTION SYSTEM**

```typescript
// Skill-based chip distribution component
const ChipDistributionBySkill = () => {
  const [ranges, setRanges] = useState<ChipRange[]>([
    { minRating: 0, maxRating: 399, chips: 150 },
    { minRating: 400, maxRating: 599, chips: 125 },
    { minRating: 600, maxRating: 799, chips: 100 },
    { minRating: 800, maxRating: 999, chips: 75 }
  ]);
  
  return (
    <div className="bg-yellow-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">⚖️ Chip Distribution by Fargo Rating</h3>
        <button
          onClick={addRange}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
        >
          Add Range
        </button>
      </div>
      
      <div className="space-y-3">
        {ranges.map((range, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={range.minRating}
                onChange={(e) => updateRange(index, 'minRating', parseInt(e.target.value))}
                className="w-20 p-2 border rounded"
                placeholder="Min"
              />
              <span>to</span>
              <input
                type="number"
                value={range.maxRating}
                onChange={(e) => updateRange(index, 'maxRating', parseInt(e.target.value))}
                className="w-20 p-2 border rounded"
                placeholder="Max"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <span>=</span>
              <input
                type="number"
                value={range.chips}
                onChange={(e) => updateRange(index, 'chips', parseInt(e.target.value))}
                className="w-20 p-2 border rounded"
                placeholder="Chips"
              />
              <span>chips</span>
            </div>
            
            <button
              onClick={() => removeRange(index)}
              className="text-red-600 hover:bg-red-100 p-1 rounded"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      
      <ChipDistributionPreview ranges={ranges} />
    </div>
  );
};

// Chip distribution logic
class ChipDistributionCalculator {
  static calculateTeamChips(
    player1FargoRating: number | null,
    player2FargoRating: number | null,
    distributionRules: ChipRange[],
    defaultChips: number
  ): number {
    if (!player1FargoRating || !player2FargoRating) {
      return defaultChips;
    }
    
    // Calculate combined team rating
    const combinedRating = player1FargoRating + player2FargoRating;
    
    // Find matching range
    const matchingRange = distributionRules.find(range => 
      combinedRating >= range.minRating && combinedRating <= range.maxRating
    );
    
    return matchingRange ? matchingRange.chips : defaultChips;
  }
}
```

---

## 🤖 **AUTOPILOT MODE IMPLEMENTATION**

```typescript
// Advanced autopilot system for chip tournaments
class ChipTournamentAutopilot {
  constructor(
    private tournament: Tournament,
    private matchHistory: MatchHistory[]
  ) {}
  
  async assignNextOpponent(
    waitingTeamId: number,
    availableTables: Table[]
  ): Promise<Table | null> {
    const waitingTeam = await this.getTeam(waitingTeamId);
    
    // Filter tables by matchup history
    const eligibleTables = await this.filterEligibleTables(
      waitingTeam,
      availableTables
    );
    
    if (eligibleTables.length === 0) {
      // All teams have played max times - find least recent
      return this.findLeastRecentMatchup(waitingTeam, availableTables);
    }
    
    // Apply tournament settings
    if (this.tournament.randomOrderingEachRound) {
      return this.randomSelect(eligibleTables);
    }
    
    // Round-robin assignment
    return eligibleTables[0];
  }
  
  private async filterEligibleTables(
    waitingTeam: Team,
    tables: Table[]
  ): Promise<Table[]> {
    const eligible: Table[] = [];
    
    for (const table of tables) {
      if (!table.currentTeam) continue;
      
      const matchupCount = await this.getMatchupCount(
        waitingTeam.id,
        table.currentTeam.id
      );
      
      // Avoid teams that have played too many times
      if (matchupCount < this.getMaxMatchupsAllowed()) {
        eligible.push(table);
      }
    }
    
    return eligible;
  }
  
  private getMaxMatchupsAllowed(): number {
    // Calculate based on tournament size and format
    const totalTeams = this.tournament.estimatedPlayers;
    
    if (totalTeams <= 8) return 2;
    if (totalTeams <= 16) return 1;
    return 1; // Large tournaments - avoid repeats initially
  }
  
  private async getMatchupCount(team1Id: number, team2Id: number): Promise<number> {
    return this.matchHistory.filter(match =>
      (match.team1Id === team1Id && match.team2Id === team2Id) ||
      (match.team1Id === team2Id && match.team2Id === team1Id)
    ).length;
  }
}
```

---

## 🏢 **VENUE SEARCH SYSTEM**

```typescript
// Advanced venue search with autocomplete
const VenueSearchSelector = ({ onSelect, required }: VenueSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const searchVenues = useDebouncedCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    
    try {
      const response = await fetch(
        `/api/venues/search?q=${encodeURIComponent(searchQuery)}`
      );
      const venues = await response.json();
      setResults(venues);
    } catch (error) {
      console.error('Venue search failed:', error);
    }
  }, 300);
  
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Venue {required && '*'}
      </label>
      
      {selectedVenue ? (
        <SelectedVenueDisplay
          venue={selectedVenue}
          onEdit={() => setSelectedVenue(null)}
        />
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                searchVenues(e.target.value);
              }}
              className="w-full p-3 border rounded-lg"
              placeholder="Search venues by name or location..."
            />
            
            {results.length > 0 && (
              <VenueSearchResults
                venues={results}
                onSelect={(venue) => {
                  setSelectedVenue(venue);
                  onSelect(venue);
                  setResults([]);
                  setQuery('');
                }}
              />
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-blue-600 hover:underline text-sm"
          >
            Don't see your venue? Add a new one
          </button>
          
          {showForm && (
            <AddNewVenueForm
              onSave={(venue) => {
                setSelectedVenue(venue);
                onSelect(venue);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Add new venue form
const AddNewVenueForm = ({ onSave, onCancel }: AddVenueProps) => {
  const [venueData, setVenueData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    tables: 8
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venueData)
      });
      
      const newVenue = await response.json();
      onSave(newVenue);
    } catch (error) {
      console.error('Failed to create venue:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
      <h3 className="font-semibold">Add New Venue</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          required
          placeholder="Venue name *"
          value={venueData.name}
          onChange={(e) => setVenueData({ ...venueData, name: e.target.value })}
          className="p-3 border rounded-lg"
        />
        
        <input
          type="text"
          placeholder="Phone number"
          value={venueData.phone}
          onChange={(e) => setVenueData({ ...venueData, phone: e.target.value })}
          className="p-3 border rounded-lg"
        />
        
        <input
          type="text"
          placeholder="Street address"
          value={venueData.address}
          onChange={(e) => setVenueData({ ...venueData, address: e.target.value })}
          className="p-3 border rounded-lg md:col-span-2"
        />
        
        <input
          type="text"
          placeholder="City"
          value={venueData.city}
          onChange={(e) => setVenueData({ ...venueData, city: e.target.value })}
          className="p-3 border rounded-lg"
        />
        
        <input
          type="text"
          placeholder="State"
          value={venueData.state}
          onChange={(e) => setVenueData({ ...venueData, state: e.target.value })}
          className="p-3 border rounded-lg"
        />
        
        <input
          type="text"
          placeholder="ZIP Code"
          value={venueData.zipCode}
          onChange={(e) => setVenueData({ ...venueData, zipCode: e.target.value })}
          className="p-3 border rounded-lg"
        />
        
        <input
          type="number"
          min="1"
          placeholder="Number of tables"
          value={venueData.tables}
          onChange={(e) => setVenueData({ ...venueData, tables: parseInt(e.target.value) })}
          className="p-3 border rounded-lg"
        />
      </div>
      
      <div className="flex space-x-2">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Save Venue
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
```

---

## 📊 **ADVANCED PAYOUT SYSTEM**

```typescript
// Comprehensive payout calculation
class PayoutCalculator {
  static calculate(
    tournament: Tournament,
    finalTeamCount: number
  ): PayoutCalculation {
    const totalPot = this.calculateTotalPot(tournament, finalTeamCount);
    const payoutPlaces = this.determinePayoutPlaces(tournament, finalTeamCount);
    const payouts = this.calculatePayoutAmounts(totalPot, payoutPlaces, tournament.payoutStructure);
    
    return {
      totalPot,
      payoutPlaces,
      payouts,
      breakdown: {
        entryFees: tournament.entryFee * finalTeamCount,
        adminFees: tournament.adminFee * finalTeamCount,
        addedMoney: tournament.addedMoney
      }
    };
  }
  
  private static calculateTotalPot(tournament: Tournament, teamCount: number): number {
    return (tournament.entryFee * teamCount) 
      - (tournament.adminFee * teamCount)
      + tournament.addedMoney;
  }
  
  private static determinePayoutPlaces(tournament: Tournament, teamCount: number): number {
    if (tournament.payoutType === 'places') {
      return this.getPlacesByStructure(tournament.payoutStructure, teamCount);
    }
    
    // Percentage type
    const percentage = this.extractPercentage(tournament.payoutStructure);
    return Math.max(1, Math.round((percentage / 100) * teamCount));
  }
  
  private static getPlacesByStructure(structure: string, teamCount: number): number {
    const structureMap = {
      'Winner Take All': 1,
      'Top 2 Places': 2,
      'Top 3 Places': 3,
      'Top 4 Places': 4,
      'Top 6 Places': 6,
      'Top 8 Places': 8
    };
    
    // Auto-select based on team count if not custom
    if (structure === 'auto') {
      if (teamCount <= 4) return 1;
      if (teamCount <= 8) return 2;
      if (teamCount <= 16) return 3;
      if (teamCount <= 24) return 4;
      if (teamCount <= 31) return 6;
      return 8;
    }
    
    return structureMap[structure] || 1;
  }
  
  private static calculatePayoutAmounts(
    totalPot: number,
    places: number,
    customStructure?: any
  ): PayoutEntry[] {
    // Use custom structure if provided
    if (customStructure && customStructure.custom) {
      return customStructure.payouts.map((payout, index) => ({
        place: index + 1,
        amount: Math.round((payout.percentage / 100) * totalPot * 100) / 100,
        percentage: payout.percentage
      }));
    }
    
    // Standard payout percentages
    const standardPercentages = {
      1: [100],
      2: [65, 35],
      3: [50, 30, 20],
      4: [40, 25, 20, 15],
      6: [30, 20, 15, 12, 12, 11],
      8: [25, 18, 15, 12, 10, 8, 7, 5]
    };
    
    const percentages = standardPercentages[places] || [100];
    
    return percentages.map((percentage, index) => ({
      place: index + 1,
      amount: Math.round((percentage / 100) * totalPot * 100) / 100,
      percentage
    }));
  }
}

// Payout configuration component
const PayoutConfiguration = () => {
  const [payoutType, setPayoutType] = useState<'places' | 'percentage'>('places');
  const [structure, setStructure] = useState('auto');
  const [customPayouts, setCustomPayouts] = useState<CustomPayout[]>([]);
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">💰 Payout Configuration</h3>
      
      {/* Payout Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-3">Payout Type</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="places"
              checked={payoutType === 'places'}
              onChange={(e) => setPayoutType(e.target.value as 'places')}
              className="mr-2"
            />
            Fixed Places
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="percentage"
              checked={payoutType === 'percentage'}
              onChange={(e) => setPayoutType(e.target.value as 'percentage')}
              className="mr-2"
            />
            Percentage of Field
          </label>
        </div>
      </div>
      
      {/* Structure Selection */}
      {payoutType === 'places' ? (
        <PlacesPayoutStructure value={structure} onChange={setStructure} />
      ) : (
        <PercentagePayoutStructure value={structure} onChange={setStructure} />
      )}
      
      {/* Custom Payout Editor */}
      {structure === 'custom' && (
        <CustomPayoutEditor
          payouts={customPayouts}
          onChange={setCustomPayouts}
        />
      )}
      
      {/* Payout Preview */}
      <PayoutPreview
        payoutType={payoutType}
        structure={structure}
        customPayouts={customPayouts}
        estimatedTeams={16} // From form data
        entryFee={50} // From form data
        adminFee={5} // From form data
        addedMoney={100} // From form data
      />
    </div>
  );
};
```

---

## 🎯 **IMPLEMENTATION TIMELINE**

### **Phase 1: Core Tournament System (Week 1-2)**
- ✅ Tournament creation wizard with ALL CSV fields
- ✅ Database schema implementation
- ✅ Venue search and management system
- ✅ Basic tournament CRUD operations

### **Phase 2: Chip Tournament Features (Week 2-3)**
- ✅ Chip distribution by skill level
- ✅ Autopilot mode implementation
- ✅ Match history tracking
- ✅ Chip transfer system

### **Phase 3: Advanced Features (Week 3-4)**
- ✅ Tournament template system
- ✅ Advanced payout calculations
- ✅ Side pots functionality
- ✅ Access controls and permissions

### **Phase 4: Integration & Polish (Week 4-5)**
- ✅ Fargo rating integration
- ✅ Real-time updates with Socket.IO
- ✅ Mobile optimization
- ✅ Testing and bug fixes

---

## 🏆 **COMPETITIVE ADVANTAGES**

### **vs DigitalPool**

| Feature | DigitalPool | Our System | Advantage |
|---------|-------------|------------|-----------|
| **Chip Tournaments** | ❌ Not supported | ✅ Fully specialized | **GAME CHANGER** |
| **Autopilot Mode** | ❌ Basic mention only | ✅ Smart matchup algorithm | **SUPERIOR** |
| **Venue Search** | ❌ None found | ✅ Full search & add system | **BETTER UX** |
| **Skill-based Chips** | ❌ None | ✅ Fargo-based distribution | **INNOVATIVE** |
| **Payout Calculations** | ❌ Basic | ✅ Advanced with previews | **PROFESSIONAL** |
| **Template System** | ❌ None | ✅ Save & reuse tournaments | **TIME SAVER** |
| **Players Per Table** | ❌ Not configurable | ✅ Chip tournament optimized | **SPECIALIZED** |

---

## 🚀 **READY TO BUILD**

This implementation plan addresses **every single requirement** from your CSV while building upon the gaps we found in DigitalPool. We're creating the **first truly specialized chip tournament management system** with features that don't exist anywhere else.

**Key Innovations:**
1. **🤖 Smart Autopilot** - Automatically prevents repeated matchups
2. **⚖️ Skill-based Chip Distribution** - Fair play through Fargo integration  
3. **🏢 Advanced Venue Management** - Search existing or add new venues
4. **💰 Professional Payouts** - Flexible calculations with live previews
5. **📝 Tournament Templates** - Save and reuse configurations
6. **📱 Mobile-First Design** - Works perfectly on all devices

**Next Step: Start coding Phase 1!** 🎯

*Would you like me to begin implementing the tournament creation wizard and database schema?*