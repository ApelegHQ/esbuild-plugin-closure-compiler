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

const preprocess = (text: string): string => `
(function(fallbackPkgName){(function (global, factory) {
	if (typeof define === "function" && define["amd"]) {
		define(["require", "exports", "module"], factory);
	} else {
		const isCjsMod = (typeof module === "object" && typeof module["exports"] === "object");
		const req = (typeof require === "function")
			? require
			: function(n) {throw new Error("Cannot find module '" + n + "'");};
		const mod = isCjsMod
			? module
			: Object.create(null, {
				"exports": {
					["configurable"]: true,
					["enumerable"]: true,
					["writable"]: true,
					["value"]: Object.create(null),
				},
			});

		const result = factory(req, mod["exports"], mod);

		if (typeof result !== "undefined") {
			mod["exports"] = result;
		}

		if (!isCjsMod) {
			global[fallbackPkgName] = mod["exports"];
		}
	}
})(this, function (require, exports, module) {
${text}
});}).call(
	typeof globalThis === "object"
	? globalThis
	: typeof self === "object"
	? self
	: typeof global === "object"
	? global
	: this,
	${JSON.stringify('index')}
);`;

const postprocess = <T>(text: T): T => text;

export { preprocess, postprocess };
