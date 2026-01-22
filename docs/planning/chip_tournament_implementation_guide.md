# CHIP TOURNAMENT IMPLEMENTATION GUIDE
*Based on DigitalPool analysis and our specific requirements*

## 🎯 TOURNAMENT SETTINGS DATABASE SCHEMA

```sql
-- Core tournament table based on CSV requirements
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, -- URL-friendly version
    description TEXT CHECK (LENGTH(description) <= 5000),
    start_date_time TIMESTAMP NOT NULL,
    end_date_time TIMESTAMP,
    venue_id INT REFERENCES venues(id),
    player_type player_type_enum DEFAULT 'scotch_doubles',
    game_type game_type_enum DEFAULT 'nine_ball',
    tournament_type tournament_type_enum DEFAULT 'chip_tournament',
    race INTEGER CHECK (race BETWEEN 1 AND 10) DEFAULT 1,
    estimated_players INTEGER NOT NULL,
    players_per_table INTEGER DEFAULT 4,
    default_chips_per_player INTEGER,
    chip_distribution_rules JSONB, -- Skill level ranges
    bracket_ordering bracket_ordering_enum DEFAULT 'random_draw',
    autopilot_mode BOOLEAN DEFAULT false,
    random_ordering_each_round BOOLEAN DEFAULT false,
    rules rules_enum DEFAULT 'bca',
    rating_system rating_system_enum DEFAULT 'fargo_rate',
    show_skill_levels BOOLEAN DEFAULT true,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    admin_fee DECIMAL(10,2) DEFAULT 0,
    added_money DECIMAL(10,2) DEFAULT 0,
    payout_type payout_type_enum DEFAULT 'places',
    payout_structure JSONB,
    access_type access_type_enum DEFAULT 'public',
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enums for tournament settings
CREATE TYPE player_type_enum AS ENUM ('singles', 'doubles', 'scotch_doubles');
CREATE TYPE game_type_enum AS ENUM ('eight_ball', 'nine_ball', 'ten_ball');
CREATE TYPE tournament_type_enum AS ENUM ('chip_tournament');
CREATE TYPE bracket_ordering_enum AS ENUM ('random_draw', 'seeded_draw', 'set_order');
CREATE TYPE rules_enum AS ENUM ('bca', 'apa', 'wpa', 'usapl', 'vnea', 'local');
CREATE TYPE rating_system_enum AS ENUM ('none', 'fargo_rate', 'apa', 'in_house');
CREATE TYPE payout_type_enum AS ENUM ('places', 'percentage');
CREATE TYPE access_type_enum AS ENUM ('public', 'private');
```

## 💰 CHIP MANAGEMENT SYSTEM

```sql
-- Chip tracking for teams
CREATE TABLE team_chips (
    id SERIAL PRIMARY KEY,
    tournament_id INT REFERENCES tournaments(id),
    team_id INT REFERENCES teams(id),
    current_chips INTEGER NOT NULL,
    starting_chips INTEGER NOT NULL,
    total_won INTEGER DEFAULT 0,
    total_lost INTEGER DEFAULT 0,
    elimination_order INTEGER,
    eliminated_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Chip transfer history
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

CREATE TYPE transfer_type_enum AS ENUM ('match_win', 'elimination', 'manual_adjustment');
```

## 🎯 AUTOPILOT MODE IMPLEMENTATION

```typescript
// Autopilot mode for chip tournaments
interface AutopilotConfig {
  enabled: boolean;
  randomOrderingEachRound: boolean;
  avoidRepeatedMatchups: boolean;
  maxMatchupsPerPair: number;
}

class ChipTournamentAutopilot {
  constructor(
    private tournament: Tournament,
    private config: AutopilotConfig
  ) {}

  assignNextOpponent(waitingTeam: Team, availableTables: Table[]): Table | null {
    const eligibleTables = availableTables.filter(table => {
      const opponentTeam = table.currentTeam;
      if (!opponentTeam) return false;
      
      // Check matchup history
      const previousMatchups = this.getMatchupHistory(waitingTeam, opponentTeam);
      
      if (this.config.avoidRepeatedMatchups) {
        return previousMatchups.length < this.config.maxMatchupsPerPair;
      }
      
      return true;
    });

    if (eligibleTables.length === 0) {
      // All teams have played each other max times
      // Assign to table with least recent matchup
      return this.findLeastRecentMatchup(waitingTeam, availableTables);
    }

    // Random selection from eligible tables
    if (this.config.randomOrderingEachRound) {
      return this.randomSelect(eligibleTables);
    }

    // Round-robin selection
    return eligibleTables[0];
  }
}
```

## 🏢 VENUE INTEGRATION

