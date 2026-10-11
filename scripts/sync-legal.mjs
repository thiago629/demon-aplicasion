// Copia los textos legales del hilo legal a la app.
// Uso: node scripts/sync-legal.mjs /mnt/project-files/app-francisco/legal
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? '../legal';
const marca = JSON.parse(readFileSync(new URL('../src/lib/marca.json', import.meta.url)));
const docs = [
  ['privacidad', '01-politica-privacidad.md'],
  ['terminos', '02-terminos-condiciones.md'],
  ['normas', '03-normas-comunidad.md'],
  ['aviso-legal', '04-aviso-legal.md'],
  ['cookies', '05-politica-cookies.md'],
  ['denuncias', '06-procedimiento-denuncias-dsa.md'],
];
const out = {};
for (const [slug, file] of docs) {
  out[slug] = readFileSync(join(dir, file), 'utf8')
    .replaceAll('[NOMBRE DE LA APP]', marca.nombre)
    .replaceAll('[DOMINIO]', marca.dominio)
    // Los borradores ya traen el nombre anterior; se sustituye por el actual
    .replaceAll('zavnir.app', marca.dominio).replaceAll('ZAVNIR', marca.nombre).replaceAll('Zavnir', marca.nombre);
}
const version = (out.privacidad.match(/Versión ([\d.]+)/) ?? [])[1] ?? '0.1';
writeFileSync(new URL('../src/lib/legal-textos.ts', import.meta.url),
  `// Generado por scripts/sync-legal.mjs. No editar a mano.\nexport const VERSION_LEGAL = ${JSON.stringify(version)};\nexport const TEXTOS: Record<string, string> = ${JSON.stringify(out, null, 2)};\n`);
console.log('legal sincronizado, versión', version);
