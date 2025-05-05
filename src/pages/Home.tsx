
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import NutritionSummaryCard from '@/components/dashboard/NutritionSummaryCard';
import RecentMealsCard from '@/components/dashboard/RecentMealsCard';
import FavoriteFoodsCard from '@/components/dashboard/FavoriteFoodsCard';
import QuickAddCard from '@/components/dashboard/QuickAddCard';
import WaterIntakeCard from '@/components/dashboard/WaterIntakeCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { FoodLog } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { fetchFoodLogs, fetchUserProfile, logFoodEntry } from '@/services/supabaseService';
import { getNutrients } from '@/services/nutritionixAPI';

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    goal: 2000,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDailyStats = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get user profile for daily goal
        const profile = await fetchUserProfile(user.id);
        let dailyGoal = 2000; // Default goal
        
        if (profile?.dailyGoal && typeof profile.dailyGoal === 'object') {
          const goalObj = profile.dailyGoal as any;
          if (goalObj.calories && typeof goalObj.calories === 'number') {
            dailyGoal = goalObj.calories;
          }
        }
        
        // Get today's logs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const logs = await fetchFoodLogs(user.id, undefined, today);
        
        // Calculate totals
        const totals = logs.reduce((acc, log) => {
          acc.calories += log.calories;
          acc.protein += log.protein;
          acc.carbs += log.carbs;
          acc.fat += log.fat;
          acc.fiber += log.fiber || 0;
          return acc;
        }, {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        });
        
        setTodayStats({
          ...totals,
          goal: dailyGoal
        });
      } catch (error) {
        console.error('Error loading daily stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDailyStats();
  }, [user]);

  const handleQuickAdd = async (item: { name: string, calories: number }) => {
    if (!user) return;
    
    // Refresh data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const logs = await fetchFoodLogs(user.id, undefined, today);
    
    // Calculate new totals
    const totals = logs.reduce((acc, log) => {
      acc.calories += log.calories;
      acc.protein += log.protein;
      acc.carbs += log.carbs;
      acc.fat += log.fat;
      acc.fiber += log.fiber || 0;
      return acc;
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    });
    
    setTodayStats({
      ...totals,
      goal: todayStats.goal
    });
  };

  const handleLogAgain = async (meal: FoodLog) => {
    if (!user) return;
    
    // For simplicity, we'll just re-log the same food with the same values
    try {
      const nutrients = await getNutrients(meal.foodName);
      if (nutrients) {
        await logFoodEntry(
          user.id,
          nutrients,
          meal.mealType,
          meal.portionSize / nutrients.serving_qty
        );
        
        toast({
          title: `Logged ${meal.foodName} again`,
          description: `${meal.calories} calories added to your log.`,
        });
        
        // Refresh stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const logs = await fetchFoodLogs(user.id, undefined, today);
        
        const totals = logs.reduce((acc, log) => {
          acc.calories += log.calories;
          acc.protein += log.protein;
          acc.carbs += log.carbs;
          acc.fat += log.fat;
          acc.fiber += log.fiber || 0;
          return acc;
        }, {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        });
        
        setTodayStats({
          ...totals,
          goal: todayStats.goal
        });
      }
    } catch (error) {
      console.error('Error logging food again:', error);
      toast({
        title: "Error",
        description: "Failed to log food again",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">BeyondDiet</h1>
        <Button
          size="sm"
          onClick={() => navigate('/search')}
          className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600"
        >
          <Plus className="h-4 w-4" /> Log Food
        </Button>
      </div>

      <div className="space-y-6">
        <NutritionSummaryCard
          calories={todayStats.calories}
          goal={todayStats.goal}
          protein={todayStats.protein}
          carbs={todayStats.carbs}
          fat={todayStats.fat}
          isLoading={isLoading}
        />

        <WaterIntakeCard />

        <FavoriteFoodsCard onLogFood={handleLogAgain} />
        
        <RecentMealsCard onLogAgain={handleLogAgain} />
        
        <QuickAddCard onQuickAdd={handleQuickAdd} />
      </div>
    </Layout>
  );
};

export default Home;
