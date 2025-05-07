
import React from 'react';

const EmptySearchState: React.FC = () => {
  return (
    <div className="mt-12 text-center text-muted-foreground">
      <p>Search for a food or recipe to log it to your diary</p>
      <p className="text-sm mt-2">Try searching for: chicken, salad, or pasta</p>
    </div>
  );
};

export default EmptySearchState;
