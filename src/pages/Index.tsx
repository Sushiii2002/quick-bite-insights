
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchUserProfile } from '@/services/supabaseService';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (loading) return;

      if (!user) {
        // User not logged in, redirect to auth
        navigate('/auth');
        return;
      }

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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">BeyondDiet</h1>
        <p className="mt-2">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
