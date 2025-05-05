
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface NutritionSummaryCardProps {
  calories: number;
  goal: number;
  protein: number;
  carbs: number;
  fat: number;
  isLoading?: boolean;
}

const NutritionSummaryCard = ({ 
  calories, 
  goal, 
  protein, 
  carbs, 
  fat, 
  isLoading = false 
}: NutritionSummaryCardProps) => {
  const percentage = Math.min(Math.round((calories / goal) * 100), 100);
  
  const macroTotal = protein + carbs + fat;
  const proteinPercentage = macroTotal > 0 ? Math.round((protein / macroTotal) * 100) : 0;
  const carbsPercentage = macroTotal > 0 ? Math.round((carbs / macroTotal) * 100) : 0;
  const fatPercentage = macroTotal > 0 ? Math.round((fat / macroTotal) * 100) : 0;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Today's Nutrition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded"></div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50 p-2 rounded-md text-center">
                <p className="text-xs text-blue-800">Protein</p>
                <div className="h-5 w-12 mx-auto bg-blue-100 rounded my-1"></div>
                <div className="h-3 w-8 mx-auto bg-blue-100 rounded"></div>
              </div>
              <div className="bg-green-50 p-2 rounded-md text-center">
                <p className="text-xs text-green-800">Carbs</p>
                <div className="h-5 w-12 mx-auto bg-green-100 rounded my-1"></div>
                <div className="h-3 w-8 mx-auto bg-green-100 rounded"></div>
              </div>
              <div className="bg-red-50 p-2 rounded-md text-center">
                <p className="text-xs text-red-800">Fat</p>
                <div className="h-5 w-12 mx-auto bg-red-100 rounded my-1"></div>
                <div className="h-3 w-8 mx-auto bg-red-100 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Today's Nutrition</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Calories</span>
              <span className="text-sm font-medium">{calories} / {goal} kcal ({percentage}%)</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-500 ease-in-out"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Protein Progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-blue-700">Protein</span>
                <span className="text-xs font-medium">{Math.round(protein)}g ({proteinPercentage}%)</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${proteinPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Carbs Progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-green-700">Carbs</span>
                <span className="text-xs font-medium">{Math.round(carbs)}g ({carbsPercentage}%)</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${carbsPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Fat Progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-orange-700">Fat</span>
                <span className="text-xs font-medium">{Math.round(fat)}g ({fatPercentage}%)</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${fatPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionSummaryCard;
