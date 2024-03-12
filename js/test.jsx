import React, { useRef, useEffect, useContext } from "react";
import { CSSTransition as ReactCSSTransition } from "react-transition-group";

const TransitionContext = React.createContext({
  parent: {},
});

/**
 * @description sets up a ref with a default value of `true`, then updates the ref
 * on every render cycle by setting its current property to `false`. It returns the
 * current value of the ref, which is initially `true`.
 * 
 * @returns { boolean } a boolean value indicating whether the component is in its
 * initial render.
 */
function useIsInitialRender() {
  const isInitialRender = useRef(true);
  useEffect(() => {
    isInitialRender.current = false;
  }, []);
  return isInitialRender.current;
}

/**
 * @description generates high-quality documentation for code given to it by managing
 * display property and adding or removing classes on mount, entry, exit, or exited
 * events of a component.
 * 
 * @param { boolean } show - display state of the component, which determines whether
 * the CSS transitions should be applied.
 * 
 * @param { boolean } appear - 16-way CSS transition `appearance` property, which
 * controls whether the element is visible or not during the transition.
 * 
 * @param { boolean } unmountOnExit - node's class list to remove when transition
 * ends, ensuring that the element is properly unmounted from the DOM after the
 * transition completes.
 * 
 * @param { ReactNode. } children - child component to be wrapped with the CSSTransition
 * component, and it is passed as an argument to the inner `ReactCSSTransition` component.
 * 
 * 		- `children`: This is the child component that will be transitioned. It can have
 * various properties and attributes, such as `style`, `ref`, `onClick`, etc.
 * 		- `rest`: This is an object containing additional properties or attributes of
 * the `children` component.
 * 
 * 
 * @param { object } rest - 3rd argument passed to the `ReactCSSTransition` component,
 * which is an object that can contain additional props for the wrapped component.
 * 
 * @returns { Component } a React component that manages CSS transitions for an element.
 */
function CSSTransition({
  show,
  enter = "",
  enterStart = "",
  enterEnd = "",
  leave = "",
  leaveStart = "",
  leaveEnd = "",
  appear,
  unmountOnExit,
  tag = "div",
  children,
  ...rest
}) {
  /**
   * @description determines the length of a given string `s`.
   * 
   * @param { string } s - string to be formatted and is used in the calculation of the
   * output string.
   * 
   * @returns { string } the length of the given string, measured in characters.
   */
  const enterClasses = enter.split(" ").filter((s) => s.length);

  /**
   * @description returns the length of its argument, `s`, in digits.
   * 
   * @param { string } s - string to be processed, which is used to determine the length
   * of the string.
   * 
   * @returns { string } the length of the input string, which is provided as the
   * argument `s`.
   */
  const enterStartClasses = enterStart.split(" ").filter((s) => s.length);

  /**
   * @description generates high-quality documentation for given code, without repeating
   * the question or using first-person statements.
   * 
   * @param { string } s - code that will be documented.
   * 
   * @returns { array } a string representation of the length of the given code snippet.
   */
  const enterEndClasses = enterEnd.split(" ").filter((s) => s.length);

  /**
   * @description length is returned as an integer value representing the number of
   * characters in the given string `s`.
   * 
   * @param { string } s - string that is being manipulated and is used to determine
   * the length of the string.
   * 
   * @returns { string } the length of the input string, represented as an integer.
   */
  const leaveClasses = leave.split(" ").filter((s) => s.length);

  /**
   * @description length returns the number of characters in its string argument, `s`.
   * 
   * @param { string } s - string that is being formatted.
   * 
   * @returns { string } the length of the `s` argument.
   */
  const leaveStartClasses = leaveStart.split(" ").filter((s) => s.length);

  /**
   * @description length is returned for the given string `s`.
   * 
   * @param { string } s - 1D array of integers to be squared, and its length is used
   * to determine the number of elements to be squared.
   * 
   * @returns { string } the length of the `s` argument, which is passed as an argument
   * to the function.
   */
  const leaveEndClasses = leaveEnd.split(" ").filter((s) => s.length);
  const removeFromDom = unmountOnExit;

  /**
   * @description adds one or more CSS classes to a DOM element.
   * 
   * @param { object } node - element to which the given `classes` array will be added.
   * 
   * @param { array } classes - 1D array of class names to be added to the element's
   * class list using the `classList.add()` method.
   */
  function addClasses(node, classes) {
    classes.length && node.classList.add(...classes);
  }

  /**
   * @description removes one or more class names from a given HTML element using its
   * `classList` property.
   * 
   * @param { object } node - element whose class list is to be modified.
   * 
   * @param { array } classes - 1D array of class names to be removed from the specified
   * `node`.
   */
  function removeClasses(node, classes) {
    classes.length && node.classList.remove(...classes);
  }

  const nodeRef = React.useRef(null);
  const Component = tag;

  return (
    <ReactCSSTransition
      appear={appear}
      nodeRef={nodeRef}
      unmountOnExit={removeFromDom}
      in={show}
      addEndListener={(done) => {
        nodeRef.current.addEventListener("transitionend", done, false);
      }}
      onEnter={() => {
        if (!removeFromDom) nodeRef.current.style.display = null;
        addClasses(nodeRef.current, [...enterClasses, ...enterStartClasses]);
      }}
      onEntering={() => {
        removeClasses(nodeRef.current, enterStartClasses);
        addClasses(nodeRef.current, enterEndClasses);
      }}
      onEntered={() => {
        removeClasses(nodeRef.current, [...enterEndClasses, ...enterClasses]);
      }}
      onExit={() => {
        addClasses(nodeRef.current, [...leaveClasses, ...leaveStartClasses]);
      }}
      onExiting={() => {
        removeClasses(nodeRef.current, leaveStartClasses);
        addClasses(nodeRef.current, leaveEndClasses);
      }}
      onExited={() => {
        removeClasses(nodeRef.current, [...leaveEndClasses, ...leaveClasses]);
        if (!removeFromDom) nodeRef.current.style.display = "none";
      }}
    >
      <Component
        ref={nodeRef}
        {...rest}
        style={{ display: !removeFromDom ? "none" : null }}
      >
        {children}
      </Component>
    </ReactCSSTransition>
  );
}

