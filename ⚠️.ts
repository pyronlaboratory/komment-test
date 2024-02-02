/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as es from 'event-stream';
import * as fs from 'fs';
import * as gulp from 'gulp';
import * as path from 'path';
import * as monacodts from './monaco-api';
import * as nls from './nls';
import { createReporter } from './reporter';
import * as util from './util';
import * as fancyLog from 'fancy-log';
import * as ansiColors from 'ansi-colors';
import * as os from 'os';
import ts = require('typescript');
import * as File from 'vinyl';
import * as task from './task';
import { Mangler } from './mangle/index';
import { RawSourceMap } from 'source-map';
const watch = require('./watch');


// --- gulp-tsb: compile and transpile --------------------------------

const reporter = createReporter();

/**
* @description This function returns the TypeScript compiler options object based
* on a given source file path and some environment variables. It sets various options
* such as verbose output (off), source maps (on unless VSCODE_NO_SOURCEMAP is set),
* root directory and base URL for compiling TypeScript code.
* 
* @param { string } src - The `src` input parameter specifies the source code file
* that needs to be compiled using TypeScript. It is a string that contains the path
* to the source file relative to the current working directory.
* 
* @returns { undefined } This function takes a string `src` as input and returns an
* object of type `ts.CompilerOptions`. The object has several properties:
* 
* 	- `verbose`: a boolean indicating whether to print detailed messages during compilation.
* 	- `sourceMap`: a boolean indicating whether to generate source maps for compiled
* files.
* 	- `rootDir`: the directory that contains the source files.
* 	- `baseUrl`: the base URL for resolving module references.
* 	- `sourceRoot`: the absolute path to the root of the source code directory.
* 	- `newLine`: an integer indicating the type of new line characters to use (0 for
* Windows-style and 1 for Unix-style).
* 
* The function sets some default values for these properties based on the location
* of the current file and the environment variables. It returns the resulting object
{/**
* @description This function generates the API proposal names for the vscode project
* by processing the extensionsApiProposals.ts file and extracting the names from it.
* It uses a RegExp to match the proposed API name patterns and adds them to a Set.
* Afterwardly is generate an output file with the extracted names.
*/}
* of `ts.CompilerOptions`.
*/
function getTypeScriptCompilerOptions(src: string): ts.CompilerOptions {
	const rootDir = path.join(__dirname, `../../${src}`);
	const options: ts.CompilerOptions = {};
	options.verbose = false;
	options.sourceMap = true;
	if (process.env['VSCODE_NO_SOURCEMAP']) { // To be used by developers in a hurry
		options.sourceMap = false;
	}
	options.rootDir = rootDir;
	options.baseUrl = rootDir;
	options.sourceRoot = util.toFileUri(rootDir);
	options.newLine = /\r\n/.test(fs.readFileSync(__filename, 'utf8')) ? 0 : 1;
	return options;
}

