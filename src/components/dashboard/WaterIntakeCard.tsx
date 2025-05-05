
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { getTodayWaterIntake, updateWaterIntake } from '@/services/supabaseService';
import { useToast } from '@/components/ui/use-toast';

interface WaterIntakeCardProps {
  className?: string;
}

const WaterIntakeCard: React.FC<WaterIntakeCardProps> = ({ className }) => {
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [targetGlasses] = useState(8);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadWaterIntake();
    }
  }, [user]);

  const loadWaterIntake = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const glasses = await getTodayWaterIntake(user.id);
      setWaterGlasses(glasses);
    } catch (error) {
      console.error("Error loading water intake:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWater = async () => {
    if (!user) return;
    if (waterGlasses >= targetGlasses) return;
    
    const newValue = waterGlasses + 1;
    setWaterGlasses(newValue);
    
    try {
      await updateWaterIntake(user.id, newValue);
      toast({
        title: "Water intake updated",
        description: `${newValue} of ${targetGlasses} glasses`,
      });
    } catch (error) {
      console.error("Error updating water intake:", error);
      setWaterGlasses(waterGlasses); // Revert if failed
      toast({
        title: "Error updating water intake",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleRemoveWater = async () => {
    if (!user) return;
    if (waterGlasses <= 0) return;
    
    const newValue = waterGlasses - 1;
    setWaterGlasses(newValue);
    
    try {
      await updateWaterIntake(user.id, newValue);
    } catch (error) {
      console.error("Error updating water intake:", error);
      setWaterGlasses(waterGlasses); // Revert if failed
      toast({
        title: "Error updating water intake",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Water Intake</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">
            {waterGlasses} / {targetGlasses} glasses
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center space-x-2 h-8 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-blue-100"></div>
            <div className="w-8 h-8 rounded-full bg-blue-100"></div>
            <div className="w-8 h-8 rounded-full bg-blue-100"></div>
          </div>
        ) : (
          <div className="flex justify-center items-center space-x-2">
            {Array.from({ length: targetGlasses }).map((_, index) => (
              <Droplet 
                key={index}
                className={`w-5 h-5 transition-all duration-300 ${
                  index < waterGlasses 
                    ? 'text-blue-500 fill-blue-500' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        )}
        
        <div className="flex justify-center space-x-4 mt-4">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRemoveWater}
            disabled={waterGlasses <= 0 || isLoading}
          >
            -
          </Button>
          <Button
            size="sm"
            onClick={handleAddWater}
            disabled={waterGlasses >= targetGlasses || isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            + Add Glass
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterIntakeCard;
