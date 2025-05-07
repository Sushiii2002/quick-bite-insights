import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { getFoodDetails, getRecipeDetails } from '@/services/fatSecretAPI';
import { logFoodEntry } from '@/services/supabaseService';
import FoodLogForm from '@/components/food/FoodLogForm';
import { MealType, FatSecretFood } from '@/types';
import FoodSearchBar from '@/components/food/FoodSearchBar';

interface SearchState {
  isLoading: boolean;
  selectedFood: FatSecretFood | null;
  selectedRecipe: any | null;
  activeTab: 'foods' | 'recipes';
}

const Search = () => {
  const [state, setState] = useState<SearchState>({
    isLoading: false,
    selectedFood: null,
    selectedRecipe: null,
    activeTab: 'foods'
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFoodSelect = async (food: FatSecretFood) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const foodDetails = await getFoodDetails(food.food_id);
      if (foodDetails) {
        setState(prev => ({ 
          ...prev, 
          selectedFood: foodDetails,
          selectedRecipe: null,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error fetching food details:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Error',
        description: 'Failed to fetch food information. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRecipeSelect = async (recipe: any) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const recipeDetails = await getRecipeDetails(recipe.recipe_id);
      if (recipeDetails) {
        setState(prev => ({ 
          ...prev, 
          selectedRecipe: recipeDetails,
          selectedFood: null,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Error',
        description: 'Failed to fetch recipe information. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLogFood = async (logData: any) => {
    if (!user || !state.selectedFood) return;
    
    try {
      const logId = await logFoodEntry(
        user.id,
        state.selectedFood,
        logData.mealType as MealType,
        logData.portionSize
      );
      
      if (logId) {
        toast({
          title: 'Food Logged',
          description: `${logData.foodName} added to your diary.`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to log food. Please try again.',
          variant: 'destructive',
        });
      }
      
      setState(prev => ({ ...prev, selectedFood: null }));
    } catch (error) {
      console.error('Error logging food:', error);
      toast({
        title: 'Error',
        description: 'Failed to log food. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLogRecipe = async (recipe: any) => {
    if (!user || !state.selectedRecipe) return;
    
    // For recipes, we log based on the nutrition facts of the recipe
    const { recipe_name, nutrition_facts } = state.selectedRecipe;
    
    try {
      const logId = await logFoodEntry(
        user.id,
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
        'dinner' as MealType, // Using 'dinner' as a valid MealType
        1 // Default to 1 serving
      );
      
      if (logId) {
        toast({
          title: 'Recipe Logged',
          description: `${recipe_name} added to your diary.`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to log recipe. Please try again.',
          variant: 'destructive',
        });
      }
      
      setState(prev => ({ ...prev, selectedRecipe: null }));
    } catch (error) {
      console.error('Error logging recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to log recipe. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Search & Log</h1>
        <p className="text-sm text-muted-foreground">Find foods, recipes and log them in seconds</p>
      </div>

      <div className="mb-6">
        <FoodSearchBar onSelect={handleFoodSelect} />
      </div>

      <Tabs
        value={state.activeTab}
        onValueChange={(value) => setState(prev => ({ 
          ...prev, 
          activeTab: value as 'foods' | 'recipes' 
        }))}
        className="w-full mb-6"
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="foods">Foods</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
        </TabsList>
        <TabsContent value="foods" className="mt-2">
          {state.showResults && state.query.length >= 2 && (
            <Card className="mb-6">
              <CardContent className="p-0">
                {state.isLoading ? (
                  <div className="p-4 text-center">
                    <p className="animate-pulse">Searching for foods...</p>
                  </div>
                ) : state.foodResults.length > 0 ? (
                  <ul className="divide-y">
                    {state.foodResults.map((food, index) => (
                      <li
                        key={`food-${index}`}
                        className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => handleFoodSelect(food)}
                      >
                        <div>
                          <p className="font-medium">{food.food_name}</p>
                          {food.brand_name && (
                            <p className="text-xs text-muted-foreground">{food.brand_name}</p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">Select</Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center">
                    <p>No foods found. Try another search term.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="recipes" className="mt-2">
          {state.showResults && state.query.length >= 2 && (
            <Card className="mb-6">
              <CardContent className="p-0">
                {state.isLoading ? (
                  <div className="p-4 text-center">
                    <p className="animate-pulse">Searching for recipes...</p>
                  </div>
                ) : state.recipeResults.length > 0 ? (
                  <ul className="divide-y">
                    {state.recipeResults.map((recipe, index) => (
                      <li
                        key={`recipe-${index}`}
                        className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => handleRecipeSelect(recipe)}
                      >
                        <div className="flex items-center">
                          {recipe.recipe_image && (
                            <img 
                              src={recipe.recipe_image} 
                              alt={recipe.recipe_name}
                              className="w-12 h-12 rounded object-cover mr-3" 
                            />
                          )}
                          <div>
                            <p className="font-medium">{recipe.recipe_name}</p>
                            {recipe.recipe_description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {recipe.recipe_description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">View</Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center">
                    <p>No recipes found. Try another search term.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {state.isLoading && (
        <Card className="mt-6">
          <CardContent className="p-4 text-center">
            <div className="animate-pulse">Loading...</div>
          </CardContent>
        </Card>
      )}

      {state.selectedFood && (
        <div className="mt-6">
          <FoodLogForm 
            food={{
              ...state.selectedFood,
              nf_calories: state.selectedFood.servings.serving.calories,
              nf_protein: state.selectedFood.servings.serving.protein,
              nf_total_carbohydrate: state.selectedFood.servings.serving.carbohydrate,
              nf_total_fat: state.selectedFood.servings.serving.fat,
              nf_dietary_fiber: state.selectedFood.servings.serving.fiber,
              serving_qty: state.selectedFood.servings.serving.number_of_units || 1,
              serving_unit: state.selectedFood.servings.serving.measurement_description || 'serving'
            }}
            onSubmit={handleLogFood}
            onCancel={() => setState(prev => ({ ...prev, selectedFood: null }))}
          />
        </div>
      )}

      {state.selectedRecipe && (
        <Card className="mt-6 p-4">
          <h2 className="text-xl font-bold mb-3">{state.selectedRecipe.recipe_name}</h2>
          
          {state.selectedRecipe.recipe_image && (
            <img 
              src={state.selectedRecipe.recipe_image} 
              alt={state.selectedRecipe.recipe_name}
              className="w-full h-48 object-cover rounded-md mb-4" 
            />
          )}
          
          {state.selectedRecipe.recipe_description && (
            <p className="mb-4 text-muted-foreground">{state.selectedRecipe.recipe_description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm font-medium">Preparation</p>
              <p className="text-lg">{state.selectedRecipe.preparation_time_min || 'N/A'} min</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm font-medium">Cook Time</p>
              <p className="text-lg">{state.selectedRecipe.cooking_time_min || 'N/A'} min</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Nutrition Facts (per serving)</h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 bg-gray-50 text-center rounded">
                <p className="text-lg font-medium">{state.selectedRecipe.nutrition_facts?.calories || 'N/A'}</p>
                <p className="text-xs">calories</p>
              </div>
              <div className="p-2 bg-blue-50 text-center rounded">
                <p className="text-lg font-medium">{state.selectedRecipe.nutrition_facts?.protein || 'N/A'}g</p>
                <p className="text-xs">protein</p>
              </div>
              <div className="p-2 bg-green-50 text-center rounded">
                <p className="text-lg font-medium">{state.selectedRecipe.nutrition_facts?.carbohydrate || 'N/A'}g</p>
                <p className="text-xs">carbs</p>
              </div>
              <div className="p-2 bg-red-50 text-center rounded">
                <p className="text-lg font-medium">{state.selectedRecipe.nutrition_facts?.fat || 'N/A'}g</p>
                <p className="text-xs">fat</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setState(prev => ({ ...prev, selectedRecipe: null }))}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-primary"
              onClick={() => handleLogRecipe(state.selectedRecipe)}
            >
              Log Recipe
            </Button>
          </div>
        </Card>
      )}

      {!state.selectedFood && !state.selectedRecipe && !state.isLoading && (
        <div className="mt-12 text-center text-muted-foreground">
          <p>Search for a food or recipe to log it to your diary</p>
          <p className="text-sm mt-2">Try searching for: chicken, salad, or pasta</p>
        </div>
      )}
    </Layout>
  );
};

export default Search;
