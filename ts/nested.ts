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
 * @description generates TypeScript compiler options for a given source file based
 * on environmental variables and returns the compiled options.
 * 
 * @param { string } src - file path or URL of the source code that the function will
 * compile, and it is used to determine the root directory, base URL, and sourceRoot
 * of the compilation process.
 * 
 * @returns { ts.CompilerOptions } an instance of the `ts.CompilerOptions` class with
 * configuration options set for the compiler.
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
 * @description creates a TypeScript compiler pipeline for a given source file or
 * directory, optionally emitting sourcemaps and transpiling only. It also provides
 * utilities for filtering and transforming the output.
 * 
 * @param { string } src - source code file or directory to compile, which is passed
 * to the `create` method of the `tsb` module to initiate the compilation process.
 * 
 * @param { boolean } build - whether to build the code or not, which affects the
 * emitted output of the function.
 * 
 * @param { boolean } emitError - error emitter function, which is called with any
 * errors that occur during the compilation process.
 * 
 * @param { boolean | { swc: boolean } } transpileOnly - ‍transpilation‍ of only‍
 * the‍ necessary‍ code‍, which‍ is‍ useful‍ when‍ building‍ for‍ deployment‍ rather‍
 * than‍ development.
 * 
 * @returns { `es.duplex` instance. } a Gulp pipeline that compiles TypeScript source
 * code into JavaScript and generates sourcemaps.
 * 
 * 		- `pipeline`: This is an ES2015 pipeline object that represents the sequence of
 * plugins and transformations applied to the input files. It has various methods for
 * configuring and manipulating the pipeline.
 * 		- `tsProjectSrc`: This is a function that returns the source code of the TypeScript
 * project (i.e., the `src` parameter passed to the `createCompile` function).
 * 		- `projectPath`: This is the path to the root directory of the TypeScript project.
 * 
 * 	The output of the `createCompile` function can be destructured as follows:
 * 
 * 		- `input`: This is an ES2015 `through` object that represents the input stream
 * for the pipeline. It can be used to configure and manipulate the input stream.
 * 		- `output`: This is an ES2015 `duplex` object that represents the output stream
 * for the pipeline. It can be used to configure and manipulate the output stream.
 * 
 * 	The various attributes of the `createCompile` function are explained as follows:
 * 
 * 		- `tsb`: This is a `tsb` module that provides methods for creating TypeScript
 * compilation pipelines.
 * 		- `sourcemaps`: This is a `gulp-sourcemaps` module that provides methods for
 * generating sourcemap files.
 * 		- `reporter`: This is an `util.reporter` object that provides methods for reporting
 * errors and warnings during the compilation process.
 * 		- `err`: This is an error object that represents any errors or warnings that
 * occurred during the compilation process. It can be used to provide feedback to the
 * user.
 * 		- `token`: This is an `util.ICancellationToken` object that represents a cancelation
 * token for the pipeline. It can be used to cancel the pipeline execution.
 */
