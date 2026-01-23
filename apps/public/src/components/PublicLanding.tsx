'use client';

import { Calendar, MapPin, Trophy, Users, Search, ArrowRight } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function PublicLanding() {
  const features = [
    {
      icon: Trophy,
      title: "Tournament Management",
      description: "Advanced chip-based tournament system with real-time tracking"
    },
    {
      icon: Users,
      title: "Team Formation",
      description: "Smart pairing system for scotch doubles partnerships"
    },
    {
      icon: Calendar,
      title: "Event Scheduling",
      description: "Easy tournament creation and registration management"
    },
    {
      icon: MapPin,
      title: "Venue Support",
      description: "Multi-table management and venue-specific configurations"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-blue-600" suppressHydrationWarning />
              <span className="text-xl font-bold text-slate-900 dark:text-white">Scotch Doubles</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">Tournaments</a>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">Venues</a>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">Rankings</a>
              <ThemeToggle />
              <a href="#" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Join Now</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
            The Future of
            <span className="text-blue-600"> Pool Tournaments</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Experience the most advanced scotch doubles tournament system. 
            Chip-based gameplay, smart matchmaking, and real-time tournament management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Tournaments
            </button>
            <button className="border border-slate-300 text-slate-700 px-8 py-4 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Built specifically for scotch doubles tournaments with advanced features 
              that traditional systems can't match.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
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
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 mx-auto">
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
                <li><a href="#" className="hover:text-white transition-colors">Tournaments</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Players</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Venues</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            © 2026 Scotch Doubles Tournament System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}