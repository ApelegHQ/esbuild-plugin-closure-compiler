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

const dymamicImportExpressionRegex =
	/(?<=\.{3}\s*|(?<!\.\s*))\bimport\s*(?=\.|\([^)]*\)(?:(?:\s*$|\s*[[\],}\w\d;'"`(^!~*+-]+\s*)+))/g;

const preprocess = (text: string): string =>
	text.replace(
		dymamicImportExpressionRegex,
		'globalThis.__reserved__["%dymamic_import%"]',
	);

const postprocess = (text: string): string => {
	const output = text.replace(
		/\bglobalThis\s*\.\s*__reserved__\s*\[\s*"%dymamic_import%"\s*\]/g,
		'import',
	);

	return output;
};

export { preprocess, postprocess };
