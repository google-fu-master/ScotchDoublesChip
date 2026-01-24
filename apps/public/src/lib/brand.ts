// Scotch Doubles Brand Design System

export const brand = {
  colors: {
    primary: {
      50: '#f0f4ff',
      100: '#e0e7ff', 
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#8b5cf6',
      500: '#7c3aed',  // Main brand color - deep purple
      600: '#6d28d9',
      700: '#5b21b6',
      800: '#4c1d95',
      900: '#3c1361'
    },
    secondary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',  // Hot pink accent
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843'
    },
    accent: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe', 
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // Electric blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',  // Emerald green
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',  // Amber
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',  // Red
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717'
    },
    dark: {
      50: '#18181b',
      100: '#27272a',
      200: '#3f3f46',
      300: '#52525b',
      400: '#71717a',
      500: '#a1a1aa',
      600: '#d4d4d8',
      700: '#e4e4e7',
      800: '#f4f4f5',
      900: '#fafafa'
    }
  },
  
  gradients: {
    primary: 'bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600',
    primaryDark: 'bg-gradient-to-r from-purple-700 via-purple-800 to-pink-700',
    hero: 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50',
    heroDark: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800',
    card: 'bg-gradient-to-br from-white to-purple-50',
    cardDark: 'bg-gradient-to-br from-slate-800 to-slate-900',
    button: 'bg-gradient-to-r from-purple-600 to-pink-600',
    buttonHover: 'bg-gradient-to-r from-purple-700 to-pink-700'
  },

  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      heading: "'Lexend', 'Inter', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
    }
  },

  shadows: {
    brand: '0 4px 14px 0 rgba(124, 58, 237, 0.15)',
    brandHover: '0 8px 28px 0 rgba(124, 58, 237, 0.25)',
    glow: '0 0 20px rgba(124, 58, 237, 0.3)',
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    cardHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  },

  borderRadius: {
    brand: '12px',
    card: '16px',
    button: '10px',
    full: '9999px'
  },

  animations: {
    slideIn: 'transform translate-x-0 opacity-100',
    slideOut: 'transform translate-x-full opacity-0',
    fadeIn: 'opacity-100',
    fadeOut: 'opacity-0',
    bounce: 'animate-bounce',
    pulse: 'animate-pulse'
  }
};

export const brandClasses = {
  // Button styles
  button: {
    primary: `
      ${brand.gradients.button} text-white font-medium py-3 px-6 rounded-[${brand.borderRadius.button}] 
      shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 
      focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
    `,
    secondary: `
      bg-white text-purple-600 border-2 border-purple-200 font-medium py-3 px-6 rounded-[${brand.borderRadius.button}] 
      hover:border-purple-300 hover:bg-purple-50 transform hover:scale-[1.02] transition-all duration-200 
      focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
    `,
    ghost: `
      text-purple-600 hover:bg-purple-50 font-medium py-3 px-6 rounded-[${brand.borderRadius.button}] 
      transition-colors duration-200
    `
  },

  // Card styles
  card: {
    primary: `
      ${brand.gradients.card} rounded-[${brand.borderRadius.card}] shadow-lg border border-purple-100 
      hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300
    `,
    dark: `
      ${brand.gradients.cardDark} rounded-[${brand.borderRadius.card}] shadow-lg border border-slate-700 
      hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300
    `
  },

  // Input styles
  input: {
    primary: `
      w-full px-4 py-3 rounded-[${brand.borderRadius.brand}] border-2 border-purple-200 
      focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200
      placeholder-gray-400 bg-white
    `,
    dark: `
      w-full px-4 py-3 rounded-[${brand.borderRadius.brand}] border-2 border-slate-600 
      focus:border-purple-400 focus:ring-2 focus:ring-purple-800 transition-all duration-200
      placeholder-gray-500 bg-slate-800 text-white
    `
  },

  // Text styles
  text: {
    hero: 'text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600',
    heading: 'text-2xl md:text-3xl font-bold text-gray-900 dark:text-white',
    subheading: 'text-lg text-gray-600 dark:text-gray-300',
    body: 'text-gray-700 dark:text-gray-300',
    small: 'text-sm text-gray-500 dark:text-gray-400'
  }
};