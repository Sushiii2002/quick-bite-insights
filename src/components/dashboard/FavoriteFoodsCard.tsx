
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from 'lucide-react';
import { FoodLog } from '@/types';
import { fetchFavoriteFoods } from '@/services/supabaseService';
import { useAuth } from '@/context/AuthContext';

interface FavoriteFoodsCardProps {
  onLogFood: (food: FoodLog) => void;
}

const FavoriteFoodsCard = ({ onLogFood }: FavoriteFoodsCardProps) => {
  const [favorites, setFavorites] = useState<FoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const foods = await fetchFavoriteFoods(user.id);
        setFavorites(foods);
      } catch (error) {
        console.error('Error loading favorite foods:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFavorites();
  }, [user]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Star className="w-4 h-4 mr-2 text-yellow-500" /> 
            Favorite Foods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 animate-pulse">
            {[...Array(3)].map((_, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="h-5 w-32 bg-gray-200 rounded" />
                <div className="h-8 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Star className="w-4 h-4 mr-2 text-yellow-500" /> 
            Favorite Foods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Keep logging foods to see your favorites here!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Star className="w-4 h-4 mr-2 text-yellow-500" /> 
          Favorite Foods
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {favorites.map((food) => (
            <div 
              key={food.id} 
              className="flex flex-col p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <p className="text-sm font-medium mb-1">{food.foodName}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{food.calories} kcal</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => onLogFood(food)}
                >
                  Log
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FavoriteFoodsCard;
