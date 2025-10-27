// lib/ui-theme.ts
// Centralized UI theme configuration for consistent styling

export const uiTheme = {
  // Main application theme (dark)
  app: {
    background: 'bg-black',
    text: 'text-white',
    border: 'border-gray-700',
    hover: 'hover:bg-gray-900'
  },
  
  // Card components
  card: {
    background: 'bg-gray-800',
    border: 'border-gray-700',
    text: 'text-white',
    hover: 'hover:bg-gray-700'
  },
  
  // Input components
  input: {
    background: 'bg-gray-800',
    border: 'border-gray-700',
    text: 'text-white',
    placeholder: 'placeholder-gray-400',
    focus: 'focus:border-gray-500 focus:ring-gray-500'
  },
  
  // Button variants
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600',
    outline: 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white',
    ghost: 'text-gray-400 hover:text-white hover:bg-gray-800',
    // Accent button for CTAs (maintains contrast)
    accent: 'bg-white text-black hover:bg-gray-100 border-white'
  },
  
  // Modal/Dialog components
  modal: {
    overlay: 'bg-black/50',
    content: 'bg-gray-900 border-gray-700 text-white',
    header: 'border-b border-gray-700',
    footer: 'border-t border-gray-700'
  },
  
  // Navigation components
  nav: {
    background: 'bg-gray-900',
    text: 'text-gray-300',
    active: 'bg-gray-700 text-white',
    hover: 'hover:bg-gray-800 hover:text-white'
  },
  
  // Status colors (maintain accessibility)
  status: {
    success: 'text-green-400 bg-green-900/20 border-green-700',
    error: 'text-red-400 bg-red-900/20 border-red-700',
    warning: 'text-yellow-400 bg-yellow-900/20 border-yellow-700',
    info: 'text-blue-400 bg-blue-900/20 border-blue-700'
  },
  
  // Loading states
  loading: {
    skeleton: 'bg-gray-700 animate-pulse',
    spinner: 'text-gray-400'
  }
} as const;

// Helper function to get consistent class combinations
export function getThemeClasses(component: keyof typeof uiTheme, variant?: string) {
  const componentTheme = uiTheme[component];
  if (typeof componentTheme === 'object' && variant && variant in componentTheme) {
    return componentTheme[variant as keyof typeof componentTheme];
  }
  return componentTheme;
}

// Accessibility helpers
export const a11y = {
  // Ensure proper contrast ratios
  highContrast: {
    text: 'text-white',
    background: 'bg-black'
  },
  
  // Focus indicators
  focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
  
  // Screen reader only content
  srOnly: 'sr-only',
  
  // Skip links
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded-md z-50'
} as const;