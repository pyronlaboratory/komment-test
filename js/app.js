/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isValidElementType from 'shared/isValidElementType';
import getComponentNameFromType from 'shared/getComponentNameFromType';
import checkPropTypes from 'shared/checkPropTypes';
import {
  getIteratorFn,
  REACT_FORWARD_REF_TYPE,
  REACT_MEMO_TYPE,
  REACT_FRAGMENT_TYPE,
  REACT_ELEMENT_TYPE,
} from 'shared/ReactSymbols';
import hasOwnProperty from 'shared/hasOwnProperty';
import isArray from 'shared/isArray';
import {jsxDEV} from './ReactJSXElement';

import {describeUnknownElementTypeFrameInDEV} from 'shared/ReactComponentStackFrame';

import ReactSharedInternals from 'shared/ReactSharedInternals';

const ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
const ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;


function setCurrentlyValidatingElement(element) {
  
  if (__DEV__) {
    if (element) {
      const owner = element._owner;
      const stack = describeUnknownElementTypeFrameInDEV(
        element.type,
        element._source,
        owner ? owner.type : null,
      );
      ReactDebugCurrentFrame.setExtraStackFrame(stack);
    } else {
      ReactDebugCurrentFrame.setExtraStackFrame(null);
    }
  }
}

let propTypesMisspellWarningShown;

if (__DEV__) {
  propTypesMisspellWarningShown = false;
}

export function isValidElement(object) {
  if (__DEV__) {
    return (
      typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE
    );
  }
}

/**
 * @description The function getDeclarationErrorAddendum appends a string to an error
 * message based on the value of ReactCurrentOwner and type.
 * 
 * @returns { string } The function returns a string that includes an error message.
 * When called with a type that refers to an owners object(ReactCurrentOwner.current.type)
 * within its render method the string identifies it by name and adds the check
 * instruction  "Check the render method of '(name)" when its __DEV__ conditional
 * branch evaluates true. Otherwise an empty string is returned .
 */
function getDeclarationErrorAddendum() {
  if (__DEV__) {
    if (ReactCurrentOwner.current) {
      const name = getComponentNameFromType(ReactCurrentOwner.current.type);
      if (name) {
        return '\n\nCheck the render method of `' + name + '`.';
      }
    }
    return '';
  }
}

/**
 * @description Return error addendum for code at given file name and line number if
 * source code exists; otherwise returns an empty string
 * 
 * @param { string } source - Accepts a source object parameter.
 * 
 * @returns { string } The output of the given function is a string that provides
 * additional information about the source of an error. It includes the filename and
 * line number where the error occurred relative to the current file's position. When
 * undefined is passed as the parameter "source", an empty string is returned.
 */
function getSourceInfoErrorAddendum(source) {
  if (__DEV__) {
    if (source !== undefined) {
      const fileName = source.fileName.replace(/^.*[\\\/]/, '');
      const lineNumber = source.lineNumber;
      return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
    }
    return '';
  }
}

/**
 * Warn if there's no key explicitly set on dynamic arrays of children or
 * object keys are not valid. This allows us to keep track of children between
 * updates.
 */
const ownerHasKeyUseWarning = {};

/**
 * @description Here is what the code you've posted does:
 * 
 * Returns error addendums as a string if any errors were reported during type
 * declaration and top-level rendering using given parentType DisplayName.
 * 
 * @param { string } parentType - OK. Here's your answer:
 * 
 * The parent type is a string or object that contains a displayName or name property
 * that specifies a component. This parameter identifies which components are involved.
 * 
 * @returns { string } The function returns an error message Addendum regarding a
 * missing declaration of the parent component.
 */
function getCurrentComponentErrorInfo(parentType) {
  if (__DEV__) {
    let info = getDeclarationErrorAddendum();

    if (!info) {
      const parentName =
        typeof parentType === 'string'
          ? parentType
          : parentType.displayName || parentType.name;
      if (parentName) {
        info = `\n\nCheck the top-level render call using <${parentName}>.`;
      }
    }
    return info;
  }
}

