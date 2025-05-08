
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import GoalSettingStep from '@/components/onboarding/GoalSettingStep';
import PersonalDetailsStep from '@/components/onboarding/PersonalDetailsStep';
import CalorieGoalStep from '@/components/onboarding/CalorieGoalStep';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile } from '@/services/supabaseService';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [goalType, setGoalType] = useState('maintain');
  const [goalCalorieAdjustment, setGoalCalorieAdjustment] = useState(0);
  const [dailyCalories, setDailyCalories] = useState(2000);

  // Calculate recommended calories based on user's data
  const calculateRecommendedCalories = () => {
    // Convert to metric if needed
    const weightInKg = weightUnit === 'kg' ? weight : weight * 0.453592;
    const heightInCm = heightUnit === 'cm' ? height : height * 2.54;
    
    // Basic BMR calculation (Mifflin-St Jeor equation)
    const bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * 30 + 5; // Age assumed 30 for simplicity
    
    // Activity factor (moderate activity)
    const tdee = bmr * 1.375;
    
    // Apply goal adjustment
    return Math.round(tdee + goalCalorieAdjustment);
  };

  useEffect(() => {
    const recommended = calculateRecommendedCalories();
    setDailyCalories(recommended);
  }, [weight, height, weightUnit, heightUnit, goalCalorieAdjustment]);

  const handleGoalSelected = (goalId: string, calorieAdjustment: number) => {
    setGoalType(goalId);
    setGoalCalorieAdjustment(calorieAdjustment);
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // On final step, save all data
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to complete onboarding",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      try {
        // Convert units if needed
        const weightInKg = weightUnit === 'kg' ? weight : weight * 0.453592;
        const heightInCm = heightUnit === 'cm' ? height : height * 2.54;
        
        const profile = {
          weight: weightInKg,
          height: heightInCm,
          daily_goal: dailyCalories,
          onboarding_completed: true
        };
        
        const success = await updateUserProfile(user.id, profile);
        
        if (success) {
          toast({
            title: "Onboarding Complete",
            description: "Your profile has been set up successfully!",
          });
          navigate('/');
        } else {
          throw new Error("Failed to update profile");
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "There was a problem saving your profile",
          variant: "destructive",
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const totalSteps = 4;
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <GoalSettingStep onGoalSelected={handleGoalSelected} />;
      case 2:
        return (
          <PersonalDetailsStep
            height={height}
            setHeight={setHeight}
            weight={weight}
            setWeight={setWeight}
            heightUnit={heightUnit}
            setHeightUnit={setHeightUnit}
            weightUnit={weightUnit}
            setWeightUnit={setWeightUnit}
          />
        );
      case 3:
        return (
          <CalorieGoalStep
            recommendedCalories={calculateRecommendedCalories()}
            initialCalories={dailyCalories}
            onCaloriesChange={setDailyCalories}
          />
        );
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={handleNext}
      onPrevious={handlePrevious}
      isFirstStep={currentStep === 0}
      isLastStep={currentStep === totalSteps - 1}
    >
      {renderStep()}
    </OnboardingLayout>
  );
};

export default Onboarding;
