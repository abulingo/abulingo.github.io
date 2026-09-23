/** @type {import('tailwindcss').Config} */
module.exports = {
  // tailwind-safelist.txt: clases que llegan desde Supabase (temario de
  // gramática), que no aparecen en ningún archivo del repo.
  content: ['./*.html', './*.js', './tailwind-safelist.txt'],
  theme: { extend: {} },
  plugins: []
};
