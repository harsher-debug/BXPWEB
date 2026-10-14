import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Window } from 'happy-dom';

let links = 0;
for (const page of ['index.html', 'privacidade.html', '404.html']) {
  const window = new Window({ url: `https://bxpweb.com.br/${page}`, settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  const html = await readFile(page, 'utf8');
  assert(!html.includes('\uFFFD'), `${page}: encoding inválido`);
  window.document.write(html);
  const document = window.document;
  assert.equal(document.documentElement.lang, 'pt-BR');
  assert.equal(document.querySelectorAll('h1').length, 1);
  const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
  assert.equal(ids.length, new Set(ids).size, `${page}: ID duplicado`);
  for (const element of document.querySelectorAll('[href], [src]')) {
    const target = element.getAttribute('href') || element.getAttribute('src');
    if (!target || /^(https?:|mailto:|data:)/.test(target)) continue;
    const [file, hash] = target.split('#');
    if (file) {
      const local = file === '/' ? 'index.html' : file.replace(/^\//, '');
      assert((await stat(resolve(local))).isFile(), `Arquivo ausente: ${file}`);
    }
    if (hash && !file) assert(document.getElementById(hash), `Âncora ausente: ${target}`);
    links++;
  }
  for (const field of document.querySelectorAll('input, textarea, select')) {
    assert(field.id && (document.querySelector(`label[for="${field.id}"]`) || field.closest('label')), `Campo sem rótulo: ${field.id}`);
  }
  await window.happyDOM.close();
}
for (const font of ['barlow-regular.ttf', 'barlow-semibold.ttf', 'instrument-italic.ttf']) {
  const bytes = await readFile(`assets/${font}`);
  assert.equal(bytes.readUInt32BE(0), 0x00010000, `Fonte TTF inválida: ${font}`);
}
const css = await readFile('styles.css', 'utf8');
for (const match of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) await stat(match[1]);
assert(css.includes('prefers-reduced-motion'));
assert(css.includes(':focus-visible'));
console.log(`Estrutura, ${links} referências locais, rótulos, fontes e recursos de acessibilidade verificados.`);
