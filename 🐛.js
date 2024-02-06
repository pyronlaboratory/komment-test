import { UIElement, UIPanel, UIText } from './libs/ui.js';

import { SetScriptValueCommand } from './commands/SetScriptValueCommand.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';



/**
* @description This is a code fragment from a THREE.js-related file that sets up an
* CodeMirror editor for modifying GLSL shader materials and programs.
* Here is the breakdown of what it does:
* 
* • It initializes containers to hold display logic related to Code Mirror below the
* editors .
* • Using Signal.connect() it lists onto three signals which are; 'editor cleared',
*   • 'edit script',  and 'script removed'.
* • The editScript() method signals' method will call   function every time the
* shader materials are edited/created with CodeMirror below them; if (currentmode
* is not null), the material name displayed near code-mirror will update.
* • If scriptName changes then change modes of editing; setDisplay() value as needed
* to display relevant material.
*   • setMode(null), otherwise set mode based on what was passed into it(or a copy
* from stored previous data); setCodeMirroryOption() sets up option such font size
* among others.
* 
* @param { object } editor - The `editor` input parameter is not used at all inside
* the ` create Editor` function. It's available as aparameter only within the wider
* scope of the anonymous self-invoking function (ES5), where it's defined as part
* of `three.editor`.
* 
* @returns {  } The output of this function is a container element that displays an
* editing interface for shader code using CodeMirror. It sets up event listeners to
* provide autocompletion and other features for the editor. The container is initially
* displayed with no content and will be hidden when the script being edited is
* removed. Additionally this functions returns valid if there were no parsing errors.
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
		'Ctrl-Space': function ( cm ) {

			server.complete( cm );

		},
		'Ctrl-I': function ( cm ) {

			server.showType( cm );

		},
		'Ctrl-O': function ( cm ) {

			server.showDocs( cm );

		},
		'Alt-.': function ( cm ) {

			server.jumpToDef( cm );

		},
		'Alt-,': function ( cm ) {

			server.jumpBack( cm );

		},
		'Ctrl-Q': function ( cm ) {

			server.rename( cm );

		},
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
