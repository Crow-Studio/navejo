'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/user-context';

interface GreetingProps {
  email?: string;
  name?: string;
  className?: string;
}

interface GreetingData {
  message: string;
  gradient: string;
}

const Greeting: React.FC<GreetingProps> = ({ 
  email, 
  name, 
  className = "" 
}) => {
  const { user: contextUser } = useUser()
  const [greeting, setGreeting] = useState<GreetingData>({
    message: "Hello",
    gradient: "from-yellow-400 to-orange-500"
  });

  // Use context user data if available, fallback to props
  const userEmail = contextUser?.email || email
  const userName = contextUser?.name || name

  // Extract name from email if name is not provided
  const extractNameFromEmail = (email: string): string => {
    const localPart = email.split('@')[0];
    // Remove numbers and special characters, then capitalize
    const cleanName = localPart
      .replace(/[0-9._-]/g, ' ')
      .split(' ')
      .filter(part => part.length > 0)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
    
    return cleanName || localPart.charAt(0).toUpperCase() + localPart.slice(1);
  };

  const getGreeting = (): GreetingData => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return {
        message: "Good morning",
        gradient: "from-yellow-400 to-orange-500"
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        message: "Good afternoon",
        gradient: "from-orange-400 to-red-500"
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        message: "Good evening",
        gradient: "from-purple-400 to-pink-500"
      };
    } else {
      return {
        message: "Good night",
        gradient: "from-blue-600 to-purple-600"
      };
    }
  };

  useEffect(() => {
    setGreeting(getGreeting());
    
    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Determine display name
  const displayName = userName || (userEmail ? extractNameFromEmail(userEmail) : 'there');

  // Format current date and time
  const formatDateTime = (): string => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    const dateStr = now.toLocaleDateString('en-US', options);
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    // Format: "Monday, July 28th, 2025 at 02:30:08 AM"
    const day = now.getDate();
    const suffix = getDaySuffix(day);
    const formattedDate = dateStr.replace(day.toString(), `${day}${suffix}`);
    
    return `${formattedDate} at ${timeStr}`;
  };

  const getDaySuffix = (day: number): string => {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex-1 min-w-0">
        {/* Greeting message with responsive text sizing */}
        <h1 className={`
          text-xl sm:text-2xl md:text-3xl lg:text-xl 
          font-light 
          bg-gradient-to-r ${greeting.gradient} 
          bg-clip-text text-transparent
          leading-tight
          break-words
          mb-2
        `}>
          <span className="block sm:inline text-white text-extrabold">{greeting.message},  {displayName}</span>
        </h1>
        
        {/* Date and time with specified colors */}
        <div className="text-xs sm:text-sm text-gray-500">
          <span className="text-gray-300">
            {formatDateTime()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Greeting;