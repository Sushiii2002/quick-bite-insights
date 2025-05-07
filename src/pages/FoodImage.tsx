
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import FoodSearchBar from '@/components/food/FoodSearchBar';

const FoodImage = () => {
  const { toast } = useToast();

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Food Search</h1>
        <p className="text-sm text-muted-foreground">Search for foods and add them to your log</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find Food</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Search for foods by name or description
          </p>
          <FoodSearchBar onSelect={(food) => {
            toast({
              title: "Food selected",
              description: `${food.food_name} has been selected. Please go to the Search & Log page to add it to your diary.`
            });
          }} />
        </CardContent>
      </Card>
    </Layout>
  );
};

export default FoodImage;