/**
* @description This function creates a Gulp pipeline for compiling TypeScript sources.
* It takes options for building or transpiling only and handles source maps and
* sourcemaps write. The function returns a duplex stream object that can be used to
* process files.
* 
* @param { string } src - The `src` input parameter specifies the source files to
* compile. It is a string or an array of strings representing the paths to the source
* files relative to the root directory of the project.
* 
* @param { boolean } build - The `build` input parameter of the `createCompile`
* function controls whether the TypeScript code is compiled to a JavaScript file or
* not. When set to `true`, it compiles the TypeScript code and emits a JavaScript
* file. When set to `false`, it only transpiles the TypeScript code without compiling
* it.
* 
* @param { boolean } emitError - The `emitError` input parameter determines whether
* or not error messages should be emitted to the reporter when compiling TypeScript
* files using the `tsb` package. If set to `true`, error messages will be emitted;
* if set to `false`, error messages will be suppressed.
* 
* @param { boolean } transpileOnly - The `transpileOnly` input parameter determines
* whether to only perform type transpilation (compile TypeScript source code to
* JavaScript) without compiling the entire project. When set to `true`, the `tsb`
* module will generate output that can be consumed directly by a bundler like Webpack
* or Rollup without further compilation steps. When set to a boolean object with a
* `swc` property (as shown here), it enables or disables generation of source maps
* for the transpiled code based on the value of the `swc` property.
* 
* @returns {  } The `createCompile` function returns a pipelinestream that processes
* TypeScript source files and produces compiled JavaScript code. The output returned
* by the function is a duplex stream object that includes the following pipes:
* 
* 	- `bom`: adds BOM (byte order mark) to the input stream if it's a UTF-8 file.
* 	- `tsFilter`: filters out non-TypeScript files.
* 	- `isUtf8Test`, `isRuntimeJs`, and `isCSS` are conditionals that manipulate the
* pipeline based on the file extension and location.
* 	- `postcss`: applies PostCSS transformation to CSS files.
* 	- `util.loadSourcemaps`: loads sourcemaps for the input files.
* 	- `compilation`: compiles the TypeScript sources using the `tsb` module.
* 	- `noDeclarationsFilter`: removes declarations from the output if build is set
* to false.
* 	- `util.appendOwnPathSourceURL`: appends the own path source URL to JavaScript
* files if they don't have one.
* 	- `sourcemaps.write`: writes sourcemaps for the compiled JavaScript files.
* 	- `tsFilter.restore`: restores the input stream to its original state before the
* first `tsFilter` pipe.
* 
* The output stream includes the compiled JavaScript code and any generated source
* maps.
*/
function createCompile(src: string, build: boolean, emitError: boolean, transpileOnly: boolean | { swc: boolean }) {
	const tsb = require('./tsb') as typeof import('./tsb');
	const sourcemaps = require('gulp-sourcemaps') as typeof import('gulp-sourcemaps');


	const projectPath = path.join(__dirname, '../../', src, 'tsconfig.json');
	const overrideOptions = { ...getTypeScriptCompilerOptions(src), inlineSources: Boolean(build) };
	if (!build) {
		overrideOptions.inlineSourceMap = true;
	}

/**
* @description This function creates a TS build project at the specified `projectPath`,
* using the provided `overrideOptions` and handling any errors with the given
* `reporter`. It also has options to transpile only (ignoring types) or transpile
* with SWC (a bundler).
* 
* @param { object } err - The `err` input parameter is an error reporter function
* that takes an error object as an argument and calls it if there is any error during
* the creation of the project. It is used to handle errors that may occur during the
* process.
*/
	const compilation = tsb.create(projectPath, overrideOptions, {
		verbose: false,
		transpileOnly: Boolean(transpileOnly),
		transpileWithSwc: typeof transpileOnly !== 'boolean' && transpileOnly.swc
	}, err => reporter(err));

/**
* @description This function defines a gulp pipeline for transpiling and compiling
* TypeScript sources. It filters out Declaration files (.d.ts), preserves BOM for
* test files (-/+Windows line ending), appends source maps and builds JS/CSS output
* depending on the configuration.
* 
* @param { undefined } token - The `token` input parameter is an `util.ICancellationToken`
* that allows the pipeline to be cancelled during runtime. It's used to inject a
* cancellation token into the pipeline so that it can be intercepted and cancelled
* by the calling function.
* 
* @returns { object } This function takes an optional `token` parameter and returns
* a duplex stream that pipes through various transformations to the input stream.
* The output of the function is also a duplex stream that emits both a content (for
* the processed files) and an end event (indicating the pipeline is complete).
*/
	function pipeline(token?: util.ICancellationToken) {
		const bom = require('gulp-bom') as typeof import('gulp-bom');

/**
* @description The given function utilizes the `util` object's `filter()` method to
* create a new array containing only the objects for which the `data.path` property
* matches the regular expression `/\.ts$/.test(data.path)`. In simpler terms: it
* selects all elements of the original `data` array whose `path` property ends with
* `.ts`.
* 
* @param { object } data - In the provided code snippet `data` is an object that is
* being passed as an argument to the function `util.filter()`. It represents an item
* or a record of some sort of data that needs to be processed by the filter function.
*/
		const tsFilter = util.filter(data => /\.ts$/.test(data.path));
/**
* @description The provided JavaScript function `isUtf8Test` takes a file object `f`
* as input and returns a boolean value indicating whether the file path contains a
* UTF-8 encoded string. It does this by checking if the file path contains either
* forward slash (`/`) or backslash (`\`) followed by "test" followed by either forward
* slash or backslash again and then any sequence of Unicode codepoints that match
* the pattern `.*utf8`.
* 
* @param { File } f - The `f` input parameter is a `File` object and is passed as
* an argument to the function. It represents the file that needs to be tested for
* UTF-8 encoding.
*/
		const isUtf8Test = (f: File) => /(\/|\\)test(\/|\\).*utf8/.test(f.path);
/**
* @description This function `isRuntimeJs` takes a file `f` as an argument and returns
* `true` if the file is a JavaScript file that does not reside within the "fixtures"
* directory. It does this by checking if the file path ends with `.js` and does not
* contain "fixtures".
* 
* @param { File } f - In the function `isRuntimeJs`, the `f` parameter is a file
* object that is being checked to determine if it is a JavaScript file that should
* be executed at runtime. The function returns `true` if the file is a JavaScript
* file that does not reside within the "fixtures" directory.
*/
		const isRuntimeJs = (f: File) => f.path.endsWith('.js') && !f.path.includes('fixtures');
/**
* @description The function `isCSS` takes a file object `f` as an argument and returns
* a boolean value indicating whether the file is a CSS file or not. It checks if the
* file path ends with ".css" and does not include "fixtures".
* 
* @param { File } f - The `f` input parameter is a File object that is being passed
* into the function. It represents the file that is being checked for CSS syntax.
*/
		const isCSS = (f: File) => f.path.endsWith('.css') && !f.path.includes('fixtures');
/**
* @description This function takes an array of data objects and returns a new array
* with only the objects that do not have a `.d.ts` file extension on their `path` property.
* 
* @param { object } data - In this function call:
* 
* util.filter(data => (!(/\.d\.ts$/.test(data.path)))),
* 
* "data" is the array or object being iterated over. It contains items with paths
* that need to be filtered.
*/
		const noDeclarationsFilter = util.filter(data => !(/\.d\.ts$/.test(data.path)));

		const postcss = require('gulp-postcss') as typeof import('gulp-postcss');
		const postcssNesting = require('postcss-nesting');

		const input = es.through();
		const output = input
			.pipe(util.$if(isUtf8Test, bom())) // this is required to preserve BOM in test files that loose it otherwise
			.pipe(util.$if(!build && isRuntimeJs, util.appendOwnPathSourceURL()))
			.pipe(util.$if(isCSS, postcss([postcssNesting()])))
			.pipe(tsFilter)
			.pipe(util.loadSourcemaps())
			.pipe(compilation(token))
			.pipe(noDeclarationsFilter)
			.pipe(util.$if(build, nls.nls()))
			.pipe(noDeclarationsFilter.restore)
			.pipe(util.$if(!transpileOnly, sourcemaps.write('.', {
				addComment: false,
				includeContent: !!build,
				sourceRoot: overrideOptions.sourceRoot
			})))
			.pipe(tsFilter.restore)
			.pipe(reporter.end(!!emitError));

		return es.duplex(input, output);
	}
/**
* @description This function sets the `src` option for the compilation pipeline to
* the `base` directory specified by `src`.
* 
* @returns { object } The function `pipeline.tsProjectSrc()` returns a `compilation.src()`
* object with its `base` property set to the value of the `src` variable. In other
* words ,it returns a configuration object for compiling TypeScript sources.
*/
	pipeline.tsProjectSrc = () => {
		return compilation.src({ base: src });
	};
	pipeline.projectPath = projectPath;
	return pipeline;
}

