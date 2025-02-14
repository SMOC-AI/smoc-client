import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const srcDir = join(__dirname, 'src');
const indexFile = join(srcDir, 'index.ts'); 

const files = readdirSync(srcDir)
  .filter(file => file.endsWith('.ts') && file !== 'index.ts')
  .map(file => `export * from './${file.replace('.ts', '')}';`);

writeFileSync(indexFile, files.join('\n') + '\n');

console.log(`✅ Successfully generated ${indexFile}`);