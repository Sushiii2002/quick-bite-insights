
// Define all the basic types needed for the app

// User type for the auth context
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  profileImage?: string;
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
  serving_id?: string;
  serving_description?: string;
  serving_url?: string;
  metric_serving_amount?: number;
  metric_serving_unit?: string;
  number_of_units?: number;
  measurement_description?: string;
  is_default?: number;
  
  // Nutrition values
  calories: number | string;
  carbohydrate: number | string;
  protein: number | string;
  fat: number | string;
  saturated_fat?: number | string;
  polyunsaturated_fat?: number | string;
  monounsaturated_fat?: number | string;
  trans_fat?: number | string;
  cholesterol?: number | string;
  sodium?: number | string;
  potassium?: number | string;
  fiber?: number | string;
  sugar?: number | string;
  added_sugars?: number | string;
  vitamin_d?: number | string;
  vitamin_a?: number | string;
  vitamin_c?: number | string;
  calcium?: number | string;
  iron?: number | string;
}

// Meal types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// Nutrient summary for cards
export interface NutrientSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  remaining?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