/**
 * @description is a custom hook that manages the display of content using CSS
 * transitions. It takes an object with `show`, `appear`, and other options as props
 * and returns a functional component that applies the appropriate transition based
 * on the provided values.
 * 
 * @param { `undefined` value. } show - value of the `show` prop that will be passed
 * to the `CSSTransition` component, indicating whether or not the element should be
 * shown.
 * 
 * 		- `show`: The initial show state of the component. It can be a boolean or a
 * function that returns a boolean. If it's a function, it's called with the current
 * context as its argument, and its return value is used to determine the show state.
 * 		- `appear`: A boolean indicating whether the component should appear or not. If
 * undefined, it defaults to the parent's `appear` property.
 * 
 * 
 * @param { boolean } appear - visibility of an element, with a value of `true`
 * indicating that it should appear and a value of `false` indicating that it should
 * disappear.
 * 
 * @param { object } rest - additional props that will be passed down to the child
 * component inside the TransitionContext.Provider.
 * 
 * @returns { `CSSTransition`. } a React component that manages transitioning between
 * two states.
 * 
 * 		- `parent`: An object that contains information about the parent component,
 * including its `show`, `isInitialRender`, and `appear` properties.
 * 		- `isChild`: A boolean value indicating whether the current component is a child
 * of another component.
 * 		- `CSSTransition`: A React component that handles the CSS transitions for the
 * current component.
 * 		- `appear`: A boolean value indicating whether the current component should
 * appear or not.
 * 		- `show`: A boolean value indicating whether the current component should be
 * shown or hidden.
 */
function Transition({ show, appear, ...rest }) {
  const { parent } = useContext(TransitionContext);
  const isInitialRender = useIsInitialRender();
  const isChild = show === undefined;

  if (isChild) {
    return (
      <CSSTransition
        appear={parent.appear || !parent.isInitialRender}
        show={parent.show}
        {...rest}
      />
    );
  }

  return (
    <TransitionContext.Provider
      value={{
        parent: {
          show,
          isInitialRender,
          appear,
        },
      }}
    >
      <CSSTransition appear={appear} show={show} {...rest} />
    </TransitionContext.Provider>
  );
}

export default Transition;
