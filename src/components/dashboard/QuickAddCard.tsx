
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface QuickFoodItem {
  name: string;
  calories: number;
}

interface QuickAddCardProps {
  onQuickAdd: (item: QuickFoodItem) => void;
}

const QuickAddCard = ({ onQuickAdd }: QuickAddCardProps) => {
  const quickItems: QuickFoodItem[] = [
    { name: 'Apple', calories: 95 },
    { name: 'Banana', calories: 105 },
    { name: 'Coffee', calories: 2 },
    { name: 'Egg', calories: 78 },
    { name: 'Water', calories: 0 },
    { name: 'Protein Shake', calories: 150 },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Quick Add</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {quickItems.map(item => (
            <Button 
              key={item.name} 
              variant="outline" 
              className="h-auto py-2 flex flex-col items-center text-xs"
              onClick={() => onQuickAdd(item)}
            >
              <Plus className="h-3 w-3 mb-1" />
              <span>{item.name}</span>
              <span className="text-muted-foreground text-[10px]">{item.calories} cal</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickAddCard;
