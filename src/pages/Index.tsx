
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // If authenticated, go to home, otherwise go to auth page
      if (user) {
        navigate('/home');
      } else {
        navigate('/auth');
      }
    }
  }, [navigate, user, loading]);

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
