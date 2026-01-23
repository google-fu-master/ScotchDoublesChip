'use client';

import { Trophy, Clock, Settings } from 'lucide-react';

interface GameConfigurationStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export function GameConfigurationStep({ formData, updateFormData }: GameConfigurationStepProps) {
  const gameTypes = [
    { value: '8_ball', label: '8-Ball', description: 'Classic pocket billiards' },
    { value: '9_ball', label: '9-Ball', description: 'Fast-paced rotation game' },
    { value: '10_ball', label: '10-Ball', description: 'Call shot rotation game' },
    { value: 'straight_pool', label: 'Straight Pool', description: 'Call pocket and ball' }
  ];

  const raceToOptions = [
    { value: 3, label: 'Race to 3', duration: 120 },
    { value: 5, label: 'Race to 5', duration: 180 },
    { value: 7, label: 'Race to 7', duration: 240 },
    { value: 9, label: 'Race to 9', duration: 300 }
  ];

  const rulesOptions = [
    'WPA 9-Ball Rules',
    'BCA 8-Ball Rules',
    'WPA 10-Ball Rules',
    'Custom House Rules'
  ];

  const updateRaceToWins = (value: number) => {
    const option = raceToOptions.find(opt => opt.value === value);
    updateFormData({ 
      raceToWins: value,
      estimatedDuration: option?.duration || 240
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Game Configuration</h2>
        <p className="text-slate-600">Set up the game rules and tournament structure</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Game Type */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">
              <Trophy className="inline w-4 h-4 mr-1" />
              Game Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {gameTypes.map((game) => (
                <label key={game.value} className="relative">
                  <input
                    type="radio"
                    name="gameType"
                    value={game.value}
                    checked={formData.gameType === game.value}
                    onChange={(e) => updateFormData({ gameType: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.gameType === game.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <div className="font-medium text-slate-900">{game.label}</div>
                    <div className="text-xs text-slate-600 mt-1">{game.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">
              Race Format *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {raceToOptions.map((option) => (
                <label key={option.value} className="relative">
                  <input
                    type="radio"
                    name="raceToWins"
                    value={option.value}
                    checked={formData.raceToWins === option.value}
                    onChange={() => updateRaceToWins(option.value)}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.raceToWins === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <div className="font-medium text-slate-900">{option.label}</div>
                    <div className="text-xs text-slate-600 mt-1">
                      ~{Math.floor(option.duration / 60)}h {option.duration % 60}m avg
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Tournament Settings */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Settings className="inline w-4 h-4 mr-1" />
              Number of Tables *
            </label>
            <input
              type="number"
              min="1"
              max="32"
              value={formData.totalTables}
              onChange={(e) => updateFormData({ totalTables: parseInt(e.target.value) || 8 })}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-slate-600 mt-1">
              This affects matchmaking and tournament pacing
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rules Set *
            </label>
            <select
              value={formData.rules}
              onChange={(e) => updateFormData({ rules: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {rulesOptions.map((rule) => (
                <option key={rule} value={rule}>{rule}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Estimated Duration (minutes)
            </label>
            <input
              type="number"
              min="60"
              max="720"
              value={formData.estimatedDuration}
              onChange={(e) => updateFormData({ estimatedDuration: parseInt(e.target.value) || 240 })}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-slate-600 mt-1">
              Average time: {Math.floor(formData.estimatedDuration / 60)}h {formData.estimatedDuration % 60}m
            </p>
          </div>
        </div>
      </div>

      {/* Tournament Structure Preview */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Tournament Structure Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">{formData.totalTables}</div>
            <div className="text-slate-600">Tables Available</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">24</div>
            <div className="text-slate-600">Max Teams (12 per table)</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {Math.floor(formData.estimatedDuration / 60)}h {formData.estimatedDuration % 60}m
            </div>
            <div className="text-slate-600">Estimated Duration</div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">Scotch Doubles Format</p>
            <p className="text-green-700">
              In scotch doubles, teams of 2 players alternate shots throughout each rack. 
              This creates a unique strategic dynamic and is perfect for social tournaments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}