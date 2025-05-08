
import { supabase } from "@/integrations/supabase/client";
import { MealType } from "@/types";

// User quick adds
export interface QuickAddItem {
  id?: string;
  userId: string;
  foodId: string;
  foodName: string;
  calories: number;
  displayOrder: number;
}

/**
 * Fetch user's custom quick add items
 */
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

/**
 * Save new quick add item
 */
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

/**
 * Delete quick add item
 */
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

/**
 * Log quick add item directly
 */
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
