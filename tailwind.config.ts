import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'hsl(var(--bg) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        elevated: 'hsl(var(--elevated) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        primary: 'hsl(var(--text-primary) / <alpha-value>)',
        secondary: 'hsl(var(--text-secondary) / <alpha-value>)',
        muted: 'hsl(var(--text-muted) / <alpha-value>)',
        brand: 'hsl(var(--brand) / <alpha-value>)',
        'brand-light': 'hsl(var(--brand-light))',
        success: 'hsl(var(--success) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)',
        danger: 'hsl(var(--danger) / <alpha-value>)',
        sidebar: 'hsl(var(--sidebar-bg) / <alpha-value>)',
        header: 'hsl(var(--header-bg) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
export default config;
