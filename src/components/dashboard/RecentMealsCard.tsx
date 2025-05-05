
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodLog } from '@/types';
import { fetchFoodLogs } from '@/services/supabaseService';
import { useAuth } from '@/context/AuthContext';

interface RecentMealsCardProps {
  onLogAgain: (meal: FoodLog) => void;
}

const RecentMealsCard = ({ onLogAgain }: RecentMealsCardProps) => {
  const [meals, setMeals] = useState<FoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadRecentMeals = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // Get today's logs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const logs = await fetchFoodLogs(user.id, 5, today);
        setMeals(logs);
      } catch (error) {
        console.error('Error loading recent meals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecentMeals();
  }, [user]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Recent Meals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 animate-pulse">
            {[...Array(3)].map((_, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-200 rounded mt-1" />
                  </div>
                </div>
                <div className="h-3 w-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {meals.map((meal) => (
            <div 
              key={meal.id} 
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
