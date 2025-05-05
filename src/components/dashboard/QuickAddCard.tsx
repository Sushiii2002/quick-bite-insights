
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { 
  fetchQuickAddItems, 
  logQuickAddItem, 
  QuickAddItem 
} from '@/services/supabaseService';
import { useAuth } from '@/context/AuthContext';
import QuickAddCustomizer from './QuickAddCustomizer';
import { useToast } from '@/components/ui/use-toast';

interface QuickAddCardProps {
  onQuickAdd: (item: { name: string, calories: number }) => void;
}

const QuickAddCard = ({ onQuickAdd }: QuickAddCardProps) => {
  const [quickItems, setQuickItems] = useState<QuickAddItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadQuickAddItems = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const items = await fetchQuickAddItems(user.id);
      
      // If no custom items yet, use default items
      if (items.length === 0) {
        const defaultItems = [
          { name: 'Apple', calories: 95 },
          { name: 'Banana', calories: 105 },
          { name: 'Coffee', calories: 2 },
          { name: 'Egg', calories: 78 },
          { name: 'Water', calories: 0 },
          { name: 'Protein Shake', calories: 150 },
        ];
        
        setQuickItems(defaultItems.map((item, index) => ({
          userId: user.id,
          foodId: item.name,
          foodName: item.name,
          calories: item.calories,
          displayOrder: index + 1
        })));
      } else {
        setQuickItems(items);
      }
    } catch (error) {
      console.error('Error loading quick add items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuickAddItems();
  }, [user]);

  const handleQuickAddClick = async (item: QuickAddItem) => {
    if (!user) return;
    
    try {
      // Log the food item to Supabase
      const logId = await logQuickAddItem(user.id, item, 'snack');
      
      if (logId) {
        // Notify the parent component
        onQuickAdd({ name: item.foodName, calories: item.calories });
        
        toast({
          title: `Added ${item.foodName}`,
          description: `${item.calories} calories added to your log.`,
        });
      }
    } catch (error) {
      console.error('Error logging quick add item:', error);
      toast({
        title: "Error",
        description: "Failed to log food item",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full relative">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Quick Add</CardTitle>
        <QuickAddCustomizer 
          quickItems={quickItems} 
          onCustomizationComplete={loadQuickAddItems}
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2 animate-pulse">
            {[...Array(6)].map((_, index) => (
              <div 
                key={index}
                className="h-16 bg-gray-100 rounded flex flex-col items-center justify-center"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {quickItems.map(item => (
              <Button 
                key={item.foodId} 
                variant="outline" 
                className="h-auto py-2 flex flex-col items-center text-xs"
                onClick={() => handleQuickAddClick(item)}
              >
                <Plus className="h-3 w-3 mb-1" />
                <span className="text-center">{item.foodName}</span>
                <span className="text-muted-foreground text-[10px]">{item.calories} cal</span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickAddCard;
