/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,ejs}'],
    theme: {
        extend: {
            colors: {
                navy:  '#0a1628',
                steel: '#1e2a3a',
                slate: '#2d3f55',
                gold:  '#c9a84c',
                ivory: '#f5f5f0',
            },
            fontFamily: {
                sans:    ['Inter', 'system-ui', 'sans-serif'],
                serif:   ['Lora', 'Georgia', 'serif'],
                display: ['Montserrat', 'Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