/**
* @description This function creates a Gulp stream task that transpiles code from
* one source file or directory to another output file or directory. It takes three
* arguments:
* 
* 	- `src`: The source file or directory to transpile
* 	- `out`: The output file or directory for the transpiled code
* 	- `swc`: (optional) If true; generate .swc files instead of standard ES5 modules.
* 
* @param { string } src - The `src` input parameter is the source code file or
* directory to be transpiled.
* 
* @param { string } out - The `out` parameter specifies the output directory for the
* transpiled code. It is used to pipe the transpiled code to the desired output location.
* 
* @param { boolean } swc - The `swc` input parameter tells the function to generate
* TypeScript source maps instead of JSON files for the compiled JavaScript code.
* 
* @returns { undefined } This function returns a `task.StreamTask` object that
* represents a Gulp task to transpile the code at the specified `src` path and save
* the compiled code to the specified `out` path. The task name is generated based
{/**
* @description This function is a Gulp task that compiles the API proposal names for
* the vscode-dts files and reports them to a reporter called "api-proposal-names".
* It takes two tasks as inputs: compileApiProposalNamesTask and watchApiProposalNamesTask.
* The compile task uses gulp.src to source all vscode-dts files and pipes them through
* the generateApiProposalNames function. The latter function reads the content of
* the src/vscode-dts/*.ts files using fs.readFileSync. It extracts the proposal names
* and their paths from the type declarations found within the files and puts the
* resulting object into a constants variable named allApiProposals. Then it emits
* an output file that exposes the apiProposalNames as constants to be used outside
* of the build process.
*/}
* on the `src` path and is returned as an attribute of the task object.
*/
/**
* @description This function creates a Gulp task that transpiles the source code
* from one directory to another using Webpack's Swc plugin. It reads all files under
* the source directory and transcompiles them to the output directory.
* 
* @param { string } src - The `src` input parameter specifies the directory containing
* the source code to be transpiled.
* 
* @param { string } out - The `out` input parameter specifies the output directory
* for the transpiled code. It is the location where the compiled code will be written
* after it has been transformed by Webpack's Swc plugin.
* 
* @param { boolean } swc - The `swc` input parameter tells Webpack's Swc plugin to
* use the `swc` optimization for transpilation. It helps reduce the size of the
* generated JavaScript code by eliminating unnecessary features and values that are
* not supported by the target environment.
* 
* @returns { undefined } The function returns a pipe stream that takes the source
* files from `${src}/**` and transpiles them using `createCompile` with options `{
* false , true , { swc }}`. The resulting transpiled code is then written to `out`.
*/
export function transpileTask(src: string, out: string, swc: boolean): task.StreamTask {

/**
* @description This function creates a Gulp task that takes the source code from a
* directory (`src`) and transpiles it to a output directory (`out`). It uses
* `createCompile` to compile the code with Webpack's Swc plugin.
* 
* @returns {  } The function returns a pipe stream that takes the source files from
* `${src}/**` and transpiles them using `createCompile` with options `{ false , true
* , { swc }}`. The resulting transpiled code is then written to `out`.
* 
* In other words:
* 
* 1/ It reads all the files under `${src}/**`
* 2/ Transpiles the code using createCompile
* 3/ Writes the transpiled code to `out`
*/
	const task = () => {

		const transpile = createCompile(src, false, true, { swc });
		const srcPipe = gulp.src(`${src}/**`, { base: `${src}` });

		return srcPipe
			.pipe(transpile())
			.pipe(gulp.dest(out));
	};

	task.taskName = `transpile-${path.basename(src)}`;
	return task;
}

