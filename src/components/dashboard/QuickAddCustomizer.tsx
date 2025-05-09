
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FoodSearchBar from "@/components/food/FoodSearchBar";
import { getNutrients, SearchResult } from "@/services/nutritionixAPI";
import { Settings, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { saveQuickAddItem, deleteQuickAddItem, QuickAddItem } from "@/services/supabaseService";
import { useAuth } from "@/context/AuthContext";

interface QuickAddCustomizerProps {
  quickItems: QuickAddItem[];
  onCustomizationComplete: () => void;
}

const QuickAddCustomizer = ({ quickItems, onCustomizationComplete }: QuickAddCustomizerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);

  const handleFoodSelect = async (food: SearchResult) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Get food nutrition details
      const nutrients = await getNutrients(food.food_name);
      if (!nutrients) {
        toast({
          title: "Error",
          description: "Could not fetch food details",
          variant: "destructive"
        });
        return;
      }
      
      // Find the next available position
      const existingPositions = quickItems.map(item => item.displayOrder);
      let newPosition = 1;
      while (existingPositions.includes(newPosition) && newPosition <= 6) {
        newPosition++;
      }
      
      if (newPosition > 6) {
        toast({
          title: "Maximum items reached",
          description: "Please remove an item before adding a new one",
          variant: "destructive"
        });
        return;
      }
      
      // Save quick add item
      await saveQuickAddItem({
        userId: user.id,
        foodId: nutrients.nix_item_id || food.food_name,
        foodName: nutrients.food_name,
        calories: Math.round(nutrients.nf_calories),
        displayOrder: newPosition
      });
      
      toast({
        title: "Quick Add Updated",
        description: `Added ${nutrients.food_name} to your Quick Add items`
      });
      
      onCustomizationComplete();
    } catch (error) {
      console.error("Error adding quick add item:", error);
      toast({
        title: "Error",
        description: "Failed to add item to Quick Add",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (item: QuickAddItem) => {
    if (!item.id) {
      toast({
        title: "Error",
        description: "Cannot remove item without ID",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const success = await deleteQuickAddItem(item.id);
      
      if (success) {
        toast({
          title: "Item Removed",
          description: `${item.foodName} has been removed from Quick Add`
        });
        onCustomizationComplete();
      } else {
        toast({
          title: "Error",
          description: "Failed to remove item",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error removing quick add item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomizer = () => {
    setIsOpen(true);
    setTimeout(() => {
      if (searchRef.current) {
        const input = searchRef.current.querySelector('input');
        if (input) input.focus();
      }
    }, 100);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-2 h-9 w-9 rounded-full"
        onClick={openCustomizer}
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Quick Add</DialogTitle>
            <DialogDescription>
              Search for foods to add to your Quick Add section. 
              Maximum of 6 items.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div ref={searchRef}>
              <FoodSearchBar onSelect={handleFoodSelect} />
            </div>
            
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
            
            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-medium">Current Quick Add Items:</h3>
              {quickItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items added yet</p>
              ) : (
                <ul className="space-y-2">
                  {quickItems
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((item) => (
                      <li key={item.id || item.foodId} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium">{item.foodName}</p>
                          <p className="text-xs text-muted-foreground">{item.calories} cal</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveItem(item)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickAddCustomizer;