```typescript
// Venue search and integration
interface VenueSearchResult {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  tables: number;
}

const VenueSelector = ({ onSelect }: { onSelect: (venue: VenueSearchResult) => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VenueSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchVenues = useDebouncedCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/venues/search?q=${encodeURIComponent(searchQuery)}`);
      const venues = await response.json();
      setResults(venues);
    } catch (error) {
      console.error('Venue search failed:', error);
    } finally {
      setLoading(false);
    }
  }, 300);

  return (
    <div className='relative'>
      <input
        type='text'
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          searchVenues(e.target.value);
        }}
        placeholder='Search venues...'
        className='w-full p-3 border rounded-lg'
      />
      
      {results.length > 0 && (
        <div className='absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg'>
          {results.map(venue => (
            <button
              key={venue.id}
              onClick={() => onSelect(venue)}
              className='w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0'
            >
              <div className='font-semibold'>{venue.name}</div>
              <div className='text-sm text-gray-600'>{venue.address}</div>
              <div className='text-xs text-blue-600'>{venue.tables} tables</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 📊 PAYOUT CALCULATION SYSTEM

```typescript
// Payout calculation based on tournament settings
interface PayoutCalculation {
  totalPot: number;
  payouts: Array<{
    place: number;
    amount: number;
    percentage: number;
  }>;
}

class PayoutCalculator {
  static calculate(tournament: Tournament, entrantCount: number): PayoutCalculation {
    // Calculate total pot
    const totalPot = (tournament.entryFee * entrantCount) 
      - (tournament.adminFee * entrantCount)
      + tournament.addedMoney;

    let payoutPlaces: number;

    if (tournament.payoutType === 'places') {
      payoutPlaces = this.getPayoutPlacesByStructure(tournament.payoutStructure, entrantCount);
    } else {
      // Percentage type
      const percentage = parseFloat(tournament.payoutStructure.replace('%', ''));
      payoutPlaces = Math.round((percentage / 100) * entrantCount);
    }

    const payouts = this.calculatePayoutAmounts(totalPot, payoutPlaces);

    return { totalPot, payouts };
  }

  private static getPayoutPlacesByStructure(structure: string, entrants: number): number {
    const placeMap = {
      'Winner Take All': 1,
      'Top 2 Places': 2,
      'Top 3 Places': 3,
      'Top 4 Places': 4,
      'Top 6 Places': 6,
      'Top 8 Places': 8
    };

    return placeMap[structure] || 1;
  }

  private static calculatePayoutAmounts(totalPot: number, places: number) {
    // Standard payout percentages
    const percentages = {
      1: [100],
      2: [70, 30],
      3: [50, 30, 20],
      4: [40, 30, 20, 10],
      6: [35, 25, 15, 10, 8, 7],
      8: [30, 20, 15, 10, 8, 7, 5, 5]
    };

    const payoutPercentages = percentages[places] || [100];

    return payoutPercentages.map((percentage, index) => ({
      place: index + 1,
      amount: Math.round((percentage / 100) * totalPot * 100) / 100,
      percentage
    }));
  }
}
```

## 🔧 TOURNAMENT TEMPLATE SYSTEM

```typescript
// Tournament template management
interface TournamentTemplate {
  id: number;
  name: string;
  userId: number;
  settings: Partial<TournamentSettings>;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSelector = ({ onApply }: { onApply: (template: TournamentTemplate) => void }) => {
  const { user } = useAuth();
  const { templates, loading } = useUserTemplates(user.id);

  if (loading) return <LoadingSpinner />;

  return (
    <div className='space-y-4'>
      <h3 className='font-semibold'>Apply Tournament Template</h3>
      
      {templates.length === 0 ? (
        <p className='text-gray-500'>No saved templates</p>
      ) : (
        <div className='space-y-2'>
          {templates.map(template => (
            <div key={template.id} className='flex items-center justify-between p-3 border rounded'>
              <div>
                <div className='font-medium'>{template.name}</div>
                <div className='text-sm text-gray-500'>
                  {formatDistance(template.updatedAt, new Date(), { addSuffix: true })}
                </div>
              </div>
              <button
                onClick={() => onApply(template)}
                className='bg-blue-600 text-white px-3 py-1 rounded text-sm'
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 🎯 IMPLEMENTATION PRIORITIES

### Phase 1: Core Tournament Settings (Week 1)
- ✅ Tournament creation form with all required fields
- ✅ Venue search and integration
- ✅ Basic chip distribution settings
- ✅ Payout calculation system

### Phase 2: Chip Tournament Logic (Week 2)
- ✅ Autopilot mode implementation
- ✅ Chip tracking and transfer system
- ✅ Scotch Doubles specific features
- ✅ Match history and repeated matchup avoidance

### Phase 3: Advanced Features (Week 3)
- ✅ Tournament template system
- ✅ Fargo rating integration for chip distribution
- ✅ Side pots functionality
- ✅ Access controls and privacy settings

## ✅ DIGITALPOOL GAPS ADDRESSED

1. **❌ No Chip Tournament Support** → ✅ Full chip management system
2. **❌ No Autopilot Mode** → ✅ Smart opponent assignment
3. **❌ Basic Venue Selection** → ✅ Searchable venue database
4. **❌ Limited Payout Options** → ✅ Flexible payout calculations
5. **❌ No Fargo Integration** → ✅ Skill-based chip distribution
6. **❌ No Template System** → ✅ Reusable tournament templates

---

**🎯 Ready to build the most comprehensive chip tournament management system!**