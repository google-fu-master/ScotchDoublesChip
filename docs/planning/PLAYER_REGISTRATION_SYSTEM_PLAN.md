# 🎯 PLAYER REGISTRATION & TEAM FORMATION SYSTEM

## Comprehensive Implementation Plan

---

## 📱 **PLAYER AUTHENTICATION SYSTEM**

### **Phone-Based Authentication with SMS OTP**

```typescript
// Authentication schema
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL, -- Primary login identifier
    email VARCHAR(255), -- Optional, for notifications
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50), -- Optional display name
    fargo_player_id VARCHAR(50) UNIQUE, -- Links to FargoRate profile
    current_fargo_rating INTEGER, -- Cached for quick access
    fargo_last_updated TIMESTAMP,
    notification_preferences JSONB DEFAULT '{
        "sms": true,
        "email": true, 
        "push": true,
        "partner_unregistered": true,
        "tournament_reminders": true
    }',
    account_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SMS OTP verification
CREATE TABLE sms_verifications (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    purpose VARCHAR(20) NOT NULL, -- 'login' or 'verify'
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Player sessions
CREATE TABLE player_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id INT REFERENCES players(id) ON DELETE CASCADE,
    device_info JSONB,
    last_accessed TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    active BOOLEAN DEFAULT true
);
```

### **SMS Authentication Flow**