/**
 * Warn if the element doesn't have an explicit key assigned to it.
 * This element is in an array. The array could grow and shrink or be
 * reordered. All children that haven't already been validated are required to
 * have a "key" property assigned to it. Error statuses are cached so a warning
 * will only be shown once.
 *
 * @internal
 * @param {ReactElement} element Element that requires a key.
 * @param {*} parentType element's parent's type.
 */
function validateExplicitKey(element, parentType) {
  if (__DEV__) {
    if (!element._store || element._store.validated || element.key != null) {
      return;
    }
    element._store.validated = true;

    const currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
    if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
      return;
    }
    ownerHasKeyUseWarning[currentComponentErrorInfo] = true;

    // Usually the current owner is the offender, but if it accepts children as a
    // property, it may be the creator of the child that's responsible for
    // assigning it a key.
    let childOwner = '';
    if (
      element &&
      element._owner &&
      element._owner !== ReactCurrentOwner.current
    ) {
      // Give the component that originally created this child.
      childOwner = ` It was passed a child from ${getComponentNameFromType(
        element._owner.type,
      )}.`;
    }

    setCurrentlyValidatingElement(element);
    console.error(
      'Each child in a list should have a unique "key" prop.' +
        '%s%s See https://reactjs.org/link/warning-keys for more information.',
      currentComponentErrorInfo,
      childOwner,
    );
    setCurrentlyValidatingElement(null);
  }
}

/**
 * Ensure that every element either is passed in a static location, in an
 * array with an explicit keys property defined, or in an object literal
 * with valid key property.
 *
 * @internal
 * @param {ReactNode} node Statically passed child of any type.
 * @param {*} parentType node's parent's type.
 */
function validateChildKeys(node, parentType) {
  if (__DEV__) {
    if (typeof node !== 'object') {
      return;
    }
    if (isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        const child = node[i];
        if (isValidElement(child)) {
          validateExplicitKey(child, parentType);
        }
      }
    } else if (isValidElement(node)) {
      // This element was passed in a valid location.
      if (node._store) {
        node._store.validated = true;
      }
    } else if (node) {
      const iteratorFn = getIteratorFn(node);
      if (typeof iteratorFn === 'function') {
        // Entry iterators used to provide implicit keys,
        // but now we print a separate warning for them later.
        if (iteratorFn !== node.entries) {
          const iterator = iteratorFn.call(node);
          let step;
          while (!(step = iterator.next()).done) {
            if (isValidElement(step.value)) {
              validateExplicitKey(step.value, parentType);
            }
          }
        }
      }
    }
  }
}

/**
 * Given an element, validate that its props follow the propTypes definition,
 * provided by the type.
 *
 * @param {ReactElement} element
 */
function validatePropTypes(element) {
  if (__DEV__) {
    const type = element.type;
    if (type === null || type === undefined || typeof type === 'string') {
      return;
    }
    let propTypes;
    if (typeof type === 'function') {
      propTypes = type.propTypes;
    } else if (
      typeof type === 'object' &&
      (type.$$typeof === REACT_FORWARD_REF_TYPE ||
        // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        type.$$typeof === REACT_MEMO_TYPE)
    ) {
      propTypes = type.propTypes;
    } else {
      return;
    }
    if (propTypes) {
      // Intentionally inside to avoid triggering lazy initializers:
      const name = getComponentNameFromType(type);
      checkPropTypes(propTypes, element.props, 'prop', name, element);
    } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
      propTypesMisspellWarningShown = true;
      // Intentionally inside to avoid triggering lazy initializers:
      const name = getComponentNameFromType(type);
      console.error(
        'Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?',
        name || 'Unknown',
      );
    }
    if (
      typeof type.getDefaultProps === 'function' &&
      !type.getDefaultProps.isReactClassApproved
    ) {
      console.error(
        'getDefaultProps is only used on classic React.createClass ' +
          'definitions. Use a static property named `defaultProps` instead.',
      );
    }
  }
}

/**
 * Given a fragment, validate that it can only be provided with fragment props
 * @param {ReactElement} fragment
 */
