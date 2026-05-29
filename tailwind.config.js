import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import scrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                display: ['Space Grotesk', ...defaultTheme.fontFamily.sans],
                mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                brand: {
                    50: '#f0f7ef',
                    100: '#dcedd8',
                    200: '#bbdbb3',
                    300: '#8fc47e',
                    400: '#7BBA4E',
                    500: '#548F4B',
                    600: '#476b3e',
                    700: '#3a5f33',
                    800: '#2d4a28',
                    900: '#1f351c',
                    950: '#12210f',
                },
                accent: {
                    DEFAULT: '#06b6d4',
                    hover: '#0891b2',
                },
                surface: {
                    dark: '#111827',
                    lighter: '#1f2937',
                },
                solar: {
                    gold: '#F59E0B',
                    orange: '#EA580C',
                    coral: '#F97316',
                    amber: '#FBBF24',
                    goldDark: '#D97706',
                }
            },
            backgroundImage: {
                'solar-gradient': 'linear-gradient(135deg, #F59E0B 0%, #EA580C 50%, #F97316 100%)',
                'gold-shimmer': 'linear-gradient(90deg, #F59E0B 0%, #FCD34D 50%, #F59E0B 100%)',
                'card-gradient': 'linear-gradient(135deg, #1a1a1f 0%, #12121a 100%)',
            },
            animation: {
                'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s infinite linear',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px #F59E0B, 0 0 10px #F59E0B' },
                    '100%': { boxShadow: '0 0 10px #F59E0B, 0 0 20px #F59E0B' },
                },
            }
        },
    },

    plugins: [forms, scrollbar],
};
