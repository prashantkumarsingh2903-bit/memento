/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        warm: {
          bg: 'var(--color-warm-bg)',
          card: 'var(--color-warm-card)',
          'card-subtle': 'var(--color-warm-card-subtle)',
          border: 'var(--color-warm-border)',
          'border-strong': 'var(--color-warm-border-strong)',
          text: 'var(--color-warm-text)',
          muted: 'var(--color-warm-muted)',
          faint: 'var(--color-warm-faint)',
          accent: 'var(--color-warm-accent)',
          'accent-hover': 'var(--color-warm-accent-hover)',
          'accent-light': 'var(--color-warm-accent-light)',
          sage: '#4F725D',
          'sage-light': '#EBF2EE',
          ochre: '#B27D36',
          'ochre-light': '#FAF2E6',
          indigo: '#55637D',
          'indigo-light': '#ECEFF5',
          rose: '#9E4E59',
          'rose-light': '#F8ECEE',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(40, 30, 20, 0.04), 0 1px 2px -1px rgba(40, 30, 20, 0.04)',
        soft: '0 4px 20px -2px rgba(40, 30, 20, 0.06), 0 2px 6px -1px rgba(40, 30, 20, 0.03)',
        elevated: '0 12px 32px -4px rgba(40, 30, 20, 0.08), 0 4px 12px -2px rgba(40, 30, 20, 0.04)',
        glow: '0 0 24px -4px var(--color-warm-accent-glow)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave-bar': 'wave 1.2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wave: {
          '0%': { transform: 'scaleY(0.2)' },
          '100%': { transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
};
