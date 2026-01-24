'use client';

import { useState } from 'react';
import { X, Plus, Settings, Users, Trophy, Shield, BarChart, Calendar, Edit, Trash2, Play, Pause, RotateCcw, Database, DollarSign, FileText, Download, Upload, Key, Lock, Unlock, UserX, UserCheck, Crown, AlertTriangle, Activity, TrendingUp, HardDrive, Wifi, Server } from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

interface Tournament {
  id: number;
  name: string;
  date: string;
  venue: string;
  status: 'upcoming' | 'registration_open' | 'in_progress' | 'completed';
  registeredTeams: number;
  maxTeams: number;
  buyIn: number;
  chipStructure: string;
  tdName: string;
  isPublic: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  type: 'player' | 'td' | 'admin';
  status: 'active' | 'suspended';
  lastLogin: string;
}

const mockTournaments: Tournament[] = [
  {
    id: 1,
    name: "Winter Championship",
    date: "2026-02-15",
    venue: "Downtown Billiards",
    status: "registration_open",
    registeredTeams: 16,
    maxTeams: 32,
    buyIn: 50,
    chipStructure: "200 Starting Chips",
    tdName: "Mike Johnson",
    isPublic: true
  },
  {
    id: 2,
    name: "Spring Open",
    date: "2026-03-10",
    venue: "City Pool Hall",
    status: "upcoming",
    registeredTeams: 8,
    maxTeams: 24,
    buyIn: 35,
    chipStructure: "150 Starting Chips",
    tdName: "Sarah Davis",
    isPublic: true
  }
];

