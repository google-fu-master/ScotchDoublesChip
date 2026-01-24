'use client';

import { Calendar, MapPin, Trophy, Users, Search, ArrowRight, Menu, X, LogIn, UserPlus, Shield, Zap, Target, Award, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';
import { AuthModal } from './auth/AuthModal';
import { TournamentSearch } from './tournament/TournamentSearch';
import { AdminDashboard } from './admin/AdminDashboard';
import { brand, brandClasses } from '../lib/brand';

export function PublicLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTournamentSearch, setShowTournamentSearch] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock auth state
  const [userType, setUserType] = useState<'player' | 'td' | 'admin'>('player'); // Mock user type
  
  const features = [
    {
      icon: Zap,
      title: "Lightning-Fast Tournaments",
      description: "Advanced chip-based system with real-time scoring and instant results",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Smart Team Pairing",
      description: "Intelligent scotch doubles partnership system with skill-based matching",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Award,
      title: "Professional Management",
      description: "Tournament director tools with venue integration and prize distribution",
      color: "from-pink-500 to-red-500"
    },
    {
      icon: Sparkles,
      title: "Dynamic Experience",
      description: "Multi-table coordination with live leaderboards and player analytics",
      color: "from-green-500 to-blue-500"
    }
  ];

  const mockTournaments = [
    { id: 1, name: "Winter Championship", date: "Feb 15, 2026", venue: "Downtown Billiards", players: 32 },
    { id: 2, name: "Spring Open", date: "Mar 10, 2026", venue: "City Pool Hall", players: 24 },
    { id: 3, name: "Monthly Series", date: "Jan 30, 2026", venue: "Metro Sports Bar", players: 16 }
  ];

  if (showTournamentSearch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowTournamentSearch(false)}
                className="flex items-center gap-2"
              >
                <Trophy className="w-8 h-8 text-blue-600" suppressHydrationWarning />
                <span className="text-xl font-bold text-slate-900 dark:text-white">Scotch Doubles</span>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Find Tournaments</h1>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by tournament name, location, or date..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {mockTournaments.map((tournament) => (
              <div key={tournament.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{tournament.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>📅 {tournament.date}</span>
                      <span>📍 {tournament.venue}</span>
                      <span>👥 {tournament.players} players</span>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={() => setShowTournamentSearch(false)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-purple-100 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" suppressHydrationWarning />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Scotch Doubles
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 -mt-1">Tournament Platform</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setShowTournamentSearch(true)}
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
              >
                Find Tournaments
              </button>
              <a href="#venues" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">Venues</a>
              <a href="#rankings" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">Rankings</a>
              <ThemeToggle />
              {!isLoggedIn ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                  <button 
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  {userType === 'admin' ? (
                    <button 
                      onClick={() => setShowAdminDashboard(true)}
                      className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Dashboard
                    </button>
                  ) : (
                    <button 
                      onClick={() => alert('Tournament signup functionality')}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg"
                    >
                      Tournament Sign Up
                    </button>
                  )}
                  <button 
                    onClick={() => setIsLoggedIn(false)}
                    className="text-slate-600 dark:text-slate-300 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Logout
                  </button>
                </div>
              )}
            </nav>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <>
              {/* Overlay */}
              <div 
                className="fixed inset-0 bg-black/20 z-40 md:hidden" 
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Menu */}
              <div className="md:hidden mt-4 pb-4 border-t border-slate-200 dark:border-slate-700 relative z-50 bg-white dark:bg-slate-800">
                <nav className="flex flex-col space-y-2 mt-4">
                  <button 
                    onClick={() => {
                      setShowTournamentSearch(true);
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 min-h-[44px] flex items-center"
                  >
                    Tournaments
                  </button>
                  <a href="#venues" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 min-h-[44px] flex items-center">Venues</a>
                  <a href="#rankings" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 min-h-[44px] flex items-center">Rankings</a>
                <div className="py-2">
                  <ThemeToggle />
                  {!isLoggedIn ? (
                    <div className="flex flex-col gap-2 mt-4">
                      <button 
                        onClick={() => {
                          setAuthMode('login');
                          setShowAuthModal(true);
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 min-h-[44px]"
                      >
                        <LogIn className="w-4 h-4" />
                        Login
                      </button>
                      <button 
                        onClick={() => {
                          setAuthMode('signup');
                          setShowAuthModal(true);
                          setMobileMenuOpen(false);
                        }}
                        className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center min-h-[44px] flex items-center justify-center"
                      >
                        Sign Up
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mt-4">
                      <button 
                        onClick={() => {
                          alert('Tournament signup functionality');
                          setMobileMenuOpen(false);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
                      >
                        Tournament Sign Up
                      </button>
                      <button 
                        onClick={() => {
                          setIsLoggedIn(false);
                          setMobileMenuOpen(false);
                        }}
                        className="text-red-600 hover:text-red-700 transition-colors py-2 text-center"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </nav>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
                Elite Pool
              </span>
              <br />
              <span className="text-slate-900 dark:text-white">
                Tournaments
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              The premium scotch doubles tournament platform. 
              <br className="hidden md:block" />
              Advanced chip system, smart matchmaking, and real-time tournament management.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={() => setShowTournamentSearch(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
            >
              <Search className="w-5 h-5" />
              Find Tournaments
            </button>
            {!isLoggedIn ? (
              <button 
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className="bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border-2 border-purple-200 dark:border-purple-700 px-8 py-4 rounded-xl font-semibold hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
              >
                <UserPlus className="w-5 h-5" />
                Join Platform
              </button>
            ) : (
              <button 
                onClick={() => alert('Tournament signup functionality')}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
              >
                <Trophy className="w-5 h-5" />
                Enter Tournament
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600">500+</div>
              <div className="text-slate-600 dark:text-slate-400">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-pink-600">120+</div>
              <div className="text-slate-600 dark:text-slate-400">Tournaments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600">50+</div>
              <div className="text-slate-600 dark:text-slate-400">Venues</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600">$25K+</div>
              <div className="text-slate-600 dark:text-slate-400">Prizes Awarded</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Why Choose
              </span>
              <br />
              <span className="text-slate-900 dark:text-white">Our Platform?</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Built specifically for scotch doubles tournaments with cutting-edge features 
              that traditional systems simply can't match.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-purple-100 dark:border-slate-700"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} p-0.5 mx-auto mb-6`}>
                    <div className="w-full h-full bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                      <Icon className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 text-center">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed">{feature.description}</p>
                  
                  {/* Hover effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Venues Section */}
      <section id="venues" className="py-16 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Featured Venues</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Tournament-ready venues equipped with our advanced management system.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Downtown Billiards', 'City Pool Hall', 'Metro Sports Bar'].map((venue, index) => (
              <button 
                key={index}
                className="bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6 text-left hover:shadow-md transition-shadow"
                onClick={() => alert(`View details for ${venue}`)}
              >
                <div className="w-full h-32 bg-slate-200 dark:bg-slate-600 rounded-lg mb-4"></div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{venue}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Professional tournament facility with 8+ tables</p>
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="text-sm">View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Rankings section */}
      <section id="rankings" className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Top Rankings</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              See how you stack up against the best players in the scotch doubles community.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8">
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Rankings Coming Soon</h3>
              <p className="text-slate-600 dark:text-slate-400">Tournament rankings will be available once more tournaments are completed.</p>
              <button 
                onClick={() => setShowTournamentSearch(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join a Tournament
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of players enjoying the most advanced tournament experience.
          </p>
          <button 
            onClick={() => alert('Registration would redirect to signup flow')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 mx-auto"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-bold text-white">Scotch Doubles</span>
              </div>
              <p className="text-sm text-slate-400">
                The premier tournament management platform for scotch doubles pool tournaments.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setShowTournamentSearch(true)} className="hover:text-white transition-colors">Tournaments</button></li>
                <li><a href="#venues" className="hover:text-white transition-colors">Players</a></li>
                <li><a href="#venues" className="hover:text-white transition-colors">Venues</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => alert('Help Center would open support documentation')} className="hover:text-white transition-colors">Help Center</button></li>
                <li><button onClick={() => alert('Contact form would open')} className="hover:text-white transition-colors">Contact Us</button></li>
                <li><button onClick={() => alert('FAQ section would open')} className="hover:text-white transition-colors">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => alert('Privacy policy would open')} className="hover:text-white transition-colors">Privacy</button></li>
                <li><button onClick={() => alert('Terms of service would open')} className="hover:text-white transition-colors">Terms</button></li>
                <li><button onClick={() => alert('Security information would open')} className="hover:text-white transition-colors">Security</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            © 2026 Scotch Doubles Tournament System. All rights reserved.
          </div>
        </div>
      </footer>
      
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(userData) => {
            setIsLoggedIn(true);
            setUserType(userData.accountType);
            setShowAuthModal(false);
          }}
        />
      )}
      
      {/* Tournament Search Modal */}
      {showTournamentSearch && (
        <TournamentSearch
          onClose={() => setShowTournamentSearch(false)}
          isLoggedIn={isLoggedIn}
          userType={userType}
        />
      )}

      {/* Admin Dashboard Modal */}
      {showAdminDashboard && (
        <AdminDashboard
          onClose={() => setShowAdminDashboard(false)}
        />
      )}
    </div>
  );
}