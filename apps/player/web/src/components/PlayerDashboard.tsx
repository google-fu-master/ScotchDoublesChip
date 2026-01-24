'use client';

import { Users, Trophy, Calendar, Target, ChevronRight, Plus, Settings, Search } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';

export function PlayerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfile, setShowProfile] = useState(false);
  
  const stats = [
    { label: "Active Tournaments", value: 2, icon: Trophy, color: "text-green-600 bg-green-50" },
    { label: "Total Wins", value: 15, icon: Target, color: "text-blue-600 bg-blue-50" },
    { label: "Matches Played", value: 32, icon: Users, color: "text-purple-600 bg-purple-50" },
    { label: "Upcoming Events", value: 3, icon: Calendar, color: "text-orange-600 bg-orange-50" }
  ];

  const mockTournaments = [
    { id: 1, name: "Weekly Scotch Doubles", date: "2024-01-15", status: "Active", players: 24 },
    { id: 2, name: "Championship Series", date: "2024-01-20", status: "Upcoming", players: 32 },
    { id: 3, name: "Local Pool League", date: "2024-01-25", status: "Registration Open", players: 16 }
  ];

  const mockMatches = [
    { id: 1, tournament: "Weekly Scotch Doubles", opponent: "Smith/Jones", result: "Win", score: "7-5", date: "2024-01-12" },
    { id: 2, tournament: "Championship Series", opponent: "Davis/Wilson", result: "Loss", score: "3-7", date: "2024-01-10" },
    { id: 3, tournament: "Local Pool League", opponent: "Brown/Miller", result: "Win", score: "6-4", date: "2024-01-08" }
  ];

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <button
                onClick={() => setShowProfile(false)}
                className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Player Profile</h1>
              <p className="text-slate-600 dark:text-slate-400">Manage your tournament profile and settings</p>
            </div>
            <ThemeToggle />
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  defaultValue="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  defaultValue="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fargo Rating</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  defaultValue="450"
                />
              </div>
              <div className="flex gap-4">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
                <button className="bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white px-6 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Player Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">Track your tournament performance and join new events</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowProfile(true)}
              className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Profile
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'tournaments', 'matches'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <Icon className="w-6 h-6" suppressHydrationWarning />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <Plus className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-slate-900 dark:text-white">Join Tournament</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Browse available tournaments to join</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('matches')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-green-300 hover:bg-green-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-slate-900 dark:text-white">View Match History</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Review your past matches and performance</p>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">Won match vs Smith/Jones</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Weekly Scotch Doubles • 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">Registered for Championship</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Championship Series • 3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'tournaments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tournaments</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tournaments..."
                    className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {mockTournaments.map((tournament) => (
                <div key={tournament.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{tournament.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <span>📅 {tournament.date}</span>
                        <span>👥 {tournament.players} players</span>
                        <span className={`px-2 py-1 rounded-full ${
                          tournament.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          tournament.status === 'Upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                        }`}>
                          {tournament.status}
                        </span>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Match History</h2>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tournament</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Opponent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Result</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                    {mockMatches.map((match) => (
                      <tr key={match.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{match.tournament}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{match.opponent}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            match.result === 'Win' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {match.result}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{match.score}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{match.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}