const mockUsers: User[] = [
  { id: 1, name: "Mike Johnson", email: "mike@example.com", type: "td", status: "active", lastLogin: "2026-01-24" },
  { id: 2, name: "Sarah Davis", email: "sarah@example.com", type: "td", status: "active", lastLogin: "2026-01-23" },
  { id: 3, name: "Alex Chen", email: "alex@example.com", type: "player", status: "active", lastLogin: "2026-01-24" },
  { id: 4, name: "John Smith", email: "john@example.com", type: "player", status: "suspended", lastLogin: "2026-01-20" },
];

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tournaments' | 'financials' | 'database' | 'fargo' | 'system' | 'reports'>('overview');
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [users, setUsers] = useState<User[]>(mockUsers);

  const handleCreateTournament = () => {
    alert('Tournament creation interface would open here');
  };

  const handleDeleteTournament = (id: number) => {
    if (confirm('Are you sure you want to delete this tournament?')) {
      setTournaments(tournaments.filter(t => t.id !== id));
    }
  };

  const handleToggleUserStatus = (id: number) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
        : user
    ));
  };

  const handlePromoteUser = (id: number, newType: 'player' | 'td' | 'admin') => {
    if (confirm(`Are you sure you want to change this user's account type to ${newType.toUpperCase()}?`)) {
      setUsers(users.map(user => 
        user.id === id ? { ...user, type: newType } : user
      ));
    }
  };

  const handleDeleteUser = (id: number) => {
    if (confirm('Are you sure you want to permanently delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleTournamentStatusChange = (id: number, newStatus: Tournament['status']) => {
    setTournaments(tournaments.map(tournament =>
      tournament.id === id ? { ...tournament, status: newStatus } : tournament
    ));
  };

  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalRevenue = tournaments.reduce((sum, t) => sum + (t.buyIn * t.registeredTeams), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-6xl w-full my-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard - God Mode</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'tournaments', label: 'Tournaments', icon: Trophy },
              { id: 'financials', label: 'Financials', icon: DollarSign },
              { id: 'database', label: 'Database', icon: Database },
              { id: 'fargo', label: 'Fargo', icon: Key },
              { id: 'system', label: 'System', icon: Server },
              { id: 'reports', label: 'Reports', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Tournaments</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{tournaments.length}</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900 dark:text-green-100">Active Users</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{activeUsers}</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Total Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">${totalRevenue}</p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-900 dark:text-red-100">System Status</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">Online</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">God Mode Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button className="p-4 text-left bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-5 h-5 text-red-600" />
                      <h4 className="font-medium">System Backup</h4>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Full system backup & restore</p>
                  </button>

                  <button className="p-4 text-left bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="w-5 h-5 text-orange-600" />
                      <h4 className="font-medium">User Impersonation</h4>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Login as any user</p>
                  </button>

                  <button className="p-4 text-left bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      <h4 className="font-medium">Financial Override</h4>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Manual payouts & adjustments</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management (God Mode)
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => alert('Create new user interface')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create User
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{user.name}</h4>
                          {user.type === 'admin' && <Crown className="w-4 h-4 text-red-500" />}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">{user.email}</p>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          Last login: {new Date(user.lastLogin).toLocaleDateString()} • ID: {user.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          user.type === 'admin' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : user.type === 'td'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {user.type.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {user.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${
                          user.status === 'active'
                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                      >
                        {user.status === 'active' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>

                      {user.type === 'player' && (
                        <button
                          onClick={() => handlePromoteUser(user.id, 'td')}
                          className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 px-2 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <Trophy className="w-3 h-3" />
                          → TD
                        </button>
                      )}
                      
                      {user.type === 'td' && (
                        <button
                          onClick={() => handlePromoteUser(user.id, 'admin')}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <Crown className="w-3 h-3" />
                          → Admin
                        </button>
                      )}
                      
                      <button
                        onClick={() => alert(`Impersonating ${user.name} (Admin only)`)}
                        className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-2 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        Impersonate
                      </button>
                      
                      {user.type !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <UserX className="w-3 h-3" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tournaments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Tournament Oversight (God Mode)
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTournament}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create Tournament
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {tournaments.map((tournament) => (
                  <div key={tournament.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{tournament.name}</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          {tournament.venue} • {new Date(tournament.date).toLocaleDateString()}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          TD: {tournament.tdName} • Revenue: ${tournament.buyIn * tournament.registeredTeams}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          tournament.status === 'in_progress' 
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            : tournament.status === 'registration_open'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : tournament.status === 'completed'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {tournament.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => alert(`Full admin control for ${tournament.name}`)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <Shield className="w-3 h-3" />
                        God Mode
                      </button>
                      
                      <button
                        onClick={() => handleDeleteTournament(tournament.id)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial God Mode
              </h3>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-900 dark:text-red-100">Financial Override Zone</h4>
                </div>
                <p className="text-red-700 dark:text-red-200 text-sm mb-4">
                  Complete financial control over the entire system.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Force Payout
                  </button>
                  <button className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Cancel Transaction
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database God Mode
              </h3>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-900 dark:text-red-100">Danger Zone</h4>
                </div>
                <p className="text-red-700 dark:text-red-200 text-sm mb-4">
                  Direct database access and system controls.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Full Backup
                  </button>
                  <button className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Raw SQL
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fargo' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Key className="w-5 h-5" />
                Fargo God Mode
              </h3>
              
              <div className="space-y-4">
                <button className="w-full p-4 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-5 h-5" />
                    <h4 className="font-medium">Override Fargo Links</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Manually link/unlink any Fargo profile</p>
                </button>
                
                <button className="w-full p-4 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5" />
                    <h4 className="font-medium">Force Sync All</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Mass sync all Fargo profiles</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Server className="w-5 h-5" />
                System God Mode
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span>System Status</span>
                    <span className="flex items-center gap-2 text-green-600">
                      <Wifi className="w-4 h-4" />
                      Online
                    </span>
                  </div>
                  
                  <button className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Emergency Shutdown
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Advanced Analytics (God Mode)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium">System Analytics</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Complete system performance</p>
                </button>
                
                <button className="p-4 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium">Financial Report</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">All financial data</p>
                </button>
                
                <button className="p-4 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <h4 className="font-medium">Admin Audit</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">All admin actions log</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}