/* Copyright © 2023 Exact Realty Limited. All rights reserved.
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
import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import cc from '../src/index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

describe('Test', () => {
	describe('Import results in the right values', async () => {
		for (const [test, expected] of [
			['test-simple', 42],
			['test-import-dependency', 42],
			[
				'test-additional-file',
				'http://invalid/assets/test-additional-file-NXTPLUDW.dat',
			],
			[
				'test-import-nested-file',
				'http://invalid/assets/test-additional-file-NXTPLUDW.dat',
			],
			['test-node-module', 'G00DBEEF'],
		]) {
			(['cjs', 'esm'] as esbuild.Format[]).forEach((format) => {
				it(`[${format}] ${test}`, async () => {
					const extension = format === 'esm' ? 'mjs' : 'cjs';

					await esbuild
						.build({
							entryPoints: [path.join(__dirname, `${test}.ts`)],
							outdir: path.join(__dirname, 'build'),
							bundle: true,
							format: format,
							publicPath: 'http://invalid/assets',
							plugins: [cc()],
							platform: 'node',
							loader: {
								'.dat': 'file',
							},
							outExtension: {
								'.js': `.${extension}`,
							},
							sourcemap: 'external',
						})
						.then(() => {
							return import(
								new URL(
									`./build/${test}.${extension}`,
									import.meta.url,
								).toString()
							);
						})
						.then((r) => {
							if (format !== 'esm') {
								r = r.default;
							}
							assert.equal(r.default, expected);
						})
						.catch((e) => {
							console.error('Error while building');
							console.dir(e);
							process.exit(1);
						});
				});
			});
		}
	});
});
