
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface NutritionSummaryCardProps {
  calories: number;
  goal: number;
  protein: number;
  carbs: number;
  fat: number;
}

const NutritionSummaryCard = ({ calories, goal, protein, carbs, fat }: NutritionSummaryCardProps) => {
  const percentage = Math.min(Math.round((calories / goal) * 100), 100);
  
  const macroTotal = protein + carbs + fat;
  const proteinPercentage = macroTotal > 0 ? Math.round((protein / macroTotal) * 100) : 0;
  const carbsPercentage = macroTotal > 0 ? Math.round((carbs / macroTotal) * 100) : 0;
  const fatPercentage = macroTotal > 0 ? Math.round((fat / macroTotal) * 100) : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Today's Nutrition</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{calories} / {goal} kcal</span>
              <span className="text-sm font-medium">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-100 p-2 rounded-md text-center">
              <p className="text-xs text-blue-800">Protein</p>
              <p className="font-semibold">{protein}g</p>
              <p className="text-xs">{proteinPercentage}%</p>
            </div>
            <div className="bg-green-100 p-2 rounded-md text-center">
              <p className="text-xs text-green-800">Carbs</p>
              <p className="font-semibold">{carbs}g</p>
              <p className="text-xs">{carbsPercentage}%</p>
            </div>
            <div className="bg-red-100 p-2 rounded-md text-center">
              <p className="text-xs text-red-800">Fat</p>
              <p className="font-semibold">{fat}g</p>
              <p className="text-xs">{fatPercentage}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionSummaryCard;
