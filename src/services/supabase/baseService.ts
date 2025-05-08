
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a user exists in the users table
 */
export const checkUserExists = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
};

/**
 * Create a new user in the users table if it doesn't exist
 */
export const createUserIfNotExists = async (userId: string, email: string = 'unknown@example.com'): Promise<boolean> => {
  try {
    const userExists = await checkUserExists(userId);
    
    if (!userExists) {
      const { error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          daily_goal: 2000 // Default daily goal
        });
      
      if (error) {
        console.error('Error creating user record:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    return false;
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};
