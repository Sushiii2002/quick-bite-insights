
import { supabase } from "@/integrations/supabase/client";
import { createUserIfNotExists } from "./baseService";

/**
 * Fetch user profile
 */
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

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, profile: any) => {
  try {
    // Ensure user exists before updating
    await createUserIfNotExists(userId);

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
