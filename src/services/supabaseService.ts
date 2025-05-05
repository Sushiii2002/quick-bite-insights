
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
  food: FoodItem,
  mealType: MealType,
  portionSize: number
): Promise<string | null> => {
  try {
    // Calculate adjusted nutrient values based on portion size
    const calories = Math.round(food.nf_calories * portionSize * 10) / 10;
    const protein = Math.round(food.nf_protein * portionSize * 10) / 10;
    const carbs = Math.round(food.nf_total_carbohydrate * portionSize * 10) / 10;
    const fat = Math.round(food.nf_total_fat * portionSize * 10) / 10;
    const fiber = food.nf_dietary_fiber 
      ? Math.round(food.nf_dietary_fiber * portionSize * 10) / 10 
      : null;

    const { data, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: userId,
        food_name: food.food_name,
        food_id: food.nix_item_id || null,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        portion_size: food.serving_qty * portionSize,
        portion_unit: food.serving_unit,
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
      mealType: log.meal_type,
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
    const { data, error } = await supabase.rpc('get_favorite_foods', { 
      user_id_param: userId,
      limit_param: limit
    });

    if (error) {
      console.error('Error fetching favorite foods:', error);
      
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
        mealType: log.meal_type,
        loggedAt: new Date(log.logged_at),
      }));
    }

    return data.map((log: any) => ({
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
      mealType: log.meal_type,
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
    let query = supabase.rpc('get_nutrition_summary', {
      user_id_param: userId,
      period_param: period,
      start_date_param: startDate?.toISOString() || null,
      end_date_param: endDate?.toISOString() || null
    });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching nutrition summary:', error);
      
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
    }

    return data;
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
