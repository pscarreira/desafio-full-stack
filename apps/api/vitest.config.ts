import { resolve } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
			test: resolve(__dirname, './test'),
		},
	},
	test: {
		globals: true,
		root: './',
		typecheck: {
			tsconfig: './tsconfig.test.json',
		},
	},
	plugins: [
		swc.vite({
			module: { type: 'es6' },
		}),
	],
});
