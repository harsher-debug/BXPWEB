import { cp, mkdir, readdir, rm, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
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
// Content-addressed URLs prevent a new page from using old CSS/JS in mobile caches.
for (const asset of ['styles.css', 'app.js', 'assets/favicon.svg']) {
  const contents = await readFile(resolve(root, asset));
  const hash = createHash('sha256').update(contents).digest('hex').slice(0, 12);
  const versioned = asset.replace('.', `.${hash}.`);
  await writeFile(resolve(output, versioned), contents);
  for (const page of ['index.html', 'privacidade.html', '404.html']) {
    const path = resolve(output, page);
    const html = await readFile(path, 'utf8');
    await writeFile(path, html.replaceAll(asset, versioned));
  }
}
console.log('Site pronto em dist/. HTML, CSS, JS e fontes locais; nenhuma dependência em produção.');