function validateFragmentProps(fragment) {
  if (__DEV__) {
    const keys = Object.keys(fragment.props);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key !== 'children' && key !== 'key') {
        setCurrentlyValidatingElement(fragment);
        console.error(
          'Invalid prop `%s` supplied to `React.Fragment`. ' +
            'React.Fragment can only have `key` and `children` props.',
          key,
        );
        setCurrentlyValidatingElement(null);
        break;
      }
    }

    if (fragment.ref !== null) {
      setCurrentlyValidatingElement(fragment);
      console.error('Invalid attribute `ref` supplied to `React.Fragment`.');
      setCurrentlyValidatingElement(null);
    }
  }
}

const didWarnAboutKeySpread = {};

/**
 * @description The function takes type (a React component or array), props (additional
 * attributes for the component), key (for accessing and re-rendering components),
 * and a flag to indicate if the children are static as input and checks the validity
 * of the input to throw useful errors at runtime. It then creates the JSX element
 * and passes through to the dev mode implementation for additional validation before
 * returning it.
 * 
 * @param { any } type - The `type` input parameter expects a string (for built-in
 * components) or a class/function (for composite components). If invalid (e.g.,
 * nullish), a console warning is printed and a result of null is returned.
 * 
 * @param { object } props - The props parameter is passed as an object of properties
 * to be assigned to the component. It can contain any combination of domestic or
 * inherited props.
 * 
 * @param { string } key - The `key` input parameter is used to validate the props
 * object containing a "key" prop being spread into JSX.
 * 
 * @param { boolean } isStaticChildren - The `isStaticChildren` parameter passed to
 * `jsxWithValidation()` signals whether the `props.children` property is static or
 * not.
 * When `isStaticChildren` is set to true and `props.children` is an array (or non-array
 * iterable), this function checks the keys of its child elements individually for
 * strings if the array is shallowly cloned without alteration (but before freezing
 * it); no such key checks occur otherwise.
 * It should always be explicitly called when one renders static children because
 * Babel usually does not handle rendering them specially and so you will see misleading
 * error messages or worse yet— no errors at all  even when the keys are missing.
 * Also calling this method with a dynamic or nullish value may log an advisory warning
 * but its result cannot ever be trusted.
 * 
 * @param { string } source - The `source` parameter of `jsxWithValidation` represents
 * the source code location where the function call was made. It is passed as an
 * additional argument to console.error messages when there are type validation issues.
 * 
 * @param { object } self - The self input parameter is passed tojsxDEV as its third
 * parameter. It receives the exported component by default and tells jsxWithValidation
 * it's okay to look for another definition ofjsxDEV inside the exported module whenDEVELOPMENTISDEFINED.</r>
 * 
 * @returns {  } The function takes a type and various props as inputs and warns of
 * potential errors and then creates a jsx using that input; however it also includes
 * concise explanatory messages for certain common errors which it prints to the
 * console should those arise during function invocation along with details about the
 * offending element. Therefore it produces no direct output but rather facilitates
 * creation of error-tolerant React component elements with informative warnings.
 */
