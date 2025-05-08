
import { supabase } from "@/integrations/supabase/client";
import { FoodLog, MealType } from "@/types";
import { createUserIfNotExists } from "./baseService";

/**
 * Log food to the food_logs table
 */
export const logFoodEntry = async (
  userId: string,
  food: any, // Using any type to accommodate both Nutritionix and FatSecret API responses
  mealType: MealType,
  portionSize: number
): Promise<string | null> => {
  try {
    console.log("logFoodEntry called with:", { userId, food, mealType, portionSize });
    
    // Ensure user exists before logging food
    await createUserIfNotExists(userId);
    
    // Calculate adjusted nutrient values based on portion size
    const calories = Math.round((food.nf_calories || food.calories) * portionSize * 10) / 10;
    const protein = Math.round((food.nf_protein || food.protein || 0) * portionSize * 10) / 10;
    const carbs = Math.round((food.nf_total_carbohydrate || food.carbs || 0) * portionSize * 10) / 10;
    const fat = Math.round((food.nf_total_fat || food.fat || 0) * portionSize * 10) / 10;
    const fiber = food.nf_dietary_fiber || food.fiber 
      ? Math.round((food.nf_dietary_fiber || food.fiber) * portionSize * 10) / 10 
      : 0;
    
    console.log("Calculated nutrition:", { calories, protein, carbs, fat, fiber });
    
    const { data, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: userId,
        food_name: food.food_name,
        food_id: (food.nix_item_id || food.food_id || null)?.toString(),
        calories,
        protein,
        carbs,
        fat,
        fiber,
        portion_size: portionSize,
        portion_unit: food.serving_unit || 'serving',
        meal_type: mealType,
      })
      .select();

    if (error) {
      console.error('Error logging food:', error);
      return null;
    }

    return data?.[0]?.id || null;
  } catch (error) {
    console.error('Error logging food:', error);
    return null;
  }
};

/**
 * Fetch user's food logs
 */
export const fetchFoodLogs = async (
  userId: string, 
  limit?: number,
  startDate?: Date,
  endDate?: Date
): Promise<FoodLog[]> => {
  try {
    let query = supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    if (startDate) {
      query = query.gte('logged_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('logged_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching food logs:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map(log => ({
      id: log.id,
      userId: log.user_id,
      foodName: log.food_name,
      foodId: log.food_id,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      fiber: log.fiber || 0,
      portionSize: log.portion_size,
      portionUnit: log.portion_unit,
      mealType: log.meal_type as MealType,
      loggedAt: new Date(log.logged_at),
    }));
  } catch (error) {
    console.error('Error fetching food logs:', error);
    return [];
  }
};

/**
 * Get favorite/frequently logged foods
 */
export const fetchFavoriteFoods = async (userId: string, limit: number = 6): Promise<FoodLog[]> => {
  try {
    // First try using RPC function
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_favorite_foods', { 
        user_id_param: userId,
        limit_param: limit
      });
  
      if (!rpcError && rpcData) {
        return rpcData.map((log: any) => ({
          id: log.id,
          userId: log.user_id,
          foodName: log.food_name,
          foodId: log.food_id,
          calories: log.calories,
          protein: log.protein,
          carbs: log.carbs,
          fat: log.fat,
          fiber: log.fiber || 0,
          portionSize: log.portion_size,
          portionUnit: log.portion_unit,
          mealType: log.meal_type as MealType,
          loggedAt: new Date(log.logged_at),
        }));
      }
    } catch (rpcError) {
      console.error('Error using RPC for favorite foods:', rpcError);
      // Continue to fallback
    }
      
    // Fallback to direct query if RPC isn't set up
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(limit);
      
    if (fallbackError) {
      console.error('Fallback error fetching food logs:', fallbackError);
      return [];
    }
    
    if (!fallbackData) {
      return [];
    }
    
    return fallbackData.map(log => ({
      id: log.id,
      userId: log.user_id,
      foodName: log.food_name,
      foodId: log.food_id,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      fiber: log.fiber || 0,
      portionSize: log.portion_size,
      portionUnit: log.portion_unit,
      mealType: log.meal_type as MealType,
      loggedAt: new Date(log.logged_at),
    }));
  } catch (error) {
    console.error('Error fetching favorite foods:', error);
    return [];
  }
};

/**
 * Fetch nutritional summary (for charts and analytics)
 */
export const fetchNutritionSummary = async (
  userId: string, 
  period: 'day' | 'week' | 'month' = 'day',
  startDate?: Date,
  endDate?: Date
) => {
  try {
    // First try with RPC
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_nutrition_summary', {
        user_id_param: userId,
        period_param: period,
        start_date_param: startDate?.toISOString() || null,
        end_date_param: endDate?.toISOString() || null
      });
  
      if (!rpcError && rpcData) {
        return rpcData;
      }
    } catch (rpcError) {
      console.error('Error using RPC for nutrition summary:', rpcError);
      // Continue to fallback
    }
      
    // Fallback to direct query
    const { data: foodLogs, error: logsError } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });
    
    if (logsError) {
      console.error('Error fetching food logs for summary:', logsError);
      return [];
    }
    
    if (!foodLogs) {
      return [];
    }
    
    // Manually create daily summaries
    const dailySummaries = new Map();
    
    foodLogs.forEach((log: any) => {
      const date = new Date(log.logged_at);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!dailySummaries.has(dateStr)) {
        dailySummaries.set(dateStr, {
          date: dateStr,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        });
      }
      
      const summary = dailySummaries.get(dateStr);
      summary.calories += log.calories;
      summary.protein += log.protein;
      summary.carbs += log.carbs;
      summary.fat += log.fat;
      summary.fiber += log.fiber || 0;
    });
    
    return Array.from(dailySummaries.values());
  } catch (error) {
    console.error('Error fetching nutrition summary:', error);
    return [];
  }
};
