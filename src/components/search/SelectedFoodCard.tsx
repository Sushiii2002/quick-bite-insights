
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { FoodLog, MealType } from '@/types';
import { FoodItem } from '@/services/fatSecretAPI';

interface SelectedFoodCardProps {
  food: FoodItem;
  onSubmit: (log: Omit<FoodLog, 'id' | 'userId' | 'loggedAt'>) => void;
  onCancel: () => void;
}

const SelectedFoodCard = ({ food, onSubmit, onCancel }: SelectedFoodCardProps) => {
  const [portionSize, setPortionSize] = useState(1);
  const [mealType, setMealType] = useState<MealType>('snack');

  // Parse nutrition values from food_description or use defaults
  const parseNutritionValue = (text: string, nutrient: string): number => {
    try {
      const regex = new RegExp(`${nutrient}:\\s*(\\d+(\\.\\d+)?)g`, 'i');
      const match = text.match(regex);
      return match ? parseFloat(match[1]) : 0;
    } catch (e) {
      console.error(`Error parsing ${nutrient}:`, e);
      return 0;
    }
  };

  const parseCalories = (text: string): number => {
    try {
      const regex = /Calories:\s*(\d+(\.\d+)?)kcal/i;
      const match = text.match(regex);
      return match ? parseFloat(match[1]) : 0;
    } catch (e) {
      console.error('Error parsing calories:', e);
      return 0;
    }
  };

  // Extract nutrition information from food_description
  const calories = parseCalories(food.food_description);
  const protein = parseNutritionValue(food.food_description, 'Protein');
  const carbs = parseNutritionValue(food.food_description, 'Carbs');
  const fat = parseNutritionValue(food.food_description, 'Fat');
  const fiber = 0; // Not typically included in the basic description

  const calculateNutrients = (nutrient: number) => {
    return Math.round(nutrient * portionSize * 10) / 10;
  };

  const handleSubmit = () => {
    onSubmit({
      foodName: food.food_name,
      foodId: food.food_id.toString(),
      calories: calculateNutrients(calories),
      protein: calculateNutrients(protein),
      carbs: calculateNutrients(carbs),
      fat: calculateNutrients(fat),
      fiber: calculateNutrients(fiber),
      portionSize: portionSize,
      portionUnit: 'serving',
      mealType,
    });
  };

  const mealTypes: {type: MealType, label: string}[] = [
    { type: 'breakfast', label: 'Breakfast' },
    { type: 'lunch', label: 'Lunch' },
    { type: 'dinner', label: 'Dinner' },
    { type: 'snack', label: 'Snack' },
  ];

  return (
    <Card className="p-4 animate-fade-in rounded-lg border-2 border-primary/20 shadow-lg">
      <div className="mb-4">
        <h3 className="font-medium text-lg">{food.food_name}</h3>
        {food.brand_name && (
          <p className="text-sm text-muted-foreground">{food.brand_name}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{food.food_description}</p>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Portion size</label>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPortionSize(Math.max(0.5, portionSize - 0.5))}
            className="h-9 w-9 rounded-full p-0 flex items-center justify-center"
          >
            -
          </Button>
          <Slider
            value={[portionSize]}
            min={0.5}
            max={3}
            step={0.1}
            className="w-full"
            onValueChange={(values) => setPortionSize(values[0])}
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPortionSize(Math.min(3, portionSize + 0.5))}
            className="h-9 w-9 rounded-full p-0 flex items-center justify-center"
          >
            +
          </Button>
          <span className="w-12 text-center font-medium">{portionSize}x</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Meal type</label>
        <div className="grid grid-cols-4 gap-2">
          {mealTypes.map(({ type, label }) => (
            <Button
              key={type}
              variant={mealType === type ? "default" : "outline"}
              className={`w-full transition-all ${mealType === type ? 'bg-primary text-white scale-105' : ''}`}
              onClick={() => setMealType(type)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-100 p-3 rounded-lg text-center transform hover:scale-105 transition-transform">
          <p className="text-xs font-medium">Calories</p>
          <p className="font-bold text-lg">{calculateNutrients(calories)} kcal</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg text-center transform hover:scale-105 transition-transform">
          <p className="text-xs font-medium text-blue-800">Protein</p>
          <p className="font-bold text-lg text-blue-600">{calculateNutrients(protein)} g</p>
        </div>
        <div className="bg-green-100 p-3 rounded-lg text-center transform hover:scale-105 transition-transform">
          <p className="text-xs font-medium text-green-800">Carbs</p>
          <p className="font-bold text-lg text-green-600">{calculateNutrients(carbs)} g</p>
        </div>
        <div className="bg-red-100 p-3 rounded-lg text-center transform hover:scale-105 transition-transform">
          <p className="text-xs font-medium text-red-800">Fat</p>
          <p className="font-bold text-lg text-red-600">{calculateNutrients(fat)} g</p>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button 
          variant="outline" 
          className="flex-1 hover:bg-gray-100"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          className="flex-1 bg-primary hover:bg-primary/80 text-white"
          onClick={handleSubmit}
        >
          Log Food
        </Button>
      </div>
    </Card>
  );
};

export default SelectedFoodCard;
