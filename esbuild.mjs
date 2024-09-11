#!/usr/bin/env node

/* Copyright © 2023 Apeleg Limited. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License") with LLVM
 * exceptions; you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 * http://llvm.org/foundation/relicensing/LICENSE.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import esbuild from 'esbuild';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

await esbuild.build({
	entryPoints: ['./src/index.ts'],
	outdir: 'dist',
	bundle: true,
	minify: true,
	format: 'cjs',
	entryNames: '[name]',
	platform: 'node',
	external: ['esbuild', 'google-closure-compiler'],
	outExtension: {
		'.js': '.cjs',
	},
});

await esbuild.build({
	entryPoints: ['./src/index.ts'],
	outdir: 'dist',
	bundle: true,
	minify: true,
	format: 'esm',
	entryNames: '[name]',
	platform: 'node',
	external: ['esbuild', 'google-closure-compiler'],
	outExtension: {
		'.js': '.mjs',
	},
});

const cjsDeclarationFiles = async (directoryPath) => {
	const entries = await readdir(directoryPath, {
		withFileTypes: true,
		recursive: true,
	});

	await Promise.all(
		entries
			.filter((entry) => {
				return entry.isFile() && entry.name.endsWith('.d.ts');
			})
			.map(async (file) => {
				const name = join(file.path, file.name);
				const newName = name.slice(0, -2) + 'cts';

				const contents = await readFile(name, { encoding: 'utf-8' });
				await writeFile(
					newName,
					contents.replace(/(?<=\.)js(?=['"])/g, 'cjs'),
				);
			}),
	);
};

await cjsDeclarationFiles('dist');
