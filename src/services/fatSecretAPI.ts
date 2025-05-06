
// Use OAuth 2.0 credentials for FatSecret
const CLIENT_ID = "02cd317bd67546c2adc92442ccc3e27";
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

// Search for foods
export const searchFoods = async (query: string, maxResults = 10): Promise<any[]> => {
  try {
    const token = await getAccessToken();
    
    const params = new URLSearchParams({
      method: "foods.search",
      search_expression: query,
      format: "json",
      max_results: maxResults.toString()
    });
    
    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to search foods");
    }
    
    const data = await response.json();
    
    if (data.foods && data.foods.food) {
      // Handle single or multiple results
      return Array.isArray(data.foods.food) 
        ? data.foods.food 
        : [data.foods.food];
    }
    
    return [];
  } catch (error) {
    console.error("Error searching foods:", error);
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
    
    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to get food details");
    }
    
    const data = await response.json();
    return data.food;
  } catch (error) {
    console.error("Error getting food details:", error);
    throw error;
  }
};

// Search for recipes
export const searchRecipes = async (
  query: string, 
  maxResults = 10,
  recipeType?: string,
  region?: string
): Promise<any[]> => {
  try {
    const token = await getAccessToken();
    
    const params = new URLSearchParams({
      method: "recipes.search",
      search_expression: query,
      format: "json",
      max_results: maxResults.toString()
    });
    
    if (recipeType) {
      params.append("recipe_type", recipeType);
    }
    
    if (region) {
      params.append("region", region);
    }
    
    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to search recipes");
    }
    
    const data = await response.json();
    
    if (data.recipes && data.recipes.recipe) {
      // Handle single or multiple results
      return Array.isArray(data.recipes.recipe) 
        ? data.recipes.recipe 
        : [data.recipes.recipe];
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
      method: "recipe.get",
      recipe_id: recipeId,
      format: "json"
    });
    
    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to get recipe details");
    }
    
    const data = await response.json();
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
    
    const formData = new FormData();
    formData.append("method", "food.image.recognize");
    formData.append("format", "json");
    formData.append("image", optimizedImage);
    
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error("Failed to recognize food image");
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error recognizing food image:", error);
    throw error;
  }
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
