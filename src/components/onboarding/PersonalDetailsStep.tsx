
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PersonalDetailsStepProps {
  height: number;
  setHeight: (height: number) => void;
  weight: number;
  setWeight: (weight: number) => void;
  heightUnit: string;
  setHeightUnit: (unit: string) => void;
  weightUnit: string;
  setWeightUnit: (unit: string) => void;
}

const PersonalDetailsStep = ({
  height,
  setHeight,
  weight,
  setWeight,
  heightUnit,
  setHeightUnit,
  weightUnit,
  setWeightUnit
}: PersonalDetailsStepProps) => {
  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold text-center mb-2">Your Details</h2>
      <p className="text-gray-600 text-center mb-6">Help us personalize your experience</p>
      
      <Card className="p-4 mb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight</Label>
            <div className="flex">
              <Input
                id="weight"
                type="number"
                value={weight || ''}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="flex-1 rounded-r-none"
              />
              <Select 
                value={weightUnit} 
                onValueChange={setWeightUnit}
              >
                <SelectTrigger className="w-24 rounded-l-none border-l-0">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <div className="flex">
              <Input
                id="height"
                type="number"
                value={height || ''}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                className="flex-1 rounded-r-none"
              />
              <Select 
                value={heightUnit} 
                onValueChange={setHeightUnit}
              >
                <SelectTrigger className="w-24 rounded-l-none border-l-0">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="in">in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>
      
      <p className="text-sm text-gray-500 text-center mt-2">
        This information helps us calculate your daily calorie needs.
      </p>
    </div>
  );
};

export default PersonalDetailsStep;
