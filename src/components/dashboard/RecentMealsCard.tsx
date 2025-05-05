
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodLog } from '@/types';

interface RecentMealsCardProps {
  meals: FoodLog[];
  onLogAgain: (meal: FoodLog) => void;
}

const RecentMealsCard = ({ meals, onLogAgain }: RecentMealsCardProps) => {
  if (meals.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Recent Meals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No meals logged today. Start logging your first meal!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Recent Meals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {meals.map((meal, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
              onClick={() => onLogAgain(meal)}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                  {meal.mealType.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{meal.foodName}</p>
                  <p className="text-xs text-muted-foreground">
                    {meal.portionSize} {meal.portionUnit} • {meal.calories} kcal
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentMealsCard;
