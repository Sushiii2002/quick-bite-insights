
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';

interface Goal {
  id: string;
  label: string;
  description: string;
  calorieAdjustment: number;
}

const goals: Goal[] = [
  { 
    id: 'lose',
    label: 'Lose Weight',
    description: 'Reduce calorie intake to create a deficit',
    calorieAdjustment: -250
  },
  { 
    id: 'maintain',
    label: 'Maintain Weight',
    description: 'Balance calorie intake and expenditure',
    calorieAdjustment: 0
  },
  { 
    id: 'gain',
    label: 'Gain Weight',
    description: 'Increase calorie intake to build muscle',
    calorieAdjustment: 250
  },
];

interface GoalSettingStepProps {
  onGoalSelected: (goalId: string, calorieAdjustment: number) => void;
}

const GoalSettingStep = ({ onGoalSelected }: GoalSettingStepProps) => {
  const [selectedGoal, setSelectedGoal] = useState<string>('maintain');
  
  const handleGoalChange = (goalId: string) => {
    setSelectedGoal(goalId);
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      onGoalSelected(goalId, goal.calorieAdjustment);
    }
  };
  
  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold text-center mb-2">What's your goal?</h2>
      <p className="text-gray-600 text-center mb-6">Select your primary nutrition goal</p>
      
      <RadioGroup 
        value={selectedGoal}
        onValueChange={handleGoalChange}
        className="space-y-4"
      >
        {goals.map((goal) => (
          <Label
            key={goal.id}
            htmlFor={goal.id}
            className="cursor-pointer"
          >
            <Card className={`p-4 transition-all ${selectedGoal === goal.id ? 'border-primary bg-primary/5' : ''}`}>
              <div className="flex items-start">
                <RadioGroupItem id={goal.id} value={goal.id} className="mt-1" />
                <div className="ml-3">
                  <h3 className="font-medium">{goal.label}</h3>
                  <p className="text-sm text-gray-500">{goal.description}</p>
                </div>
              </div>
            </Card>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
};

export default GoalSettingStep;
