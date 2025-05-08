
const FATSECRET_API_BASE_URL = 'https://platform.fatsecret.com/rest/server.api';

// This should be replaced with OAuth 2.0 implementation
// For demo purposes, we'll use a placeholder access token
const BEARER_TOKEN = 'YOUR_OAUTH2_TOKEN';

export interface FoodItem {
  food_id: number | string;
  food_name: string;
  brand_name?: string;
  food_description: string;
  food_type?: string;
  food_url?: string;
}

interface SearchResponse {
  foods?: {
    food: FoodItem | FoodItem[];
    max_results?: string;
    total_results?: string;
    page_number?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export const searchFoods = async (query: string): Promise<FoodItem[]> => {
  try {
    // For demonstration purposes, simulating API response with mock data
    // In a real implementation, you would make an actual API call
    console.log('Searching for foods with query:', query);
    
    // Simulated API call response
    const mockResponse = {
      foods: {
        food: [
          {
            food_id: "41963",
            food_name: "Cheeseburger",
            brand_name: "McDonald's",
            food_description: "Per 1 serving - Calories: 300kcal | Fat: 13.00g | Carbs: 32.00g | Protein: 15.00g",
            food_type: "Brand",
            food_url: "https://www.fatsecret.com/calories-nutrition/mcdonalds/cheeseburger"
          },
          {
            food_id: "36421",
            food_name: "Mushrooms",
            food_description: "Per 100g - Calories: 22kcal | Fat: 0.34g | Carbs: 3.28g | Protein: 3.09g",
            food_type: "Generic",
            food_url: "https://www.fatsecret.com/calories-nutrition/usda/mushrooms"
          },
          {
            food_id: "33375",
            food_name: "Apple",
            food_description: "Per 100g - Calories: 52kcal | Fat: 0.17g | Carbs: 13.81g | Protein: 0.26g",
            food_type: "Generic",
            food_url: "https://www.fatsecret.com/calories-nutrition/usda/apple"
          },
          {
            food_id: "35752",
            food_name: "Banana",
            food_description: "Per 100g - Calories: 89kcal | Fat: 0.33g | Carbs: 22.84g | Protein: 1.09g",
            food_type: "Generic",
            food_url: "https://www.fatsecret.com/calories-nutrition/usda/banana"
          }
        ],
        max_results: "4",
        page_number: "0",
        total_results: "4"
      }
    };

    // Filter mock results based on query
    const lowerQuery = query.toLowerCase();
    const filteredMockResults = mockResponse.foods.food.filter((food) => 
      food.food_name.toLowerCase().includes(lowerQuery) || 
      (food.brand_name && food.brand_name.toLowerCase().includes(lowerQuery))
    );

    // Update the mock response with filtered results
    mockResponse.foods.food = filteredMockResults;
    mockResponse.foods.total_results = String(filteredMockResults.length);

    // Create response data
    const response: SearchResponse = mockResponse;

    // Handle empty response
    if (!response.foods || !response.foods.food) {
      return [];
    }

    // Handle both array and single object responses
    if (Array.isArray(response.foods.food)) {
      return response.foods.food;
    } else {
      return [response.foods.food];
    }
  } catch (error) {
    console.error('Error searching foods:', error);
    return [];
  }
};
