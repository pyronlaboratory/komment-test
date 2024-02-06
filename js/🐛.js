import { UIElement, UIPanel, UIText } from './libs/ui.js';

import { SetScriptValueCommand } from './commands/SetScriptValueCommand.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';



/**
 * @description This function creates a code mirror editor for Material Property
 * editing and other GLSL shaders parameters on a Three.js scene item and event signal
 * listener connected. When the user double-clicks an object (either scene.item)
 * material component or shader display property button ,  a prompt displays at the
 * bottom of the threejs canvas (DOM Container element is set to visible display
 * none), to create / edit and parameter
 * shaders for the chosen  object using auto completion using esprima parse method
 * or glsl parsed validated shader errors messages output on codemirror messages error
 * lines range widget display with highlight. After this feature function adds three
 * key events , cursoractivity for updated hinting at each word entry by user for
 * GLSL arguments and  completion list preview using a TernJS autocompletion server
 * connected. On finish edit ( double clicking  outside or on another element of the
 * Three.js scene to focus and reset canvas DOM) it updates materials properties names
 * with values displayed on mouseover above and also accepts the modified parameter
 * GL slang scripts  as uniforms define to 3.js materials property when Save button
 * clicked( saved edited code script is material Property of selected item  being
 * removed after button action click). The removed scripts will not work . Finally
 * scene item has  listeners on property remore which displays error lines for the
 * given material property shaders with source highlight error messages near those 
 * parts.
 * 
 * @param { object } editor - The `editor` input parameter is used to set the content
 * of the text editor component and should be a string containing the code to be
 * executed or an array of lines.
 * 
 * @returns {  } This is a callback function that generates a UI editor component for
 * modifying Material objects with THREE.JS. It creates a DOM element and styles it
 * for rendering code editor UI; initializes CodeMirror for editing GLSL/Javascript
 * scripts used by material definitions; adds listener functions for editor activities
 * (e.g., completion suggestions when Ctrl + Space is pressed); enables autocomplete
 * suggestions when typing glsl/javascript words; shows hints related to currently
 * edited function or parameter definition on cursor activity events; clears existing
 * history and settings on script removals (based on input param signals);  Finally
 * displays a Material UI preview. The output would be the rendered UI elements of
 * code editor section plus supporting functionality  e.g., script naming information
 * title display etc . In other words all needed components form THREE point material's
 * code-oriented interface and live prview feed.
 */
function Script( editor ) {

	const signals = editor.signals;

	const container = new UIPanel();
	container.setId( 'script' );
	container.setPosition( 'absolute' );
	container.setBackgroundColor( '#272822' );
	container.setDisplay( 'none' );

	const header = new UIPanel();
	header.setPadding( '10px' );
	container.add( header );

	const title = new UIText().setColor( '#fff' );
	header.add( title );

	/**
	 * @description Creating an SVG element with specified dimensions and adding a Path
	 * element with the given d attribute value and white stroke. The return value is the
	 * created SVG element.
	 * 
	 * @returns {  } The output returned by this function is an SVG element with a specified
	 * width and height and containing a path element with a specific d attribute value
	 * and stroke attribute value.
	 */
	const buttonSVG = ( function () {

		const svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
		svg.setAttribute( 'width', 32 );
		svg.setAttribute( 'height', 32 );
		const path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
		path.setAttribute( 'd', 'M 12,12 L 22,22 M 22,12 12,22' );
		path.setAttribute( 'stroke', '#fff' );
		svg.appendChild( path );
		return svg;

	} )();

	const close = new UIElement( buttonSVG );
	close.setPosition( 'absolute' );
	close.setTop( '3px' );
	close.setRight( '1px' );
	close.setCursor( 'pointer' );
	close.onClick( function () {

		container.setDisplay( 'none' );

	} );
	header.add( close );


	let renderer;

	signals.rendererCreated.add( function ( newRenderer ) {

		renderer = newRenderer;

	} );


	let delay;
	let currentMode;
	let currentScript;
	let currentObject;

	const codemirror = CodeMirror( container.dom, {
		value: '',
		lineNumbers: true,
		matchBrackets: true,
		indentWithTabs: true,
		tabSize: 4,
		indentUnit: 4,
		hintOptions: {
			completeSingle: false
		}
	} );
	codemirror.setOption( 'theme', 'monokai' );
	codemirror.on( 'change', function () {

		if ( codemirror.state.focused === false ) return;

		clearTimeout( delay );
		delay = setTimeout( function () {

			const value = codemirror.getValue();

			if ( ! validate( value ) ) return;

			if ( typeof ( currentScript ) === 'object' ) {

				if ( value !== currentScript.source ) {

					editor.execute( new SetScriptValueCommand( editor, currentObject, currentScript, 'source', value ) );

				}

				return;

			}

			if ( currentScript !== 'programInfo' ) return;

			const json = JSON.parse( value );

			if ( JSON.stringify( currentObject.material.defines ) !== JSON.stringify( json.defines ) ) {

				const cmd = new SetMaterialValueCommand( editor, currentObject, 'defines', json.defines );
				cmd.updatable = false;
				editor.execute( cmd );

			}

			if ( JSON.stringify( currentObject.material.uniforms ) !== JSON.stringify( json.uniforms ) ) {

				const cmd = new SetMaterialValueCommand( editor, currentObject, 'uniforms', json.uniforms );
				cmd.updatable = false;
				editor.execute( cmd );

			}

			if ( JSON.stringify( currentObject.material.attributes ) !== JSON.stringify( json.attributes ) ) {

				const cmd = new SetMaterialValueCommand( editor, currentObject, 'attributes', json.attributes );
				cmd.updatable = false;
				editor.execute( cmd );

			}

		}, 300 );

	} );

	// prevent backspace from deleting objects
	const wrapper = codemirror.getWrapperElement();
	wrapper.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

	} );

	// validate

	const errorLines = [];
	const widgets = [];

