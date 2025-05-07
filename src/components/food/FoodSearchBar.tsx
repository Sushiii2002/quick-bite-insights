
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchFoods, autocompleteFoods } from '@/services/fatSecretAPI';
import { FatSecretFood } from '@/types';
import { useToast } from "@/components/ui/use-toast";

interface FoodSearchBarProps {
  onSelect: (food: FatSecretFood) => void;
}

const FoodSearchBar = ({ onSelect }: FoodSearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FatSecretFood[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Fetch autocomplete suggestions when user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setAutocompleteLoading(true);
        const results = await autocompleteFoods(query);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setAutocompleteLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Helper function to get default serving
  const getServingInfo = (food: FatSecretFood) => {
    // For v3 API responses
    if (food.servings && food.servings.serving) {
      const serving = Array.isArray(food.servings.serving) 
        ? food.servings.serving.find(s => s.is_default === 1) || food.servings.serving[0] 
        : food.servings.serving;
      
      return serving;
    }
    return null;
  };

  const handleSuggestionClick = async (suggestion: string) => {
    console.log(`Suggestion clicked: ${suggestion}`);
    setQuery(suggestion);
    setShowSuggestions(false);
    
    // Immediately search for this suggestion
    setLoading(true);
    try {
      const searchResults = await searchFoods(suggestion);
      console.log(`Search results for suggestion "${suggestion}":`, searchResults);
      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching search results:', error);
      toast({
        title: "Search Error",
        description: "Failed to fetch food results. Please try again.",
        variant: "destructive"
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    console.log(`Searching for: ${query}`);
    if (query.length >= 2) {
      setLoading(true);
      setShowSuggestions(false);
      
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
              if (e.target.value.length >= 2) {
                setShowSuggestions(true);
              } else {
                setShowSuggestions(false);
                setShowResults(false);
              }
            }}
            onFocus={() => setShowSuggestions(query.length >= 2)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          
          {/* Loading indicator for autocomplete */}
          {autocompleteLoading && (
            <div className="absolute right-2 top-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          )}
          
          {/* Autocomplete suggestions */}
          {showSuggestions && (
            <div className="absolute z-20 w-full mt-1 bg-white rounded-md shadow-lg max-h-40 overflow-auto">
              {autocompleteLoading ? (
                <div className="p-2 text-center text-sm">
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-primary rounded-full mx-auto"></div>
                  <p className="text-xs mt-1">Loading suggestions...</p>
                </div>
              ) : suggestions.length > 0 ? (
                <ul>
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={`suggestion-${index}`}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              ) : query.length >= 2 ? (
                <div className="p-2 text-center text-sm">
                  <p>No suggestions found</p>
                </div>
              ) : null}
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
                const serving = getServingInfo(item);
                
                return (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                    onClick={() => {
                      console.log("Selected food:", item);
                      onSelect(item);
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
                    </div>
                    {serving && (
                      <div className="text-sm text-gray-600">
                        {serving.calories} cal
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
