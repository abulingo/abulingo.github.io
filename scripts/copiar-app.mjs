// Copia a dist/ las páginas de la app que NO son parte de Astro, sin
// modificarlas, para que sigan en sus rutas de siempre (/abulingo.html,
// /admin.html, /fonetica/app.js, ...). Se ejecuta después de `astro build`.
import { cpSync, readdirSync, statSync } from 'node:fs';

const EXCLUIR = new Set(['tailwind.config.cjs']);
const CARPETAS = ['fonetica', 'juego'];
const EXT = /\.(html|js|css|mp3)$/;

for (const f of readdirSync('.')) {
  if (statSync(f).isFile() && EXT.test(f) && !EXCLUIR.has(f)) cpSync(f, `dist/${f}`);
}
for (const d of CARPETAS) cpSync(d, `dist/${d}`, { recursive: true });
console.log('App copiada a dist/');
