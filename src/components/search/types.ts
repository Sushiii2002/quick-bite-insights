
import { FatSecretFood } from "@/types";

export interface SearchState {
  isLoading: boolean;
  selectedFood: FatSecretFood | null;
  selectedRecipe: any | null;
  activeTab: 'foods' | 'recipes';
}