/**
* @description This function is a Gulp task that compiles and watches the `vscode-dts`
* file for changes to generate API proposal names. It reads the
* `vs/workbench/services/extensions/common/extensionsApiProposals.ts` file and
* extracts a list of proposed APIs from it. It then generates a single
* `vscode.proposed.*.d.ts` file with all the proposed APIs and their corresponding
* URLs. Finally ,it watches for changes to the `vscode-dts` folder and re-runs the
* task whenever a change is detected.
* 
* @param { string } src - The `src` input parameter is used to specify the source
* files to be processed by the `generateApiProposalNames` stream. It takes a glob
* pattern string and defaults to "src/vscode-dts/**", which matches all files within
* the "src/vscode-dts" directory and its subdirectories.
* 
* @param { string } out - The `out` input parameter of the `task.define` function
* is used to specify an output stream for the task. In this case:
* 
* it is being used to direct the compiled files into the "src" folder of the repository.
* 
* @param { boolean } build - The `build` input parameter is set to "watch" to enable
* building on every file change while developing. When set to "watch," gulp will
* re-run the specified tasks whenever a file changes and the watch stream is running.
* 
* @param { object } options - The `options` input parameter is an object that can
* specify several options to customize the behavior of the task. The available options
* are:
* 
* 	- `reporter`: a string indicating which reporter to use for this task. If not
* specified or set to `null`, the default reporter will be used.
* 	- `end`: a boolean indicating whether the task should stop running when all input
* files have been processed. By default (`false`), the task will continue running
* even after all inputs have been processed.
* 
* @returns { undefined } This function is creating two Gulp tasks: 'compile-api-proposal-names'
* and 'watch-api-proposal-names'.
* 
* 1/ 'compile-api-proposal-names': This task compiles the 'vscode-dts' files and
* generates an object that contains all the available API proposal names.
* 2/ 'watch-api-proposal-names': This task watches the 'vscode-dts' files for changes
* and updates the API proposal names object whenever a change is detected.
* 
* Both tasks use Gulp to stream the files and generate the output. The
* 'compile-api-proposal-names' task writes the output to the 'src' directory and
* reports success using the 'apiProposalNamesReporter'. The 'watch-api-proposal-names'
* task continuously monitors the 'vscode-dts' files and updates the output when
* changes are detected.
*/
export function compileTask(src: string, out: string, build: boolean, options: { disableMangle?: boolean } = {}): task.StreamTask {

/**
* @description This function generates a Typescript interface that exposes all the
* APIs proposed by vscode-dts into a single interface.
*/
	const task = () => {

		if (os.totalmem() < 4_000_000_000) {
			throw new Error('compilation requires 4GB of RAM');
		}

		const compile = createCompile(src, build, true, false);
		const srcPipe = gulp.src(`${src}/**`, { base: `${src}` });
		const generator = new MonacoGenerator(false);
		if (src === 'src') {
			generator.execute();
		}

		// mangle: TypeScript to TypeScript
		let mangleStream = es.through();
		if (build && !options.disableMangle) {
/**
* @description This function creates a new instance of the Mangler plugin with the
* following configuration options:
* 
* 	- `mangleExports`: Set to `true` to mangle exported names (i.e., renamed exports
* when generating module code).
* 	- `manglePrivateFields`: Set to `true` to mangle private fields within modules.
* 
* The function also logs information using the `fancyLog` function with an optional
* `ansiColors.blue` formatting feature to highlight log messages with blue text.
* 
* @param { array } data - The `data` parameter is an optional array of items that
* will be passed to the callback function (`fancyLog`) along with the logs generated
* by the Mangler.
*/
			let ts2tsMangler = new Mangler(compile.projectPath, (...data) => fancyLog(ansiColors.blue('[mangler]'), ...data), { mangleExports: true, manglePrivateFields: true });
			const newContentsByFileName = ts2tsMangler.computeNewFileContents(new Set(['saveState']));
/**
* @description This function defines two Gulp tasks for generating and watching the
* `api-proposal-names.d.ts` file. It uses a custom stream to generate the contents
* of the file based on the proposal names found inside the `vscode-dts` folder. The
* task creates a reporter that logs the list of proposal names at the end of the task.
* 
* @param { object } data - In this context; 'input' specifies data that will be used
* for pipeline stages before the 'end' event is reached by the Streams used by duplex.
* An instance of a File object should contain a file's name and contents when passed
* to 'data'; otherwise (no input file found), a zero-length file Buffer will be
* generated as the contents data for a specific event 'end'.
*/
			mangleStream = es.through(async function write(data: File & { sourceMap?: RawSourceMap }) {
				type TypeScriptExt = typeof ts & { normalizePath(path: string): string };
				const tsNormalPath = (<TypeScriptExt>ts).normalizePath(data.path);
				const newContents = (await newContentsByFileName).get(tsNormalPath);
				if (newContents !== undefined) {
					data.contents = Buffer.from(newContents.out);
					data.sourceMap = newContents.sourceMap && JSON.parse(newContents.sourceMap);
				}
				this.push(data);
			}, async function end() {
				// free resources
				(await newContentsByFileName).clear();

				this.push(null);
				(<any>ts2tsMangler) = undefined;
			});
		}

		return srcPipe
			.pipe(mangleStream)
			.pipe(generator.stream)
			.pipe(compile())
			.pipe(gulp.dest(out));
	};

	task.taskName = `compile-${path.basename(src)}`;
	return task;
}

