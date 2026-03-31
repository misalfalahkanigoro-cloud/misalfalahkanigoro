/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            spacing: {
                '4.5': '1.125rem',
            },
            colors: {
                primary: '#1E7F43', // Hijau Tua Islami
                secondary: '#166033', // Hijau Lebih Tua untuk Hover
                accent: '#E8F5E9', // Hijau Sangat Muda
                gold: '#F59E0B',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
