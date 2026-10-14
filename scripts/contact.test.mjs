import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';

const html = await readFile('index.html', 'utf8');
const code = await readFile('app.js', 'utf8');
const key = 'bxpweb:privacy:v1';
async function setup(t, choice) {
  const window = new Window({ url: 'https://bxpweb.com.br/', settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  window.document.write(html);
  // Canvas rendering is intentionally excluded: these are interaction tests,
  // not browser or visual tests.
  window.document.querySelector('canvas').remove();
  if (choice !== undefined) window.localStorage.setItem(key, choice);
  const opened = [];
  window.open = (...args) => { opened.push(args); return null; };
  window.eval(code);
  t.after(() => window.happyDOM.close());
  return { window, document: window.document, opened };
}
function fill(document) {
  document.querySelector('#name').value = 'Luíze & Caio';
  document.querySelector('#service').value = 'Site ou landing page';
  document.querySelector('#message').value = 'Uma página para TI + redes. <script>teste</script>';
}
function submit(window) {
  window.document.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
}
test('não abre WhatsApp sem campos obrigatórios ou aceite', async t => {
  const { window, document, opened } = await setup(t);
  submit(window);
  assert.equal(opened.length, 0);
  fill(document);
  submit(window);
  assert.equal(opened.length, 0);
  document.querySelector('#privacy-consent').checked = true;
  document.querySelector('#name').value = '   ';
  submit(window);
  assert.equal(opened.length, 0);
});
test('prepara mensagem segura e oferece link se popup for bloqueado', async t => {
  const { window, document, opened } = await setup(t);
  fill(document);
  document.querySelector('#privacy-consent').checked = true;
  submit(window);
  assert.equal(opened.length, 1);
  const [address, target, features] = opened[0];
  const url = new URL(address);
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/5551980214923');
  assert(url.searchParams.get('text').includes('Luíze & Caio'));
  assert(url.searchParams.get('text').includes('TI + redes. <script>teste</script>'));
  assert.equal(target, '_blank');
  assert.equal(features, 'noopener,noreferrer');
  assert.equal(document.querySelector('#form-status a').href, address);
  assert.equal(document.querySelector('#form-status script'), null);
  assert.equal(window.localStorage.length, 0);
});
test('escolha de privacidade persiste e pode ser alterada no rodapé', async t => {
  const { window, document } = await setup(t);
  assert.equal(document.querySelector('#cookie-banner').hidden, false);
  document.querySelector('[data-cookie-choice="necessary"]').click();
  assert.equal(document.querySelector('#cookie-banner').hidden, true);
  assert.equal(JSON.parse(window.localStorage.getItem(key)).value, 'necessary');
  document.querySelector('[data-cookie-settings]').click();
  assert.equal(document.querySelector('#cookie-banner').hidden, false);
  document.querySelector('[data-cookie-choice="accepted"]').click();
  assert.equal(JSON.parse(window.localStorage.getItem(key)).value, 'accepted');
  assert.equal(document.activeElement, document.querySelector('[data-cookie-settings]'));
});
test('preferência válida oculta aviso, inválida ou expirada mostra aviso', async t => {
  const valid = await setup(t, JSON.stringify({ value: 'necessary', at: Date.now() }));
  assert.equal(valid.document.querySelector('#cookie-banner').hidden, true);
  const expired = await setup(t, JSON.stringify({ value: 'accepted', at: Date.now() - 181 * 86400000 }));
  assert.equal(expired.document.querySelector('#cookie-banner').hidden, false);
  const invalid = await setup(t, 'conteúdo inválido');
  assert.equal(invalid.document.querySelector('#cookie-banner').hidden, false);
});
test('CTA escolhe a solução e menu fecha com Escape e restaura foco', async t => {
  const { window, document } = await setup(t);
  document.querySelector('[data-service="App ou plataforma digital"]').click();
  assert.equal(document.querySelector('#service').value, 'App ou plataforma digital');
  const toggle = document.querySelector('.menu-toggle');
  toggle.click();
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(document.querySelector('#mobile-nav').hidden, false);
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(document.activeElement, toggle);
});
