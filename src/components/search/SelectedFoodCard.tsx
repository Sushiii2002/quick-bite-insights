
import React from 'react';
import { FatSecretFood, MealType } from '@/types';
import FoodLogForm from '@/components/food/FoodLogForm';

interface SelectedFoodCardProps {
  food: FatSecretFood;
  onSubmit: (logData: any) => void;
  onCancel: () => void;
}

const SelectedFoodCard: React.FC<SelectedFoodCardProps> = ({ food, onSubmit, onCancel }) => {
  // Handle the case where servings might be an array
  const getServing = () => {
    if (Array.isArray(food.servings.serving)) {
      return food.servings.serving[0];
    }
    return food.servings.serving;
  };

  const serving = getServing();

  return (
    <div className="mt-6">
      <FoodLogForm 
        food={{
          ...food,
          nf_calories: serving.calories,
          nf_protein: serving.protein,
          nf_total_carbohydrate: serving.carbohydrate,
          nf_total_fat: serving.fat,
          nf_dietary_fiber: serving.fiber,
          serving_qty: serving.number_of_units || 1,
          serving_unit: serving.measurement_description || 'serving'
        }}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  );
};

export default SelectedFoodCard;
