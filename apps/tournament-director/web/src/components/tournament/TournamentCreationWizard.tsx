'use client';

import { useState } from 'react';
import { ChevronLeft, CheckCircle, Circle } from 'lucide-react';
import { BasicInformationStep } from '@/components/tournament/wizard/BasicInformationStep';
import { GameConfigurationStep } from '@/components/tournament/wizard/GameConfigurationStep';
import { ChipSettingsStep } from '@/components/tournament/wizard/ChipSettingsStep';
import { FinancialSettingsStep } from '@/components/tournament/wizard/FinancialSettingsStep';
import { ReviewAndCreateStep } from '@/components/tournament/wizard/ReviewAndCreateStep';

interface TournamentCreationWizardProps {
  onClose: () => void;
  onComplete: (data: any) => void;
}

export function TournamentCreationWizard({ onClose, onComplete }: TournamentCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    date: '',
    startTime: '',
    format: 'scotch_doubles',
    venueName: '',
    venueAddress: '',
    description: '',
    
    // Game Configuration
    gameType: '9_ball',
    raceToWins: 5,
    totalTables: 8,
    rules: 'WPA 9-Ball Rules',
    estimatedDuration: 240,
    
    // Chip Settings
    startingChips: 1000,
    chipDistributionMethod: 'equal_distribution',
    autopilotMode: true,
    winnerStays: false,
    preventRepeats: true,
    
    // Financial Settings
    entryFee: 40,
    adminFee: 5,
    addedMoney: 500,
    payoutStructure: [
      { place: 1, percentage: 50, amount: 0 },
      { place: 2, percentage: 30, amount: 0 },
      { place: 3, percentage: 20, amount: 0 }
    ],
    
    // Access Settings
    accessType: 'public'
  });

  const steps = [
    { id: 1, title: 'Basic Information', component: BasicInformationStep },
    { id: 2, title: 'Game Configuration', component: GameConfigurationStep },
    { id: 3, title: 'Chip Settings', component: ChipSettingsStep },
    { id: 4, title: 'Financial Settings', component: FinancialSettingsStep },
    { id: 5, title: 'Review & Create', component: ReviewAndCreateStep }
  ];

  const updateFormData = (newData: any) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create Tournament</h1>
              <p className="text-slate-600">Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                  index + 1 < currentStep 
                    ? 'bg-green-600 text-white' 
                    : index + 1 === currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 text-slate-500'
                }`}>
                  {index + 1 < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 rounded transition-colors ${
                    index + 1 < currentStep ? 'bg-green-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <CurrentStepComponent 
            formData={formData}
            updateFormData={updateFormData}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Previous
          </button>
          
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {currentStep === steps.length ? 'Create Tournament' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}