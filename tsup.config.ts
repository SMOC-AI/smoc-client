import { defineConfig } from 'tsup';

export default defineConfig([
	{
		entry: ['src/index.ts'],
		format: ['cjs', 'esm'],
		dts: true,
		splitting: false,
		sourcemap: true,
		clean: true,
	},
	{
		entry: { page: 'src/page.ts' },
		format: ['iife'],
		platform: 'browser',
		minify: true,
		sourcemap: true,
		outDir: 'dist',
		clean: false,
	},
]);