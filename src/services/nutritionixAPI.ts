
const NUTRITIONIX_API_BASE_URL = 'https://trackapi.nutritionix.com/v2';
const APP_ID = 'e61f4614';
const APP_KEY = '66d31b418de24093e7e0630011d45dad';

export interface FoodItem {
  food_name: string;
  brand_name?: string;
  nix_item_id?: string;
  nf_calories: number;
  nf_total_fat: number;
  nf_total_carbohydrate: number;
  nf_protein: number;
  nf_dietary_fiber?: number;
  serving_qty: number;
  serving_unit: string;
  photo?: {
    thumb: string;
  };
}

export interface SearchResult {
  food_name: string;
  brand_name?: string;
  nix_item_id?: string;
  photo?: {
    thumb: string;
  };
}

const headers = {
  'x-app-id': APP_ID,
  'x-app-key': APP_KEY,
  'Content-Type': 'application/json'
};

export const searchFoods = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await fetch(`${NUTRITIONIX_API_BASE_URL}/search/instant?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }
    
    const data = await response.json();
    return [...data.common, ...data.branded];
  } catch (error) {
    console.error('Error searching foods:', error);
    return [];
  }
};

export const getNutrients = async (query: string): Promise<FoodItem | null> => {
  try {
    const response = await fetch(`${NUTRITIONIX_API_BASE_URL}/natural/nutrients`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch nutrients');
    }
    
    const data = await response.json();
    return data.foods[0] || null;
  } catch (error) {
    console.error('Error getting nutrients:', error);
    return null;
  }
};
