import { readFile, writeFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';

const svg = await readFile(new URL('../assets/favicon.svg', import.meta.url), 'utf8');
for (const [file, width] of [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['brand-preview.png', 256],
]) {
  const renderer = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
  await writeFile(new URL(`../assets/${file}`, import.meta.url), renderer.render().asPng());
}
console.log('Favicon e ícone para iPhone gerados a partir do mesmo SVG.');
