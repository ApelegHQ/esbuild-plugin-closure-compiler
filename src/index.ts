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

`
TODOS:
- Errors and warnings
- Support for sourcemaps
`;

import esbuild from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import getCompiler from './getCompiler.js';
import type { CompileOptions } from 'google-closure-compiler';

export default (compilerOptions?: CompileOptions): esbuild.Plugin => {
	const name = '@apeleghq/esbuild-plugin-closure-compiler';
	const textEncoder = new TextEncoder();
	const textDecoder = new TextDecoder();

	const plugin: esbuild.Plugin = {
		name,
		setup(build) {
			const origWrite = build.initialOptions.write;
			const options = { ...build.initialOptions };

			/* Required for the plugin to work */
			build.initialOptions.write = false;
			build.initialOptions.metafile = true;

			const compiler = getCompiler(options, compilerOptions);

			build.onEnd(async (result) => {
				const outputFiles = result.outputFiles;

				if (!Array.isArray(outputFiles) || !result.metafile) {
					return;
				}

				await Promise.all(
					Object.entries(result.metafile?.outputs || {}).map(
						async ([path, meta]) => {
							if (!meta.entryPoint) return;

							const outputFile = outputFiles.find((file) =>
								file.path.endsWith(path),
							);

							if (!outputFile) return;

							const compiledText = textEncoder.encode(
								await compiler(outputFile.text),
							);

							Object.defineProperty(meta, 'bytes', {
								get: () => compiledText.byteLength,
							});
							Object.defineProperties(outputFile, {
								['contents']: {
									get: () => {
										return compiledText;
									},
								},
								['text']: {
									get: () => {
										return textDecoder.decode(compiledText);
									},
								},
							});
						},
					),
				);

				if (origWrite === false) return;

				await Promise.all(
					Array.from(
						new Set(
							outputFiles.map((file) => path.dirname(file.path)),
						),
					).map((dir) => fs.mkdir(dir, { recursive: true })),
				);

				await Promise.all(
					outputFiles.map((file) =>
						fs.writeFile(file.path, file.contents),
					),
				);

				result.outputFiles = undefined;
			});
		},
	};

	return plugin;
};
