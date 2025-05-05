
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // For demo purposes, redirect to auth page
    // In a real app with Supabase, we would check auth state here
    navigate('/auth');
  }, [navigate]);

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
