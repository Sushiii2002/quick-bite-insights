
// Use OAuth 2.0 credentials for FatSecret
const CLIENT_ID = "02cd317bd67546c2adc92442ccc3e277"; // Fixed client ID
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
      throw new Error("Failed to obtain access token");
    }
    
    accessToken = data.access_token;
    // Set expiry to be a bit before actual expiry for safety
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
    
    return accessToken;
  } catch (error) {
    console.error("Error getting FatSecret access token:", error);
    throw error;
  }
};

// Search for foods using v3 API
export const searchFoods = async (query: string, maxResults = 10): Promise<any[]> => {
  try {
    const token = await getAccessToken();
    
    // Updated to v3 API with correct parameters
    const params = new URLSearchParams({
      method: "foods.search.v3",
      search_expression: query,
      format: "json",
      max_results: maxResults.toString(),
      page_number: "0",
      include_sub_categories: "true",
      flag_default_serving: "true"
    });
    
    console.log("Searching foods with params:", params.toString());
    
    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to search foods: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Food search response:", data);
    
    if (data.foods_search && data.foods_search.results && data.foods_search.results.food) {
      // Handle single or multiple results
      return Array.isArray(data.foods_search.results.food) 
        ? data.foods_search.results.food 
        : [data.foods_search.results.food];
    }
    
    return [];
  } catch (error) {
    console.error("Error searching foods:", error);
    return [];
  }
};

// Autocomplete food search (new implementation)
export const autocompleteFoods = async (query: string, maxResults = 10): Promise<string[]> => {
  try {
    const token = await getAccessToken();
    
    const params = new URLSearchParams({
      method: "foods.autocomplete.v2",
      expression: query,
      format: "json",
      max_results: maxResults.toString()
    });
    
    console.log("Autocompleting foods with params:", params.toString());
    
    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get autocomplete suggestions: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Autocomplete response:", data);
    
    if (data.suggestions && data.suggestions.suggestion) {
      return Array.isArray(data.suggestions.suggestion) 
        ? data.suggestions.suggestion 
        : [data.suggestions.suggestion];
    }
    
    return [];
  } catch (error) {
    console.error("Error getting autocomplete suggestions:", error);
    return [];
  }
};

// Get food details
export const getFoodDetails = async (foodId: string): Promise<any> => {
  try {
    const token = await getAccessToken();
    
    // Updated to v3 API
    const params = new URLSearchParams({
      method: "food.get.v3",
      food_id: foodId,
      format: "json",
      include_sub_categories: "true",
      flag_default_serving: "true"
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

// Search for recipes with v3 API
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

// Image Recognition API
export const recognizeFoodImage = async (imageFile: File): Promise<any> => {
  try {
    const token = await getAccessToken();
    
    // Resize and optimize image if needed
    const optimizedImage = await optimizeImage(imageFile);
    
    // For image recognition v1, we need to convert to base64
    const imageBase64 = await fileToBase64(optimizedImage);
    
    // Updated to v1 API with correct parameters
    const requestBody = JSON.stringify({
      method: "image.recognition.v1",
      format: "json",
      image_b64: imageBase64.split(',')[1], // Remove data URL prefix
      include_food_data: true
    });
    
    console.log("Sending image recognition request");
    
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: requestBody
    });
    
    if (!response.ok) {
      throw new Error(`Failed to recognize food image: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Image recognition response:", data);
    return data;
  } catch (error) {
    console.error("Error recognizing food image:", error);
    throw error;
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Helper to optimize image for API
const optimizeImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Target dimensions as recommended by FatSecret
      const targetWidth = 512;
      const targetHeight = 512;
      
      // Calculate the proportions
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > targetWidth) {
          height = Math.round(height * (targetWidth / width));
          width = targetWidth;
        }
      } else {
        if (height > targetHeight) {
          width = Math.round(width * (targetHeight / height));
          height = targetHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (!ctx) {
        reject(new Error("Could not create canvas context"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        }, 
        'image/jpeg', 
        0.9
      );
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};
