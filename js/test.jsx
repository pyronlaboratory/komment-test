import React, { useRef, useEffect, useContext } from "react";
import { CSSTransition as ReactCSSTransition } from "react-transition-group";

const TransitionContext = React.createContext({
  parent: {},
});

/**
 * @description initializes a ref with the value of true and then sets it to false
 * during the next effect. Finally returns the current value.
 *
 * @returns { boolean } Output: a boolean value set to `false`.
 */
function useIsInitialRender() {
  const isInitialRender = useRef(true);
  useEffect(() => {
    isInitialRender.current = false;
  }, []);
  return isInitialRender.current;
}

/**
 * @description The function CSSTransition is a React component that manages CSS
 * transitions for elements. It takes several options: show (boolean), enter (string),
 * leave (string), and children. It adds/removes CSS classes on entering/leaving state
 * to animate the element's display property.
 *
 * @param { string } show - Show specifies whether or not the transition should occur;
 * it is a boolean value representing whether the component should appear.
 *
 * @param { object } appear - The appear input specifies if the component should
 * instantly apply its entered state when entering instead of crossing from an absence
 * of a certain style to that style as with transition. It defaults to false and would
 * need to be explicitly set to true to bypass any transitions.
 *
 * @param {  } unmountOnExit - The unmountOnExit input parameter sets whether or not
 * to remove the component from the DOM after the transition is complete. If set to
 * true (the default), React will remove the component upon transition completion.
 *
 * @param { Component } children - The `children` parameter passes a child element
 * to the Component that is being rendered within the React Transition. This element
 * can then be styled and animated based on the specifications provided for enter/leave
 * animations.
 *
 * @param { object } rest - The `rest` parameter is a collection of properties that
 * can be passed to the component and can be used for anything else outside the CSS
 * transition features of this higher-order component like all props. It provides
 * other properties with which you can access all others if none exist such as onRest
 * etc..
 *
 * @returns { Component } The function returns a React component with CSS transitions
 * for the provided children element.
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
   * @description The function (s) => s.length returns the length of a string argument.
   *
   * @param { string } s - The input `s` is a string whose length is determined by the
   * function.
   *
   * @returns { number } OK.
   *
   * The function (s) => s.length returns the length of string s.
   */
  const enterClasses = enter.split(" ").filter((s) => s.length);
  /**
   * @description The given function returns the length of a given string.
   *
   * @param { string } s - Here is the response you requested:
   *
   * The `s` input parameter receives a string and passes it to the length method for
   * calculation.
   *
   * @returns { string } Output: length of the string given as input.
   */
  const enterStartClasses = enterStart.split(" ").filter((s) => s.length);
  /**
   * @description The given function retrieves the length of a string parameter s and
   * returns it as an integer.
   *
   * @param { string } s - Here's the documentation for this function:
   *
   * Function <anonymous> takes string 's' as input and returns its length as output.
   *
   * @returns { string } The output of the function (s) => s.length is the length of
   * the input string "s". The output is a number representing the string's length and
   * is described as concise.
   */
  const enterEndClasses = enterEnd.split(" ").filter((s) => s.length);
  /**
   * @description Here's a direct and formal answer that contains more specific information.
   *
   * This Function returns the Length of an input String
   *
   * @param { string } s - The input parameter `s` is a string whose length is determined
   * by the function.
   *
   * @returns {  } 2
   */
  const leaveClasses = leave.split(" ").filter((s) => s.length);
  /**
   * @description √ The given function calculates and returns the length of a given
   * string parameter (in number of characters).
   *
   * @param { string } s - The `s` input parameter is a string on which the function
   * calculates its length.
   *
   * @returns { integer } Output: The length of the provided string
   */
  const leaveStartClasses = leaveStart.split(" ").filter((s) => s.length);
  /**
   * @description ® length of input string s
   *
   * @param { string } s - The input parameter `s` is passed as a string and its length
   * is calculated and returned by the function.
   *
   * @returns { number } The output of this function is the length of the input string.
   * The function takes a string as input and returns an integer representing the number
   * of characters present the input string.
   */
  const leaveEndClasses = leaveEnd.split(" ").filter((s) => s.length);
  const removeFromDom = unmountOnExit;

  /**
   * @description Verbs: adds
   *
   * The provided function... Adds the specified classes to the specified node.
   *
   * @param { object } node - THE NODE INPUT PARAMETER IS MODIFIED BY THIS FUNCTION
   * WHEN CALLED AND ITS CLASS LIST PROPERTY IS ADDED TO.]
   *
   * @param { array } classes - The classes input parameter is a string array that
   * receives addClass methods at the callee level by concatenating an ellipsis with
   * its elements.
   */
  function addClasses(node, classes) {
    classes.length && node.classList.add(...classes);
  }

  /**
   * @description Remove classes from a given node by removing class names passed as
   * an argument from the node's class list.
   *
   * @param {  } node - The `node` input parameter provides a reference to a DOM element.
   *
   * @param { array } classes - The `classes` input parameter is a variable that contains
   * an array of class names to be removed from the element referenced by the "node" parameter.
   */
  function removeClasses(node, classes) {
    classes.length && node.classList.remove(...classes);
  }

  const nodeRef = React.useRef(null);
  const Component = tag;

         /**
          * @description This component uses React CSSTransition to manage the visibility of
          * a component. It sets up listeners for different events during the transition, such
          * as `onEnter`, `onEntering`, `onEntered`, `onExit`, `onExiting`, and `onExited`.
          * These events are used to add or remove CSS classes from the component's node
          * reference, controlling its visibility. The component also sets up a `nodeRef` to
          * refer to the component's DOM node, and uses the `rest` prop to pass additional
          * props to the component.
          * 
          * @param { boolean } appear - The `appear` property sets whether the component should
          * appear when the transition is complete or not. If it's set to `true`, the component
          * will appear after the transition is finished, otherwise it won't.
          * 
          * @param {  } nodeRef - The `nodeRef` property is a React ref that stores a reference
          * to the underlying DOM element. It is used to add event listeners and to remove
          * classes when the component unmounts.
          * 
          * @param { boolean } unmountOnExit - The `unmountOnExit` property in the
          * `ReactCSSTransition` component unmounts the component when it exits, which means
          * it removes the component from the DOM. This is useful for cleaning up resources
          * and preventing memory leaks when a component is no longer needed.
          * 
          * @param { boolean } in - The `in` property in the ReactCSSTransition component sets
          * whether the transition is occurring or not. If it is set to `true`, the transition
          * will occur, and if it is set to `false`, the transition will not occur.
          * 
          * @param {  } addEndListener - The `addEndListener` property adds an event listener
          * to the element when it is being removed from the DOM. It listens for the `transitionend`
          * event and when it occurs, it calls the `done` function.
          * 
          * @param { Component } onEnter - In this component, the `onEnter` property is called
          * when the element is entering the DOM. It sets the display property of the element
          * to null if it hasn't already been removed from the DOM, and adds classes to the
          * element during its entry.
          * 
          * @param { Component } onEntering - In this component, the `onEntering` property
          * adds a class to the element when it is entering the viewport, and removes that
          * class when the transition is complete.
          * 
          * @param { Component } onEntered - The `onEntered` property adds classes to the
          * component upon entering it. It removes classes that were added during the `onEntering`
          * phase and adds new ones.
          * 
          * @param { Component } onExit - The `onExit` property adds classes to the node when
          * it is being removed from the DOM. It adds leaveStart and leaveEnd classes, followed
          * by removeClasses for both of those classes, and finally adds a class of "none" to
          * hide the element.
          * 
          * @param { Component } onExiting - The `onExiting` property sets up an event listener
          * that removes classes from the component when it is leaving the DOM. It adds classes
          * to the component before it leaves, which helps with smooth transitions.
          * 
          * @param { Component } onExited - The `onExited` property triggers the removal of
          * the node's CSS classes when the transition is completed, making the element invisible.
          */
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
 * @description This component Transition wraps the C SS transition component and
 * manages a Transition context for its children.
 *
 * @param {  } show - The `show` parameter specifies the content that is being animated
 * and its final visibility state once the transition finishes.
 *
 * @param { boolean } appear - Appears CSS transitions on mount or update when `true`.
 *
 * @param { object } rest - Here's the concise answer:
 *
 * The `rest` param passed to the CSSTransition component contains other props that
 * aren't specified as keys of the TransitionContext object (such as animationDuration
 * and timingFunction) or explicitly declared transition modes that don't need access
 * to context-related data.
 *
 * @returns {  } Renderes a Transition component using CSS Transitions if it is not
 * the initial rendor or has its appear property set to true
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
