import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  'aria-label'?: string;
}

const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  className = '', 
  ...props 
}: ButtonProps) => {
  const baseStyles = "font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent";
  
  const variants = {
    primary: "bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white/20 shadow-lg",
    secondary: "bg-white text-black hover:bg-gray-100 shadow-lg"
  };
  
  const sizes = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg"
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;