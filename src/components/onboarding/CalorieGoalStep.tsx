
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface CalorieGoalStepProps {
  recommendedCalories: number;
  initialCalories?: number;
  onCaloriesChange: (calories: number) => void;
}

const CalorieGoalStep = ({ 
  recommendedCalories, 
  initialCalories,
  onCaloriesChange 
}: CalorieGoalStepProps) => {
  const [customCalories, setCustomCalories] = useState<number>(
    initialCalories || recommendedCalories
  );

  const handleCaloriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setCustomCalories(value);
    onCaloriesChange(value);
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold text-center mb-2">Daily Calorie Goal</h2>
      <p className="text-gray-600 text-center mb-6">Set your target daily calorie intake</p>
      
      <Card className="p-4 mb-4">
        <div className="space-y-4">
          <div className="text-center p-4 bg-primary/10 rounded-lg mb-4">
            <h3 className="text-sm font-medium text-gray-600">Recommended Daily Calories</h3>
            <div className="text-3xl font-bold text-primary mt-2">
              {recommendedCalories}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customCalories">Custom Goal (calories)</Label>
            <Input
              id="customCalories"
              type="number"
              value={customCalories}
              onChange={handleCaloriesChange}
            />
          </div>
        </div>
      </Card>
      
      <p className="text-sm text-gray-500 text-center mt-2">
        Your calorie goal can be adjusted at any time from your profile settings.
      </p>
    </div>
  );
};

export default CalorieGoalStep;
