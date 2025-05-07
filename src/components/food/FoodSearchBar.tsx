
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchFoods } from '@/services/fatSecretAPI';
import { FatSecretFood } from '@/types';
import { useToast } from "@/components/ui/use-toast";

interface FoodSearchBarProps {
  onSelect: (food: FatSecretFood) => void;
}

const FoodSearchBar = ({ onSelect }: FoodSearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FatSecretFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Helper function to get default serving
  const getServingInfo = (food: FatSecretFood) => {
    // For v2 API responses
    if (food.servings && food.servings.serving) {
      const serving = Array.isArray(food.servings.serving) 
        ? food.servings.serving.find(s => s.is_default === 1) || food.servings.serving[0] 
        : food.servings.serving;
      
      return serving;
    }
    return null;
  };

  const handleSearch = async () => {
    console.log(`Searching for: ${query}`);
    if (query.length >= 2) {
      setLoading(true);
      
      try {
        const searchResults = await searchFoods(query);
        console.log(`Search results for "${query}":`, searchResults);
        setResults(searchResults);
        setShowResults(true);
        
        if (searchResults.length === 0) {
          toast({
            title: "No results found",
            description: "Try a different search term"
          });
        }
      } catch (error) {
        console.error("Search error:", error);
        toast({
          title: "Search Error",
          description: "Failed to fetch food results",
          variant: "destructive"
        });
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
  };

  // Parse nutrition info from food description (v1 API format)
  const parseNutritionInfo = (description: string): { calories?: number, fat?: number, carbs?: number, protein?: number } => {
    try {
      const info: { calories?: number, fat?: number, carbs?: number, protein?: number } = {};
      
      if (!description) return info;

      // Example: "Per 1 serving - Calories: 300kcal | Fat: 13.00g | Carbs: 32.00g | Protein: 15.00g"
      const caloriesMatch = description.match(/Calories:\s*(\d+\.?\d*)kcal/i);
      const fatMatch = description.match(/Fat:\s*(\d+\.?\d*)g/i);  
      const carbsMatch = description.match(/Carbs:\s*(\d+\.?\d*)g/i);
      const proteinMatch = description.match(/Protein:\s*(\d+\.?\d*)g/i);
      
      if (caloriesMatch) info.calories = parseFloat(caloriesMatch[1]);
      if (fatMatch) info.fat = parseFloat(fatMatch[1]);
      if (carbsMatch) info.carbs = parseFloat(carbsMatch[1]);  
      if (proteinMatch) info.protein = parseFloat(proteinMatch[1]);
      
      return info;
    } catch (e) {
      console.error("Error parsing nutrition info", e);
      return {};
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex w-full items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a food..."
            className="pl-8"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length < 2) {
                setShowResults(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          
          {/* Loading indicator */}
          {loading && (
            <div className="absolute right-2 top-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          )}
        </div>
        <Button 
          type="button" 
          onClick={handleSearch}
          disabled={loading || query.length < 2}
        >
          {loading ? (
            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-primary-foreground rounded-full mr-2"></div>
          ) : null}
          Search
        </Button>
      </div>

      {/* Search results */}
      {showResults && query.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-sm">
              <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-primary rounded-full mx-auto mb-2"></div>
              <p>Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((item, index) => {
                const nutritionInfo = parseNutritionInfo(item.food_description || '');
                
                return (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                    onClick={() => {
                      console.log("Selected food:", item);
                      onSelect({
                        ...item,
                        // Add servings structure expected by other components
                        servings: {
                          serving: {
                            calories: nutritionInfo.calories || 0,
                            carbohydrate: nutritionInfo.carbs || 0,
                            protein: nutritionInfo.protein || 0,
                            fat: nutritionInfo.fat || 0,
                            fiber: 0, // Not available in v1 API
                            number_of_units: 1,
                            measurement_description: "serving"
                          }
                        }
                      });
                      setShowResults(false);
                      setQuery('');
                      toast({
                        title: "Food selected",
                        description: `${item.food_name} has been selected`
                      });
                    }}
                  >
                    <div>
                      <div className="font-medium">{item.food_name}</div>
                      {item.brand_name && (
                        <div className="text-xs text-gray-500">{item.brand_name}</div>
                      )}
                      <div className="text-xs text-gray-500">{item.food_description}</div>
                    </div>
                    {nutritionInfo.calories && (
                      <div className="text-sm text-gray-600">
                        {nutritionInfo.calories} cal
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodSearchBar;
