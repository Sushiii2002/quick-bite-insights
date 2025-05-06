
import React, { useState, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Camera, Upload, Loader2 } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';
import { recognizeFoodImage } from '@/services/fatSecretAPI';
import { useAuth } from '@/context/AuthContext';
import { logFoodEntry } from '@/services/supabaseService';
import { FoodLog, MealType } from '@/types';

const FoodImage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recognizedFoods, setRecognizedFoods] = useState<any[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('snack');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = async () => {
    try {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Camera not available",
          description: "Your browser doesn't support camera access",
          variant: "destructive"
        });
        return;
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create a video element to capture the camera stream
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Take a picture after a short delay
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to file
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
            handleImageFile(file);
          }
          
          // Stop the camera stream
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }, 'image/jpeg');
      }, 500);
    } catch (error) {
      if ((error as Error).name === 'NotAllowedError') {
        toast({
          title: "Camera access denied",
          description: "Please allow camera access to use this feature",
          variant: "destructive"
        });
      } else {
        console.error("Camera error:", error);
        toast({
          title: "Camera error",
          description: "Failed to access the camera",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Preview the image
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Set loading state
    setIsLoading(true);
    setRecognizedFoods([]);

    try {
      // Send the image to FatSecret API
      const result = await recognizeFoodImage(file);
      
      if (result && result.results && result.results.food) {
        setRecognizedFoods(Array.isArray(result.results.food) 
          ? result.results.food 
          : [result.results.food]
        );
      } else {
        toast({
          title: "No foods recognized",
          description: "Try a clearer image or different food",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error recognizing food:", error);
      toast({
        title: "Recognition failed",
        description: "Failed to analyze the food image",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogFood = async (food: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to log foods",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await logFoodEntry(
        user.id,
        food,
        selectedMealType,
        1 // Default serving size
      );
      
      if (result) {
        toast({
          title: "Food logged successfully",
          description: `${food.food_name} added to your ${selectedMealType}`,
        });
        // Clear the recognition data and image preview
        setRecognizedFoods([]);
        setImagePreview(null);
      }
    } catch (error) {
      console.error("Error logging food:", error);
      toast({
        title: "Failed to log food",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Food Recognition</h1>
        <p className="text-sm text-muted-foreground">Take a photo or upload an image to identify and log your food</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Food Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image preview */}
          {imagePreview ? (
            <div className="relative h-64 w-full rounded-md overflow-hidden">
              <img 
                src={imagePreview} 
                alt="Food preview" 
                className="w-full h-full object-cover" 
              />
              
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-white"
                onClick={() => {
                  setImagePreview(null);
                  setRecognizedFoods([]);
                }}
              >
                Clear
              </Button>
            </div>
          ) : (
            <div className="h-64 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center bg-gray-50">
              <Image className="h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Take a photo or upload an image</p>
            </div>
          )}

          {/* Upload buttons */}
          <div className="flex space-x-4">
            <Button 
              onClick={handleCameraClick} 
              className="flex-1"
              disabled={isLoading}
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            
            <Button 
              onClick={handleUploadClick} 
              variant="outline" 
              className="flex-1"
              disabled={isLoading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {/* Meal type selector */}
          <div className="grid grid-cols-4 gap-2">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => (
              <Button
                key={mealType}
                variant={selectedMealType === mealType ? "default" : "outline"}
                onClick={() => setSelectedMealType(mealType)}
                className="capitalize"
              >
                {mealType}
              </Button>
            ))}
          </div>

          {/* Recognition results */}
          {isLoading ? (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Analyzing image...</p>
            </div>
          ) : recognizedFoods.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium">Recognized Foods</h3>
              <div className="space-y-2">
                {recognizedFoods.map((food, index) => {
                  const serving = Array.isArray(food.servings?.serving) 
                    ? food.servings.serving[0] 
                    : food.servings?.serving;
                  
                  return (
                    <Card key={index}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{food.food_name}</p>
                          {serving && (
                            <p className="text-sm text-gray-500">
                              {serving.calories} cal, {serving.carbohydrate}g carbs, 
                              {serving.protein}g protein, {serving.fat}g fat
                            </p>
                          )}
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleLogFood(food)}
                        >
                          Log
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : imagePreview ? (
            <p className="text-center text-muted-foreground">
              No foods recognized. Try a clearer image or different angle.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default FoodImage;
