'use client';

import { CheckCircle, Calendar, MapPin, Users, Trophy, Coins, DollarSign, Lock } from 'lucide-react';

interface ReviewAndCreateStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export function ReviewAndCreateStep({ formData, updateFormData }: ReviewAndCreateStepProps) {
  const totalPrizePool = (formData.entryFee - formData.adminFee) * 24 + formData.addedMoney;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Review Your Tournament</h2>
        <p className="text-slate-600">Please review all settings before creating your tournament</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Tournament Name:</span>
              <span className="font-medium">{formData.name || 'Untitled Tournament'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Date & Time:</span>
              <span className="font-medium">
                {formData.date ? new Date(formData.date).toLocaleDateString() : 'Not set'}
                {formData.startTime && ` at ${formData.startTime}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Format:</span>
              <span className="font-medium capitalize">{formData.format?.replace('_', ' ')}</span>
            </div>
            {formData.venueName && (
              <div className="flex justify-between">
                <span className="text-slate-600">Venue:</span>
                <span className="font-medium">{formData.venueName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Game Configuration */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-slate-900">Game Configuration</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Game Type:</span>
              <span className="font-medium capitalize">{formData.gameType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Race To:</span>
              <span className="font-medium">{formData.raceToWins} {formData.raceToWins === 1 ? 'game' : 'games'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tables:</span>
              <span className="font-medium">{formData.totalTables} tables</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Rules:</span>
              <span className="font-medium">{formData.rules}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Duration:</span>
              <span className="font-medium">{Math.floor(formData.estimatedDuration / 60)}h {formData.estimatedDuration % 60}m</span>
            </div>
          </div>
        </div>

        {/* Chip Settings */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Coins className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-slate-900">Chip Settings</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Starting Chips:</span>
              <span className="font-medium">{formData.startingChips} per player</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Distribution:</span>
              <span className="font-medium capitalize">{formData.chipDistributionMethod?.replace('_', ' ')}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${formData.autopilotMode ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className="text-slate-600">Autopilot Mode</span>
                <span className="font-medium">{formData.autopilotMode ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${formData.winnerStays ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className="text-slate-600">Winner Stays</span>
                <span className="font-medium">{formData.winnerStays ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${formData.preventRepeats ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className="text-slate-600">Prevent Repeats</span>
                <span className="font-medium">{formData.preventRepeats ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-900">Financial Settings</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Entry Fee:</span>
              <span className="font-medium">${formData.entryFee?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Admin Fee:</span>
              <span className="font-medium">${formData.adminFee?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Added Money:</span>
              <span className="font-medium">${formData.addedMoney?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-slate-600 font-medium">Total Prize Pool:</span>
              <span className="font-bold text-green-600">${totalPrizePool.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Payout Places:</span>
              <span className="font-medium">{formData.payoutStructure?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Structure */}
      {formData.payoutStructure && formData.payoutStructure.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Payout Structure</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {formData.payoutStructure.map((payout: any, index: number) => (
              <div key={index} className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="font-bold text-lg text-slate-900">
                  {payout.place === 1 ? '1st' : payout.place === 2 ? '2nd' : payout.place === 3 ? '3rd' : `${payout.place}th`}
                </div>
                <div className="text-sm text-slate-600">{payout.percentage}%</div>
                <div className="font-medium text-green-600">${payout.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Access & Privacy */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-4">
          <Lock className="inline w-4 h-4 mr-1" />
          Access & Privacy Settings
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { 
              value: 'public', 
              label: 'Public Tournament', 
              description: 'Anyone can find and register',
              icon: '🌍'
            },
            { 
              value: 'private', 
              label: 'Private Tournament', 
              description: 'Not listed publicly, registration by invite only',
              icon: '🔒'
            },
            { 
              value: 'invitation_only', 
              label: 'Invitation Only', 
              description: 'You must approve all registrations',
              icon: '📨'
            }
          ].map((access) => (
            <label key={access.value} className="relative">
              <input
                type="radio"
                name="accessType"
                value={access.value}
                checked={formData.accessType === access.value}
                onChange={(e) => updateFormData({ accessType: e.target.value })}
                className="sr-only"
              />
              <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.accessType === access.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">{access.icon}</div>
                  <div className="font-medium text-slate-900">{access.label}</div>
                  <div className="text-xs text-slate-600 mt-1">{access.description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Final Confirmation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Ready to Create Tournament</h3>
            <p className="text-sm text-blue-700 mt-1">
              Your tournament will be created with the settings above. You can modify most settings after creation,
              but some changes may affect already registered players.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}