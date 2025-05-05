
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

export interface FoodLog {
  id?: string;
  userId: string;
  foodName: string;
  foodId?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  portionSize: number;
  portionUnit: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
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

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