export function watchTask(out: string, build: boolean): task.StreamTask {

	const task = () => {
		const compile = createCompile('src', build, false, false);

		const src = gulp.src('src/**', { base: 'src' });
		const watchSrc = watch('src/**', { base: 'src', readDelay: 200 });

		const generator = new MonacoGenerator(true);
		generator.execute();

		return watchSrc
			.pipe(generator.stream)
			.pipe(util.incremental(compile, src, true))
			.pipe(gulp.dest(out));
	};
	task.taskName = `watch-${path.basename(out)}`;
	return task;
}

const REPO_SRC_FOLDER = path.join(__dirname, '../../src');

class MonacoGenerator {
	private readonly _isWatch: boolean;
	public readonly stream: NodeJS.ReadWriteStream;

	private readonly _watchedFiles: { [filePath: string]: boolean };
	private readonly _fsProvider: monacodts.FSProvider;
	private readonly _declarationResolver: monacodts.DeclarationResolver;

	constructor(isWatch: boolean) {
		this._isWatch = isWatch;
		this.stream = es.through();
		this._watchedFiles = {};
		const onWillReadFile = (moduleId: string, filePath: string) => {
			if (!this._isWatch) {
				return;
			}
			if (this._watchedFiles[filePath]) {
				return;
			}
			this._watchedFiles[filePath] = true;

			fs.watchFile(filePath, () => {
				this._declarationResolver.invalidateCache(moduleId);
				this._executeSoon();
			});
		};
		this._fsProvider = new class extends monacodts.FSProvider {
			public readFileSync(moduleId: string, filePath: string): Buffer {
				onWillReadFile(moduleId, filePath);
				return super.readFileSync(moduleId, filePath);
			}
		};
		this._declarationResolver = new monacodts.DeclarationResolver(this._fsProvider);

		if (this._isWatch) {
			fs.watchFile(monacodts.RECIPE_PATH, () => {
				this._executeSoon();
			});
		}
	}

