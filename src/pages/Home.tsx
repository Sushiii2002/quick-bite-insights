
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import NutritionSummaryCard from '@/components/dashboard/NutritionSummaryCard';
import RecentMealsCard from '@/components/dashboard/RecentMealsCard';
import QuickAddCard from '@/components/dashboard/QuickAddCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { FoodLog } from '@/types';

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Demo data for UI display
  const todayStats = {
    calories: 1240,
    goal: 2000,
    protein: 75,
    carbs: 120,
    fat: 45,
    fiber: 18
  };

  const recentMeals: FoodLog[] = [
    {
      userId: '1',
      foodName: 'Greek Yogurt with Berries',
      calories: 180,
      protein: 15,
      carbs: 20,
      fat: 5,
      portionSize: 1,
      portionUnit: 'cup',
      mealType: 'breakfast',
      loggedAt: new Date(new Date().setHours(8, 30))
    },
    {
      userId: '1',
      foodName: 'Grilled Chicken Salad',
      calories: 350,
      protein: 32,
      carbs: 15,
      fat: 18,
      portionSize: 1,
      portionUnit: 'bowl',
      mealType: 'lunch',
      loggedAt: new Date(new Date().setHours(12, 15))
    },
    {
      userId: '1',
      foodName: 'Protein Bar',
      calories: 220,
      protein: 20,
      carbs: 25,
      fat: 8,
      portionSize: 1,
      portionUnit: 'bar',
      mealType: 'snack',
      loggedAt: new Date(new Date().setHours(15, 45))
    }
  ];

  const handleQuickAdd = (item: { name: string, calories: number }) => {
    toast({
      title: `Added ${item.name}`,
      description: `${item.calories} calories added to your log.`,
    });
  };

  const handleLogAgain = (meal: FoodLog) => {
    toast({
      title: `Logged ${meal.foodName} again`,
      description: `${meal.calories} calories added to your log.`,
    });
  };

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">BeyondDiet</h1>
        <Button
          size="sm"
          onClick={() => navigate('/search')}
          className="flex items-center gap-1"
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
        />

        <RecentMealsCard meals={recentMeals} onLogAgain={handleLogAgain} />
        
        <QuickAddCard onQuickAdd={handleQuickAdd} />
      </div>
    </Layout>
  );
};

export default Home;
