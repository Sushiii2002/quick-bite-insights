
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  Settings, 
  Star, 
  LogOut, 
  HelpCircle,
  Info,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserProfile, updateUserProfile, fetchFavoriteFoods } from '@/services/supabaseService';

interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    email: '',
    height: 175,
    weight: 70,
    dailyGoals: {
      calories: 2000,
      protein: 100,
      carbs: 200,
      fat: 65
    } as DailyGoals
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState<{foodName: string, calories: number}[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Load user profile
        const userProfile = await fetchUserProfile(user.id);
        if (userProfile) {
          let dailyGoals: DailyGoals = {
            calories: 2000,
            protein: 100,
            carbs: 200,
            fat: 65
          };
          
          if (userProfile.dailyGoal && typeof userProfile.dailyGoal === 'object') {
            const goalObj = userProfile.dailyGoal as any;
            dailyGoals = {
              calories: typeof goalObj.calories === 'number' ? goalObj.calories : 2000,
              protein: typeof goalObj.protein === 'number' ? goalObj.protein : 100,
              carbs: typeof goalObj.carbs === 'number' ? goalObj.carbs : 200,
              fat: typeof goalObj.fat === 'number' ? goalObj.fat : 65
            };
          }
          
          setProfile({
            email: userProfile.email || '',
            height: userProfile.height || 175,
            weight: userProfile.weight || 70,
            dailyGoals
          });
        }
        
        // Load favorite foods
        const favorites = await fetchFavoriteFoods(user.id);
        setFavoriteItems(favorites.map(food => ({
          foodName: food.foodName,
          calories: food.calories
        })));
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Convert goals to proper format for storage
      const updatedProfile = {
        height: profile.height,
        weight: profile.weight,
        dailyGoal: {
          calories: Number(profile.dailyGoals.calories),
          protein: Number(profile.dailyGoals.protein),
          carbs: Number(profile.dailyGoals.carbs),
          fat: Number(profile.dailyGoals.fat)
        }
      };
      
      console.log("Saving profile:", updatedProfile);
      
      const success = await updateUserProfile(user.id, updatedProfile);
      
      if (success) {
        toast({
          title: "Profile updated",
          description: "Your profile information has been updated.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="w-full h-40 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Settings className="w-4 h-4 mr-2" /> 
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} readOnly />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input 
                    id="height" 
                    type="number" 
                    value={profile.height} 
                    onChange={(e) => setProfile({
                      ...profile,
                      height: Number(e.target.value)
                    })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    value={profile.weight} 
                    onChange={(e) => setProfile({
                      ...profile,
                      weight: Number(e.target.value)
                    })} 
                  />
                </div>
              </div>
              
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Star className="w-4 h-4 mr-2" /> 
                Favorite Foods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {favoriteItems.length > 0 ? (
                  <ul className="divide-y">
                    {favoriteItems.map((item, index) => (
                      <li key={index} className="py-2 flex justify-between items-center">
                        <span>{item.foodName}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.calories} cal
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No favorite foods yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="w-4 h-4 mr-2" /> 
                Nutrition Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Daily Calories</Label>
                <Input 
                  id="calories" 
                  type="number" 
                  value={profile.dailyGoals.calories}
                  onChange={(e) => setProfile({
                    ...profile,
                    dailyGoals: {
                      ...profile.dailyGoals,
                      calories: Number(e.target.value)
                    }
                  })} 
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input 
                    id="protein" 
                    type="number" 
                    value={profile.dailyGoals.protein}
                    onChange={(e) => setProfile({
                      ...profile,
                      dailyGoals: {
                        ...profile.dailyGoals,
                        protein: Number(e.target.value)
                      }
                    })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input 
                    id="carbs" 
                    type="number" 
                    value={profile.dailyGoals.carbs}
                    onChange={(e) => setProfile({
                      ...profile,
                      dailyGoals: {
                        ...profile.dailyGoals,
                        carbs: Number(e.target.value)
                      }
                    })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input 
                    id="fat" 
                    type="number" 
                    value={profile.dailyGoals.fat}
                    onChange={(e) => setProfile({
                      ...profile,
                      dailyGoals: {
                        ...profile.dailyGoals,
                        fat: Number(e.target.value)
                      }
                    })} 
                  />
                </div>
              </div>
              
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving Goals...' : 'Save Goals'}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button variant="outline" className="w-full flex items-center justify-center">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center">
              <Info className="mr-2 h-4 w-4" />
              About BeyondDiet
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center text-red-500 hover:text-red-700"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Profile;
