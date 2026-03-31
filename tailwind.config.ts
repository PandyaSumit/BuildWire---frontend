import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:          'hsl(var(--bg) / <alpha-value>)',
        surface:     'hsl(var(--surface) / <alpha-value>)',
        elevated:    'hsl(var(--elevated) / <alpha-value>)',
        border:      'hsl(var(--border) / <alpha-value>)',
        primary:     'hsl(var(--text-primary) / <alpha-value>)',
        secondary:   'hsl(var(--text-secondary) / <alpha-value>)',
        muted:       'hsl(var(--text-muted) / <alpha-value>)',
        brand:       'hsl(var(--brand) / <alpha-value>)',
        'brand-hover': 'hsl(var(--brand-hover) / <alpha-value>)',
        'brand-light': 'hsl(var(--brand-light))',
        success:     'hsl(var(--success) / <alpha-value>)',
        warning:     'hsl(var(--warning) / <alpha-value>)',
        danger:      'hsl(var(--danger) / <alpha-value>)',
        info:        'hsl(var(--info) / <alpha-value>)',
        sidebar:     'hsl(var(--sidebar-bg) / <alpha-value>)',
        header:      'hsl(var(--header-bg) / <alpha-value>)',
      },
      boxShadow: {
        'token-xs': 'var(--shadow-xs)',
        'token-sm': 'var(--shadow-sm)',
        'token-md': 'var(--shadow-md)',
        'token-lg': 'var(--shadow-lg)',
        'token-xl': 'var(--shadow-xl)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '180': '180ms',
        '220': '220ms',
      },
    },
  },
  plugins: [],
};
export default config;
