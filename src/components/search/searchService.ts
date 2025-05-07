
import { FatSecretFood, MealType } from "@/types";
import { getFoodDetails, getRecipeDetails } from "@/services/fatSecretAPI";
import { logFoodEntry } from "@/services/supabaseService";
import { toast } from "@/hooks/use-toast";

export const fetchFoodDetails = async (food: FatSecretFood) => {
  try {
    const foodDetails = await getFoodDetails(food.food_id);
    return foodDetails;
  } catch (error) {
    console.error('Error fetching food details:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch food information. Please try again.',
      variant: 'destructive',
    });
    return null;
  }
};

export const fetchRecipeDetails = async (recipe: any) => {
  try {
    const recipeDetails = await getRecipeDetails(recipe.recipe_id);
    return recipeDetails;
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch recipe information. Please try again.',
      variant: 'destructive',
    });
    return null;
  }
};

export const logFood = async (userId: string, food: FatSecretFood, mealType: MealType, portionSize: number) => {
  if (!userId || !food) return null;
  
  try {
    const logId = await logFoodEntry(
      userId,
      food,
      mealType,
      portionSize
    );
    
    if (logId) {
      toast({
        title: 'Food Logged',
        description: `${food.food_name} added to your diary.`,
      });
      return logId;
    } else {
      toast({
        title: 'Error',
        description: 'Failed to log food. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  } catch (error) {
    console.error('Error logging food:', error);
    toast({
      title: 'Error',
      description: 'Failed to log food. Please try again.',
      variant: 'destructive',
    });
    return null;
  }
};

export const logRecipe = async (userId: string, recipe: any, mealType: MealType = 'dinner') => {
  if (!userId || !recipe) return null;
  
  // For recipes, we log based on the nutrition facts of the recipe
  const { recipe_name, nutrition_facts } = recipe;
  
  try {
    const logId = await logFoodEntry(
      userId,
      {
        food_name: recipe_name,
        servings: {
          serving: {
            calories: nutrition_facts?.calories || 0,
            carbohydrate: nutrition_facts?.carbohydrate || 0,
            protein: nutrition_facts?.protein || 0,
            fat: nutrition_facts?.fat || 0,
            fiber: nutrition_facts?.fiber || 0,
            number_of_units: 1
          }
        }
      },
      mealType,
      1 // Default to 1 serving
    );
    
    if (logId) {
      toast({
        title: 'Recipe Logged',
        description: `${recipe_name} added to your diary.`,
      });
      return logId;
    } else {
      toast({
        title: 'Error',
        description: 'Failed to log recipe. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  } catch (error) {
    console.error('Error logging recipe:', error);
    toast({
      title: 'Error',
      description: 'Failed to log recipe. Please try again.',
      variant: 'destructive',
    });
    return null;
  }
};
