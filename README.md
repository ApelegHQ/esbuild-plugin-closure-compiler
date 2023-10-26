# esbuild plugin for post-compiling with Google Closure Compiler

 [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Exact-Realty_esbuild-plugin-closure-compiler&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Exact-Realty_esbuild-plugin-closure-compiler)
 [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=Exact-Realty_esbuild-plugin-closure-compiler&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=Exact-Realty_esbuild-plugin-closure-compiler)
 [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Exact-Realty_esbuild-plugin-closure-compiler&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Exact-Realty_esbuild-plugin-closure-compiler)
 [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Exact-Realty_esbuild-plugin-closure-compiler&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Exact-Realty_esbuild-plugin-closure-compiler)
 [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Exact-Realty_esbuild-plugin-closure-compiler&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Exact-Realty_esbuild-plugin-closure-compiler)
 ![NPM Downloads](https://img.shields.io/npm/dw/@exact-realty/esbuild-plugin-closure-compiler?style=flat-square)

## How to use

### Installing

```sh
npm i -D @exact-realty/esbuild-plugin-closure-compiler
```

### Configuring esbuild

In the file you have your configuration, first import this plugin

```js
const cc = require('@exact-realty/esbuild-plugin-closure-compiler');
```

Or using ES module syntax:

```js
import cc from '@exact-realty/esbuild-plugin-closure-compiler';
```

Then, in your esbuild configuration, add `cc()` to the `plugins` list. `cc`
optionally takes an object that is passed as options to Closure Compiler (for
reference, refer to the documentation for Google Closure Compiler). Minimal example:

```js
const esbuild = require('esbuild');
const cc = require('@exact-realty/esbuild-plugin-closure-compiler');

await esbuild
	.build({
		entryPoints: ['index.js'],
		outdir: 'build',
		bundle: true,
		format: 'cjs',
		plugins: [cc({ language_out: 'ECMASCRIPT_2018' })],
	});
```
