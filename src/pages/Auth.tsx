
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { fetchUserProfile } from '@/services/supabaseService';

const Auth = () => {
  const [activeView, setActiveView] = useState<'login' | 'register'>('login');
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (user) {
        // Check if user has completed onboarding
        try {
          const profile = await fetchUserProfile(user.id);
          if (profile && profile.onboardingCompleted) {
            navigate('/');
          } else {
            navigate('/onboarding');
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
          navigate('/onboarding');
        }
      }
    };

    checkUserAndRedirect();
  }, [user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleRegister = async (email: string, password: string) => {
    await signUp(email, password);
  };

  const switchToLogin = () => setActiveView('login');
  const switchToRegister = () => setActiveView('register');

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">BeyondDiet</h1>
          <p className="text-muted-foreground">Your simple nutrition companion</p>
        </div>
        
        {activeView === 'login' ? (
          <LoginForm onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
        ) : (
          <RegisterForm onRegister={handleRegister} onSwitchToLogin={switchToLogin} />
        )}
      </div>
    </div>
  );
};

export default Auth;
