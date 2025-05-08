
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { FoodLog } from '@/types';
import { FoodItem, searchFoods } from '@/services/fatSecretAPI';
import { logFoodEntry } from '@/services/supabaseService';
import { useAuth } from '@/context/AuthContext';

export const useSearchService = () => {
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFoodSelect = async (food: FoodItem) => {
    setSelectedFood(food);
  };

  const handleLogFood = async (logData: Omit<FoodLog, 'id' | 'userId' | 'loggedAt'>) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to log food.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      console.log("Logging food with data:", logData);
      console.log("User ID:", user.id);
      
      // Create a simplified food item structure that matches what logFoodEntry expects
      const foodItem = {
        food_name: logData.foodName,
        nix_item_id: logData.foodId || null,
        nf_calories: logData.calories,
        nf_protein: logData.protein,
        nf_total_carbohydrate: logData.carbs,
        nf_total_fat: logData.fat,
        nf_dietary_fiber: logData.fiber || 0,
        serving_qty: 1,
        serving_unit: logData.portionUnit
      };
      
      const logId = await logFoodEntry(
        user.id,
        foodItem,
        logData.mealType,
        logData.portionSize
      );
      
      if (logId) {
        toast({
          title: 'Food Logged',
          description: `${logData.foodName} added to your diary.`,
        });
        setSelectedFood(null);
      } else {
        console.error("Failed to log food - logId is null");
        toast({
          title: 'Error',
          description: 'Failed to log food. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error logging food:', error);
      toast({
        title: 'Error',
        description: 'Failed to log food. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const searchFoodsHandler = async (query: string) => {
    if (query.length < 2) return [];
    
    setIsLoading(true);
    try {
      const results = await searchFoods(query);
      return results;
    } catch (error) {
      console.error('Error searching foods:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search foods. Please try again.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedFood,
    isLoading,
    handleFoodSelect,
    handleLogFood,
    searchFoodsHandler,
    setSelectedFood
  };
};
