
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import FoodSearchBar from '@/components/food/FoodSearchBar';
import FoodLogForm from '@/components/food/FoodLogForm';
import { getNutrients, FoodItem, SearchResult } from '@/services/nutritionixAPI';
import { useToast } from '@/components/ui/use-toast';
import { FoodLog } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

const Search = () => {
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFoodSelect = async (food: SearchResult) => {
    try {
      setIsLoading(true);
      const nutrients = await getNutrients(food.food_name);
      if (nutrients) {
        setSelectedFood(nutrients);
      }
    } catch (error) {
      console.error('Error fetching nutrients:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch food information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogFood = (logData: Omit<FoodLog, 'id' | 'userId' | 'loggedAt'>) => {
    // TODO: Save to Supabase
    console.log('Logging food:', logData);
    
    toast({
      title: 'Food Logged',
      description: `${logData.foodName} added to your diary.`,
    });
    
    setSelectedFood(null);
  };

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Search & Log</h1>
        <p className="text-sm text-muted-foreground">Find and log your food in seconds</p>
      </div>

      <FoodSearchBar onSelect={handleFoodSelect} />

      {isLoading && (
        <Card className="mt-6">
          <CardContent className="p-4 text-center">
            <div className="animate-pulse">Loading food information...</div>
          </CardContent>
        </Card>
      )}

      {selectedFood && (
        <div className="mt-6">
          <FoodLogForm 
            food={selectedFood} 
            onSubmit={handleLogFood}
            onCancel={() => setSelectedFood(null)}
          />
        </div>
      )}

      {!selectedFood && !isLoading && (
        <div className="mt-12 text-center text-muted-foreground">
          <p>Search for a food to log it to your diary</p>
          <p className="text-sm mt-2">Examples: apple, chicken breast, latte</p>
        </div>
      )}
    </Layout>
  );
};

export default Search;
