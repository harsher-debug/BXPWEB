import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const [name, source] = process.argv.slice(2);
if (!['sites', 'landing', 'apps', 'suporte'].includes(name) || !source) {
  throw new Error('Usage: node scripts/prepare-service-image.mjs <sites|landing|apps|suporte> <source-image>');
}
await mkdir('assets/services', { recursive: true });
for (const width of [600, 1200]) {
  const suffix = width === 1200 ? '' : '-600';
  const output = resolve('assets/services', `${name}${suffix}.webp`);
  const result = await sharp(source).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(output);
  console.log(`${name}${suffix}.webp: ${result.width}x${result.height}, ${Math.round(result.size / 1024)} KB`);
}
