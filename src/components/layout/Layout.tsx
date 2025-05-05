
import React, { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container max-w-md mx-auto px-4 pb-20 pt-4">
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