	private _executeSoonTimer: NodeJS.Timeout | null = null;
	private _executeSoon(): void {
		if (this._executeSoonTimer !== null) {
			clearTimeout(this._executeSoonTimer);
			this._executeSoonTimer = null;
		}
		this._executeSoonTimer = setTimeout(() => {
			this._executeSoonTimer = null;
			this.execute();
		}, 20);
	}

	private _run(): monacodts.IMonacoDeclarationResult | null {
		const r = monacodts.run3(this._declarationResolver);
		if (!r && !this._isWatch) {
			// The build must always be able to generate the monaco.d.ts
			throw new Error(`monaco.d.ts generation error - Cannot continue`);
		}
		return r;
	}

	private _log(message: any, ...rest: any[]): void {
		fancyLog(ansiColors.cyan('[monaco.d.ts]'), message, ...rest);
	}

	public execute(): void {
		const startTime = Date.now();
		const result = this._run();
		if (!result) {
			// nothing really changed
			return;
		}
		if (result.isTheSame) {
			return;
		}

		fs.writeFileSync(result.filePath, result.content);
		fs.writeFileSync(path.join(REPO_SRC_FOLDER, 'vs/editor/common/standalone/standaloneEnums.ts'), result.enums);
		this._log(`monaco.d.ts is changed - total time took ${Date.now() - startTime} ms`);
		if (!this._isWatch) {
			this.stream.emit('error', 'monaco.d.ts is no longer up to date. Please run gulp watch and commit the new file.');
		}
	}
}

