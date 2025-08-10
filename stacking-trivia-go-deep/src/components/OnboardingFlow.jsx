import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOnboardingStacks, stackMetadata, getDifficultyColor } from '../utils/stackMetadata';

const OnboardingFlow = ({ onComplete, onSelectStack }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const onboardingStacks = getOnboardingStacks();

  const steps = [
    {
      title: 'Welcome to Deeply Trivial!',
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-lg text-amber-700 dark:text-amber-300">
            Ready to go five questions deep? Each stack takes you from surface knowledge to expert insights.
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Let's get you started with the perfect first challenge!
          </p>
        </div>
      )
    },
    {
      title: 'How Deep Questions Work',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <div className="font-semibold text-green-800 dark:text-green-200">Foundation</div>
                <div className="text-sm text-green-600 dark:text-green-300">Everyone knows this</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <div className="font-semibold text-yellow-800 dark:text-yellow-200">Context</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-300">Getting interesting...</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
              <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">5</div>
              <div>
                <div className="font-semibold text-red-800 dark:text-red-200">Expert</div>
                <div className="text-sm text-red-600 dark:text-red-300">Only true fans know this</div>
              </div>
            </div>
          </div>
          <p className="text-sm text-amber-600 dark:text-amber-400 text-center mt-4">
            Each correct answer unlocks the next deeper question!
          </p>
        </div>
      )
    },
    {
      title: 'Pick Your First Stack',
      content: (
        <div className="space-y-4">
          <p className="text-center text-amber-700 dark:text-amber-300 mb-4">
            Here are three great starting stacks, chosen for you:
          </p>
          <div className="grid grid-cols-1 gap-3">
            {onboardingStacks.map((stackKey) => {
              const metadata = stackMetadata[stackKey];
              return (
                <button
                  key={stackKey}
                  onClick={() => onSelectStack(stackKey)}
                  className="p-4 bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-700 rounded-lg hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-200 text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-amber-800 dark:text-amber-200 text-lg capitalize">
                      {stackKey.replace(/-/g, ' ').replace(/_/g, ' ')}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(metadata.difficulty)}`}>
                      {metadata.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                    {metadata.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {metadata.estimatedTime}
                    </span>
                    <div className="flex gap-1">
                      {metadata.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-4">
            Don't worry - you can explore all stacks after your first game!
          </p>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-amber-300 dark:border-amber-600 overflow-hidden">
          
          {/* Progress Bar */}
          <div className="h-2 bg-amber-100 dark:bg-amber-900/30">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Header */}
          <div className="p-6 pb-4 border-b border-amber-200 dark:border-amber-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200" style={{ fontFamily: 'Baskervville, serif' }}>
                {steps[currentStep].title}
              </h2>
              <button
                onClick={skipOnboarding}
                className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
              >
                Skip intro
              </button>
            </div>
            <div className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          {currentStep < steps.length - 1 && (
            <div className="p-6 pt-0 flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-4 py-2 text-amber-600 dark:text-amber-400 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-amber-700 dark:hover:text-amber-300"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors duration-200"
                style={{ fontFamily: 'Baskervville, serif' }}
              >
                {currentStep === steps.length - 2 ? 'Choose Your Stack' : 'Continue'}
              </button>
            </div>
          )}
        </div>

        {/* Welcome message */}
        <div className="text-center mt-4">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Welcome, <span className="font-semibold">{user?.username}</span>! Let's make you a trivia master.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
