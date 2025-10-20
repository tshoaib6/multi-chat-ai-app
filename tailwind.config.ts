/** @type {import('tailwindcss').Config} */
export default {
darkMode: 'class',
content: [
'./index.html',
'./src/**/*.{ts,tsx}',
],
theme: {
extend: {
colors: {
sarah: { DEFAULT: '#4338ca' }, // indigo
james: { DEFAULT: '#0d9488' }, // teal
maria: { DEFAULT: '#be185d' }, // rose
user: { DEFAULT: '#334155' }, // slate
}
},
},
plugins: [],
}