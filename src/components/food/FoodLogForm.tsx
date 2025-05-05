
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { FoodItem } from '@/services/nutritionixAPI';
import { FoodLog, MealType } from '@/types';

interface FoodLogFormProps {
  food: FoodItem;
  onSubmit: (log: Omit<FoodLog, 'id' | 'userId' | 'loggedAt'>) => void;
  onCancel: () => void;
}

const FoodLogForm = ({ food, onSubmit, onCancel }: FoodLogFormProps) => {
  const [portionSize, setPortionSize] = useState(1);
  const [mealType, setMealType] = useState<MealType>('snack');

  const calculateNutrients = (nutrient: number) => {
    return Math.round(nutrient * portionSize * 10) / 10;
  };

  const handleSubmit = () => {
    onSubmit({
      foodName: food.food_name,
      foodId: food.nix_item_id,
      calories: calculateNutrients(food.nf_calories),
      protein: calculateNutrients(food.nf_protein),
      carbs: calculateNutrients(food.nf_total_carbohydrate),
      fat: calculateNutrients(food.nf_total_fat),
      fiber: food.nf_dietary_fiber ? calculateNutrients(food.nf_dietary_fiber) : 0,
      portionSize: food.serving_qty * portionSize,
      portionUnit: food.serving_unit,
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
    <Card className="p-4 animate-fade-in">
      <div className="mb-4 flex items-center">
        {food.photo?.thumb && (
          <img 
            src={food.photo.thumb} 
            alt={food.food_name} 
            className="w-12 h-12 rounded-md mr-3 object-cover"
          />
        )}
        <div>
          <h3 className="font-medium">{food.food_name}</h3>
          <p className="text-sm text-muted-foreground">
            {food.serving_qty * portionSize} {food.serving_unit}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">Portion size</label>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPortionSize(Math.max(0.5, portionSize - 0.5))}
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
          >
            +
          </Button>
          <span className="w-10 text-center">{portionSize}x</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Meal type</label>
        <div className="grid grid-cols-4 gap-2">
          {mealTypes.map(({ type, label }) => (
            <Button
              key={type}
              variant={mealType === type ? "default" : "outline"}
              className="w-full"
              onClick={() => setMealType(type)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-100 p-2 rounded text-center">
          <p className="text-xs">Calories</p>
          <p className="font-medium">{calculateNutrients(food.nf_calories)} kcal</p>
        </div>
        <div className="bg-blue-100 p-2 rounded text-center">
          <p className="text-xs text-blue-800">Protein</p>
          <p className="font-medium">{calculateNutrients(food.nf_protein)} g</p>
        </div>
        <div className="bg-green-100 p-2 rounded text-center">
          <p className="text-xs text-green-800">Carbs</p>
          <p className="font-medium">{calculateNutrients(food.nf_total_carbohydrate)} g</p>
        </div>
        <div className="bg-red-100 p-2 rounded text-center">
          <p className="text-xs text-red-800">Fat</p>
          <p className="font-medium">{calculateNutrients(food.nf_total_fat)} g</p>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleSubmit}>
          Log Food
        </Button>
      </div>
    </Card>
  );
};

export default FoodLogForm;
