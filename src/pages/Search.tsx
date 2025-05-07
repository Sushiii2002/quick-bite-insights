
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MealType } from '@/types';
import FoodSearchBar from '@/components/food/FoodSearchBar';
import SelectedFoodCard from '@/components/search/SelectedFoodCard';
import SelectedRecipeCard from '@/components/search/SelectedRecipeCard';
import EmptySearchState from '@/components/search/EmptySearchState';
import { SearchState } from '@/components/search/types';
import { fetchFoodDetails, fetchRecipeDetails, logFood, logRecipe } from '@/components/search/searchService';

const Search = () => {
  const [state, setState] = useState<SearchState>({
    isLoading: false,
    selectedFood: null,
    selectedRecipe: null,
    activeTab: 'foods'
  });
  
  const { user } = useAuth();

  const handleFoodSelect = async (food: any) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const foodDetails = await fetchFoodDetails(food);
      if (foodDetails) {
        setState(prev => ({ 
          ...prev, 
          selectedFood: foodDetails,
          selectedRecipe: null,
          isLoading: false
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error in food selection:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleRecipeSelect = async (recipe: any) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const recipeDetails = await fetchRecipeDetails(recipe);
      if (recipeDetails) {
        setState(prev => ({ 
          ...prev, 
          selectedRecipe: recipeDetails,
          selectedFood: null,
          isLoading: false
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error in recipe selection:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleLogFood = async (logData: any) => {
    if (!user || !state.selectedFood) return;
    
    const result = await logFood(
      user.id,
      state.selectedFood,
      logData.mealType as MealType,
      logData.portionSize
    );
    
    if (result) {
      setState(prev => ({ ...prev, selectedFood: null }));
    }
  };

  const handleLogRecipe = async () => {
    if (!user || !state.selectedRecipe) return;
    
    const result = await logRecipe(user.id, state.selectedRecipe);
    
    if (result) {
      setState(prev => ({ ...prev, selectedRecipe: null }));
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
          {/* Food search results will be shown in FoodSearchBar component */}
        </TabsContent>
        <TabsContent value="recipes" className="mt-2">
          {/* Recipe search will be implemented later */}
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
        <SelectedFoodCard 
          food={state.selectedFood}
          onSubmit={handleLogFood}
          onCancel={() => setState(prev => ({ ...prev, selectedFood: null }))}
        />
      )}

      {state.selectedRecipe && (
        <SelectedRecipeCard 
          recipe={state.selectedRecipe}
          onLogRecipe={handleLogRecipe}
          onCancel={() => setState(prev => ({ ...prev, selectedRecipe: null }))}
        />
      )}

      {!state.selectedFood && !state.selectedRecipe && !state.isLoading && (
        <EmptySearchState />
      )}
    </Layout>
  );
};

export default Search;
