
import { supabase } from "@/integrations/supabase/client";
import { FoodLog, MealType } from "@/types";
import { FoodItem } from "@/services/nutritionixAPI";

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
  food: any, // Using any type to accommodate both Nutritionix and FatSecret API responses
  mealType: MealType,
  portionSize: number
): Promise<string | null> => {
  try {
    console.log("logFoodEntry called with:", { userId, food, mealType, portionSize });
    
    // Calculate adjusted nutrient values based on portion size
    const calories = Math.round((food.nf_calories || food.calories) * portionSize * 10) / 10;
    const protein = Math.round((food.nf_protein || food.protein || 0) * portionSize * 10) / 10;
    const carbs = Math.round((food.nf_total_carbohydrate || food.carbs || 0) * portionSize * 10) / 10;
    const fat = Math.round((food.nf_total_fat || food.fat || 0) * portionSize * 10) / 10;
    const fiber = food.nf_dietary_fiber || food.fiber 
      ? Math.round((food.nf_dietary_fiber || food.fiber) * portionSize * 10) / 10 
      : 0;
    
    console.log("Calculated nutrition:", { calories, protein, carbs, fat, fiber });
    console.log("Inserting into food_logs...");
    
    // First, check if the user exists in the users table
    const { data: userExists, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (userCheckError) {
      console.error('Error checking if user exists:', userCheckError);
      return null;
    }
    
    // If user doesn't exist, create the user record first
    if (!userExists) {
      console.log("User does not exist in users table, creating...");
      const { error: insertUserError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: 'unknown@example.com', // Placeholder, will be updated on next profile fetch
          daily_goal: 2000 // Default daily goal
        });
      
      if (insertUserError) {
        console.error('Error creating user record:', insertUserError);
        return null;
      }
    }
    
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
      dailyGoal: data.daily_goal
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

// Track water intake
export const updateWaterIntake = async (userId: string, glasses: number): Promise<boolean> => {
  try {
    const date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
    
    // First check if an entry for today exists
    const { data, error: fetchError } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching water intake:', fetchError);
      return false;
    }
    
    if (data) {
      // Update existing entry
      const { error } = await supabase
        .from('water_intake')
        .update({ glasses })
        .eq('id', data.id);
      
      if (error) {
        console.error('Error updating water intake:', error);
        return false;
      }
    } else {
      // Create new entry
      const { error } = await supabase
        .from('water_intake')
        .insert({
          user_id: userId,
          date,
          glasses
        });
      
      if (error) {
        console.error('Error inserting water intake:', error);
        return false;
      }
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
      .from('water_intake')
      .select('glasses')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching water intake:', error);
      return 0;
    }
    
    return data?.glasses || 0;
  } catch (error) {
    console.error('Error fetching water intake:', error);
    return 0;
  }
};
