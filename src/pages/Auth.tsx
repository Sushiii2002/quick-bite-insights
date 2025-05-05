
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    // TODO: Implement Supabase authentication
    console.log('Login with:', email, password);
    
    // For demo purposes, simulate successful login
    toast({
      title: 'Login Successful',
      description: 'Welcome back to BeyondDiet!',
    });
    
    // Redirect to the home page
    navigate('/');
  };

  const handleRegister = async (email: string, password: string) => {
    // TODO: Implement Supabase authentication
    console.log('Register with:', email, password);
    
    // For demo purposes, simulate successful registration
    toast({
      title: 'Registration Successful',
      description: 'Your account has been created. Welcome to BeyondDiet!',
    });
    
    // Redirect to the home page
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">BeyondDiet</h1>
          <p className="text-muted-foreground mt-1">Simple nutrition tracking</p>
        </div>
        
        {isLogin ? (
          <LoginForm 
            onLogin={handleLogin} 
            onSwitchToRegister={() => setIsLogin(false)} 
          />
        ) : (
          <RegisterForm 
            onRegister={handleRegister} 
            onSwitchToLogin={() => setIsLogin(true)} 
          />
        )}
      </div>
    </div>
  );
};

export default Auth;
