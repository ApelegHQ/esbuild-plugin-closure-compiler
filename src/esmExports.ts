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

const preprocess = (text: string): string =>
	text
		.replace(
			/export\s+default\b/g,
			'/** @nocollapse */globalThis["__reserved__"]["%export"]["default"]=',
		)
		.replace(/export\s*{([^}]+)}/g, (_, p1: string) => {
			return p1
				.split(',')
				.map(
					(e) =>
						'/** @nocollapse */globalThis["__reserved__"]["%export"]' +
						(/\sas\s/.test(e)
							? e.replace(/(.+)\sas\s(.+)/, (_, p1, p2) => {
									return `[${JSON.stringify(
										p2.trim(),
									)}]=${p1}`;
								})
							: `[${JSON.stringify(e.trim())}]=${e}`),
				)
				.join(';');
		});

const postprocess = (text: string): string => {
	const output = text
		.replace(
			/globalThis\s*\.\s*__reserved__\s*\[\s*"%export"\s*\]\s*\[\s*"default"\s*\]\s*=/g,
			'export default ',
		)
		.replace(
			/globalThis\s*\.\s*__reserved__\s*\[\s*"%export"\s*\]\s*\.\s*([^=]+)=/g,
			'export const $1=',
		);

	if (output.indexOf('globalThis.__reserved__["%export"]') !== -1) {
		throw new Error('File has unsupported exports');
	}

	return output;
};

export { preprocess, postprocess };
