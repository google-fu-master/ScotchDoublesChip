'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Plus, Check, X, Building, Phone, Mail, Globe, Users, Hash, Clock, AlertTriangle } from 'lucide-react';
import {
  VenueAgeRestriction,
  VenueAgeRestrictionLabels,
  AgeRestrictionUtils,
  AgeRestrictionConflict
} from '../../../../../shared/types/age-restriction.types';

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  amenities: string[];
  tableCount?: number;
  maxCapacity?: number;
  hourlyRate?: number;
  contactName?: string;
  isVerified: boolean;
  // Age restriction fields
  ageRestriction: VenueAgeRestriction;
  useVenueAgeForAllTables: boolean;
  minorStartTime?: string;
  minorEndTime?: string;
  ages18To20StartTime?: string;
  ages18To20EndTime?: string;
  ownerId?: string;
}

interface VenueSelectorProps {
  onVenueSelect: (venue: Venue | null) => void;
  selectedVenue?: Venue | null;
  allowNoVenue?: boolean;
}

export function VenueSelector({ onVenueSelect, selectedVenue, allowNoVenue = true }: VenueSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [newVenue, setNewVenue] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: '',
    email: '',
    website: '',
    description: '',
    tableCount: '',
    maxCapacity: '',
    contactName: '',
    // Age restriction fields
    ageRestriction: VenueAgeRestriction.MINORS_ALLOWED_ALL_DAY,
    useVenueAgeForAllTables: true,
    minorStartTime: '',
    minorEndTime: '',
    ages18To20StartTime: '',
    ages18To20EndTime: ''
  });

  useEffect(() => {
    if (isOpen) {
      searchVenues('');
    }
  }, [isOpen]);

  const searchVenues = async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      
      const response = await fetch(`/api/venues?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setVenues(data.venues);
      }
    } catch (error) {
      console.error('Failed to search venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchVenues(query);
  };

  const handleVenueSelect = (venue: Venue) => {
    onVenueSelect(venue);
    setIsOpen(false);
  };

  const handleNoVenue = () => {
    onVenueSelect(null);
    setIsOpen(false);
  };

  const handleCreateVenue = async () => {
    if (!newVenue.name || !newVenue.address || !newVenue.city || !newVenue.state) {
      alert('Please fill in all required fields (name, address, city, state)');
      return;
    }

    // Validate age restrictions
    const ageValidation = AgeRestrictionUtils.validateVenueTimeRestrictions(
      newVenue.ageRestriction,
      newVenue.minorStartTime || undefined,
      newVenue.minorEndTime || undefined,
      newVenue.ages18To20StartTime || undefined,
      newVenue.ages18To20EndTime || undefined
    );

    if (!ageValidation.isValid) {
      const errorMessage = ageValidation.conflicts.map((c: AgeRestrictionConflict) => c.message).join('\n');
      alert('Age restriction validation failed:\n' + errorMessage);
      return;
    }

    try {
      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newVenue,
          tableCount: newVenue.tableCount ? parseInt(newVenue.tableCount) : undefined,
          maxCapacity: newVenue.maxCapacity ? parseInt(newVenue.maxCapacity) : undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        handleVenueSelect(data.venue);
        setShowAddVenue(false);
        setNewVenue({
          name: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA',
          phone: '',
          email: '',
          website: '',
          description: '',
          tableCount: '',
          maxCapacity: '',
          contactName: '',
          // Reset age restriction fields
          ageRestriction: VenueAgeRestriction.MINORS_ALLOWED_ALL_DAY,
          useVenueAgeForAllTables: true,
          minorStartTime: '',
          minorEndTime: '',
          ages18To20StartTime: '',
          ages18To20EndTime: ''
        });
      } else {
        alert('Failed to create venue: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to create venue:', error);
      alert('Failed to create venue');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Tournament Venue
      </label>
      
      {/* Selected Venue Display */}
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-700"
      >
        {selectedVenue ? (
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-slate-500" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 dark:text-white">
                  {selectedVenue.name}
                </span>
                {selectedVenue.isVerified && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {selectedVenue.address}, {selectedVenue.city}, {selectedVenue.state}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <MapPin className="w-5 h-5" />
            <span>Click to select venue or create without venue</span>
          </div>
        )}
      </div>

      {/* Venue Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm sm:max-w-lg lg:max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-600 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Select Tournament Venue
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
              {!showAddVenue ? (
                <>
                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search venues by name, city, or address..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mb-4">
                    {allowNoVenue && (
                      <button
                        onClick={handleNoVenue}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500"
                      >
                        <X className="w-4 h-4" />
                        No Venue (Online/TBD)
                      </button>
                    )}
                    <button
                      onClick={() => setShowAddVenue(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Venue
                    </button>
                  </div>

                  {/* Venues List */}
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {loading ? (
                      <div className="text-center py-8 text-slate-500">Searching venues...</div>
                    ) : venues.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        No venues found. Try a different search or add a new venue.
                      </div>
                    ) : (
                      venues.map((venue) => (
                        <div
                          key={venue.id}
                          onClick={() => handleVenueSelect(venue)}
                          className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-slate-900 dark:text-white">
                                  {venue.name}
                                </h4>
                                {venue.isVerified && (
                                  <Check className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                                <MapPin className="w-4 h-4" />
                                {venue.address}, {venue.city}, {venue.state} {venue.zipCode}
                              </div>
                              
                              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                {venue.tableCount && (
                                  <span className="flex items-center gap-1">
                                    <Hash className="w-3 h-3" />
                                    {venue.tableCount} tables
                                  </span>
                                )}
                                {venue.maxCapacity && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {venue.maxCapacity} capacity
                                  </span>
                                )}
                                {venue.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {venue.phone}
                                  </span>
                                )}
                              </div>

                              {venue.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {venue.amenities.map((amenity, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded"
                                    >
                                      {amenity}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                /* Add New Venue Form */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-slate-900 dark:text-white">Add New Venue</h4>
                    <button
                      onClick={() => setShowAddVenue(false)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Venue Name *</label>
                      <input
                        type="text"
                        value={newVenue.name}
                        onChange={(e) => setNewVenue({...newVenue, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Address *</label>
                      <input
                        type="text"
                        value={newVenue.address}
                        onChange={(e) => setNewVenue({...newVenue, address: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">City *</label>
                      <input
                        type="text"
                        value={newVenue.city}
                        onChange={(e) => setNewVenue({...newVenue, city: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">State *</label>
                      <input
                        type="text"
                        value={newVenue.state}
                        onChange={(e) => setNewVenue({...newVenue, state: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">ZIP Code</label>
                      <input
                        type="text"
                        value={newVenue.zipCode}
                        onChange={(e) => setNewVenue({...newVenue, zipCode: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input
                        type="tel"
                        value={newVenue.phone}
                        onChange={(e) => setNewVenue({...newVenue, phone: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Contact Name</label>
                      <input
                        type="text"
                        value={newVenue.contactName}
                        onChange={(e) => setNewVenue({...newVenue, contactName: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Table Count</label>
                      <input
                        type="number"
                        value={newVenue.tableCount}
                        onChange={(e) => setNewVenue({...newVenue, tableCount: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Age Restrictions Section */}
                  <div className="border-t pt-4 mt-6">
                    <h5 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Age Restrictions
                    </h5>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Age Restriction Policy *</label>
                        <select
                          value={newVenue.ageRestriction}
                          onChange={(e) => setNewVenue({...newVenue, ageRestriction: e.target.value as VenueAgeRestriction})}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700"
                          required
                        >
                          {Object.entries(VenueAgeRestrictionLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label as string}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Minor Hours (if needed) */}
                      {(newVenue.ageRestriction === VenueAgeRestriction.MINORS_ALLOWED_LIMITED_HOURS || 
                        newVenue.ageRestriction === VenueAgeRestriction.MINORS_AND_18_20_LIMITED_HOURS) && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <h6 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Minor Hours (&lt;18) *
                          </h6>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Start Time</label>
                              <input
                                type="time"
                                value={newVenue.minorStartTime}
                                onChange={(e) => setNewVenue({...newVenue, minorStartTime: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">End Time</label>
                              <input
                                type="time"
                                value={newVenue.minorEndTime}
                                onChange={(e) => setNewVenue({...newVenue, minorEndTime: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 18-20 Hours (if needed) */}
                      {(newVenue.ageRestriction === VenueAgeRestriction.AGES_18_20_LIMITED_HOURS || 
                        newVenue.ageRestriction === VenueAgeRestriction.MINORS_AND_18_20_LIMITED_HOURS) && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h6 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            18-20 Age Group Hours *
                          </h6>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Start Time</label>
                              <input
                                type="time"
                                value={newVenue.ages18To20StartTime}
                                onChange={(e) => setNewVenue({...newVenue, ages18To20StartTime: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">End Time</label>
                              <input
                                type="time"
                                value={newVenue.ages18To20EndTime}
                                onChange={(e) => setNewVenue({...newVenue, ages18To20EndTime: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Table Age Restriction Management */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Table Age Restrictions</label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="tableAgeMode"
                              checked={newVenue.useVenueAgeForAllTables}
                              onChange={() => setNewVenue({...newVenue, useVenueAgeForAllTables: true})}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Apply Venue Age Restriction to All Tables
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="tableAgeMode"
                              checked={!newVenue.useVenueAgeForAllTables}
                              onChange={() => setNewVenue({...newVenue, useVenueAgeForAllTables: false})}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Set Table Age Restrictions Manually
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowAddVenue(false)}
                      className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateVenue}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Create Venue
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}