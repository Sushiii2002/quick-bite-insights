
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-6">
        <h1 className="text-6xl font-bold text-primary mb-6">404</h1>
        <h2 className="text-2xl font-medium mb-4">Page not found</h2>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate('/')}>Return to Home</Button>
      </div>
    </div>
  );
};

export default NotFound;
