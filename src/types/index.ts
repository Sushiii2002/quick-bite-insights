export interface User {
  id: string;
  email: string;
  height?: number;
  weight?: number;
  dailyGoal?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  dailyData?: {
    [date: string]: {
      water_glasses?: number;
      // Other daily tracking data can be added here in the future
    };
  };
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'meal';

export interface FoodLog {
  id?: string;
  userId: string;
  foodName: string;
  foodId?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  portionSize: number;
  portionUnit: string;
  mealType: MealType;
  loggedAt: Date;
}

export interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface WaterIntake {
  id?: string;
  userId: string;
  date: string;
  glasses: number;
}

// FatSecret API types
export interface FatSecretFood {
  food_id: string;
  food_name: string;
  brand_name?: string;
  food_type?: string;
  food_url?: string;
  servings: {
    serving: FatSecretServing | FatSecretServing[];
  };
}

export interface FatSecretServing {
  serving_id: string;
  serving_description: string;
  serving_url?: string;
  metric_serving_amount?: number;
  metric_serving_unit?: string;
  number_of_units?: number;
  measurement_description?: string;
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  saturated_fat?: number;
  polyunsaturated_fat?: number;
  monounsaturated_fat?: number;
  trans_fat?: number;
  cholesterol?: number;
  sodium?: number;
  potassium?: number;
  fiber?: number;
  sugar?: number;
  vitamin_a?: number;
  vitamin_c?: number;
  calcium?: number;
  iron?: number;
}

export interface FatSecretRecipe {
  recipe_id: string;
  recipe_name: string;
  recipe_description?: string;
  recipe_url?: string;
  recipe_image?: string;
  preparation_time_min?: number;
  cooking_time_min?: number;
  serving_sizes?: {
    serving: {
      serving_description: string;
      number_of_units?: number;
    }
  };
  number_of_servings?: number;
  rating?: number;
  recipe_categories?: {
    recipe_category: string[];
  };
  recipe_types?: {
    recipe_type: string[];
  };
  nutrition_facts?: {
    calories: number;
    carbohydrate: number;
    protein: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
}

export interface FatSecretImageRecognition {
  results: {
    food: FatSecretFood[];
  };
}
