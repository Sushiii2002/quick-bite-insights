
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchFoods, SearchResult } from '@/services/nutritionixAPI';

interface FoodSearchBarProps {
  onSelect: (food: SearchResult) => void;
}

const FoodSearchBar = ({ onSelect }: FoodSearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const searchResults = await searchFoods(query);
      setResults(searchResults);
      setLoading(false);
    };

    const debounce = setTimeout(fetchResults, 500);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="flex w-full items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for a food..."
            className="pl-8"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />
        </div>
        <Button type="submit">Search</Button>
      </div>

      {showResults && query.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-sm">Loading...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((item, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => {
                    onSelect(item);
                    setShowResults(false);
                    setQuery('');
                  }}
                >
                  {item.photo?.thumb && (
                    <img
                      src={item.photo.thumb}
                      alt={item.food_name}
                      className="w-8 h-8 rounded mr-2 object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{item.food_name}</div>
                    {item.brand_name && (
                      <div className="text-xs text-gray-500">{item.brand_name}</div>
                    )}
                  </div>
                </li>
              ))}
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
