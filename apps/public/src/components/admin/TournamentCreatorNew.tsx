'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Trophy, Users, DollarSign, Clock, Plus, Settings, Save, FileText, Trash2, AlertTriangle } from 'lucide-react';
import { VenueSelector } from '../venue/VenueSelector';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TableAgeRestriction,
  TableAgeRestrictionLabels,
  TournamentAgeRestriction 
} from '../../../shared/types/age-restriction.types';

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
}

interface ChipRange {
  minRating: number;
  maxRating: number;
  chips: number;
}

interface SidePot {
  id: string;
  name: string;
  entryFee: number;
  description: string;
}

interface TournamentTemplate {
  id: string;
  name: string;
  settings: TournamentFormData;
}

interface TournamentFormData {
  // Basic Information
  name: string;
  applyTemplate: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  venue: Venue | null;
  
  // Age Restrictions (for tournaments without venues)\n  isAgeRestricted: boolean;\n  useUniformAgeRestriction: boolean;\n  uniformAgeRestriction: TableAgeRestriction;\n  \n  // Tournament Configuration
  playerType: 'singles' | 'doubles' | 'scotch_doubles';
  gameType: 'eight_ball' | 'nine_ball' | 'ten_ball';
  tournamentType: 'chip_tournament';
  race: number;
  estimatedPlayers: number;
  playersPerTable: number;
  
  // Chip Settings
  defaultChipsPerPlayer: number;
  chipRanges: ChipRange[];
  birthdayChip: boolean;
  
  // Tournament Settings
  bracketOrdering: 'random' | 'seeded' | 'set_order';
  autopilotMode: boolean;
  randomPlayerOrdering: boolean;
  rules: 'bca' | 'apa' | 'wpa' | 'usapl' | 'vnea' | 'local';
  ratingSystem: 'none' | 'fargo' | 'apa' | 'inhouse';
  
  // Financial Settings
  entryFee: number;
  adminFee: number;
  addedMoney: number;
  payoutType: 'places' | 'percentage';
  payoutStructurePlaces: string;
  payoutStructurePercentage: string;
  
  // Display & Access
  showSkillLevels: boolean;
  access: 'public' | 'private';
  sidePots: SidePot[];
  
  // Template
  saveAsTemplate: boolean;
  templateName: string;
}

interface TournamentCreatorProps {
  onClose: () => void;
  onSubmit: (data: TournamentFormData) => void;
}

