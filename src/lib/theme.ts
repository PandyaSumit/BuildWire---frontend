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
    bg: '#1d1f21',
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
    sidebarBg: '#1d1f21',
    headerBg: '#1d1f21',
};

export const lightTheme: Theme = {
    bg: '#F7FAFC',
    surface: '#FFFFFF',
    elevated: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    brand: '#2563EB',
    brandLight: '#2563EB1A',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#F87171',
    sidebarBg: '#F3F7FB',
    headerBg: '#F3F7FB',
};

export const themes = {
    dark: darkTheme,
    light: lightTheme,
} as const;

export type ThemeMode = keyof typeof themes;