function createCompile(src: string, build: boolean, emitError: boolean, transpileOnly: boolean | { swc: boolean }) {
	const tsb = require('./tsb') as typeof import('./tsb');
	const sourcemaps = require('gulp-sourcemaps') as typeof import('gulp-sourcemaps');


	const projectPath = path.join(__dirname, '../../', src, 'tsconfig.json');
	const overrideOptions = { ...getTypeScriptCompilerOptions(src), inlineSources: Boolean(build) };
	if (!build) {
		overrideOptions.inlineSourceMap = true;
	}

	const compilation = tsb.create(projectPath, overrideOptions, {
		verbose: false,
		transpileOnly: Boolean(transpileOnly),
		transpileWithSwc: typeof transpileOnly !== 'boolean' && transpileOnly.swc
	}, err => reporter(err));

	/**
	 * @description is a stream transformer that processes a sequence of files through
	 * various filters and transformations based on their filetype and other conditions.
	 * It preserves BOM in test files, adds own path source URL for runtime JavaScript
	 * files, applies postcss to CSS files, compiles TypeScript sources, generates
	 * sourcemaps, and emits final reports.
	 * 
	 * @param { util.ICancellationToken } token - cancellation token that can be used to
	 * cancel the compilation process at any time.
	 * 
	 * @returns { `es.duplex`. } a duplex stream that transforms input files into transformed
	 * output files.
	 * 
	 * 		- `input`: The es.through() pipeline is used as the input source for the rest
	 * of the pipeline.
	 * 		- `output`: The resulting output from the pipeline, which is an es.duplex() pipeline.
	 * 		- `bom`: The `bom` variable is set to the `require('gulp-bom') as typeof
	 * import('gulp-bom');` expression, which provides a way to preserve the BOM in test
	 * files that might lose it otherwise.
	 * 		- `postcss`: The `postcss` variable is set to the `gulp-postcss` module, which
	 * is used for CSS processing.
	 * 		- `postcssNesting`: The `postcssNesting` variable is set to a postcss plugin for
	 * nesting.
	 * 		- `util`: The `util` variable refers to the `gulp-util` module, which provides
	 * utility functions for the pipeline.
	 * 		- `loadSourcemaps`: The `loadSourcemaps()` function is called on the output
	 * stream to load sourcemaps for the transpiled code.
	 * 		- `compilation`: The `compilation()` function is called on the output stream
	 * with the `token` parameter, which is an optional parameter that can be used to
	 * cancel the compilation process if needed.
	 * 		- `noDeclarationsFilter`: The `noDeclarationsFilter` variable refers to a filter
	 * function that removes any declarations from the transpiled code.
	 * 		- `build`: The `build` variable is set to a boolean value that indicates whether
	 * the pipeline should generate a build or not.
	 * 		- `transpileOnly`: The `transpileOnly` variable is set to a boolean value that
	 * indicates whether the pipeline should only transpile the code without building it.
	 * 		- `nls`: The `nls()` function is called on the output stream if the `build` flag
	 * is set, which generates a build for the transpiled code.
	 * 		- `sourcemaps.write()`: This function is called on the output stream with an
	 * options parameter that includes several configuration options for writing sourcemaps.
	 * The `addComment` option is set to `false`, which disables the comment injection
	 * feature in the sourcemaps. The `includeContent` option is set to `!!build`, which
	 * includes the content of the transpiled code in the sourcemaps. The `sourceRoot`
	 * option is set to the `overrideOptions.sourceRoot` value if it is provided, or else
	 * it uses the default source root.
	 */
	function pipeline(token?: util.ICancellationToken) {
		const bom = require('gulp-bom') as typeof import('gulp-bom');

		const tsFilter = util.filter(data => /\.ts$/.test(data.path));
		/**
		 * @description checks if a file path is in UTF-8 format by checking if the `/\*` or
		 * `\/` prefix is present and the path ends with `.*utf8`.
		 * 
		 * @param { File } f - file to be checked for encoding, and the function checks if
		 * the file path is encoded in UTF-8 format.
		 * 
		 * @returns { boolean } a boolean value indicating whether the given file path is in
		 * UTF-8 format.
		 */
		const isUtf8Test = (f: File) => /(\/|\\)test(\/|\\).*utf8/.test(f.path);
		/**
		 * @description checks whether a given file path ends with a `.js` extension and does
		 * not include the string 'fixtures'.
		 * 
		 * @param { File } f - file being checked for inclusion of a specific extension and
		 * lack of inclusion in a specific directory.
		 * 
		 * @returns { boolean } a boolean value indicating whether the given file has a `.js`
		 * extension and does not include the string "fixtures".
		 */
		const isRuntimeJs = (f: File) => f.path.endsWith('.js') && !f.path.includes('fixtures');
		/**
		 * @description checks if a given file path ends with a `.css` extension and does not
		 * include the string `'fixtures'`.
		 * 
		 * @param { File } f - file to be checked for CSS file extension and absence of
		 * "fixtures" in its path.
		 * 
		 * @returns { boolean } a boolean indicating whether the given file has a `.css`
		 * extension and does not include the `fixtures` directory path.
		 */
		const isCSS = (f: File) => f.path.endsWith('.css') && !f.path.includes('fixtures');
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
	pipeline.tsProjectSrc = () => {
		return compilation.src({ base: src });
	};
	pipeline.projectPath = projectPath;
	return pipeline;
}

/**
 * @description generates a Gulp task to transpile code from a given source file to
 * a destination file, optionally generating source maps and saving the compiled code
 * in a separate file.
 * 
 * @param { string } src - source code to be transpiled.
 * 
 * @param { string } out - destination directory or file path where the transpiled
 * code should be written.
 * 
 * @param { boolean } swc - flag for syntax check
 * 
 * @returns { task.StreamTask } a `gulp.StreamTask` object representing a pipelined
 * sequence of file transformations from `src` to `out`.
 */
export function transpileTask(src: string, out: string, swc: boolean): task.StreamTask {

	/**
	 * @description takes the source file path, compiles it using the `createCompile`
	 * function, and then saves the compiled output to the specified destination path.
	 * 
	 * @returns { array } a stream of files compiled from source code located in the `src`
	 * directory and written to the `out` directory.
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
 * @description compiles TypeScript source code into JavaScript files, optionally
 * mangle exports and private fields using a TypeScript-to-TypeScript mangler. It
 * takes in the source code, output directory, build mode, and mangling options as
 * input and returns a stream task that pipes through various stages of compilation
 * and file generation.
 * 
 * @param { string } src - source code file or directory to be compiled.
 * 
 * @param { string } out - destination directory where the compiled files will be
 * saved, and it is passed to the `gulp.dest()` method to write the compiled files there.
 * 
 * @param { boolean } build - whether to build or not.
 * 
 * @param { object } options - configuration for the mangle stream, allowing to disable
 * mangle feature or provide custom options for mangling, such as specifying whether
 * to mangle exports or private fields.
 * 
 * @returns { task.StreamTask } a `gulp.streamTask` that compiles source code and
 * generates output files in the specified directory.
 */
export function compileTask(src: string, out: string, build: boolean, options: { disableMangle?: boolean } = {}): task.StreamTask {

	/**
	 * @description performs a code compilation task, requiring at least 4GB of RAM and
	 * generating new file contents through mangling. It takes input files, compiles them
	 * using the createCompile function, mangles the output, and saves it to the desired
	 * output directory.
	 * 
	 * @returns { object } a pipeline of processes that compile TypeScript code and mangle
	 * it for production usage.
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
			 * @description applies the `fancyLog` function to the input parameters with the
			 * addition of an ANSI blue colored message at the beginning of the output.
			 * 
			 * @param { any[] } data - data to be formatted and colored using the `fancyLog()` function.
			 * 
			 * @returns { string } a string representation of the provided data, colored blue
			 * using ANSI escape sequences.
			 */
			let ts2tsMangler = new Mangler(compile.projectPath, (...data) => fancyLog(ansiColors.blue('[mangler]'), ...data), { mangleExports: true, manglePrivateFields: true });
			const newContentsByFileName = ts2tsMangler.computeNewFileContents(new Set(['saveState']));
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

/**
 * @description creates a stream task that watches the `src` directory for changes
 * and compiles any modified files using the `createCompile` function, before copying
 * the compiled files to the specified output location.
 * 
 * @param { string } out - destination directory where the compiled code will be saved
 * after the watching and compilation process is completed.
 * 
 * @param { boolean } build -
 * 
 * @returns { task.StreamTask } a `gulp.streamTask` object that watches and compiles
 * source files in the `src` directory and saves them to the specified output path.
 */
export function watchTask(out: string, build: boolean): task.StreamTask {

	/**
	 * @description compiles Sass code and watches source files for changes, executing
	 * the compilation when a change is detected.
	 * 
	 * @returns { `stream`. } a pipeline of files generated by incrementally compiling
	 * source code using the Monaco compiler, and then saved to the specified output directory.
	 * 
	 * 		- `pipe`: This is an array of streams that are piped together to form the final
	 * output.
	 * 		- `util.incremental`: This is an array of streams that represent the incremental
	 * compilation process, where the output of each stream is passed as input to the
	 * next stream in the pipeline.
	 * 		- `gulp.dest`: This is a stream that represents the destination for the compiled
	 * code, which is written to the `out` directory.
	 */
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

	/**
	 * @description initializes an instance of a class that provides file-watching
	 * functionality for a module. It sets up an fs provider, declaration resolver, and
	 * adds event listeners to watch files. If watching is enabled, it also listens for
	 * changes to the recipe file.
	 * 
	 * @param { boolean } isWatch - status of watching files, with a value of `true`
	 * indicating that files should be watched for changes and a value of `false` indicating
	 * otherwise.
	 * 
	 * @returns { `undefined`. } a `CodeStream` instance with an initialized `_fsProvider`,
	 * `_declarationResolver`, and `_watchedFiles` map.
	 * 
	 * 		- `_isWatch`: A boolean variable indicating whether the code is being run in
	 * watch mode or not.
	 * 		- `stream`: An instance of `es.through()`, which is a high-level stream for
	 * handling asynchronous data streams.
	 * 		- `_watchedFiles`: A mapping of file paths to booleans, where `true` means the
	 * file is watched and `false` means it's not. This variable keeps track of the files
	 * that have been watched and updated.
	 * 		- `_declarationResolver`: An instance of `monacodts.DeclarationResolver`, which
	 * is responsible for resolving the code dependencies and invalidating the cache when
	 * necessary.
	 * 		- `_fsProvider`: An instance of a custom `FSProvider` class that extends the
	 * `monacodts.FSProvider` class, which provides readFileSync method that calls the
	 * onWillReadFile function before returning the file contents.
	 * 
	 * 	In summary, the `constructor` function sets up the necessary stream and file
	 * watching mechanisms for handling asynchronous code execution in watch mode.
	 */
	constructor(isWatch: boolean) {
		this._isWatch = isWatch;
		this.stream = es.through();
		this._watchedFiles = {};
		/**
		 * @description monitors a given file path for changes and updates the watched files
		 * array if necessary, invoking the declaration resolver to invalidate the cache and
		 * triggering the next execution cycle upon file change.
		 * 
		 * @param { string } moduleId - identifier of the module for which the file is being
		 * watched, and it is used to invalidate the cache in the declaration resolver when
		 * the file changes.
		 * 
		 * @param { string } filePath - file path that the module id is related to, which
		 * determines whether or not the function should execute based on changes to that file.
		 * 
		 * @returns { `undefined` value. } a void value, indicating that the file being watched
		 * will be monitored for changes and the cache invalidated when necessary.
		 * 
		 * 		- `moduleId`: A string representing the module ID for which the file is being watched.
		 * 		- `filePath`: A string representing the path to the file being watched.
		 * 		- `this._isWatch`: A boolean indicating whether the module is currently being
		 * watched or not.
		 * 		- `this._watchedFiles`: An object containing the files that are being watched
		 * by the module. The key of the object is the file path, and the value is a boolean
		 * indicating whether the file is being watched or not.
		 * 		- `fs`: A reference to the `fs` module, which is used to watch the file.
		 */
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
			/**
			 * @description reads a file synchronously and passes it to the `onWillReadFile`
			 * callback before returning its contents as a `Buffer`.
			 * 
			 * @param { string } moduleId - identifier of the module for which the file is being
			 * read.
			 * 
			 * @param { string } filePath - path to the file that is being read.
			 * 
			 * @returns { Buffer } a `Buffer` object containing the contents of the specified file.
			 */
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
	/**
	 * @description sets a timer to call the `execute()` method after a 20-second delay
	 * if a previous timer is not present.
	 */
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

	/**
	 * @description resolves the declaration result using `monacodts.run3()` and handles
	 * the generation of the `monaco.d.ts` file based on the input given to it.
	 * 
	 * @returns { monacodts.IMonacoDeclarationResult | null } an `IMonacoDeclarationResult`
	 * object or null.
	 */
	private _run(): monacodts.IMonacoDeclarationResult | null {
		const r = monacodts.run3(this._declarationResolver);
		if (!r && !this._isWatch) {
			// The build must always be able to generate the monaco.d.ts
			throw new Error(`monaco.d.ts generation error - Cannot continue`);
		}
		return r;
	}

	/**
	 * @description takes a message and any number of additional arguments and emits them
	 * to the console using the `fancyLog` method with an optional prefix of Ansi colors.
	 * 
	 * @param { any } message - message to be logged.
	 * 
	 * @param { any[] } rest - 0 or more additional arguments to be passed to the
	 * `fancyLog()` function along with the message.
	 */
	private _log(message: any, ...rest: any[]): void {
		fancyLog(ansiColors.cyan('[monaco.d.ts]'), message, ...rest);
	}

	/**
	 * @description updates monaco.d.ts based on the results of calling `_run()` and logs
	 * the total time taken. If the file has changed, it emits an error event on the stream.
	 */
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

/**
 * @description generates a proposal names for API's based on the file
 * 'vscode-dts/vscode.proposed.{name}.d.ts' in the project root, and exports them as
 * a const in a new file named 'vs/workbench/services/extensions/common/extensionsApiProposals.ts'.
 * 
 * @returns { `es.Duplex` stream. } a duplex stream that emits files containing the
 * proposed API names for VS Code.
 * 
 * 		- `input`: A duplex stream that takes in files as input.
 * 		- `output`: A duplex stream that emits files with the generated API proposal names.
 * 		- `allApiProposals`: An object that maps API proposal names to their corresponding
 * URLs.
 * 		- `ApiProposalName`: The type of the API proposal name, which is also the key
 * of the `allApiProposals` object.
 * 		- `contents`: The generated contents of the `vs/workbench/services/extensions/common/extensionsApiProposals.ts`
 * file.
 */
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
	/**
	 * @description generates high-quality documentation for code given to it by piping
	 * source files from `'src/vscode-dts/'` through two processes: `generateApiProposalNames()`
	 * and `apiProposalNamesReporter.end(true)`.
	 * 
	 * @returns { `apiProposalNames`. } a list of proposal names for an API documentation
	 * set based on source files in the `src/vscode-dts/` directory.
	 * 
	 * 		- `src`: The source directory path of the VSCode DTS files.
	 * 		- `pipe`: The pipe function that generates the API proposal names.
	 * 		- `generateApiProposalNames`: The function that generates the API proposal names.
	 * 		- `apiProposalNamesReporter`: The reporter function that receives the generated
	 * API proposal names.
	 * 		- `end`: The endpoint that marks the completion of the task.
	 */
	const task = () => gulp.src('src/vscode-dts/**')
		.pipe(generateApiProposalNames())
		.pipe(apiProposalNamesReporter.end(true));

	return watch('src/vscode-dts/**', { readDelay: 200 })
		.pipe(util.debounce(task))
		.pipe(gulp.dest('src'));
});
