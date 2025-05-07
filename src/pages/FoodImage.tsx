
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Camera } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';
import FoodSearchBar from '@/components/food/FoodSearchBar';

const FoodImage = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'camera'>('search');
  const { toast } = useToast();

  const handleCameraClick = () => {
    toast({
      title: "Feature not available",
      description: "Image recognition is not available with the current API plan.",
      variant: "destructive"
    });
    setActiveTab('search');
  };

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
          {/* Tab navigation */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant={activeTab === 'search' ? "default" : "outline"}
              onClick={() => setActiveTab('search')}
              className="flex-1"
            >
              <Image className="w-4 h-4 mr-2" />
              Search
            </Button>
            
            <Button
              variant={activeTab === 'camera' ? "default" : "outline"}
              onClick={handleCameraClick}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </Button>
          </div>

          {/* Search tab content */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Search for foods by name or description
              </p>
              <FoodSearchBar onSelect={(food) => {
                toast({
                  title: "Food selected",
                  description: `${food.food_name} has been selected. Please go to the Search & Log page to add it to your diary.`
                });
              }} />
            </div>
          )}

          {/* Camera tab content (placeholder) */}
          {activeTab === 'camera' && (
            <div className="space-y-4 text-center p-8">
              <Image className="h-12 w-12 mx-auto text-gray-400" />
              <p className="text-lg font-medium">Camera Feature Not Available</p>
              <p className="text-sm text-muted-foreground">
                Image recognition is not available with the current API plan.
                Please use the search feature instead.
              </p>
              <Button 
                onClick={() => setActiveTab('search')}
                className="mt-4"
              >
                Switch to Search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default FoodImage;
