import { arr } from "./var/arr.js";
import { getProto } from "./var/getProto.js";
import { slice } from "./var/slice.js";
import { flat } from "./var/flat.js";
import { push } from "./var/push.js";
import { indexOf } from "./var/indexOf.js";
import { class2type } from "./var/class2type.js";
import { toString } from "./var/toString.js";
import { hasOwn } from "./var/hasOwn.js";
import { fnToString } from "./var/fnToString.js";
import { ObjectFunctionString } from "./var/ObjectFunctionString.js";
import { support } from "./var/support.js";
import { isArrayLike } from "./core/isArrayLike.js";
import { DOMEval } from "./core/DOMEval.js";

var version = "@VERSION",

	rhtmlSuffix = /HTML$/i,

	// Define a local copy of jQuery
										/**
										 * @description Initializes the jQuery object from a selector and context.
										 * 
										 * @param { string } selector - Selects the element or elements that are to be searched.
										 * 
										 * @param { object } context - Context supplies the document for an instance of the
										 * constructed element set.
										 * 
										 * @returns {  } The output returned by this function is a newly constructed jQuery
										 * object.
										 */
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,


/**
* @description
* 
* @returns {  }
*/
	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	/**
	 * @description The function takes an argument num and returns all the elements of a
	 * clean array if num is null and one element from the set when num is not null.
	 * 
	 * @param { number } num - The input parameter `num` specifies whether to return all
	 * elements or just the one element from the set. When `num` is null or not provided.,
	 * the function returns all the elements of a clean array. When `num` is less than 0
	 * then it returns the one element at the specified index ( num+ length)of the set .
	 * Otherwise it simply returns the one element at the specified index (num)
	 * 
	 * @returns { array } The function takes a number "num" and returns either an element
	 * or all elements of the array. If num is null the function returns all elements of
	 * the array and if num is negative the function returns just one element at the
	 * specified index.
	 */
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	/**
	 * @description This function creates a new jQuery element set by merging the given
	 * element set with a reference to the old object on the stack.
	 * 
	 * @param { string } elems - The `elems` input parameter is passed to jQuery.merge(),
	 * merging a new matched element set into the prevObject parameter's jQuery object.
	 * 
	 * @returns { object } The output of this function is a newly-formed jQuery matched
	 * element set that includes the original element set and the input elements provided.
	 */
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	/**
	 * @description The function takes a callback and returns the result of applying the
	 * callback to each element of this object.
	 * 
	 * @param {  } callback - The input `callback` takes a function as an argument and
	 * calls it on each item of the collection while passing `this`.
	 * 
	 * @returns {  } The output returned by this function is a jQuery.each().
	 */
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	/**
	 * @description The function pushes a new stack with elements from a map using the
	 * `callback` argument to transform each element before adding it to the new stack.
	 * 
	 * @param {  } callback - CALLBACK PARAMETER IN THIS FUNCTION: Invoked for each array
	 * element during map() and passed the current index 'i' of the traversal (integer)
	 * and also the current DOM element 'elem'(any).
	 * 
	 * @returns { array } The output returned by this function is an array formed from
	 * elements called back with index and element as arguments and pushed to a stack.
	 */
	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	/**
	 * @description pushes the stack with a new array consisting of the current context's
	 * unwrapped arguments
	 * 
	 * @returns { array } The function returns a new array with the elements provided as
	 * arguments.
	 */
	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	/**
	 * @description The function extracts the zero index of a collection and returns it
	 * as a single value.
	 * 
	 * @returns { number } The function returns the element at index 0 of the given collection.
	 */
	first: function() {
		return this.eq( 0 );
	},

	/**
	 * @description The function negates the input value and returns it as a number.
	 * 
	 * @returns { number } The function returns a negative one (-1).
	 */
	last: function() {
		return this.eq( -1 );
	},

	/**
	 * @description The function pushes the results of a modified iteration onto a stack
	 * using the pushStack() method and passes an array of elements from a jQuery collection
	 * that have been filtered according to a provided function.
	 * 
	 * @returns { array } The function pushes the stack with the elements that have an
	 * index divisible by two.
	 */
	even: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return ( i + 1 ) % 2;
		} ) );
	},

	/**
	 * @description The function filters the input collection using a boolean test and
	 * then returns a new stack with only the elements that have passed the test.
	 * 
	 * @returns { array } Output: An array containing only those elements of the original
	 * collection for which the given predicate function returns true. The resulting array
	 * is pushed onto the stack and returned.
	 */
	odd: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return i % 2;
		} ) );
	},

	/**
	 * @description The function extends the pushStack method of an array-like object by
	 * accepting an index.
	 * 
	 * @param { number } i - The `i` input parameter represents the index of an element
	 * within an array-like object at which to search for insertion.
	 * 
	 * @returns { array } Adds one or more elements to the end of an array. If 'i' is
	 * negative then the first element from the end of the array will be returned and the
	 * size of the negative 'i' will be subtracted from the result.
	 * If no argument 'i' is passed then all elements are added.
	 */
	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	/**
	 * @description The function creates a new instance of the constructor if previousObject
	 * is null; otherwise returns the previousObject.
	 * 
	 * @returns { object } The output of the given function is an object with either
	 * prevObject or constructor attributes according to the given input and type. It
	 * returns one of these two possibilities concisely  without fail or errors .
	 */
	end: function() {
		return this.prevObject || this.constructor();
	}
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && typeof target !== "function" ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				copy = options[ name ];

				// Prevent Object.prototype pollution
				// Prevent never-ending loop
				if ( name === "__proto__" || target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {
					src = target[ name ];

					// Ensure proper type for the source value
					if ( copyIsArray && !Array.isArray( src ) ) {
						clone = [];
					} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
						clone = {};
					} else {
						clone = src;
					}
					copyIsArray = false;

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	/**
	 * @description The function throws an error with the specified message.
	 * 
	 * @param { string } msg - THE FUNCTION THROWS AN ERROR MESSAGE WHICH IS SPECIFIED
	 * AS THE INPUT PARAMETER MSG
	 */
	error: function( msg ) {
		throw new Error( msg );
	},

	/**
	 * @description The given function does not specify any behavior or implementation.
	 * Please provide the actual code and details about the expected input/output pairs
	 * for accurate documentation.
	 */
	noop: function() {},

	/**
	 * @description This function checks if a given object is plain (not an instance of
	 * a constructor function) and returns true or false based on the object's properties.
	 * 
	 * @param { object } obj - The input parameter obj is tested for type and prototype
	 * to determine whether it is an object created by a global object constructor.
	 * 
	 * @returns { boolean } Output: a boolean value indicating whether an object is plain
	 * or not based on whether it has a constructor property and strings "Object Function"
	 * when toString-called.
	 */
	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	/**
	 * @description The function checks if an object is empty. It iterates through all
	 * the properties of the object using a "for...in" loop and returns "false" if any
	 * property exists. If no property exists. it returns "true".
	 * 
	 * @param { object } obj - The function accepts an object as input through the parameter
	 * 'obj'.
	 * 
	 * @returns { boolean } Function takes an object as input and returns boolean value.
	 * It loops through each key-value pair of the object and returns "false" for all of
	 * them.
	 * The final output is a collection of false values.
	 */
	isEmptyObject: function( obj ) {
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	// Evaluates a script in a provided context; falls back to the global one
	// if not specified.
	/**
	 * @description The function DOM Evaluate. It evaluates the DOME and produces
	 * high-quality documentation for the given code.
	 * 
	 * @param { string } code - CODE IS EVALUATED.
	 * 
	 * @param { object } options - The `options` input parameter provides a nonce for DOMEval().
	 * 
	 * @param {  } doc - The `doc` input parameter provides documentation metadata to the
	 * DOMEval function within this anonymous function given here.
	 */
	globalEval: function( code, options, doc ) {
		DOMEval( code, { nonce: options && options.nonce }, doc );
	},

	/**
	 * @description processes an array-like object or a non-array object with a callback
	 * function applied to each element
	 * 
	 * @param { object } obj - Here is your answer:
	 * 
	 * The obj input parameter supplies an array or object to search through calling
	 * callback on its elements.
	 * 
	 * @param { any } callback - Certainly. Here is my concise response to your question:
	 * 
	 * The `callback` function executes on every element of `obj`, and can decide at any
	 * moment to end loop execution by returning false.
	 * 
	 * @returns { object } The output returned by this function is the input object.
	 */
	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},


	// Retrieve the text value of an array of DOM nodes
	/**
	 * @description Here is the concise answer to your question:
	 * 
	 * This function extracts text from a DOM node or array of nodes. Depending on the
	 * type of node passed as an argument and processed from top down through deepest
	 * first level.
	 * 
	 * @param { array } elem - Okay. Here you go:
	 * 
	 * The `elem` input parameter provides access to a jQuery element that contains text
	 * content that needs to be extracted and returns a string with just the content.
	 * 
	 * @returns { string } The function returns a string concatenation of all child text
	 * node values of an HTML element or array of elements if no elements are provided
	 * as an argument to the function.
	 */
	text: function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;

		if ( !nodeType ) {

			// If no nodeType, this is expected to be an array
			while ( ( node = elem[ i++ ] ) ) {

				// Do not traverse comment nodes
				ret += jQuery.text( node );
			}
		}
		if ( nodeType === 1 || nodeType === 11 ) {
			return elem.textContent;
		}
		if ( nodeType === 9 ) {
			return elem.documentElement.textContent;
		}
		if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}

		// Do not include comment or processing instruction nodes

		return ret;
	},


	// results is for internal usage only
	/**
	 * @description Accepts an array or array-like object and appends its elements to a
	 * new array if it is not null and is an array or string.
	 * 
	 * @param { object } arr - Arr provides an array-like object to be added or concatenated
	 * with another array "ret".
	 * 
	 * @param { array } results - Results is an optional input parameter and is initialized
	 * to an empty array if not provided. It will be concatenated with any arrays or
	 * string value returned from function call
	 * 
	 * @returns { array } The output returned by this function is an array of values that
	 * have been pushed onto it or merged into it from multiple sources. If a non-array
	 * like object is passed to the function as 'arr', then its contents are first converted
	 * into an array and added to ret. If an array-like object (string) is passed then
	 * the value inside is added to the output array without any changes. Finally returns
	 * 'ret'
	 */
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
						[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	/**
	 * @description Finds the index of the first occurrence of an array element or -1 if
	 * no such element is found.
	 * 
	 * @param {  } elem - Here's your response.
	 * 
	 * Element to search for within an array.
	 * 
	 * @param { array } arr - arr provides the elements to search for the input `elem`.
	 * 
	 * @param { integer } i - Searches the array for a given element from the specified
	 * position.
	 * 
	 * @returns { number } The function returns -1 if the specified element is not found
	 * within the array or returns its position index (zero-based indexing) if it is present.
	 */
	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	/**
	 * @description Verbs:
	 * returns
	 * assumes
	 * tests
	 * 
	 * @param { object } elem - Provides an HTML element to be checked for HTML context.
	 * 
	 * @returns { boolean } The function returns a boolean value indicating whether the
	 * provided element object is not an HTML element or does not have a namespace.
	 */
	isXMLDoc: function( elem ) {
		var namespace = elem && elem.namespaceURI,
			docElem = elem && ( elem.ownerDocument || elem ).documentElement;

		// Assume HTML when documentElement doesn't yet exist, such as inside
		// document fragments.
		return !rhtmlSuffix.test( namespace || docElem && docElem.nodeName || "HTML" );
	},

	// Note: an element does not contain itself
	/**
	 * @description The function compares two nodes `a` and `b`, determining whether `a`
	 * contains or is equal to the parent node of `b`.
	 * 
	 * @param {  } a - OF COURSE.
	 * The input parameter a is compared to the node's parent element of the object
	 * parameter b.
	 * 
	 * @param {  } b - The function's b parameter receives the Node object to check if
	 * it is contained within or equal to a.
	 * 
	 * @returns { boolean } Here's a crisp and concise answer based on your request:
	 * 
	 * Return value - The given function will return either 'a' is the parentNode of 'b',
	 * or both nodes are siblings (based on contains or compareDocumentPosition).
	 */
	contains: function( a, b ) {
		var bup = b && b.parentNode;

		return a === bup || !!( bup && bup.nodeType === 1 && (

			// Support: IE 9 - 11+
			// IE doesn't have `contains` on SVG.
			a.contains ?
				a.contains( bup ) :
				a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
		) );
	},

	/**
	 * @description Copies elements of an array to another.
	 * 
	 * @param { array } first - The first input parameter is assigned to an array and
	 * then has its length updated.
	 * 
	 * @param { array } second - second is being assigned to the "i" index of the "first"
	 * array during runtime
	 * 
	 * @returns { array } The function takes two arrays as input and combines them into
	 * the first array. The function returns the modified first array.
	 */
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	/**
	 * @description The function takes three arguments: an array of elements ("elems"),
	 * a callback function to apply to each element ("callback"), and a boolean invert
	 * parameter. It then iterates over the array using the provided callback function.
	 * It pushes any element for which the callback function returns a falsey value (i.e.,
	 * if it doesn't pass the test) onto an array of matched elements that is returned
	 * at the end.
	 * 
	 * @param { array } elems - The function takes an array of elements as input through
	 * the `elems` parameter and processes each element.
	 * 
	 * @param {  } callback - The `callback` input parameter takes a functional argument
	 * that gets evaluated for each array element. It determines if the element passes
	 * the test and is added to the resulting array.
	 * 
	 * @param { boolean } invert - The `invert` parameter causes the callback function
	 * to operate with an inverse expectation.
	 * 
	 * @returns { array } The function returns an array of elements that pass the validation
	 * check. The array is created by iterating through the input elements and only adding
	 * those that do not satisfy the callback function's condition.
	 */
	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	/**
	 * @description This function applies a callback to each element of an array or object
	 * and collects the return values into an array.
	 * 
	 * @param { object } elems - The `elems` parameter is an array-like object passed
	 * into the `function`.
	 * 
	 * @param {  } callback - In this function given here's what the `callaback` paramter
	 * does -
	 * 
	 * The callback receives each of these array items as its two arguments and returns
	 * a new value (of the item). This value (returned by the callback) is appended to
	 * an overall resulting array called `ret`, if it's not null.
	 * 
	 * @param { any } arg - Here is the function's documentation with your requests:
	 * 
	 * The function's arg input parameter provides a value to pass as a second argument
	 * for each callback execution.
	 * 
	 * @returns { array } The output is an array of values that result from applying the
	 * provided callback function to each element of the input array or object.
	 */
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return flat( ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( _i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );

export { jQuery, jQuery as $ };
