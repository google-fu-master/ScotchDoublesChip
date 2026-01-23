'use client';

import { Coins, Shuffle, Settings2, Zap } from 'lucide-react';

interface ChipSettingsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export function ChipSettingsStep({ formData, updateFormData }: ChipSettingsStepProps) {
  const startingChipOptions = [
    { value: 500, label: '500 chips', description: 'Quick games' },
    { value: 1000, label: '1,000 chips', description: 'Balanced play' },
    { value: 1500, label: '1,500 chips', description: 'Extended games' },
    { value: 2000, label: '2,000 chips', description: 'Long format' }
  ];

  const distributionMethods = [
    {
      value: 'equal_distribution',
      label: 'Equal Distribution',
      description: 'Each team starts with the same number of chips',
      icon: '⚖️'
    },
    {
      value: 'skill_based',
      label: 'Skill-Based Distribution',
      description: 'Chips distributed based on player skill ratings',
      icon: '🎯'
    },
    {
      value: 'random_distribution',
      label: 'Random Distribution',
      description: 'Random chip allocation for added excitement',
      icon: '🎲'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Chip Settings</h2>
        <p className="text-slate-600">Configure the chip system for your tournament</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Starting Chips */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">
              <Coins className="inline w-4 h-4 mr-1" />
              Starting Chips per Team *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {startingChipOptions.map((option) => (
                <label key={option.value} className="relative">
                  <input
                    type="radio"
                    name="startingChips"
                    value={option.value}
                    checked={formData.startingChips === option.value}
                    onChange={(e) => updateFormData({ startingChips: parseInt(e.target.value) })}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.startingChips === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <div className="font-medium text-slate-900">{option.label}</div>
                    <div className="text-xs text-slate-600 mt-1">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">
              <Shuffle className="inline w-4 h-4 mr-1" />
              Chip Distribution Method *
            </label>
            <div className="space-y-3">
              {distributionMethods.map((method) => (
                <label key={method.value} className="relative">
                  <input
                    type="radio"
                    name="chipDistributionMethod"
                    value={method.value}
                    checked={formData.chipDistributionMethod === method.value}
                    onChange={(e) => updateFormData({ chipDistributionMethod: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.chipDistributionMethod === method.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{method.icon}</span>
                      <div>
                        <div className="font-medium text-slate-900">{method.label}</div>
                        <div className="text-sm text-slate-600 mt-1">{method.description}</div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Game Options */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">
              <Settings2 className="inline w-4 h-4 mr-1" />
              Game Options
            </label>
            <div className="space-y-4">
              <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.autopilotMode}
                  onChange={(e) => updateFormData({ autopilotMode: e.target.checked })}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-slate-900">Autopilot Mode</span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Automatically assign teams to tables and manage rotations
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.winnerStays}
                  onChange={(e) => updateFormData({ winnerStays: e.target.checked })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-slate-900">Winner Stays</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Winning teams remain at their table for the next match
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.preventRepeats}
                  onChange={(e) => updateFormData({ preventRepeats: e.target.checked })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-slate-900">Prevent Repeat Matchups</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Avoid teams playing against each other multiple times when possible
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Chip Preview */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Tournament Chip Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <Coins className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">{formData.startingChips}</div>
            <div className="text-sm text-slate-600">Starting Chips</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600 mb-1">24</div>
            <div className="text-sm text-slate-600">Max Teams</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {(formData.startingChips * 24).toLocaleString()}
            </div>
            <div className="text-sm text-slate-600">Total Chips</div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How Chips Work</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Teams bet chips on their matches</li>
              <li>• Winners take the pot from each match</li>
              <li>• Higher chip counts = better final position</li>
              <li>• Autopilot mode handles betting automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}