```typescript
// SMS OTP authentication component
const PhoneAuth = () => {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formatPhoneNumber(phone) })
      });
      
      setStep('code');
      toast.success('Verification code sent!');
    } catch (error) {
      toast.error('Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formatPhoneNumber(phone), code })
      });

      const result = await response.json();
      
      if (result.success) {
        if (result.isNewUser) {
          // Redirect to profile setup
          router.push('/profile/setup');
        } else {
          // Redirect to dashboard
          router.push('/dashboard');
        }
      } else {
        toast.error('Invalid code. Please try again.');
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">🎱 Tournament Login</h1>
        <p className="text-gray-600">Enter your phone number to continue</p>
      </div>

      {step === 'phone' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full p-3 border rounded-lg text-lg"
              autoFocus
            />
          </div>
          
          <button
            onClick={sendCode}
            disabled={!phone || loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
          
          <p className="text-xs text-gray-500 text-center">
            You'll receive a 6-digit code via SMS
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full p-3 border rounded-lg text-lg text-center tracking-wider"
              autoFocus
              maxLength={6}
            />
          </div>
          
          <button
            onClick={verifyCode}
            disabled={code.length !== 6 || loading}
            className="w-full bg-green-600 text-white p-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
          
          <div className="text-center">
            <button
              onClick={() => setStep('phone')}
              className="text-blue-600 hover:underline text-sm"
            >
              Use different phone number
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 👤 **PLAYER PROFILE SETUP**

### **Fargo Integration & Profile Creation**

```typescript
// Player profile setup component
const PlayerProfileSetup = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    fargoPlayerId: '',
    skipFargo: false
  });
  const [fargoSearchResults, setFargoSearchResults] = useState<FargoPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const searchFargoProfiles = useDebouncedCallback(async (query: string) => {
    if (query.length < 3) {
      setFargoSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Search FargoRate profiles
      const response = await fetch(`/api/fargo/search?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      setFargoSearchResults(results);
    } catch (error) {
      console.error('Fargo search failed:', error);
    } finally {
      setLoading(false);
    }
  }, 500);

  const selectFargoProfile = async (fargoPlayer: FargoPlayer) => {
    // Check if profile already linked to another account
    const response = await fetch(`/api/players/check-fargo/${fargoPlayer.id}`);
    const { available } = await response.json();

    if (!available) {
      toast.error('This Fargo profile is already linked to another account.');
      return;
    }

    setProfileData({
      ...profileData,
      fargoPlayerId: fargoPlayer.id,
      firstName: fargoPlayer.firstName,
      lastName: fargoPlayer.lastName
    });
    setFargoSearchResults([]);
    setSearchQuery(fargoPlayer.name);
  };

  const completeSetup = async () => {
    try {
      const response = await fetch('/api/players/complete-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        router.push('/dashboard');
        toast.success('Profile setup complete!');
      }
    } catch (error) {
      toast.error('Setup failed. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">🎱 Complete Your Profile</h1>

        <div className="space-y-6">
          {/* Fargo Profile Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Find Your Fargo Profile</label>
            <p className="text-sm text-gray-600 mb-3">
              Search for your existing FargoRate profile to link it to your account
            </p>
            
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchFargoProfiles(e.target.value);
                }}
                placeholder="Search by name (e.g., John Smith)"
                className="w-full p-3 border rounded-lg"
                disabled={profileData.skipFargo}
              />
              
              {loading && (
                <div className="absolute right-3 top-3">
                  <LoadingSpinner size="sm" />
                </div>
              )}
              
              {fargoSearchResults.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                  {fargoSearchResults.map(player => (
                    <button
                      key={player.id}
                      onClick={() => selectFargoProfile(player)}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="font-medium">{player.name}</div>
                      <div className="text-sm text-gray-600">
                        Rating: {player.rating} | Location: {player.location}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profileData.skipFargo}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    skipFargo: e.target.checked,
                    fargoPlayerId: e.target.checked ? '' : profileData.fargoPlayerId
                  })}
                  className="mr-2"
                />
                <span className="text-sm">I don't have a Fargo profile (TD will assign rating)</span>
              </label>
            </div>
          </div>

          {/* Manual Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <input
                type="text"
                required
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                className="w-full p-3 border rounded-lg"
                disabled={!!profileData.fargoPlayerId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Last Name *</label>
              <input
                type="text"
                required
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                className="w-full p-3 border rounded-lg"
                disabled={!!profileData.fargoPlayerId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nickname (Optional)</label>
              <input
                type="text"
                value={profileData.nickname}
                onChange={(e) => setProfileData({ ...profileData, nickname: e.target.value })}
                placeholder="How you want to appear on brackets"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email (Optional)</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="For tournament notifications"
                className="w-full p-3 border rounded-lg"
              />
            </div>
          </div>

          {/* Selected Fargo Profile Display */}
          {profileData.fargoPlayerId && (
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-green-800">
                    ✅ Fargo Profile Linked
                  </div>
                  <div className="text-sm text-green-600">
                    {profileData.firstName} {profileData.lastName} - Rating: {getCurrentFargoRating(profileData.fargoPlayerId)}
                  </div>
                </div>
                <button
                  onClick={() => setProfileData({ ...profileData, fargoPlayerId: '', firstName: '', lastName: '' })}
                  className="text-red-600 hover:bg-red-100 p-1 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Notification Preferences */}
          <NotificationPreferences 
            preferences={profileData.notificationPreferences}
            onChange={(prefs) => setProfileData({ ...profileData, notificationPreferences: prefs })}
          />

          <button
            onClick={completeSetup}
            disabled={!profileData.firstName || !profileData.lastName}
            className="w-full bg-blue-600 text-white p-4 rounded-lg text-lg font-medium disabled:opacity-50"
          >
            Complete Profile Setup
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🗓️ **TOURNAMENT DISCOVERY & REGISTRATION**

### **Date-Based Tournament Selection**

```typescript
// Tournament discovery interface
const TournamentDiscovery = () => {
  const { player } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTournamentsForDate = async (date: Date) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/tournaments/search?date=${date.toISOString().split('T')[0]}`
      );
      const data = await response.json();
      setTournaments(data);
    } catch (error) {
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournamentsForDate(selectedDate);
  }, [selectedDate]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">🎱 Tournament Registration</h1>

      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Select Tournament Date</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <DatePicker
              selected={selectedDate}
              onChange={setSelectedDate}
              minDate={new Date()}
              maxDate={addMonths(new Date(), 3)}
              className="w-full p-3 border rounded-lg"
              dateFormat="MMMM d, yyyy"
            />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Quick Select:</div>
            <div className="flex flex-wrap gap-2">
              <QuickDateButton 
                label="Next Friday"
                date={getNextFriday()}
                onClick={setSelectedDate}
                active={isSameDay(selectedDate, getNextFriday())}
              />
              <QuickDateButton 
                label="This Friday"
                date={getThisFriday()}
                onClick={setSelectedDate}
                active={isSameDay(selectedDate, getThisFriday())}
                disabled={isPast(getThisFriday())}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tournament List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            Available Tournaments for {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          {loading && <LoadingSpinner />}
        </div>

        {tournaments.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <div className="text-gray-500">
              {loading ? 'Loading tournaments...' : 'No tournaments available for this date'}
            </div>
            {!loading && (
              <p className="text-sm text-gray-400 mt-2">
                Check back later or try a different date
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tournaments.map(tournament => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                player={player}
                onRegister={() => handleRegister(tournament)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Tournament card component
const TournamentCard = ({ tournament, player, onRegister }: TournamentCardProps) => {
  const isRegistered = tournament.registrations?.some(reg => 
    reg.player1Id === player.id || reg.player2Id === player.id
  );
  
  const spotsRemaining = tournament.maxTeams - (tournament.registrations?.length || 0);
  const isRegistrationClosed = spotsRemaining <= 0 || isPast(tournament.registrationDeadline);

  return (
    <div className="bg-white border rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">{tournament.name}</h3>
            <p className="text-gray-600">{tournament.venue?.name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ${tournament.entryFee}
            </div>
            <div className="text-sm text-gray-500">entry fee</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>📅 Start Time:</span>
            <span>{format(tournament.startDateTime, 'h:mm a')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>🎮 Format:</span>
            <span>{formatPlayerType(tournament.playerType)} {tournament.gameType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>🏆 Race:</span>
            <span>Race to {tournament.race}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>👥 Teams:</span>
            <span>
              {tournament.registrations?.length || 0} / {tournament.maxTeams}
              <span className="text-green-600 ml-1">
                ({spotsRemaining} spots left)
              </span>
            </span>
          </div>
        </div>

        {tournament.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {tournament.description}
          </p>
        )}

        <div className="flex space-x-2">
          {isRegistered ? (
            <div className="flex-1 space-y-2">
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded text-center font-medium">
                ✅ Registered
              </div>
              <button
                onClick={() => handleUnregister(tournament)}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Withdraw Registration
              </button>
            </div>
          ) : (
            <button
              onClick={onRegister}
              disabled={isRegistrationClosed}
              className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistrationClosed ? 'Registration Closed' : 'Register Team'}
            </button>
          )}
          
          <button
            onClick={() => viewTournamentDetails(tournament)}
            className="bg-gray-200 text-gray-700 px-4 py-3 rounded hover:bg-gray-300"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 👥 **TEAM REGISTRATION SYSTEM**

### **Partner Search & Team Formation**

```typescript
// Team registration component
const TeamRegistration = ({ tournament }: { tournament: Tournament }) => {
  const { player } = useAuth();
  const [partner, setPartner] = useState<Player | null>(null);
  const [partnerSearch, setPartnerSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [teamChips, setTeamChips] = useState<number>(tournament.defaultChipsPerPlayer);
  const [loading, setLoading] = useState(false);

  // Auto-populate player 1 info
  const player1Display = formatPlayerDisplay(player);

  const searchPartners = useDebouncedCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      
      // Exclude current player and already registered players
      const filteredResults = results.filter((p: Player) => 
        p.id !== player.id && 
        !tournament.registrations?.some(reg => 
          reg.player1Id === p.id || reg.player2Id === p.id
        )
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Partner search failed:', error);
    }
  }, 300);

  const selectPartner = (selectedPlayer: Player) => {
    setPartner(selectedPlayer);
    setPartnerSearch('');
    setSearchResults([]);
    
    // Calculate team chips based on combined Fargo ratings
    calculateTeamChips(player, selectedPlayer);
  };

  const calculateTeamChips = async (p1: Player, p2: Player) => {
    if (!p1.currentFargoRating || !p2.currentFargoRating) {
      setTeamChips(tournament.defaultChipsPerPlayer);
      return;
    }

    const combinedRating = p1.currentFargoRating + p2.currentFargoRating;
    
    // Find matching chip distribution range
    const distributionRules = tournament.chipDistributionRules as ChipDistributionRule[];
    const matchingRule = distributionRules?.find(rule =>
      combinedRating >= rule.minRating && combinedRating <= rule.maxRating
    );

    const chips = matchingRule ? matchingRule.chips : tournament.defaultChipsPerPlayer;
    setTeamChips(chips);
  };

  const registerTeam = async () => {
    if (!partner) {
      toast.error('Please select a partner');
      return;
    }

    // Double-check for existing registrations
    const existingRegistration = await checkExistingRegistration(
      tournament.id,
      player.id,
      partner.id
    );

    if (existingRegistration.exists) {
      toast.error(existingRegistration.message);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/tournaments/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId: tournament.id,
          player1Id: player.id,
          player2Id: partner.id,
          teamChips
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Team registered successfully!');
        router.push('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          🎱 Register for {tournament.name}
        </h1>

        {/* Tournament Info Summary */}
        <div className="bg-blue-50 p-4 rounded-lg mb-8">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Date:</strong> {format(tournament.startDateTime, 'PPP')}</div>
            <div><strong>Time:</strong> {format(tournament.startDateTime, 'p')}</div>
            <div><strong>Venue:</strong> {tournament.venue?.name}</div>
            <div><strong>Entry Fee:</strong> ${tournament.entryFee}</div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Player 1 (Current User) */}
          <div>
            <label className="block text-sm font-medium mb-2">Player 1 (You)</label>
            <div className="p-3 bg-gray-50 border rounded-lg">
              <div className="font-medium">{player1Display}</div>
              {player.currentFargoRating && (
                <div className="text-sm text-gray-600">
                  Fargo Rating: {player.currentFargoRating}
                </div>
              )}
            </div>
          </div>

          {/* Player 2 (Partner Search) */}
          <div>
            <label className="block text-sm font-medium mb-2">Partner (Player 2)</label>
            {partner ? (
              <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{formatPlayerDisplay(partner)}</div>
                    {partner.currentFargoRating && (
                      <div className="text-sm text-gray-600">
                        Fargo Rating: {partner.currentFargoRating}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setPartner(null)}
                    className="text-red-600 hover:bg-red-100 p-1 rounded"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={partnerSearch}
                  onChange={(e) => {
                    setPartnerSearch(e.target.value);
                    searchPartners(e.target.value);
                  }}
                  placeholder="Search for your partner by name..."
                  className="w-full p-3 border rounded-lg"
                />

                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map(p => (
                      <button
                        key={p.id}
                        onClick={() => selectPartner(p)}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium">{formatPlayerDisplay(p)}</div>
                        {p.currentFargoRating && (
                          <div className="text-sm text-gray-600">
                            Fargo Rating: {p.currentFargoRating}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Team Chip Calculation */}
          {partner && (
            <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
              <h3 className="font-semibold mb-2">💰 Team Chip Allocation</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Your Rating:</span>
                  <span>{player.currentFargoRating || 'Not Set'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Partner Rating:</span>
                  <span>{partner.currentFargoRating || 'Not Set'}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Combined Rating:</span>
                    <span>
                      {(player.currentFargoRating || 0) + (partner.currentFargoRating || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-green-600">
                    <span>Starting Chips:</span>
                    <span>{teamChips} 🪙</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Registration Button */}
          <button
            onClick={registerTeam}
            disabled={!partner || loading}
            className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : `Register Team - $${tournament.entryFee}`}
          </button>

          {/* Registration Rules */}
          <div className="text-xs text-gray-500 text-center">
            <p>• Registration can be withdrawn until tournament starts</p>
            <p>• Both players will be notified of registration status</p>
            <p>• Entry fee will be collected at the venue</p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 📱 **NOTIFICATION SYSTEM**

### **Multi-Channel Notifications**

```typescript
// Notification system implementation
interface NotificationPreferences {
  sms: boolean;
  email: boolean;
  push: boolean;
  partnerUnregistered: boolean;
  tournamentReminders: boolean;
  matchUpdates: boolean;
}

class NotificationService {
  static async sendPartnerUnregisteredNotification(
    playerId: number,
    tournament: Tournament,
    partnerName: string
  ) {
    const player = await this.getPlayer(playerId);
    const preferences = player.notificationPreferences as NotificationPreferences;

    const message = {
      title: '🚨 Tournament Registration Alert',
      body: `${partnerName} has withdrawn from ${tournament.name}. Your registration has been cancelled.`,
      data: { tournamentId: tournament.id, type: 'partner_unregistered' }
    };

    // Send via enabled channels
    if (preferences.sms && preferences.partnerUnregistered) {
      await this.sendSMS(player.phone, message.body);
    }

    if (preferences.email && preferences.partnerUnregistered && player.email) {
      await this.sendEmail(player.email, message.title, this.formatEmailTemplate(message, tournament));
    }

    if (preferences.push && preferences.partnerUnregistered) {
      await this.sendPushNotification(playerId, message);
    }
  }

  static async sendTournamentReminder(tournamentId: number) {
    const tournament = await this.getTournament(tournamentId);
    const registrations = await this.getTournamentRegistrations(tournamentId);

    for (const registration of registrations) {
      const players = [registration.player1, registration.player2];
      
      for (const player of players) {
        const preferences = player.notificationPreferences as NotificationPreferences;
        
        if (!preferences.tournamentReminders) continue;

        const message = {
          title: '🎱 Tournament Starting Soon',
          body: `${tournament.name} starts in 2 hours at ${tournament.venue?.name}`,
          data: { tournamentId: tournament.id, type: 'tournament_reminder' }
        };

        if (preferences.sms) {
          await this.sendSMS(player.phone, message.body);
        }

        if (preferences.push) {
          await this.sendPushNotification(player.id, message);
        }
      }
    }
  }

  private static async sendSMS(phone: string, message: string) {
    try {
      // Implement SMS service (Twilio, AWS SNS, etc.)
      await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
      });
    } catch (error) {
      console.error('SMS notification failed:', error);
    }
  }

  private static async sendEmail(email: string, subject: string, html: string) {
    try {
      // Implement email service (SendGrid, AWS SES, etc.)
      await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, html })
      });
    } catch (error) {
      console.error('Email notification failed:', error);
    }
  }

  private static async sendPushNotification(playerId: number, message: any) {
    try {
      // Implement push notification service (Firebase, Apple Push, etc.)
      await fetch('/api/notifications/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, message })
      });
    } catch (error) {
      console.error('Push notification failed:', error);
    }
  }
}

// Notification preferences component
const NotificationSettings = () => {
  const { player } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    player.notificationPreferences || {
      sms: true,
      email: true,
      push: true,
      partnerUnregistered: true,
      tournamentReminders: true,
      matchUpdates: true
    }
  );

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await fetch('/api/players/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences)
      });
      
      setPreferences(newPreferences);
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">📱 Notification Settings</h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Delivery Methods</h3>
          <div className="space-y-2">
            <NotificationToggle
              label="📱 SMS Text Messages"
              enabled={preferences.sms}
              onChange={(enabled) => updatePreferences({ ...preferences, sms: enabled })}
            />
            <NotificationToggle
              label="📧 Email"
              enabled={preferences.email}
              onChange={(enabled) => updatePreferences({ ...preferences, email: enabled })}
            />
            <NotificationToggle
              label="🔔 Push Notifications"
              enabled={preferences.push}
              onChange={(enabled) => updatePreferences({ ...preferences, push: enabled })}
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Notification Types</h3>
          <div className="space-y-2">
            <NotificationToggle
              label="🚨 Partner Registration Changes"
              description="When your tournament partner registers or withdraws"
              enabled={preferences.partnerUnregistered}
              onChange={(enabled) => updatePreferences({ ...preferences, partnerUnregistered: enabled })}
            />
            <NotificationToggle
              label="⏰ Tournament Reminders"
              description="Reminders before tournaments start"
              enabled={preferences.tournamentReminders}
              onChange={(enabled) => updatePreferences({ ...preferences, tournamentReminders: enabled })}
            />
            <NotificationToggle
              label="🎮 Match Updates"
              description="When your matches are scheduled or completed"
              enabled={preferences.matchUpdates}
              onChange={(enabled) => updatePreferences({ ...preferences, matchUpdates: enabled })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔒 **REGISTRATION VALIDATION & SECURITY**

### **Duplicate Registration Prevention**

```typescript
// Registration validation service
class RegistrationValidator {
  static async validateTeamRegistration(
    tournamentId: number,
    player1Id: number,
    player2Id: number
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    
    // Check if tournament exists and is open
    const tournament = await this.getTournament(tournamentId);
    if (!tournament) {
      errors.push('Tournament not found');
      return { valid: false, errors };
    }

    if (isPast(tournament.registrationDeadline)) {
      errors.push('Registration deadline has passed');
    }

    if (tournament.registrations.length >= tournament.maxTeams) {
      errors.push('Tournament is full');
    }

    // Check for duplicate player registrations
    const existingRegistrations = await this.getExistingRegistrations(tournamentId);
    
    for (const registration of existingRegistrations) {
      if (registration.player1Id === player1Id || registration.player2Id === player1Id) {
        errors.push(`You are already registered for this tournament`);
        break;
      }
      
      if (registration.player1Id === player2Id || registration.player2Id === player2Id) {
        const partnerName = await this.getPlayerName(player2Id);
        errors.push(`${partnerName} is already registered for this tournament`);
        break;
      }
    }

    // Validate player pairing (can't play with yourself)
    if (player1Id === player2Id) {
      errors.push('You cannot register with yourself as a partner');
    }

    // Check if both players exist and are verified
    const [player1, player2] = await Promise.all([
      this.getPlayer(player1Id),
      this.getPlayer(player2Id)
    ]);

    if (!player1?.accountVerified) {
      errors.push('Your account is not verified');
    }

    if (!player2?.accountVerified) {
      const partnerName = this.formatPlayerName(player2);
      errors.push(`${partnerName}'s account is not verified`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static async validateUnregistration(
    tournamentId: number,
    playerId: number
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    
    const tournament = await this.getTournament(tournamentId);
    if (!tournament) {
      errors.push('Tournament not found');
      return { valid: false, errors };
    }

    // Cannot unregister after tournament starts
    if (isPast(tournament.startDateTime)) {
      errors.push('Cannot withdraw after tournament has started');
    }

    // Find registration
    const registration = tournament.registrations.find(reg =>
      reg.player1Id === playerId || reg.player2Id === playerId
    );

    if (!registration) {
      errors.push('You are not registered for this tournament');
    }

    return {
      valid: errors.length === 0,
      errors,
      registration
    };
  }
}

// API route for team registration
// /api/tournaments/register
export async function POST(request: Request) {
  try {
    const { tournamentId, player1Id, player2Id, teamChips } = await request.json();
    
    // Validate registration
    const validation = await RegistrationValidator.validateTeamRegistration(
      tournamentId,
      player1Id,
      player2Id
    );

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.errors.join('. ') },
        { status: 400 }
      );
    }

    // Create registration
    const registration = await prisma.teamRegistration.create({
      data: {
        tournamentId,
        player1Id,
        player2Id,
        teamChips,
        registeredAt: new Date()
      },
      include: {
        player1: true,
        player2: true,
        tournament: { include: { venue: true } }
      }
    });

    // Send confirmation notifications
    await NotificationService.sendRegistrationConfirmation(registration);

    return NextResponse.json({
      success: true,
      registration
    });

  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

---

## 🎯 **IMPLEMENTATION TIMELINE**

### **Phase 1: Authentication & Profile (Week 1)**

- ✅ SMS OTP authentication system
- ✅ Player profile setup with Fargo integration
- ✅ Notification preferences management

### **Phase 2: Tournament Discovery (Week 2)**

- ✅ Date-based tournament search
- ✅ Tournament listing and filtering
- ✅ Registration validation system

### **Phase 3: Team Registration (Week 2-3)**

- ✅ Partner search functionality
- ✅ Real-time chip calculation
- ✅ Team registration flow
- ✅ Registration management (withdraw)

### **Phase 4: Notifications (Week 3-4)**

- ✅ Multi-channel notification system
- ✅ Partner unregistration alerts
- ✅ Tournament reminders
- ✅ Push notification setup

### **Phase 5: Security & Polish (Week 4)**

- ✅ Duplicate registration prevention
- ✅ Security audit and testing
- ✅ Mobile app optimization
- ✅ Performance optimization

---

## 📱 **MOBILE APP FEATURES**

### **Progressive Web App Setup**

```json
{
  "name": "Chip Tournament Registration",
  "short_name": "ChipReg",
  "description": "Register for chip tournaments and manage your pool game",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#3182ce",
  "background_color": "#1a202c",
  "shortcuts": [
    {
      "name": "Register for Tournament",
      "short_name": "Register",
      "url": "/register",
      "icons": [{ "src": "/icons/register-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "My Tournaments",
      "short_name": "Tournaments",
      "url": "/my-tournaments",
      "icons": [{ "src": "/icons/tournaments-96x96.png", "sizes": "96x96" }]
    }
  ]
}
```

---

## 🔑 **ADDITIONAL FEATURES TO CONSIDER**

Based on the requirements, here are additional features that would enhance the system:

1. **Team History Tracking** - Track which players have teamed together before
2. **Preferred Partners List** - Allow players to mark frequent partners
3. **Tournament Waitlist** - Allow registration on full tournaments with waitlist
4. **Check-in System** - Digital check-in at venue before tournament starts
5. **Rating History** - Track Fargo rating changes over time
6. **Team Performance Analytics** - Show win/loss records for team combinations
7. **Social Features** - Player profiles, friend requests, tournament photos
8. **Payment Integration** - Online entry fee payments (Stripe, PayPal)
9. **Tournament Chat** - Communication between registered players
10. **Live Scoring** - Players can report their own match scores

---

## 🚀 **READY TO BUILD THE FUTURE OF TOURNAMENT REGISTRATION**

This comprehensive system will provide:

- **🔒 Secure phone-based authentication** - No password hassles
- **🎯 Smart tournament discovery** - Find tournaments by date easily
- **👥 Intelligent partner matching** - Search and team up efficiently  
- **💰 Real-time chip calculation** - See your starting chips instantly
- **📱 Multi-channel notifications** - Stay informed via SMS/email/push
- **🛡️ Bulletproof validation** - Prevent duplicate registrations and errors

**Next Step: Start with Phase 1 - Authentication & Profile Setup!** 🎯

*Would you like me to begin implementing the SMS authentication and player profile system?*
