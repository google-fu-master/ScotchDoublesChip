'use client';

import { DollarSign, PiggyBank, Gift, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FinancialSettingsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export function FinancialSettingsStep({ formData, updateFormData }: FinancialSettingsStepProps) {
  const [payoutPlaces, setPayoutPlaces] = useState(3);
  const maxParticipants = 24; // Based on 8 tables, max 3 teams per table

  const calculatePrizePool = () => {
    const totalEntryFees = (formData.entryFee - formData.adminFee) * maxParticipants;
    return totalEntryFees + formData.addedMoney;
  };

  const updatePayoutStructure = (places: number) => {
    setPayoutPlaces(places);
    const prizePool = calculatePrizePool();
    
    let structure: { place: number; percentage: number; amount: number }[] = [];
    if (places === 3) {
      structure = [
        { place: 1, percentage: 50, amount: prizePool * 0.50 },
        { place: 2, percentage: 30, amount: prizePool * 0.30 },
        { place: 3, percentage: 20, amount: prizePool * 0.20 }
      ];
    } else if (places === 4) {
      structure = [
        { place: 1, percentage: 40, amount: prizePool * 0.40 },
        { place: 2, percentage: 30, amount: prizePool * 0.30 },
        { place: 3, percentage: 20, amount: prizePool * 0.20 },
        { place: 4, percentage: 10, amount: prizePool * 0.10 }
      ];
    } else if (places === 6) {
      structure = [
        { place: 1, percentage: 35, amount: prizePool * 0.35 },
        { place: 2, percentage: 25, amount: prizePool * 0.25 },
        { place: 3, percentage: 20, amount: prizePool * 0.20 },
        { place: 4, percentage: 10, amount: prizePool * 0.10 },
        { place: 5, percentage: 6, amount: prizePool * 0.06 },
        { place: 6, percentage: 4, amount: prizePool * 0.04 }
      ];
    }
    
    updateFormData({ payoutStructure: structure });
  };

  useEffect(() => {
    updatePayoutStructure(payoutPlaces);
  }, [formData.entryFee, formData.adminFee, formData.addedMoney]);

  const prizePool = calculatePrizePool();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Financial Settings</h2>
        <p className="text-slate-600">Set entry fees, admin costs, and prize distribution</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Entry Fees */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Entry Fee per Team *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-500">$</span>
              <input
                type="number"
                min="0"
                step="5"
                value={formData.entryFee}
                onChange={(e) => updateFormData({ entryFee: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="40"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <PiggyBank className="inline w-4 h-4 mr-1" />
              Admin Fee per Team
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-500">$</span>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.adminFee}
                onChange={(e) => updateFormData({ adminFee: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="5"
              />
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Covers venue, supplies, and organization costs
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Gift className="inline w-4 h-4 mr-1" />
              Added Money
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-500">$</span>
              <input
                type="number"
                min="0"
                step="25"
                value={formData.addedMoney}
                onChange={(e) => updateFormData({ addedMoney: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="500"
              />
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Extra money added to increase the prize pool
            </p>
          </div>
        </div>

        {/* Prize Pool Summary */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Prize Pool Calculation</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Entry fees ({maxParticipants} teams × ${(formData.entryFee - formData.adminFee).toFixed(2)}):</span>
                <span className="font-medium">${((formData.entryFee - formData.adminFee) * maxParticipants).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Added money:</span>
                <span className="font-medium">${formData.addedMoney.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-slate-900 font-semibold">Total Prize Pool:</span>
                  <span className="font-bold text-green-600 text-lg">${prizePool.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Admin fees collected:</span>
                <span>${(formData.adminFee * maxParticipants).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">
              <TrendingUp className="inline w-4 h-4 mr-1" />
              Number of Payout Places
            </label>
            <div className="flex gap-3">
              {[3, 4, 6].map((places) => (
                <button
                  key={places}
                  onClick={() => updatePayoutStructure(places)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    payoutPlaces === places
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {places} Places
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payout Structure */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Payout Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {formData.payoutStructure?.map((payout: any, index: number) => (
            <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-lg font-bold text-slate-900 mb-1">
                {payout.place === 1 ? '1st' : payout.place === 2 ? '2nd' : payout.place === 3 ? '3rd' : `${payout.place}th`}
              </div>
              <div className="text-sm text-slate-600 mb-2">{payout.percentage}%</div>
              <div className="text-lg font-bold text-green-600">${payout.amount.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600 mb-1">${formData.entryFee.toFixed(2)}</div>
          <div className="text-sm text-blue-800">Entry Fee per Team</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600 mb-1">${prizePool.toFixed(2)}</div>
          <div className="text-sm text-green-800">Total Prize Pool</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600 mb-1">{formData.payoutStructure?.length || 0}</div>
          <div className="text-sm text-purple-800">Payout Places</div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Financial Tips</p>
            <ul className="space-y-1 text-yellow-700">
              <li>• Entry fees are collected when teams register</li>
              <li>• Admin fees help cover venue and operational costs</li>
              <li>• Added money makes tournaments more attractive to players</li>
              <li>• Consider your local market when setting entry fees</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}