
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  Settings, 
  Star, 
  LogOut, 
  HelpCircle,
  Info,
  BookOpen
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // TODO: Implement logout functionality with Supabase
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/auth');
  };

  const handleSave = () => {
    toast({
      title: 'Profile updated',
      description: 'Your profile information has been updated.',
    });
  };

  // Dummy user data
  const user = {
    email: 'user@example.com',
    height: 175,
    weight: 70,
    dailyGoals: {
      calories: 2000,
      protein: 100,
      carbs: 200,
      fat: 65
    }
  };

  const favoriteItems = [
    "Overnight Oats",
    "Protein Smoothie",
    "Grilled Chicken Salad",
    "Greek Yogurt"
  ];

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

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
              <Input id="email" value={user.email} readOnly />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" type="number" defaultValue={user.height} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" defaultValue={user.weight} />
              </div>
            </div>
            
            <Button onClick={handleSave}>Save Changes</Button>
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
                      <span>{item}</span>
                      <Button variant="ghost" size="sm">Log</Button>
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
              <Input id="calories" type="number" defaultValue={user.dailyGoals.calories} />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input id="protein" type="number" defaultValue={user.dailyGoals.protein} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input id="carbs" type="number" defaultValue={user.dailyGoals.carbs} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input id="fat" type="number" defaultValue={user.dailyGoals.fat} />
              </div>
            </div>
            
            <Button onClick={handleSave}>Save Goals</Button>
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
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
