
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
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

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
