
// Use OAuth 2.0 credentials for FatSecret
const CLIENT_ID = "02cd317bd67546c2adc92442ccc3e277"; // Client ID
const CLIENT_SECRET = "fd77bf8995d943d1bc088339095dd8d4";

const BASE_URL = "https://platform.fatsecret.com/rest/server.api";

// Token cache
let accessToken: string | null = null;
let tokenExpiry: number | null = null;

// Get OAuth 2.0 token
const getAccessToken = async (): Promise<string> => {
  // Check if we have a valid token
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const tokenEndpoint = "https://oauth.fatsecret.com/connect/token";
  
  try {
    console.log("Requesting new FatSecret access token...");
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
      },
      body: "grant_type=client_credentials&scope=basic"
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Failed to obtain access token:", data);
      throw new Error(`Failed to obtain access token: ${JSON.stringify(data)}`);
    }
    
    console.log("New access token obtained successfully");
    accessToken = data.access_token;
    // Set expiry to be a bit before actual expiry for safety
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
    
    return accessToken;
  } catch (error) {
    console.error("Error getting FatSecret access token:", error);
    throw error;
  }
};

// Search for foods using v1 API
export const searchFoods = async (query: string, maxResults = 10): Promise<any[]> => {
  try {
    const token = await getAccessToken();
    
    // Using v1 API with correct parameters
    const params = new URLSearchParams({
      method: "foods.search",
      search_expression: query,
      format: "json",
      max_results: maxResults.toString(),
      page_number: "0"
    });
    
    console.log(`Searching foods with query: "${query}" and params:`, params.toString());
    
    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to search foods: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to search foods: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Food search response:", data);
    
    if (data.foods && data.foods.food) {
      // Handle single or multiple results
      const foods = Array.isArray(data.foods.food) 
        ? data.foods.food 
        : [data.foods.food];
      
      console.log(`Found ${foods.length} foods for query "${query}"`);
      return foods;
    }
    
    console.log(`No foods found for query "${query}"`);
    return [];
  } catch (error) {
    console.error(`Error searching foods with query "${query}":`, error);
    return [];
  }
};

// Get food details
export const getFoodDetails = async (foodId: string): Promise<any> => {
  try {
    const token = await getAccessToken();
    
    const params = new URLSearchParams({
      method: "food.get.v2",
      food_id: foodId,
      format: "json"
    });
    
    console.log("Getting food details with params:", params.toString());
    
    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get food details: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Food details response:", data);
    return data.food;
  } catch (error) {
    console.error("Error getting food details:", error);
    throw error;
  }
};

// Search for recipes with v3 API (this is free)
export const searchRecipes = async (
  query: string, 
  maxResults = 10,
  recipeType?: string,
  region?: string
): Promise<any[]> => {
  try {
    const token = await getAccessToken();
    
    // Updated to v3 API
    const params = new URLSearchParams({
      method: "recipes.search.v3",
      search_expression: query,
      format: "json",
      max_results: maxResults.toString(),
      page_number: "0"
    });
    
    if (recipeType) {
      params.append("recipe_types", recipeType);
    }
    
    if (region) {
      params.append("region", region);
    }
    
    console.log("Searching recipes with params:", params.toString());
    
    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to search recipes: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Recipe search response:", data);
    
    if (data.recipes_search && data.recipes_search.results && data.recipes_search.results.recipe) {
      // Handle single or multiple results
      return Array.isArray(data.recipes_search.results.recipe) 
        ? data.recipes_search.results.recipe 
        : [data.recipes_search.results.recipe];
    }
    
    return [];
  } catch (error) {
    console.error("Error searching recipes:", error);
    return [];
  }
};

// Get recipe details
export const getRecipeDetails = async (recipeId: string): Promise<any> => {
  try {
    const token = await getAccessToken();
    
    const params = new URLSearchParams({
      method: "recipe.get.v3",
      recipe_id: recipeId,
      format: "json"
    });
    
    console.log("Getting recipe details with params:", params.toString());
    
    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get recipe details: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Recipe details response:", data);
    return data.recipe;
  } catch (error) {
    console.error("Error getting recipe details:", error);
    throw error;
  }
};
