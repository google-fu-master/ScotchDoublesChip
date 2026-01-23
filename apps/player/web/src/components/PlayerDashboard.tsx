'use client';

import { Users, Trophy, Calendar, Target } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function PlayerDashboard() {
  const stats = [
    { label: "Active Tournaments", value: 2, icon: Trophy, color: "text-green-600 bg-green-50" },
    { label: "Total Wins", value: 15, icon: Target, color: "text-blue-600 bg-blue-50" },
    { label: "Matches Played", value: 32, icon: Users, color: "text-purple-600 bg-purple-50" },
    { label: "Upcoming Events", value: 3, icon: Calendar, color: "text-orange-600 bg-orange-50" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Player Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">Track your tournament performance and join new events</p>
          </div>
          <ThemeToggle />
        </div>

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
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Active Tournaments</h2>
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" suppressHydrationWarning />
              <p className="text-slate-500 dark:text-slate-400">No active tournaments</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Join a tournament to get started</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recent Matches</h2>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" suppressHydrationWarning />
              <p className="text-slate-500 dark:text-slate-400">No recent matches</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Play some games to see your history</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}