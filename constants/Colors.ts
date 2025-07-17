// 1. Define the raw color palette with shades
const palette = {
  // Primary Color (Blue)
  blue300: '#66B2FF', // Lighter, for highlights or hover states
  blue500: '#007AFF', // Main primary color
  blue700: '#0056B3', // Darker, for pressed states
  blueDark: '#0A84FF',

  // Secondary Color (Purple)
  purple300: '#CDB8FF', // Light mode secondary
  purple500: '#AF8EFF', // Dark mode secondary
  
  // Neutrals / Greys
  offBlack: '#121212', // Soft black for dark backgrounds
  black: '#1D1D1F',   // For light mode text
  white: '#FFFFFF',
  grey100: '#F5F5F7', // Light background
  grey200: '#E5E5EA', // Dividers, light chips
  grey300: '#C7C7CC', // Borders, disabled elements
  grey400: '#8E8E93', // Secondary text, labels
  grey500: '#6E6E73', // Icons, secondary text (dark mode)
  grey600: '#3A3A3C', // Dark dividers
  grey700: '#2C2C2E', // Dark chips, read-only fields
  grey800: '#1C1C1E', // Card backgrounds (dark mode)
  
  // Status Colors
  green: '#34C759',
  greenDark: '#30D158',
  yellow: '#FF9500',
  yellowDark: '#FF9F0A',
  red: '#FF3B30',
  redDark: '#FF453A',
};

// 2. Map the palette to semantic names for each theme
export default {
  light: {
    // Core & Utility
    text: palette.black,
    background: palette.grey100,
    tint: palette.blue500,
    primary: palette.blue500,
    secondary: palette.purple300,
    white: palette.white,
    black: palette.black,
    success: palette.green,
    warning: palette.yellow,
    error: palette.red,
    info: palette.blue500,
    
    // Components
    card: palette.white,
    label: palette.grey400,
    button: palette.blue500,
    badge: palette.red,
    chip: palette.grey200,
    input: palette.white,
    divider: palette.grey200,
    readOnlyBackground: palette.grey100,
    
    // Tabs
    tabIconDefault: palette.grey300,
    tabIconSelected: palette.blue500,
  },
  dark: {
    // Core & Utility
    text: palette.white,
    background: palette.offBlack,
    tint: palette.white,
    primary: palette.blueDark,
    secondary: palette.purple500,
    white: palette.white,
    black: palette.black,
    success: palette.greenDark,
    warning: palette.yellowDark,
    error: palette.redDark,
    info: palette.blueDark,
    
    // Components
    card: palette.grey800,
    label: palette.grey500,
    button: palette.blueDark,
    badge: palette.redDark,
    chip: palette.grey700,
    input: palette.grey800,
    divider: palette.grey600,
    readOnlyBackground: palette.grey700,
    
    // Tabs
    tabIconDefault: palette.grey500,
    tabIconSelected: palette.white,
  },
};
