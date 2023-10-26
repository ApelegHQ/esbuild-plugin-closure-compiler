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

import type esbuild from 'esbuild';
import googleClosureCompiler from 'google-closure-compiler';
import * as esmExports from './esmExports.js';
import * as esmImports from './esmImports.js';
import * as esmDynamicImports from './esmDynamicImports.js';
import * as umdExports from './umdExports.js';

const esm = {
	preprocess: (x: string): string => {
		return [
			esmDynamicImports.preprocess,
			esmExports.preprocess,
			esmImports.preprocess,
		].reduce((acc, cv) => cv(acc), x);
	},
	postprocess: (x: string): string => {
		return [
			esmDynamicImports.postprocess,
			esmExports.postprocess,
			esmImports.postprocess,
		].reduce((acc, cv) => cv(acc), x);
	},
};

const umd = {
	preprocess: (x: string): string => {
		return [esmDynamicImports.preprocess, umdExports.preprocess].reduce(
			(acc, cv) => cv(acc),
			x,
		);
	},
	postprocess: (x: string): string => {
		return [esmDynamicImports.postprocess, umdExports.postprocess].reduce(
			(acc, cv) => cv(acc),
			x,
		);
	},
};

const getCompiler = (
	config: esbuild.BuildOptions,
	compilerOptions?: googleClosureCompiler.CompileOptions,
) => {
	const esmOutput = config.format === 'esm';

	const buildModule = esmOutput ? esm : umd;

	const compiler = new googleClosureCompiler.compiler({
		language_in: 'ECMASCRIPT_2020',
		language_out: 'ECMASCRIPT_2015',
		env: 'BROWSER',
		...compilerOptions,
		rewrite_polyfills: false,
		process_closure_primitives: false,
		apply_input_source_maps: false,
		warning_level: 'QUIET',
		isolate_polyfills: true,
		assume_function_wrapper: esmOutput,
	});

	return (text: string) => {
		text = buildModule.preprocess(text);

		return new Promise<string>((resolve, reject) => {
			const process = compiler.run((exitCode, stdout, stderr) => {
				if (exitCode === 0) {
					// TODO: Warnings
					stdout = buildModule.postprocess(stdout);

					resolve(stdout);
				} else {
					// TODO: Better error handing
					return reject(new Error(stderr));
				}
			});

			if (!process.stdin) {
				process.kill();
				reject(new Error('No stdin'));
				return;
			}

			process.stdin.write(text);
			process.stdin.end();
		});
	};
};

export default getCompiler;
