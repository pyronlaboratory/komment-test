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
           /**
            * @description This function selects an element or elements based on a specified
            * selector and context, and performs an action on them.
            * 
            * @param { string } selector - The `selector` input parameter selects the HTML element
            * or elements that the function will operate on. It is used to target specific
            * elements within the context of the calling code.
            * 
            * @param {  } context - The `context` input parameter in the provided function is
            * used to provide additional data or information that can be utilized within the
            * function. It serves as a way to pass in external data or context that can be used
            * to modify or manipulate the output of the function.
            */
  jQuery = function (selector, context) {};

jQuery.fn = jQuery.prototype = {
  // The current version of jQuery being used
  jquery: version,

  constructor: jQuery,

  // The default length of a jQuery object is 0
  length: 0,

  /**
   * @description The given function slice calls the current object.
   * 
   * @returns { array } The output returned by this function is an array formed from
   * the current element of this object.
   */
  toArray: function () {
    return slice.call(this);
  },

  // Get the Nth element in the matched element set OR
  // Get the whole matched element set as a clean array
  /**
   * @description Return all elements or one element of an array according to a given
   * number if null.
   *
   * @param { number } num - Of course. The input parameter `num` is a test for whether
   * or not to return the element at a specific position of the array (i.e. positive
   * value). When set to zero (`num == null`) all elements are returned without any
   * modification from their original state (position order).
   *
   * @returns { array } The function takes an optional argument "num". If it's null or
   * not present , the function returns all the elements of an array "this" as a clean
   * array. If "num" is less than zero , then element at the positive distance of num
   * from the end of the array is returned , else element at the position of num is
   * returned .
   */
  get: function (num) {
    // Return all the elements in a clean array
    if (num == null) {
      return slice.call(this);
    }

    // Return just the one element from the set
    return num < 0 ? this[num + this.length] : this[num];
  },

  // Take an array of elements and push it onto the stack
  // (returning the new matched element set)
  /**
   * @description Creating a new jQuery element set.
   * Elems are merged with this.constructor(), creating a new set of elements and adding
   * old objects to the stack.
   *
   * @param { array } elems - elems is constructed into a new jQuery matched element set
   *
   * @returns { object } The output returned by the function is a new jQuery matched
   * element set. This set includes the elements provided as input as well as a reference
   * to the old object.
   */
  pushStack: function (elems) {
    // Build a new jQuery matched element set
    var ret = jQuery.merge(this.constructor(), elems);

    // Add the old object onto the stack (as a reference)
    ret.prevObject = this;

    // Return the newly-formed element set
    return ret;
  },

  // Execute a callback for every element in the matched set.
  /**
   * @description Certainly. Here is the concise answer to your question:
   *
   * Iterates through each of "this" object's properties and invokes callback on each
   * property and its corresponding value.
   *
   * @param {  } callback - The `callback` parameter is passed a value of type `Function`.
   * It performs some action on each element found within `this`, whatever type that
   * happens to be.
   *
   * @returns {  } Certainly. The function accepts a callback function and executes it
   * on each item within the "this" object array.
   *
   * The output is not explicitly defined and varies based on the callback's implementation.
   */
  each: function (callback) {
    return jQuery.each(this, callback);
  },

  /**
   * @description Here's the answer to your question:
   *
   * The provided JavaScript function pushes elements of a stack returning a jQuery
   * collection. The callback receives the element index and that same element as an
   * argument during mapping of the parent elements to this collection.
   *
   * @param {  } callback - CALLBACK FUNCTION.
   *
   * @returns { array } Certainly. The function returns a jQuery object consisting of
   * mapped results where callback has been called with arguments of index (i) and DOM
   * element (elem).
   */
  map: function (callback) {
    return this.pushStack(
      jQuery.map(this, function (elem, i) {
        return callback.call(elem, i, elem);
      }),
    );
  },

  /**
   * @description The function pushes the slice of the arguments onto a stack.
   *
   * @returns { array } The function pushes the specified arguments onto a stack using
   * slice() method and returns the new stack.
   */
  slice: function () {
    return this.pushStack(slice.apply(this, arguments));
  },

  /**
   * @description Returns the zero-th (initial) element of a JavaScript object.
   *
   * @returns { array } The output of this function is the element at index zero (0)
   * of the provided collection.
   */
  first: function () {
    return this.eq(0);
  },

  /**
   * @description The function extracts the element at index -1 from its container.
   *
   * @returns { integer } The function takes no argument and returns this.eq(-1).  This
   * returns nothing since nonexistent indexes return undefined
   */
  last: function () {
    return this.eq(-1);
  },

  /**
   * @description The function pushes the elements that have an odd index to a new stack.
   *
   * @returns { array } The output is a jQuery array containing all elements of the
   * original array that have an index equal to 0 or 1 modulo 2.
   */
  even: function () {
    return this.pushStack(
      jQuery.grep(this, function (_elem, i) {
        return (i + 1) % 2;
      }),
    );
  },

  /**
   * @description Selects elements from the jQuery collection and pushes them into a
   * stack using jQuery.grep() method
   *
   * @returns { array } The function takes a jQuery collection as input and returns a
   * new jQuery collection containing only the elements that have an odd index (i.e.,
   * i % 2 === 1).
   */
  odd: function () {
    return this.pushStack(
      jQuery.grep(this, function (_elem, i) {
        return i % 2;
      }),
    );
  },

  /**
   * @description The function adds an item to an array starting at a specified index.
   *
   * @param { integer } i - ADDS VALUE TO THE PUSH STACK.
   *
   * @returns { array } Adds one or zero elements to an array.
   * The output is either a single element or an empty array.
   */
  eq: function (i) {
    var len = this.length,
      j = +i + (i < 0 ? len : 0);
    return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
  },

  /**
   * @description The provided function retrieves the previous object or initializes a
   * new object of the same type as the function if no previous object is found.
   *
   * @returns { object } The function returns the object's prevObject or its constructor
   * function if prevObject is null or not present.
   */
  end: function () {
    return this.prevObject || this.constructor();
  },
};

