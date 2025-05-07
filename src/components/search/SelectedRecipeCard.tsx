
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SelectedRecipeCardProps {
  recipe: any;
  onLogRecipe: () => void;
  onCancel: () => void;
}

const SelectedRecipeCard: React.FC<SelectedRecipeCardProps> = ({ recipe, onLogRecipe, onCancel }) => {
  return (
    <Card className="mt-6 p-4">
      <h2 className="text-xl font-bold mb-3">{recipe.recipe_name}</h2>
      
      {recipe.recipe_image && (
        <img 
          src={recipe.recipe_image} 
          alt={recipe.recipe_name}
          className="w-full h-48 object-cover rounded-md mb-4" 
        />
      )}
      
      {recipe.recipe_description && (
        <p className="mb-4 text-muted-foreground">{recipe.recipe_description}</p>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium">Preparation</p>
          <p className="text-lg">{recipe.preparation_time_min || 'N/A'} min</p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium">Cook Time</p>
          <p className="text-lg">{recipe.cooking_time_min || 'N/A'} min</p>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Nutrition Facts (per serving)</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 bg-gray-50 text-center rounded">
            <p className="text-lg font-medium">{recipe.nutrition_facts?.calories || 'N/A'}</p>
            <p className="text-xs">calories</p>
          </div>
          <div className="p-2 bg-blue-50 text-center rounded">
            <p className="text-lg font-medium">{recipe.nutrition_facts?.protein || 'N/A'}g</p>
            <p className="text-xs">protein</p>
          </div>
          <div className="p-2 bg-green-50 text-center rounded">
            <p className="text-lg font-medium">{recipe.nutrition_facts?.carbohydrate || 'N/A'}g</p>
            <p className="text-xs">carbs</p>
          </div>
          <div className="p-2 bg-red-50 text-center rounded">
            <p className="text-lg font-medium">{recipe.nutrition_facts?.fat || 'N/A'}g</p>
            <p className="text-xs">fat</p>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          className="flex-1 bg-primary"
          onClick={onLogRecipe}
        >
          Log Recipe
        </Button>
      </div>
    </Card>
  );
};

export default SelectedRecipeCard;
