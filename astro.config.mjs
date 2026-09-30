// @ts-check
import { defineConfig } from 'astro/config';

// Salida estática para GitHub Pages (sitio de usuario: se sirve en la raíz).
export default defineConfig({
  site: 'https://abulingo.github.io',
  output: 'static',
  build: { format: 'file' },
  // Mantiene el HTML y los scripts inline tal cual estaban en index.html
  compressHTML: false,
});
