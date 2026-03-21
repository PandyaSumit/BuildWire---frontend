export type Theme = {
  bg: string;
  surface: string;
  elevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  brand: string;
  brandLight: string;
  success: string;
  warning: string;
  danger: string;
  sidebarBg: string;
  headerBg: string;
};

export const darkTheme: Theme = {
  bg: '#121212',
  surface: '#1E1E1E',
  elevated: '#2A2A2A',
  border: '#333333',
  textPrimary: '#F5F5F5',
  textSecondary: '#B0B0B0',
  textMuted: '#707070',
  brand: '#FFFFFF',
  brandLight: '#FFFFFF15',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#F87171',
  sidebarBg: '#0F0F0F',
  headerBg: '#121212',
};

export const lightTheme: Theme = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  elevated: '#FFFFFF',
  border: '#E5E5E5',
  textPrimary: '#0A0A0A',
  textSecondary: '#525252',
  textMuted: '#A3A3A3',
  brand: '#171717',
  brandLight: '#17171710',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  sidebarBg: '#F5F5F5',
  headerBg: '#FAFAFA',
};

export const themes = {
  dark: darkTheme,
  light: lightTheme,
} as const;

export type ThemeMode = keyof typeof themes;
