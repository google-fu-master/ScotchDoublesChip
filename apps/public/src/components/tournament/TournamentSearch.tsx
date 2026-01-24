'use client';

import { useState } from 'react';
import { Search, MapPin, Users, Trophy, Calendar, X, ArrowRight } from 'lucide-react';

interface TournamentSearchProps {
  onClose: () => void;
  isLoggedIn: boolean;
  userType: 'player' | 'td' | 'admin';
}

interface Tournament {
  id: number;
  name: string;
  date: string;
  venue: string;
  address: string;
  registeredTeams: number;
  maxTeams: number;
  buyIn: number;
  chipStructure: string;
  status: 'upcoming' | 'registration_open' | 'in_progress' | 'completed';
  isPublic: boolean;
  description: string;
  tdName: string;
}

const mockTournaments: Tournament[] = [
  {
    id: 1,
    name: "Winter Championship",
    date: "2026-02-15",
    venue: "Downtown Billiards",
    address: "123 Main St, Downtown",
    registeredTeams: 16,
    maxTeams: 32,
    buyIn: 50,
    chipStructure: "200 Starting Chips",
    status: "registration_open",
    isPublic: true,
    description: "Annual winter championship featuring the best teams in the region.",
    tdName: "Mike Johnson"
  },
  {
    id: 2,
    name: "Spring Open",
    date: "2026-03-10",
    venue: "City Pool Hall", 
    address: "456 Oak Ave, Midtown",
    registeredTeams: 8,
    maxTeams: 24,
    buyIn: 35,
    chipStructure: "150 Starting Chips",
    status: "upcoming",
    isPublic: true,
    description: "Open tournament welcoming all skill levels.",
    tdName: "Sarah Davis"
  },
  {
    id: 3,
    name: "Monthly Series #3",
    date: "2026-01-30",
    venue: "Metro Sports Bar",
    address: "789 Pine St, Westside", 
    registeredTeams: 12,
    maxTeams: 16,
    buyIn: 25,
    chipStructure: "100 Starting Chips",
    status: "registration_open",
    isPublic: false,
    description: "Private tournament for league members only.",
    tdName: "Alex Chen"
  }
];

export function TournamentSearch({ onClose, isLoggedIn, userType }: TournamentSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  const filteredTournaments = mockTournaments.filter(tournament => {
    if (!isLoggedIn && !tournament.isPublic) return false;
    return tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tournament.venue.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (selectedTournament) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-sm sm:max-w-lg lg:max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {selectedTournament.name}
              </h2>
              <button 
                onClick={() => setSelectedTournament(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Calendar className="w-4 h-4" />
                <span>{new Date(selectedTournament.date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4" />
                <div>
                  <div>{selectedTournament.venue}</div>
                  <div className="text-sm">{selectedTournament.address}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Users className="w-4 h-4" />
                <span>{selectedTournament.registeredTeams}/{selectedTournament.maxTeams} teams registered</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Buy-in:</span> ${selectedTournament.buyIn}
                  </div>
                  <div>
                    <span className="font-medium">Chips:</span> {selectedTournament.chipStructure}
                  </div>
                  <div>
                    <span className="font-medium">TD:</span> {selectedTournament.tdName}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      selectedTournament.status === 'registration_open' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : selectedTournament.status === 'upcoming'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200'
                    }`}>
                      {selectedTournament.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {selectedTournament.description}
                </p>
              </div>

              {isLoggedIn && selectedTournament.status === 'registration_open' && (
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowRegistration(true)}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    Register Team
                  </button>
                </div>
              )}

              {!isLoggedIn && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    You need to be logged in to register for tournaments.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-sm sm:max-w-lg lg:max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-600 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Find Tournaments</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <div className="mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tournaments by name or venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredTournaments.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-300">No tournaments found</p>
              </div>
            ) : (
              filteredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={() => setSelectedTournament(tournament)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                        {tournament.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(tournament.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {tournament.venue}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!tournament.isPublic && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs rounded">
                          Private
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded ${
                        tournament.status === 'registration_open' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : tournament.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200'
                      }`}>
                        {tournament.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {tournament.registeredTeams}/{tournament.maxTeams} teams
                      </div>
                      <div>
                        ${tournament.buyIn} buy-in
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}