jQuery.extend = jQuery.fn.extend = function () {
  var options,
    name,
    src,
    copy,
    copyIsArray,
    clone,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false;

  // Handle a deep copy situation
  if (typeof target === "boolean") {
    deep = target;

    // Skip the boolean and the target
    target = arguments[i] || {};
    i++;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== "object" && typeof target !== "function") {
    target = {};
  }

  // Extend jQuery itself if only one argument is passed
  if (i === length) {
    target = this;
    i--;
  }

  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    if ((options = arguments[i]) != null) {
      // Extend the base object
      for (name in options) {
        copy = options[name];

        // Prevent Object.prototype pollution
        // Prevent never-ending loop
        if (name === "__proto__" || target === copy) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if (
          deep &&
          copy &&
          (jQuery.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))
        ) {
          src = target[name];

          // Ensure proper type for the source value
          if (copyIsArray && !Array.isArray(src)) {
            clone = [];
          } else if (!copyIsArray && !jQuery.isPlainObject(src)) {
            clone = {};
          } else {
            clone = src;
          }
          copyIsArray = false;

          // Never move original objects, clone them
          target[name] = jQuery.extend(deep, clone, copy);

          // Don't bring in undefined values
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

jQuery.extend({
  // Unique for each copy of jQuery on the page
  expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),

  // Assume jQuery is ready without the ready module
  isReady: true,

  /**
   * @description THROWS NEW ERROR(MSG)
   *
   * @param {  } msg - Throws an Error with the provided message.
   */
  error: function (msg) {
    throw new Error(msg);
  },

  /**
   * @description This anonymous function accepts no parameters and returns nothing.
   * Its body contains an empty set of parentheses {} and so has a blank or no-operation
   * effect when called.
   */
  noop: function () {},

  /**
   * @description obj - Determines if an object is plain or has a specified constructor.
   *
   * @param { object } obj - obj - The object being checked for being an instance of a
   * global Object function
   *
   * @returns { object } This function takes an object as input and returns a boolean
   * value indicating whether the object is plain (not a constructor). The output is
   * "true" if the object has no prototype or if it was constructed using a global
   * Object function. Otherwise the output is "false".
   */
  isPlainObject: function (obj) {
    var proto, Ctor;

    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    if (!obj || toString.call(obj) !== "[object Object]") {
      return false;
    }

    proto = getProto(obj);

    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if (!proto) {
      return true;
    }

    // Objects with prototype are plain iff they were constructed by a global Object function
    Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
    return (
      typeof Ctor === "function" &&
      fnToString.call(Ctor) === ObjectFunctionString
    );
  },

  /**
   * @description The function checks whether an object is empty by iterating over its
   * properties using a for...in loop and returning true if no properties exist.
   *
   * @param { object } obj - The input parameter `obj` is iterated upon using the
   * `for...in` statement to determine if the property exists within the object.
   *
   * @returns {  } True is output by this function if no properties are present within
   * the provided object.
   */
  isEmptyObject: function (obj) {
    var name;

    for (name in obj) {
      return false;
    }
    return true;
  },

  // Evaluates a script in a provided context; falls back to the global one
  // if not specified.
  /**
   * @description The given function takes three parameters - `code`, `options`, and
   * `doc`. It runs DOMEval() function on the passed `code' by using a passed option(if
   * present) & passes `doc` as second argument to DOMVAL().
   *
   * @param { string } code - Of course. Here is the concise answer to your question.
   *
   * The input 'code' to the function provided serves as the source code that is being
   * evaluated and interpreted by the DOMEval method within the defined scope of options
   * provided.
   *
   * @param { object } options - The `options` object modifies the evaluation of the code.
   *
   * @param {  } doc - Doc input takes a string value representing the desired documentation
   * for generated comments.
   */
  globalEval: function (code, options, doc) {
    DOMEval(code, { nonce: options && options.nonce }, doc);
  },

  /**
   * @description The function iterates over an array or object and invokes a provided
   * callback function for each element. If the callback returns false during iteration.
   * it breaks out of the loop early and returns the original array or object.
   *
   * @param { object } obj - Here is the concise answer to your question:
   *
   * obj serves as the collection being searched and its elements are iterated over for
   * processing by callback
   *
   * @param { object } callback - Here is a concise description of what the `callback`
   * does as provided directly based on the function you sent. I've adhered to all
   * guidelines given.
   *
   * CALLBACK PARAMETER: CALLBACK CAN BE PASSED AS A FUNCTION TO CHECK ELEMENTS AND
   * ABORT PROCESSING UPON FALSE RESULT.
   *
   * @returns { object } The output of this function is the original input object.
   */
  each: function (obj, callback) {
    var length,
      i = 0;

    if (isArrayLike(obj)) {
      length = obj.length;
      for (; i < length; i++) {
        if (callback.call(obj[i], i, obj[i]) === false) {
          break;
        }
      }
    } else {
      for (i in obj) {
        if (callback.call(obj[i], i, obj[i]) === false) {
          break;
        }
      }
    }

    return obj;
  },

  // Retrieve the text value of an array of DOM nodes
  /**
   * @description Here is a concise answer to your question:
   *
   * This code defines a function that extracts text from an element using the NodeType
   * property of each node and checks whether the type of node is 1 for Element Node
   * or 11 for Document Fragment to return its text content; 9 for DocumentElement to
   * return its content if it exists; 3 for Text to return its node value and does not
   * include comment and processing instruction nodes; finally returns an array of
   * extracted texts from all children.
   *
   * @param { object } elem - Okay. Here's my response to your request:
   *
   * The `elem` parameter is expected to be either an array of DOM nodes or a single
   * DOM node.
   *
   * @returns { string } The function takes an HTML element as input and returns a
   * string containing its text content. If the element is a comment or processing
   * instruction node then their values are not included.
   */
  text: function (elem) {
    var node,
      ret = "",
      i = 0,
      nodeType = elem.nodeType;

    if (!nodeType) {
      // If no nodeType, this is expected to be an array
      while ((node = elem[i++])) {
        // Do not traverse comment nodes
        ret += jQuery.text(node);
      }
    }
    if (nodeType === 1 || nodeType === 11) {
      return elem.textContent;
    }
    if (nodeType === 9) {
      return elem.documentElement.textContent;
    }
    if (nodeType === 3 || nodeType === 4) {
      return elem.nodeValue;
    }

    // Do not include comment or processing instruction nodes

    return ret;
  },

  // results is for internal usage only
  /**
   * @description The function takes an array and an optional `results` argument. It
   * creates a new array and populates it by either concatenating the input array (if
   * it's not null) or pushing each element onto the new array. Finally it returns the
   * new array.
   *
   * @param { object } arr - Of course. Here's your answer.
   *
   * The `arr` input parameter provides an array or array-like object to be processed
   * by the function.
   *
   * @param { array } results - The `results` input parameter is an optional array to
   * which the return value of the `push.call()` method is appended if not null and the
   * return value itself otherwise.
   *
   * @returns { array } The function takes two parameters: "arr" and "results". It
   * returns a new array object with values from either of the "arr" input parameter.
   * Results could either be null or an array. If the arr has multiple elements as
   * arrays then it would create concatenate all its elements to form an entirely new
   * array as shown above; however if Arr was an empty Array (array()()), nothing was
   * returned(ret stayed at []); note though this doesn't alter or change original
   * objects that contain multiple values instead merely making one concateted object
   * that has no mutiplied references towards each original objects keyvaluepairs and
   * returns newArray after creating it using function return feature so as not interfere
   *   with orginal parameters while preserving their references across programming
   * language constructs .
   */
  makeArray: function (arr, results) {
    var ret = results || [];

    if (arr != null) {
      if (isArrayLike(Object(arr))) {
        jQuery.merge(ret, typeof arr === "string" ? [arr] : arr);
      } else {
        push.call(ret, arr);
      }
    }

    return ret;
  },

  /**
   * @description The function searches for the index of an element within an array.
   * It returns -1 if the array is null. Otherwise it returns the index using the
   * built-in method indexOf.
   *
   * @param { object } elem - Element to search for is passed as `elem`.
   *
   * @param { array } arr - The `arr` input parameter takes an array and returns its index.
   *
   * @param { integer } i - Inserts the array index where the provided element should
   * be added (0-based).
   *
   * @returns { integer } Returns -1 or the index of the element if it exists.
   */
  inArray: function (elem, arr, i) {
    return arr == null ? -1 : indexOf.call(arr, elem, i);
  },

  /**
   * @description Here's your concise answer:
   *
   * This function tests if an HTML element has been explicitly assigned to a particular
   * XML namespace. It returns false when it does.
   *
   * @param {  } elem - Accepts an element object and returns a boolean value indicating
   * whether or not the specified element is an HTML element.
   *
   * @returns { boolean } The output of this function is a boolean value indicating
   * whether an HTML document is present based on the element provided. If the namespace
   * exists and is not "html", it is assumed to be HTML.
   */
  isXMLDoc: function (elem) {
    var namespace = elem && elem.namespaceURI,
      docElem = elem && (elem.ownerDocument || elem).documentElement;

    // Assume HTML when documentElement doesn't yet exist, such as inside
    // document fragments.
    return !rhtmlSuffix.test(
      namespace || (docElem && docElem.nodeName) || "HTML",
    );
  },

  // Note: an element does not contain itself
  /**
   * @description Compares two elements a and b if a is the parent of b or a contains
   * b using the 'contains' method. Support for IE.
   *
   * @param { string } a - Returns the boolean value indicating whether an element is
   * a parent of "b".
   *
   * @param { object } b - The `b` parameter provides the node to check for containment
   * within the context of `a`.
   *
   * @returns { boolean } The output of this function is a boolean value that indicates
   * whether `a` contains or has a positioned reference to `b`.
   */
  contains: function (a, b) {
    var bup = b && b.parentNode;

    return (
      a === bup ||
      !!(
        bup &&
        bup.nodeType === 1 &&
        // Support: IE 9 - 11+
        // IE doesn't have `contains` on SVG.
        (a.contains
          ? a.contains(bup)
          : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16)
      )
    );
  },

  /**
   * @description COPY_SELECT_Contents(second);
   *
   * @param {  } first - The function takes a first input parameter that is assigned
   * to an array "i" whose length is equal to the input second's length and is used to
   * store new elements that are retrieved from the second input.
   *
   * @param { array } second - second is assigned to variable 'j'
   *
   * @returns { array } The output of this function is the original first array with
   * the elements rearranged to spell second.
   */
  merge: function (first, second) {
    var len = +second.length,
      j = 0,
      i = first.length;

    for (; j < len; j++) {
      first[i++] = second[j];
    }

    first.length = i;

    return first;
  },

  /**
   * @description Finds elements within an array that do not meet a provided validation
   * function criteria and saves them into a separate array.
   * 
   * @param { array } elems - Elems is the array to iterate through and apply the
   * provided callback function to each item.
   * 
   * @param {  } callback - The `callback` input parameter takes an item from the `elems`
   * array and an index of that item and calls the provided function on those parameters
   * to determine if it passes a certain test (a true return value means it doesn't
   * pass). If the test fails (i.e., a false return value), the item is added to the
   * resulting `matches` array.
   * 
   * @param { boolean } invert - Inverts the logic of the validation function. When set
   * to true and a item doesn't pass validation the it will be included instead of excluded.
   * 
   * @returns { array } Function takes an array of elements and a callback function as
   * arguments. It then returns an array of only those elements that pass the validator
   * function provided.
   */
  grep: function (elems, callback, invert) {
    var callbackInverse,
      matches = [],
      i = 0,
      length = elems.length,
      callbackExpect = !invert;

    // Go through the array, only saving the items
    // that pass the validator function
    for (; i < length; i++) {
      callbackInverse = !callback(elems[i], i);
      if (callbackInverse !== callbackExpect) {
        matches.push(elems[i]);
      }
    }

    return matches;
  },


  /**
   * @description Translates each of the items to their new values and flattens any
   * nested arrays.
   * 
   * @param { object } elems - Elems is an array-like object or a plain object that the
   * function processes.
   * 
   * @param { any } callback - Certainly. Here is your answer:
   * 
   * Callback takes two parameters and returns a value.
   * 
   * @param { object } arg - OK. Here is your answer:
   * 
   * The input parameter 'arg' supplies a supplemental value to each element passed
   * into the function.
   * 
   * @returns { array } The function takes an array or object and applies a provided
   * callback function to each element. It then returns a flattened array of values
   * returned by the callback functions.
   */
  map: function (elems, callback, arg) {
    var length,
      value,
      i = 0,
      ret = [];

    // Go through the array, translating each of the items to their new values
    if (isArrayLike(elems)) {
      length = elems.length;
      for (; i < length; i++) {
        value = callback(elems[i], i, arg);

        if (value != null) {
          ret.push(value);
        }
      }

      // Go through every key on the object,
    } else {
      for (i in elems) {
        value = callback(elems[i], i, arg);

        if (value != null) {
          ret.push(value);
        }
      }
    }

    // Flatten any nested arrays
    return flat(ret);
  },

  // A global GUID counter for objects
  guid: 1,

  // jQuery.support is not used in Core but other projects attach their
  // properties to it so it needs to exist.
  support: support,
});

if (typeof Symbol === "function") {
  jQuery.fn[Symbol.iterator] = arr[Symbol.iterator];
}

// Populate the class2type map
jQuery.each(
  "Boolean Number String Function Array Date RegExp Object Error Symbol".split(
    " ",
  ),
  function (_i, name) {
    class2type["[object " + name + "]"] = name.toLowerCase();
  },
);

export { jQuery, jQuery as $ };
