/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                princess: {
                    light: "#fce7f3",
                    pink: "#ec4899",
                    hot: "#db2777",
                    dark: "#be185d",
                    gold: "#fbbf24",
                },
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
