
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchUserProfile } from '@/services/supabaseService';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (loading) return;

      if (!user) {
        // User not logged in, redirect to auth
        navigate('/auth');
        return;
      }

      setIsRedirecting(true);

      try {
        // User is logged in, check if they've completed onboarding
        const profile = await fetchUserProfile(user.id);
        
        if (!profile || profile.onboardingCompleted === false) {
          // User hasn't completed onboarding
          navigate('/onboarding');
        } else {
          // User has completed onboarding, go to home
          navigate('/home');
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        // If we can't determine onboarding status, send to onboarding to be safe
        navigate('/onboarding');
      }
    };

    checkUserAndRedirect();
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
      <div className="text-center p-6 rounded-lg">
        <h1 className="text-3xl font-bold text-primary mb-2">BeyondDiet</h1>
        <div className="flex items-center justify-center mt-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">Loading your nutrition journey...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
