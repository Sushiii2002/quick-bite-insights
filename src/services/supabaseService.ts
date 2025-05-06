import { supabase } from "@/integrations/supabase/client";
import { FoodLog, MealType, WaterIntake, FatSecretFood } from "@/types";

// User quick adds
export interface QuickAddItem {
  id?: string;
  userId: string;
  foodId: string;
  foodName: string;
  calories: number;
  displayOrder: number;
}

// Fetch user's custom quick add items
export const fetchQuickAddItems = async (userId: string): Promise<QuickAddItem[]> => {
  try {
    const { data, error } = await supabase
      .from('user_quick_adds')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching quick add items:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      foodId: item.food_id,
      foodName: item.food_name,
      calories: item.calories,
      displayOrder: item.display_order,
    }));
  } catch (error) {
    console.error('Error fetching quick add items:', error);
    return [];
  }
};

// Save new quick add item
export const saveQuickAddItem = async (item: Omit<QuickAddItem, 'id'>): Promise<string | null> => {
  try {
    // Convert camelCase to snake_case for Supabase
    const { data, error } = await supabase
      .from('user_quick_adds')
      .insert({
        user_id: item.userId,
        food_id: item.foodId,
        food_name: item.foodName,
        calories: item.calories,
        display_order: item.displayOrder,
      })
      .select();

    if (error) {
      console.error('Error saving quick add item:', error);
      return null;
    }

    return data?.[0]?.id || null;
  } catch (error) {
    console.error('Error saving quick add item:', error);
    return null;
  }
};

// Delete quick add item
export const deleteQuickAddItem = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_quick_adds')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting quick add item:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting quick add item:', error);
    return false;
  }
};

// Log food to the food_logs table
export const logFoodEntry = async (
  userId: string,
  food: FatSecretFood | any,
  mealType: MealType,
  portionSize: number
): Promise<string | null> => {
  try {
    // Handle FatSecret API format or our internal format
    let calories, protein, carbs, fat, fiber, servingQty, servingUnit;
    
    if (food.servings && food.servings.serving) {
      // FatSecret format
      const serving = Array.isArray(food.servings.serving) 
        ? food.servings.serving[0] 
        : food.servings.serving;
      
      calories = serving.calories * portionSize;
      protein = serving.protein * portionSize;
      carbs = serving.carbohydrate * portionSize;
      fat = serving.fat * portionSize;
      fiber = serving.fiber ? serving.fiber * portionSize : null;
      servingQty = serving.number_of_units || 1;
      servingUnit = serving.measurement_description || 'serving';
    } else {
      // Original Nutritionix format
      calories = Math.round(food.nf_calories * portionSize * 10) / 10;
      protein = Math.round(food.nf_protein * portionSize * 10) / 10;
      carbs = Math.round(food.nf_total_carbohydrate * portionSize * 10) / 10;
      fat = Math.round(food.nf_total_fat * portionSize * 10) / 10;
      fiber = food.nf_dietary_fiber 
        ? Math.round(food.nf_dietary_fiber * portionSize * 10) / 10 
        : null;
      servingQty = food.serving_qty * portionSize;
      servingUnit = food.serving_unit;
    }

    const foodName = food.food_name || food.food_name;
    const foodId = food.food_id || food.nix_item_id || null;

    const { data, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: userId,
        food_name: foodName,
        food_id: foodId,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        portion_size: servingQty,
        portion_unit: servingUnit,
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

// Log quick add item directly
export const logQuickAddItem = async (
  userId: string,
  quickAddItem: QuickAddItem,
  mealType: MealType
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: userId,
        food_name: quickAddItem.foodName,
        food_id: quickAddItem.foodId,
        calories: quickAddItem.calories,
        protein: 0, // Default values since quick adds don't track complete nutrition
        carbs: 0,
        fat: 0,
        portion_size: 1,
        portion_unit: 'serving',
        meal_type: mealType,
      })
      .select();

    if (error) {
      console.error('Error logging quick add item:', error);
      return null;
    }

    return data?.[0]?.id || null;
  } catch (error) {
    console.error('Error logging quick add item:', error);
    return null;
  }
};

// Fetch user's food logs
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
      mealType: log.meal_type as MealType, // Type assertion to ensure it matches our expected type
      loggedAt: new Date(log.logged_at),
    }));
  } catch (error) {
    console.error('Error fetching food logs:', error);
    return [];
  }
};

// Get favorite/frequently logged foods
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

// Fetch nutritional summary (for charts and analytics)
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

// Get current user
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

// Fetch user profile
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      height: data.height,
      weight: data.weight,
      dailyGoal: data.daily_goal,
      dailyData: data.daily_data
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, profile: any) => {
  try {
    const { error } = await supabase
      .from('users')
      .update(profile)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

// Track water intake - using RLS and direct JSON structure without a separate table
export const updateWaterIntake = async (userId: string, glasses: number): Promise<boolean> => {
  try {
    const date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
    
    // Update the user profile with water intake data
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching user data for water tracking:', fetchError);
      return false;
    }
    
    // Create or update the water_intake object in the user profile
    const updatedDailyData = userData.daily_data || {};
    updatedDailyData[date] = {
      ...(updatedDailyData[date] || {}),
      water_glasses: glasses
    };
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        daily_data: updatedDailyData 
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating water intake:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking water intake:', error);
    return false;
  }
};

// Get water intake for today
export const getTodayWaterIntake = async (userId: string): Promise<number> => {
  try {
    const date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
    
    const { data, error } = await supabase
      .from('users')
      .select('daily_data')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching water intake:', error);
      return 0;
    }
    
    // Get the water glasses from the daily_data object
    const dailyData = data?.daily_data || {};
    const todayData = dailyData[date] || {};
    
    return todayData.water_glasses || 0;
  } catch (error) {
    console.error('Error fetching water intake:', error);
    return 0;
  }
};
