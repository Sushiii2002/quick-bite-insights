
// This file provides backward compatibility while transitioning to modular services
// It re-exports all functions from the new service modules

import {
  // Base service
  getCurrentUser,
  checkUserExists,
  createUserIfNotExists,
  
  // User service
  fetchUserProfile,
  updateUserProfile,
  
  // Food log service
  logFoodEntry,
  fetchFoodLogs,
  fetchFavoriteFoods,
  fetchNutritionSummary,
  
  // Quick add service
  fetchQuickAddItems,
  saveQuickAddItem,
  deleteQuickAddItem,
  logQuickAddItem,
  
  // Types
  QuickAddItem
} from './supabase';

// Re-export everything
export {
  // Base service
  getCurrentUser,
  checkUserExists,
  createUserIfNotExists,
  
  // User service
  fetchUserProfile,
  updateUserProfile,
  
  // Food log service
  logFoodEntry,
  fetchFoodLogs,
  fetchFavoriteFoods,
  fetchNutritionSummary,
  
  // Quick add service
  fetchQuickAddItems,
  saveQuickAddItem,
  deleteQuickAddItem,
  logQuickAddItem,
  
  // Types
  QuickAddItem
};

// NOTE: Water intake functionality has been removed as it's not supported in the current database schema
// If you need water intake tracking, please create the necessary table first using SQL migrations
