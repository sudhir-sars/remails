/** @type {import('tailwindcss').Config} */
import type { Config } from 'tailwindcss';
import type { PluginAPI } from 'tailwindcss/types/config';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        blink: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'blink': 'blink 5s infinite',
      },
      boxShadow: {
        'all-sides': '0 0 10px rgba(0, 0, 0, 0.3)',
        'inner-all': `
          inset 0 2px 4px 0 hsl(var(--border) / 0.5),    /* top */
          inset 2px 0 4px 0 hsl(var(--border) / 0.5),    /* right */
          inset 0 -2px 4px 0 hsl(var(--border) / 0.5),   /* bottom */
          inset -2px 0 4px 0 hsl(var(--border) / 0.5)    /* left */
        `,
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    function plugin({ addBase, theme }: PluginAPI) {
      addBase({
        'h1': {
          fontSize: theme('fontSize.4xl'),
          fontWeight: theme('fontWeight.bold'),
          marginBottom: theme('spacing.6'),
        },
        'h2': {
          fontSize: theme('fontSize.3xl'),
          fontWeight: theme('fontWeight.bold'),
          marginBottom: theme('spacing.5'),
        },
        'h3': {
          fontSize: theme('fontSize.2xl'),
          fontWeight: theme('fontWeight.semibold'),
          marginBottom: theme('spacing.4'),
        },
        'h4': {
          fontSize: theme('fontSize.xl'),
          fontWeight: theme('fontWeight.semibold'),
          marginBottom: theme('spacing.3'),
        },
        'h5': {
          fontSize: theme('fontSize.lg'),
          fontWeight: theme('fontWeight.medium'),
          marginBottom: theme('spacing.2'),
        },
        'p': {
          fontSize: theme('fontSize.base'),
          marginBottom: theme('spacing.4'),
        },
        'ul': {
          listStyleType: 'disc',
          paddingLeft: theme('spacing.5'),
          marginBottom: theme('spacing.4'),
        },
        'ol': {
          listStyleType: 'decimal',
          paddingLeft: theme('spacing.5'),
          marginBottom: theme('spacing.4'),
        },
        'li': {
          marginBottom: theme('spacing.2'),
        },
        'a': {
          color: theme('colors.blue.500'),
          textDecoration: 'underline',
        },
        'blockquote': {
          borderLeftWidth: '4px',
          borderColor: theme('colors.gray.300'),
          paddingLeft: theme('spacing.4'),
          fontStyle: 'italic',
          marginBottom: theme('spacing.4'),
        },
        'code': {
          backgroundColor: theme('colors.gray.100'),
          padding: theme('spacing.4'),
          borderRadius: theme('borderRadius.md'),
          fontSize: theme('fontSize.sm'),
          fontFamily: theme('fontFamily.mono'),
        },
        'table': {
          minWidth: '100%',
          borderCollapse: 'collapse',
          marginBottom: theme('spacing.4'),
        },
        'thead th': {
          backgroundColor: theme('colors.gray.100'),
          textAlign: 'left',
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.semibold'),
          color: theme('colors.gray.500'),
          textTransform: 'uppercase',
          letterSpacing: theme('letterSpacing.wider'),
        },
        'tbody td': {
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          fontSize: theme('fontSize.sm'),
          color: theme('colors.gray.500'),
        },
      });
    },
  ],
};

export default config;