export function jsxWithValidation(
  type,
  props,
  key,
  isStaticChildren,
  source,
  self,
) {
  if (__DEV__) {
    const validType = isValidElementType(type);

    // We warn in this case but don't throw. We expect the element creation to
    // succeed and there will likely be errors in render.
    if (!validType) {
      let info = '';
      if (
        type === undefined ||
        (typeof type === 'object' &&
          type !== null &&
          Object.keys(type).length === 0)
      ) {
        info +=
          ' You likely forgot to export your component from the file ' +
          "it's defined in, or you might have mixed up default and named imports.";
      }

      const sourceInfo = getSourceInfoErrorAddendum(source);
      if (sourceInfo) {
        info += sourceInfo;
      } else {
        info += getDeclarationErrorAddendum();
      }

      let typeString;
      if (type === null) {
        typeString = 'null';
      } else if (isArray(type)) {
        typeString = 'array';
      } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
        typeString = `<${getComponentNameFromType(type.type) || 'Unknown'} />`;
        info =
          ' Did you accidentally export a JSX literal instead of a component?';
      } else {
        typeString = typeof type;
      }

      console.error(
        'React.jsx: type is invalid -- expected a string (for ' +
          'built-in components) or a class/function (for composite ' +
          'components) but got: %s.%s',
        typeString,
        info,
      );
    }

    const element = jsxDEV(type, props, key, source, self);

    // The result can be nullish if a mock or a custom function is used.
    // TODO: Drop this when these are no longer allowed as the type argument.
    if (element == null) {
      return element;
    }

    // Skip key warning if the type isn't valid since our key validation logic
    // doesn't expect a non-string/function type and can throw confusing errors.
    // We don't want exception behavior to differ between dev and prod.
    // (Rendering will throw with a helpful message and as soon as the type is
    // fixed, the key warnings will appear.)

    if (validType) {
      const children = props.children;
      if (children !== undefined) {
        if (isStaticChildren) {
          if (isArray(children)) {
            for (let i = 0; i < children.length; i++) {
              validateChildKeys(children[i], type);
            }

            if (Object.freeze) {
              Object.freeze(children);
            }
          } else {
            console.error(
              'React.jsx: Static children should always be an array. ' +
                'You are likely explicitly calling React.jsxs or React.jsxDEV. ' +
                'Use the Babel transform instead.',
            );
          }
        } else {
          validateChildKeys(children, type);
        }
      }
    }

    if (hasOwnProperty.call(props, 'key')) {
      const componentName = getComponentNameFromType(type);
      const keys = Object.keys(props).filter(k => k !== 'key');
      const beforeExample =
        keys.length > 0
          ? '{key: someKey, ' + keys.join(': ..., ') + ': ...}'
          : '{key: someKey}';
      if (!didWarnAboutKeySpread[componentName + beforeExample]) {
        const afterExample =
          keys.length > 0 ? '{' + keys.join(': ..., ') + ': ...}' : '{}';
        console.error(
          'A props object containing a "key" prop is being spread into JSX:\n' +
            '  let props = %s;\n' +
            '  <%s {...props} />\n' +
            'React keys must be passed directly to JSX without using spread:\n' +
            '  let props = %s;\n' +
            '  <%s key={someKey} {...props} />',
          beforeExample,
          componentName,
          afterExample,
          componentName,
        );
        didWarnAboutKeySpread[componentName + beforeExample] = true;
      }
    }

    if (type === REACT_FRAGMENT_TYPE) {
      validateFragmentProps(element);
    } else {
      validatePropTypes(element);
    }

    return element;
  }
}

// These two functions exist to still get child warnings in dev
// even with the prod transform. This means that jsxDEV is purely
// opt-in behavior for better messages but that we won't stop
// giving you warnings if you use production apis.
/**
 * @description Validates the provided JSX element with the type and props provided
 * as parameters; the function takes a third parameter called 'key', whose value has
 * been skipped over since it is optional.
 * 
 * @param { string } type - Validates type by calling the 'jsxWithValidation' function
 * 
 * @param { object } props - PROPS INPUT PARAMETER PROVIDES OPTIONAL ATTRIBUTES FOR
 * COMPONENT.]
 * 
 * @param { string } key - Provides a unique identifier for each list item. It is
 * used by the validation functionality to keep track of which items have been rendered
 * and to avoid re-rendering them unnecessarily.
 * 
 * @returns { boolean } The function returns jsxWithValidation(type with validation),
 * using props and a given key.
 */
export function jsxWithValidationStatic(type, props, key) {
  if (__DEV__) {
    return jsxWithValidation(type, props, key, true);
  }
}

/**
 * @description Returns a dynamically generated JSX element of type "type", with
 * properties specified by "props," and an optional key "key." When the code is being
 * developed (__DEV__), the function calls "jsxWithValidation" and adds false as its
 * last argument.
 * 
 * @param { string } type - Type specifies the component to be rendered as a string
 * ofjsx element.
 * 
 * @param { object } props - PROPS ARE PASSED TO THE JSX WITH VALIDATION FUNCTION
 * 
 * @param { string } key - PROVIDES THE UNIQUE ID FOR THE ELEMENT
 * 
 * @returns {  } The output returned by this function is `jsxWithValidation(type`,
 * `props`, `key',`false)].
 */
export function jsxWithValidationDynamic(type, props, key) {
  if (__DEV__) {
    return jsxWithValidation(type, props, key, false);
  }
}