/**
* @description This is a validate function that checks the syntax of a given string
* using three different parsers (esprima for JavaScript/CSS Scripts detection ,
* jsonlint for JSON and glsl parser for GLSL Shaders) to catch any error/syntax
* warning line number , message then returns the validity status.
* 
* @param { string } string - The `string` input parameter is the string of code that
* the validate function will parse and check for syntax errors.
* 
* @returns { string } The output returned by the `validate` function is a boolean
* value indicating whether the input string is valid or not. It also includes an
* array of error objects containing information about any validation errors found.
* The errors are described as follows:
* 
* 	- `lineNumber`: the line number where the error occurred
* 	- `message`: a human-readable message describing the error
* 
* If the input string is invalid (i.e., it contains syntax or JSON parsing errors),
* the function will return `false` and the `errors` array will contain one or more
* objects representing the errors found. Otherwise (if the input string is valid),
* the function will return `true`.
*/
	const validate = function ( string ) {

		let valid;
		let errors = [];

		return codemirror.operation( function () {

			while ( errorLines.length > 0 ) {

				codemirror.removeLineClass( errorLines.shift(), 'background', 'errorLine' );

			}

			while ( widgets.length > 0 ) {

				codemirror.removeLineWidget( widgets.shift() );

			}

			//

			switch ( currentMode ) {

				case 'javascript':

					try {

						const syntax = esprima.parse( string, { tolerant: true } );
						errors = syntax.errors;

					} catch ( error ) {

						errors.push( {

							lineNumber: error.lineNumber - 1,
							message: error.message

						} );

					}

					for ( let i = 0; i < errors.length; i ++ ) {

						const error = errors[ i ];
						error.message = error.message.replace( /Line [0-9]+: /, '' );

					}

					break;

				case 'json':

					errors = [];

					jsonlint.parseError = function ( message, info ) {

						message = message.split( '\n' )[ 3 ];

						errors.push( {

							lineNumber: info.loc.first_line - 1,
							message: message

						} );

					};

					try {

						jsonlint.parse( string );

					} catch ( error ) {

						// ignore failed error recovery

					}

					break;

				case 'glsl':

					currentObject.material[ currentScript ] = string;
					currentObject.material.needsUpdate = true;
					signals.materialChanged.dispatch( currentObject, 0 ); // TODO: Add multi-material support

					const programs = renderer.info.programs;

					valid = true;
					const parseMessage = /^(?:ERROR|WARNING): \d+:(\d+): (.*)/g;

					for ( let i = 0, n = programs.length; i !== n; ++ i ) {

						const diagnostics = programs[ i ].diagnostics;

						if ( diagnostics === undefined ||
								diagnostics.material !== currentObject.material ) continue;

						if ( ! diagnostics.runnable ) valid = false;

						const shaderInfo = diagnostics[ currentScript ];
						const lineOffset = shaderInfo.prefix.split( /\r\n|\r|\n/ ).length;

						while ( true ) {

							const parseResult = parseMessage.exec( shaderInfo.log );
							if ( parseResult === null ) break;

							errors.push( {

								lineNumber: parseResult[ 1 ] - lineOffset,
								message: parseResult[ 2 ]

							} );

						} // messages

						break;

					} // programs

			} // mode switch

			for ( let i = 0; i < errors.length; i ++ ) {

				const error = errors[ i ];

				const message = document.createElement( 'div' );
				message.className = 'esprima-error';
				message.textContent = error.message;

				const lineNumber = Math.max( error.lineNumber, 0 );
				errorLines.push( lineNumber );

				codemirror.addLineClass( lineNumber, 'background', 'errorLine' );

				const widget = codemirror.addLineWidget( lineNumber, message );

				widgets.push( widget );

			}

			return valid !== undefined ? valid : errors.length === 0;

		} );

	};

	// tern js autocomplete

	const server = new CodeMirror.TernServer( {
		caseInsensitive: true,
		plugins: { threejs: null }
	} );

	codemirror.setOption( 'extraKeys', {
		/**
		 * @description The function completes the request on the server.
		 * 
		 * @param { object } cm - The input parameter `cm` is completed by the `server`.
		 */
		'Ctrl-Space': function ( cm ) {

			server.complete( cm );

		},
		/**
		 * @description Displays server information on the client side.
		 * 
		 * @param { object } cm - The input parameter `cm` serves to trigger the `server.showType()`
		 * method and is thereby necessary for proper functionality.
		 */
		'Ctrl-I': function ( cm ) {

			server.showType( cm );

		},
		/**
		 * @description Displays documentation.
		 * 
		 * @param {  } cm - The `cm` input parameter calls the server.showDocs function with
		 * the passed value.
		 */
		'Ctrl-O': function ( cm ) {

			server.showDocs( cm );

		},
		/**
		 * @description Jumps to a definition for the specified code module (cm).
		 * 
		 * @param { object } cm - The input `cm` jumps to the definition of a server.
		 */
		'Alt-.': function ( cm ) {

			server.jumpToDef( cm );

		},
		/**
		 * @description The function causes the server to jump backward using the method jumpBack().
		 * 
		 * @param { object } cm - The `cm` input parameter calls the server function to jump
		 * back.
		 */
		'Alt-,': function ( cm ) {

			server.jumpBack( cm );

		},
		/**
		 * @description The given function renames a cloud material (cm) by calling the
		 * server.rename() method and passing cm as an argument.
		 * 
		 * @param {  } cm - cm is renamed by the server within this function.
		 */
		'Ctrl-Q': function ( cm ) {

			server.rename( cm );

		},
		/**
		 * @description Selects name of server using the given context manager.
		 * 
		 * @param { object } cm - The `cm` input parameter is passed to the `selectName()`
		 * method of the `server` object.
		 */
		'Ctrl-.': function ( cm ) {

			server.selectName( cm );

		}
	} );

	codemirror.on( 'cursorActivity', function ( cm ) {

		if ( currentMode !== 'javascript' ) return;
		server.updateArgHints( cm );

	} );

	codemirror.on( 'keypress', function ( cm, kb ) {

		if ( currentMode !== 'javascript' ) return;
		const typed = String.fromCharCode( kb.which || kb.keyCode );
		if ( /[\w\.]/.exec( typed ) ) {

			server.complete( cm );

		}

	} );


	//

	signals.editorCleared.add( function () {

		container.setDisplay( 'none' );

	} );

	signals.editScript.add( function ( object, script ) {

		let mode, name, source;

		if ( typeof ( script ) === 'object' ) {

			mode = 'javascript';
			name = script.name;
			source = script.source;
			title.setValue( object.name + ' / ' + name );

		} else {

			switch ( script ) {

				case 'vertexShader':

					mode = 'glsl';
					name = 'Vertex Shader';
					source = object.material.vertexShader || '';

					break;

				case 'fragmentShader':

					mode = 'glsl';
					name = 'Fragment Shader';
					source = object.material.fragmentShader || '';

					break;

				case 'programInfo':

					mode = 'json';
					name = 'Program Properties';
					const json = {
						defines: object.material.defines,
						uniforms: object.material.uniforms,
						attributes: object.material.attributes
					};
					source = JSON.stringify( json, null, '\t' );

			}

			title.setValue( object.material.name + ' / ' + name );

		}

		currentMode = mode;
		currentScript = script;
		currentObject = object;

		container.setDisplay( '' );
		codemirror.setValue( source );
		codemirror.clearHistory();
		if ( mode === 'json' ) mode = { name: 'javascript', json: true };
		codemirror.setOption( 'mode', mode );

	} );

	signals.scriptRemoved.add( function ( script ) {

		if ( currentScript === script ) {

			container.setDisplay( 'none' );

		}

	} );

	return container;

}

export { Script };