function generateApiProposalNames() {
	let eol: string;

	try {
		const src = fs.readFileSync('src/vs/workbench/services/extensions/common/extensionsApiProposals.ts', 'utf-8');
		const match = /\r?\n/m.exec(src);
		eol = match ? match[0] : os.EOL;
	} catch {
		eol = os.EOL;
	}

	const pattern = /vscode\.proposed\.([a-zA-Z\d]+)\.d\.ts$/;
	const proposalNames = new Set<string>();

	const input = es.through();
	const output = input
		.pipe(util.filter((f: File) => pattern.test(f.path)))
		.pipe(es.through((f: File) => {
			const name = path.basename(f.path);
			const match = pattern.exec(name);

			if (match) {
				proposalNames.add(match[1]);
			}
		}, function () {
			const names = [...proposalNames.values()].sort();
			const contents = [
				'/*---------------------------------------------------------------------------------------------',
				' *  Copyright (c) Microsoft Corporation. All rights reserved.',
				' *  Licensed under the MIT License. See License.txt in the project root for license information.',
				' *--------------------------------------------------------------------------------------------*/',
				'',
				'// THIS IS A GENERATED FILE. DO NOT EDIT DIRECTLY.',
				'',
				'export const allApiProposals = Object.freeze({',
/**
* @description The function maps each element (presumably an array of strings) to a
* new array of strings that include a tab character followed by the original element
* and a URL linking to a specific version of the vscode project on GitHub.
* 
* @param { string } name - In this function `names.map()`, the `name` parameter is
* a string that represents each item from the array `names`. The parameter is passed
* to the callback function(`function(name) => \t${name}:
* 'https://raw.githubusercontent.com/microsoft/vscode/main/src/vscode-dts/vscode.proposed.${name}.d.ts'`)
* inside the map method .
* The callback function takes the name parameter and uses it to create a string that
* includes the tab character '\t', followed by the name string with some added text
*/
				`${names.map(name => `\t${name}: 'https://raw.githubusercontent.com/microsoft/vscode/main/src/vscode-dts/vscode.proposed.${name}.d.ts'`).join(`,${eol}`)}`,
				'});',
				'export type ApiProposalName = keyof typeof allApiProposals;',
				'',
			].join(eol);

			this.emit('data', new File({
				path: 'vs/workbench/services/extensions/common/extensionsApiProposals.ts',
				contents: Buffer.from(contents)
			}));
			this.emit('end');
		}));

	return es.duplex(input, output);
}

const apiProposalNamesReporter = createReporter('api-proposal-names');

export const compileApiProposalNamesTask = task.define('compile-api-proposal-names', () => {
	return gulp.src('src/vscode-dts/**')
		.pipe(generateApiProposalNames())
		.pipe(gulp.dest('src'))
		.pipe(apiProposalNamesReporter.end(true));
});

export const watchApiProposalNamesTask = task.define('watch-api-proposal-names', () => {
	const task = () => gulp.src('src/vscode-dts/**')
		.pipe(generateApiProposalNames())
		.pipe(apiProposalNamesReporter.end(true));

	return watch('src/vscode-dts/**', { readDelay: 200 })
		.pipe(util.debounce(task))
		.pipe(gulp.dest('src'));
});
