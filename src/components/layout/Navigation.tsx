
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  Search,
  MessageCircle, 
  User
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/',
    },
    {
      icon: Search,
      label: 'Search',
      path: '/search',
    },
    {
      icon: MessageCircle,
      label: 'AI Chat',
      path: '/ai-chat',
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 z-10">
      <div className="container max-w-md mx-auto px-4">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-1 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