export function TournamentCreator({ onClose, onSubmit }: TournamentCreatorProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [templates, setTemplates] = useState<TournamentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/tournament-templates');
        if (response.ok) {
          const templatesData = await response.json();
          setTemplates(templatesData || []); // Ensure we always have an array
        } else {
          console.warn('Failed to load templates:', response.status, response.statusText);
          setTemplates([]); // Graceful fallback
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        setTemplates([]); // Graceful fallback
      }
    };

    fetchTemplates();
  }, []);
  
  const [formData, setFormData] = useState<TournamentFormData>({
    // Basic Information
    name: '',
    applyTemplate: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    venue: null,
    
    // Age Restrictions (for tournaments without venues)
    isAgeRestricted: false,
    useUniformAgeRestriction: true,
    uniformAgeRestriction: TableAgeRestriction.AGES_21_PLUS,
    
    // Tournament Configuration
    playerType: 'scotch_doubles',
    gameType: 'nine_ball',
    tournamentType: 'chip_tournament',
    race: 1,
    estimatedPlayers: 16,
    playersPerTable: 4,
    
    // Chip Settings
    defaultChipsPerPlayer: 150,
    chipRanges: [
      { minRating: 200, maxRating: 400, chips: 200 },
      { minRating: 401, maxRating: 500, chips: 175 },
      { minRating: 501, maxRating: 600, chips: 150 },
      { minRating: 601, maxRating: 700, chips: 125 },
      { minRating: 701, maxRating: 800, chips: 100 }
    ],
    birthdayChip: true,
    
    // Tournament Settings
    bracketOrdering: 'random',
    autopilotMode: true,
    randomPlayerOrdering: true,
    rules: 'bca',
    ratingSystem: 'fargo',
    
    // Financial Settings
    entryFee: 50,
    adminFee: 5,
    addedMoney: 0,
    payoutType: 'places',
    payoutStructurePlaces: 'auto',
    payoutStructurePercentage: '25',
    
    // Display & Access
    showSkillLevels: true,
    access: 'public',
    sidePots: [],
    
    // Template
    saveAsTemplate: false,
    templateName: ''
  });

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/tournament-templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({ 
        ...template.settings,
        name: '', // Keep name empty for new tournament
        applyTemplate: templateId,
        startDateTime: '',
        endDateTime: '',
        saveAsTemplate: false,
        templateName: ''
      });
    }
  };

  const addSidePot = () => {
    if (formData.sidePots.length < 10) {
      const newSidePot: SidePot = {
        id: `sidepot-${Date.now()}`,
        name: `Side Pot ${formData.sidePots.length + 1}`,
        entryFee: 10,
        description: ''
      };
      setFormData(prev => ({
        ...prev,
        sidePots: [...prev.sidePots, newSidePot]
      }));
    }
  };

  const updateSidePot = (id: string, updates: Partial<SidePot>) => {
    setFormData(prev => ({
      ...prev,
      sidePots: prev.sidePots.map(pot => 
        pot.id === id ? { ...pot, ...updates } : pot
      )
    }));
  };

  const removeSidePot = (id: string) => {
    setFormData(prev => ({
      ...prev,
      sidePots: prev.sidePots.filter(pot => pot.id !== id)
    }));
  };

  const addChipRange = () => {
    const newRange: ChipRange = {
      minRating: 0,
      maxRating: 100,
      chips: 150
    };
    setFormData(prev => ({
      ...prev,
      chipRanges: [...prev.chipRanges, newRange]
    }));
  };

  const updateChipRange = (index: number, updates: Partial<ChipRange>) => {
    setFormData(prev => ({
      ...prev,
      chipRanges: prev.chipRanges.map((range, i) => 
        i === index ? { ...range, ...updates } : range
      )
    }));
  };

  const removeChipRange = (index: number) => {
    if (formData.chipRanges.length > 1) {
      setFormData(prev => ({
        ...prev,
        chipRanges: prev.chipRanges.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotalPot = () => {
    const entrants = formData.playerType === 'singles' ? formData.estimatedPlayers : Math.floor(formData.estimatedPlayers / 2);
    return (formData.entryFee * entrants) - formData.adminFee + formData.addedMoney;
  };

  const getPayoutStructureOptions = () => {
    const entrants = formData.playerType === 'singles' ? formData.estimatedPlayers : Math.floor(formData.estimatedPlayers / 2);
    
    if (entrants <= 4) return ['Winner Take All'];
    if (entrants <= 8) return ['Winner Take All', 'Top 2 Places'];
    if (entrants <= 16) return ['Winner Take All', 'Top 2 Places', 'Top 3 Places'];
    if (entrants <= 24) return ['Winner Take All', 'Top 2 Places', 'Top 3 Places', 'Top 4 Places'];
    if (entrants <= 31) return ['Winner Take All', 'Top 2 Places', 'Top 3 Places', 'Top 4 Places', 'Top 6 Places'];
    return ['Winner Take All', 'Top 2 Places', 'Top 3 Places', 'Top 4 Places', 'Top 6 Places', 'Top 8 Places'];
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Save tournament
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          venue: formData.venue
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tournament');
      }

      // Save as template if requested
      if (formData.saveAsTemplate && formData.templateName) {
        await fetch('/api/tournament-templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.templateName,
            settings: formData
          }),
        });
      }

      onSubmit(formData);
    } catch (error) {
      console.error('Failed to create tournament:', error);
      alert('Failed to create tournament. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.startDateTime && formData.venue;
      case 2:
        return formData.playerType && formData.gameType && formData.race > 0;
      case 3:
        return formData.chipRanges.length > 0 && formData.defaultChipsPerPlayer > 0;
      case 4:
        return formData.entryFee >= 0 && formData.adminFee >= 0 && formData.adminFee <= formData.entryFee;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const updateFormData = (updates: Partial<TournamentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Basic Information';
      case 2: return 'Tournament Configuration';
      case 3: return 'Chip Settings';
      case 4: return 'Financial Settings';
      case 5: return 'Final Settings & Review';
      default: return 'Tournament Setup';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-labelledby="tournament-modal-title" aria-modal="true">
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-sm sm:max-w-lg lg:max-w-4xl max-h-[95vh] flex flex-col shadow-xl">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 id="tournament-modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Create Tournament</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber === currentStep 
                    ? 'bg-purple-600 text-white'
                    : stepNumber < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < totalSteps && (
                  <div className={`w-8 h-1 ${
                    stepNumber < currentStep ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-300">
            Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Template Selection */}
              {templates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Apply Template (Optional)
                  </label>
                  <select
                    value={formData.applyTemplate}
                    onChange={(e) => {
                      updateFormData({ applyTemplate: e.target.value });
                      if (e.target.value) applyTemplate(e.target.value);
                    }}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  >
                    <option value="">Select a template...</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tournament Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  placeholder="Midway Scotch Chip 1/24/2026"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  maxLength={5000}
                  rows={3}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  placeholder="Tournament description..."
                />
                <div className="text-xs text-slate-500 mt-1">
                  {formData.description.length}/5000 characters
                </div>
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDateTime}
                    onChange={(e) => updateFormData({ startDateTime: e.target.value })}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    End Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDateTime}
                    onChange={(e) => updateFormData({ endDateTime: e.target.value })}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>
              </div>

              {/* Venue Selection */}
              <div>
                <VenueSelector
                  selectedVenue={formData.venue}
                  onVenueSelect={(venue) => updateFormData({ venue })}
                />
              </div>

              {/* Age Restrictions (only show when no venue selected) */}
              {!formData.venue && (
                <div className="border-t border-slate-200 dark:border-slate-600 pt-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                      <AlertTriangle className="h-5 w-5" />
                      <div>
                        <div className="font-semibold">Age Restrictions for Tournament Tables</div>
                        <div className="text-sm mt-1">
                          Since no venue is selected, you can set age restrictions for tournament tables. 
                          If unchecked, all players can participate regardless of age.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isAgeRestricted}
                        onChange={(e) => updateFormData({ isAgeRestricted: e.target.checked })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Age Restricted Tournament
                      </label>
                    </div>

                    {formData.isAgeRestricted && (
                      <div className="ml-6 space-y-4 pl-4 border-l-2 border-purple-200 dark:border-purple-800">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Table Age Restriction Mode
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                checked={formData.useUniformAgeRestriction}
                                onChange={() => updateFormData({ useUniformAgeRestriction: true })}
                                className="text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                Apply Age Restriction to All Tables
                              </span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                checked={!formData.useUniformAgeRestriction}
                                onChange={() => updateFormData({ useUniformAgeRestriction: false })}
                                className="text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                Set Table Age Restrictions Manually
                              </span>
                            </label>
                          </div>
                        </div>

                        {formData.useUniformAgeRestriction && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Age Restriction Level
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                formData.uniformAgeRestriction === TableAgeRestriction.AGES_18_20
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                              }`}>
                                <input
                                  type="radio"
                                  value={TableAgeRestriction.AGES_18_20}
                                  checked={formData.uniformAgeRestriction === TableAgeRestriction.AGES_18_20}
                                  onChange={(e) => updateFormData({ uniformAgeRestriction: e.target.value as TableAgeRestriction })}
                                  className="sr-only"
                                />
                                <span className="font-medium">18+</span>
                              </label>
                              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                formData.uniformAgeRestriction === TableAgeRestriction.AGES_21_PLUS
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                              }`}>
                                <input
                                  type="radio"
                                  value={TableAgeRestriction.AGES_21_PLUS}
                                  checked={formData.uniformAgeRestriction === TableAgeRestriction.AGES_21_PLUS}
                                  onChange={(e) => updateFormData({ uniformAgeRestriction: e.target.value as TableAgeRestriction })}
                                  className="sr-only"
                                />
                                <span className="font-medium">21+</span>
                              </label>
                            </div>
                          </div>
                        )}

                        {!formData.useUniformAgeRestriction && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>Manual Table Restrictions:</strong> Each table added to this tournament will need its age restriction set individually during tournament setup.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Tournament Configuration */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Player Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Player Type *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'singles', label: 'Singles (1v1)', description: 'Individual players compete' },
                    { value: 'doubles', label: 'Doubles (2v2)', description: 'Two-player teams compete' },
                    { value: 'scotch_doubles', label: 'Scotch Doubles (2v2 alternating shot)', description: 'Partners alternate shots' }
                  ].map(option => (
                    <label key={option.value} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.playerType === option.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                    }`}>
                      <input
                        type="radio"
                        value={option.value}
                        checked={formData.playerType === option.value}
                        onChange={(e) => updateFormData({ playerType: e.target.value as any })}
                        className="sr-only"
                      />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{option.label}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Game Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Game Type *
                </label>
                <select
                  value={formData.gameType}
                  onChange={(e) => updateFormData({ gameType: e.target.value as any })}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  required
                >
                  <option value="eight_ball">Eight Ball</option>
                  <option value="nine_ball">Nine Ball</option>
                  <option value="ten_ball">Ten Ball</option>
                </select>
              </div>

              {/* Race & Players */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Race *
                  </label>
                  <select
                    value={formData.race}
                    onChange={(e) => updateFormData({ race: parseInt(e.target.value) })}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    required
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Estimated Players/Teams *
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedPlayers}
                    onChange={(e) => updateFormData({ estimatedPlayers: parseInt(e.target.value) || 0 })}
                    min="2"
                    max="256"
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Players Per Table *
                  </label>
                  <input
                    type="number"
                    value={formData.playersPerTable}
                    onChange={(e) => updateFormData({ playersPerTable: parseInt(e.target.value) || 4 })}
                    min="2"
                    max="8"
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    required
                  />
                </div>
              </div>

              {/* Tournament Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bracket Ordering */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Bracket Ordering *
                  </label>
                  <select
                    value={formData.bracketOrdering}
                    onChange={(e) => updateFormData({ bracketOrdering: e.target.value as any })}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    required
                  >
                    <option value="random">Random Draw</option>
                    <option value="seeded">Seeded Draw</option>
                    <option value="set_order">Set Order</option>
                  </select>
                </div>

                {/* Rules */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Rules *
                  </label>
                  <select
                    value={formData.rules}
                    onChange={(e) => updateFormData({ rules: e.target.value as any })}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    required
                  >
                    <option value="bca">BCA</option>
                    <option value="apa">APA</option>
                    <option value="wpa">WPA</option>
                    <option value="usapl">USAPL</option>
                    <option value="vnea">VNEA</option>
                    <option value="local">Local</option>
                  </select>
                </div>
              </div>

              {/* Rating System */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Rating System *
                </label>
                <select
                  value={formData.ratingSystem}
                  onChange={(e) => updateFormData({ ratingSystem: e.target.value as any })}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  required
                >
                  <option value="none">None</option>
                  <option value="fargo">Fargo Rate</option>
                  <option value="apa">APA</option>
                  <option value="inhouse">In-House</option>
                </select>
              </div>

              {/* Autopilot & Random Ordering */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Autopilot Mode
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.autopilotMode}
                        onChange={() => updateFormData({ autopilotMode: true })}
                        className="mr-2"
                      />
                      <span>On</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!formData.autopilotMode}
                        onChange={() => updateFormData({ autopilotMode: false })}
                        className="mr-2"
                      />
                      <span>Off</span>
                    </label>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Auto-assigns entrants avoiding repeat matchups
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Random Player Ordering Each Round
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.randomPlayerOrdering}
                        onChange={() => updateFormData({ randomPlayerOrdering: true })}
                        className="mr-2"
                      />
                      <span>On</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!formData.randomPlayerOrdering}
                        onChange={() => updateFormData({ randomPlayerOrdering: false })}
                        className="mr-2"
                      />
                      <span>Off</span>
                    </label>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Shuffles players each round
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Chip Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Default Chips */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Default Number of Chips Per Player *
                </label>
                <input
                  type="number"
                  value={formData.defaultChipsPerPlayer}
                  onChange={(e) => updateFormData({ defaultChipsPerPlayer: parseInt(e.target.value) || 0 })}
                  min="1"
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  required
                />
              </div>

              {/* Birthday Chip */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.birthdayChip}
                    onChange={(e) => updateFormData({ birthdayChip: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Enable Birthday Chip
                  </span>
                </label>
                <div className="text-xs text-slate-500 mt-1">
                  Players get an extra chip on their birthday (individual player bonus)
                </div>
              </div>

              {/* Chip Ranges for Combined Fargo Ratings */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Chip Distribution by Combined Team Fargo Ratings
                  </label>
                  <button
                    type="button"
                    onClick={addChipRange}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Range
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.chipRanges.map((range, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-slate-300 dark:border-slate-600 rounded-lg">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Min Rating</label>
                          <input
                            type="number"
                            value={range.minRating}
                            onChange={(e) => updateChipRange(index, { minRating: parseInt(e.target.value) || 0 })}
                            className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Max Rating</label>
                          <input
                            type="number"
                            value={range.maxRating}
                            onChange={(e) => updateChipRange(index, { maxRating: parseInt(e.target.value) || 0 })}
                            className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Chips</label>
                          <input
                            type="number"
                            value={range.chips}
                            onChange={(e) => updateChipRange(index, { chips: parseInt(e.target.value) || 0 })}
                            className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeChipRange(index)}
                        disabled={formData.chipRanges.length <= 1}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Combined Fargo rating = Player 1 Fargo + Player 2 Fargo. Birthday chips are calculated per individual player and added after team chips are determined.
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Financial Settings */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Entry Fee & Admin Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Entry Fee *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.entryFee}
                      onChange={(e) => updateFormData({ entryFee: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-8 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Admin Fee
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={formData.entryFee}
                      value={formData.adminFee}
                      onChange={(e) => updateFormData({ adminFee: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-8 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Added Money
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.addedMoney}
                      onChange={(e) => updateFormData({ addedMoney: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-8 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Total Pot Calculation */}
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Prize Pool Calculation</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <div>Entry Fee: ${formData.entryFee} × {formData.playerType === 'singles' ? formData.estimatedPlayers : Math.floor(formData.estimatedPlayers / 2)} entrants = ${(formData.entryFee * (formData.playerType === 'singles' ? formData.estimatedPlayers : Math.floor(formData.estimatedPlayers / 2))).toFixed(2)}</div>
                  <div>Admin Fee: -${formData.adminFee}</div>
                  <div>Added Money: +${formData.addedMoney}</div>
                  <div className="border-t border-slate-300 dark:border-slate-600 pt-2 font-medium text-slate-900 dark:text-white">
                    Total Prize Pool: ${calculateTotalPot().toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Payout Structure */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Payout Type *
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.payoutType === 'places'}
                      onChange={() => updateFormData({ payoutType: 'places' })}
                      className="mr-2"
                    />
                    <span>Places</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.payoutType === 'percentage'}
                      onChange={() => updateFormData({ payoutType: 'percentage' })}
                      className="mr-2"
                    />
                    <span>Percentage</span>
                  </label>
                </div>

                {formData.payoutType === 'places' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Payout Structure (Places)
                    </label>
                    <select
                      value={formData.payoutStructurePlaces}
                      onChange={(e) => updateFormData({ payoutStructurePlaces: e.target.value })}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    >
                      <option value="auto">Auto (Based on field size)</option>
                      {getPayoutStructureOptions().map(option => (
                        <option key={option} value={option.toLowerCase().replace(' ', '_')}>{option}</option>
                      ))}
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                )}

                {formData.payoutType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Payout Structure (Percentage of Field)
                    </label>
                    <select
                      value={formData.payoutStructurePercentage}
                      onChange={(e) => updateFormData({ payoutStructurePercentage: e.target.value })}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    >
                      {['10', '15', '20', '25', '30', '35', '40', '45', '50'].map(percent => (
                        <option key={percent} value={percent}>{percent}% of field</option>
                      ))}
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Side Pots */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Side Pots (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={addSidePot}
                    disabled={formData.sidePots.length >= 10}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Side Pot
                  </button>
                </div>

                {formData.sidePots.length > 0 && (
                  <div className="space-y-3">
                    {formData.sidePots.map(pot => (
                      <div key={pot.id} className="p-4 border border-slate-300 dark:border-slate-600 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <input
                            type="text"
                            value={pot.name}
                            onChange={(e) => updateSidePot(pot.id, { name: e.target.value })}
                            className="flex-1 mr-3 p-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                            placeholder="Side pot name"
                          />
                          <button
                            type="button"
                            onClick={() => removeSidePot(pot.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Entry Fee</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={pot.entryFee}
                                onChange={(e) => updateSidePot(pot.id, { entryFee: parseFloat(e.target.value) || 0 })}
                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Description</label>
                            <input
                              type="text"
                              value={pot.description}
                              onChange={(e) => updateSidePot(pot.id, { description: e.target.value })}
                              className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                              placeholder="Optional description"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-2">
                  You can add up to 10 side pots per tournament
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Final Settings & Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Display & Access Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Show Player Skill Levels in Bracket
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.showSkillLevels}
                        onChange={() => updateFormData({ showSkillLevels: true })}
                        className="mr-2"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!formData.showSkillLevels}
                        onChange={() => updateFormData({ showSkillLevels: false })}
                        className="mr-2"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Tournament Access *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.access === 'public'}
                        onChange={() => updateFormData({ access: 'public' })}
                        className="mr-2"
                      />
                      <span>Public</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.access === 'private'}
                        onChange={() => updateFormData({ access: 'private' })}
                        className="mr-2"
                      />
                      <span>Private</span>
                    </label>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {formData.access === 'public' ? 'Anyone can view and join' : 'Invite-only tournament'}
                  </div>
                </div>
              </div>

              {/* Save as Template */}
              <div className="border border-slate-300 dark:border-slate-600 rounded-lg p-4">
                <label className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={formData.saveAsTemplate}
                    onChange={(e) => updateFormData({ saveAsTemplate: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Save as Template
                  </span>
                </label>

                {formData.saveAsTemplate && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={formData.templateName}
                      onChange={(e) => updateFormData({ templateName: e.target.value })}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                      placeholder="Enter template name"
                    />
                  </div>
                )}
              </div>

              {/* Tournament Summary */}
              <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Tournament Summary</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {formData.name}</div>
                  <div><strong>Type:</strong> {formData.playerType.replace('_', ' ')} {formData.gameType.replace('_', ' ')}</div>
                  <div><strong>Venue:</strong> {formData.venue?.name || 'Not selected'}</div>
                  <div><strong>Start:</strong> {formData.startDateTime ? new Date(formData.startDateTime).toLocaleString() : 'Not set'}</div>
                  <div><strong>Entry Fee:</strong> ${formData.entryFee}</div>
                  <div><strong>Total Prize Pool:</strong> ${calculateTotalPot().toFixed(2)}</div>
                  <div><strong>Chip Ranges:</strong> {formData.chipRanges.length} configured</div>
                  <div><strong>Side Pots:</strong> {formData.sidePots.length}</div>
                  <div><strong>Access:</strong> {formData.access}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-600">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 sm:px-6 sm:py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
              >
                Previous
              </button>
            )}
            
            <div className="flex-1" />
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isStepValid() || isLoading}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4" />
                    Create Tournament
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}