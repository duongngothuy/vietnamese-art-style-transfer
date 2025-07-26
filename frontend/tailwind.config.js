/** @type {import('tailwindcss').Config} */

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Vietnamese-inspired color palette
                'vietnamese-red': '#DA020E',  // Traditional red
                'vietnamese-gold': '#FFD700', // Lacquer gold
                'vietnamese-blue': '#003366', // Traditional blue
                'silk-beige': '#F5F5DC',      // Silk painting background
            },
            fontFamily: {
                'vietnamese': ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}