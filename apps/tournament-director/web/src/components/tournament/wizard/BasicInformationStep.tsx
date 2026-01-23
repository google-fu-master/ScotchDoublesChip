'use client';

import { Calendar, MapPin, FileText } from 'lucide-react';

interface BasicInformationStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export function BasicInformationStep({ formData, updateFormData }: BasicInformationStepProps) {
  const tournamentFormats = [
    { value: 'scotch_doubles', label: 'Scotch Doubles', description: 'Two players per team' },
    { value: 'singles', label: 'Singles', description: 'Individual players' },
    { value: 'team_event', label: 'Team Event', description: 'Multiple players per team' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Basic Tournament Information</h2>
        <p className="text-slate-600">Let's start with the essentials for your tournament</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tournament Details */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tournament Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="e.g., Spring Championship Scotch Doubles"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Tournament Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => updateFormData({ date: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => updateFormData({ startTime: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">
              Tournament Format *
            </label>
            <div className="space-y-3">
              {tournamentFormats.map((format) => (
                <label key={format.value} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={formData.format === format.value}
                    onChange={(e) => updateFormData({ format: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-slate-900">{format.label}</div>
                    <div className="text-sm text-slate-600">{format.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Venue Information */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Venue Name
            </label>
            <input
              type="text"
              value={formData.venueName}
              onChange={(e) => updateFormData({ venueName: e.target.value })}
              placeholder="e.g., Downtown Billiards Club"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Venue Address
            </label>
            <textarea
              value={formData.venueAddress}
              onChange={(e) => updateFormData({ venueAddress: e.target.value })}
              placeholder="Street address, city, state, zip"
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Tournament Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Optional description, special rules, or additional information..."
              rows={4}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
            <p className="font-medium mb-1">Tournament Setup Tips</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Choose a clear, descriptive name that players will recognize</li>
              <li>• Make sure your venue can accommodate the expected number of players</li>
              <li>• Consider travel time when setting your start time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}