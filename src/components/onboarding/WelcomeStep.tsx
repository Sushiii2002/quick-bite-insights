
import React from 'react';

const WelcomeStep = () => {
  return (
    <div className="text-center flex flex-col items-center justify-center flex-1">
      <h1 className="text-3xl font-bold text-primary mb-4">Welcome to BeyondDiet</h1>
      <p className="text-gray-600 mb-8">Track your nutrition and reach your health goals with our simple nutrition companion.</p>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-green-600 text-xl">🥗</span>
          </div>
          <h3 className="font-medium text-sm">Track Meals</h3>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-blue-600 text-xl">📊</span>
          </div>
          <h3 className="font-medium text-sm">View Insights</h3>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-purple-600 text-xl">🎯</span>
          </div>
          <h3 className="font-medium text-sm">Set Goals</h3>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-amber-600 text-xl">⚡</span>
          </div>
          <h3 className="font-medium text-sm">Quick Add</h3>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;
