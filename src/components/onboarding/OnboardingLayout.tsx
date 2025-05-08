
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isLastStep?: boolean;
  isFirstStep?: boolean;
}

const OnboardingLayout = ({
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  isLastStep = false,
  isFirstStep = false
}: OnboardingLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="px-4 py-2">
        {!isFirstStep && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-gray-500" 
            onClick={onPrevious}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col px-4 py-6 max-w-md mx-auto w-full">
        <div className="mb-6 flex justify-between items-center w-full">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index}
              className={`h-1 flex-1 rounded-full mx-1 ${
                index < currentStep ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          {children}
        </div>

        <div className="mt-auto pt-6">
          <Button 
            className="w-full" 
            onClick={onNext}
          >
            {isLastStep ? 'Get Started' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
