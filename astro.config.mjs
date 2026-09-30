// @ts-check
import { defineConfig } from 'astro/config';

// Salida estática para GitHub Pages (sitio de usuario: se sirve en la raíz).
export default defineConfig({
  site: 'https://abulingo.github.io',
  output: 'static',
  build: { format: 'file' },
  // Quita espacios sobrantes del HTML (no toca el contenido de los <script>)
  compressHTML: true,
});
