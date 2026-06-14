/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Apple-style light surfaces (warm-neutral, never clinical pure white)
        background: '#fbfbfd',
        foreground: '#1d1d1f',
        surface: '#ffffff',
        'surface-hover': '#f5f5f7',
        'surface-sunken': '#f0f0f3',
        border: '#e7e7ec',
        'border-hover': '#d2d2d7',
        // Signature tech accent — Apple blue, with a violet counterpoint for gradients
        primary: '#0071e3',
        'primary-hover': '#0077ed',
        accent: '#7c3aed',
        muted: '#6e6e73',
        'muted-dark': '#9a9aa0',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'SF Pro Display',
          'var(--font-inter)',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '10px',
        lg: '14px',
        xl: '18px',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.06)',
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -16px rgba(15, 23, 42, 0.16)',
        'card-hover': '0 2px 6px rgba(15, 23, 42, 0.05), 0 28px 56px -22px rgba(15, 23, 42, 0.24)',
        glow: '0 0 0 1px rgba(0, 113, 227, 0.08), 0 12px 40px -12px rgba(0, 113, 227, 0.3)',
        'glow-lg': '0 0 0 1px rgba(0, 113, 227, 0.1), 0 24px 64px -16px rgba(0, 113, 227, 0.35)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s ease-in-out infinite',
        float: 'float 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
