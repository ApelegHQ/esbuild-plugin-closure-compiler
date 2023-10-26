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

const importExpressionRegex =
	/\bimport\s*(?:|(?:((?<=\s)(?:(?=[^{*]*,\s*[*{])[^,]+\s*(?=,)|[^,{*]*?(?=\s*from))),?)?\s*(?:(?:[*]\s*as\s+([^{},]*)(?=\s))|\{\s*([^}]*?)\s*\})?\s*(from))\s*((["'])(?:[^\\6\\]|\\.)*?\6)/g;

const preprocess = (text: string): string =>
	text
		.replace(
			importExpressionRegex,
			(_, defaultExport, starName, namedImports, from, moduleName) => {
				return (
					'/** @nocollapse */ globalThis.__reserved__["%import_start"]();' +
					`${
						from
							? `const {${[
									defaultExport
										? `default:${defaultExport}`
										: '',
									namedImports?.replace(/as\s/g, ':'),
									starName ? `...${starName}` : '',
							  ]
									.filter(Boolean)
									.join(',')}}=`
							: ''
					}globalThis.__reserved__["%import"](${moduleName});` +
					'/** @nocollapse */ globalThis.__reserved__["%import_end"]()'
				);
			},
		)
		.replace(/export\s*{([^}]+)}/g, (_, p1: string) => {
			return p1
				.split(',')
				.map(
					(e) =>
						'/** @nocollapse */globalThis.__reserved__["%export"]' +
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
	const output = text.replace(
		/\bglobalThis\s*\.\s*__reserved__\s*\[\s*"%import_start"\s*\]\s*\(\s*\)[^}]*(\{.*?)\s*=\s*globalThis\s*\.\s*__reserved__\s*\[\s*"%import"\s*\]\s*\(\s*(.*?)\s*\)(?:\s*;|[\r\n])\s*globalThis\s*.__reserved__\s*\[\s*"%import_end"\s*\]\s*\(\s*\)/g,
		(_, l, m) => {
			return `import ${l.replace(/:/g, ' as ')} from ${m}`;
		},
	);

	if (output.indexOf('globalThis.__reserved__["%import_start"]') !== -1) {
		throw new Error('File has unsupported imports');
	}

	return output;
};

export { preprocess, postprocess };
