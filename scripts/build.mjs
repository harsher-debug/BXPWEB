import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
// The only directory removed is this project's literal build output.
if (output !== resolve(root, 'dist')) throw new Error('Invalid output directory');
await mkdir(output, { recursive: true });
for (const entry of await readdir(output)) await rm(resolve(output, entry), { recursive: true, force: true });
const files = ['index.html', 'privacidade.html', '404.html', 'styles.css', 'app.js', 'assets', 'robots.txt', 'sitemap.xml', '_headers'];
for (const file of files) await cp(resolve(root, file), resolve(output, file), { recursive: true });
console.log('Site pronto em dist/. HTML, CSS, JS e fontes locais; nenhuma dependência em produção.');
