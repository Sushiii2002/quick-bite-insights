
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
      dailyGoal: data.daily_goal,
      goalType: data.goal_type || 'maintain', // Access existing goal_type column
      onboardingCompleted: data.onboarding_completed
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

    // Convert camelCase to snake_case for Supabase
    const dbProfile: Record<string, any> = {};
    
    if ('dailyGoal' in profile) {
      dbProfile.daily_goal = profile.dailyGoal;
    }
    
    if ('onboardingCompleted' in profile) {
      dbProfile.onboarding_completed = profile.onboardingCompleted;
    }
    
    if ('goalType' in profile) {
      dbProfile.goal_type = profile.goalType;
    }
    
    // Add any other fields that don't need conversion
    for (const key in profile) {
      if (!['dailyGoal', 'onboardingCompleted', 'goalType'].includes(key)) {
        dbProfile[key] = profile[key];
      }
    }

    console.log("Updating profile with data:", dbProfile);

    const { error } = await supabase
      .from('users')
      .update(dbProfile)
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
