'use client';

import { Calendar, MapPin, Users, Trophy, Plus } from 'lucide-react';
import { useState } from 'react';
import { TournamentCreationWizard } from '@/components/tournament/TournamentCreationWizard';

export function TournamentDashboard() {
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  const stats = [
    { 
      label: "Active Tournaments", 
      value: 0, 
      icon: Trophy, 
      color: "text-green-600 bg-green-50" 
    },
    { 
      label: "Upcoming Events", 
      value: 0, 
      icon: Calendar, 
      color: "text-blue-600 bg-blue-50" 
    },
    { 
      label: "Total Participants", 
      value: 0, 
      icon: Users, 
      color: "text-purple-600 bg-purple-50" 
    },
    { 
      label: "Venues Managed", 
      value: 0, 
      icon: MapPin, 
      color: "text-orange-600 bg-orange-50" 
    }
  ];

  if (showCreateWizard) {
    return (
      <TournamentCreationWizard 
        onClose={() => setShowCreateWizard(false)}
        onComplete={(data) => {
          console.log('Tournament created:', data);
          setShowCreateWizard(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tournament Director</h1>
          <p className="text-slate-600">Manage your scotch doubles tournaments with ease</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tournaments List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Recent Tournaments</h2>
                <button 
                  onClick={() => setShowCreateWizard(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Tournament
                </button>
              </div>
              
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">No tournaments yet</h3>
                <p className="text-slate-500 mb-4">Get started by creating your first scotch doubles tournament</p>
                <button 
                  onClick={() => setShowCreateWizard(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Tournament
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowCreateWizard(true)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-slate-900">New Tournament</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Create a new scotch doubles tournament</p>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-slate-900">Manage Players</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">View and manage player registrations</p>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-slate-900">Venue Setup</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Configure tables and venue layout</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}