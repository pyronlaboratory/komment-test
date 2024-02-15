import React, { useRef, useEffect, useContext } from 'react';
import { CSSTransition as ReactCSSTransition } from 'react-transition-group';

const TransitionContext = React.createContext({
  parent: {},
})

/**
 * @description This function uses the useRef hook to create a ref object with an
 * initial value of true. It then uses useEffect to set the current value of that ref
 * object to false after any side effectful content has been rendered once. Finally
 * it returns the current value of that ref. Therefore this function tells you if
 * your component has only been rendered once i.e. whether the ref is still initially
 * set to true.
 * 
 * @returns { boolean } The output of this function is a value that is initially
 * `true`, but is set to `false` on the first renders using the effect function and
 * is kept as such for subsequent renders. In essence it provides a "one time" initial
 * value.
 */
function useIsInitialRender() {
  const isInitialRender = useRef(true);
  useEffect(() => {
    isInitialRender.current = false;
  }, [])
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
  enter = '',
  enterStart = '',
  enterEnd = '',
  leave = '',
  leaveStart = '',
  leaveEnd = '',
  appear,
  unmountOnExit,
  tag = 'div',
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
  const enterClasses = enter.split(' ').filter((s) => s.length);
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
  const enterStartClasses = enterStart.split(' ').filter((s) => s.length);
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
  const enterEndClasses = enterEnd.split(' ').filter((s) => s.length);
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
  const leaveClasses = leave.split(' ').filter((s) => s.length);
  /**
   * @description √ The given function calculates and returns the length of a given
   * string parameter (in number of characters).
   * 
   * @param { string } s - The `s` input parameter is a string on which the function
   * calculates its length.
   * 
   * @returns { integer } Output: The length of the provided string
   */
  const leaveStartClasses = leaveStart.split(' ').filter((s) => s.length);
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
  const leaveEndClasses = leaveEnd.split(' ').filter((s) => s.length);
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
          * @description Transitions between appearance and disappearance of components by
          * applying styles using React Transition.
          * 
          * @param { boolean } appear - The `appear` property sets whether or not the node
          * will initially appear inside the transition.
          * 
          * @param { object } nodeRef - nodeRef property sets the reference of the current
          * node to the Component.
          * 
          * @param { boolean } unmountOnExit - Removes the component from the DOM.
          * 
          * @param { boolean } in - The `in` property determines whether the transition is
          * being entered or exited based on its value of "true" or "false." When set to true
          * while mounting the transition and later changed to false as a state update triggered
          * transition ends means "true", "the component would immediately exit," regardless
          * of whether animation duration is fulfilled or cancelled.
          * 
          * @param { Component } addEndListener - The `addEndListener` property sets a callback
          * function to be called when the transition ends.
          * 
          * @param {  } onEnter - Okay. Here is the answer to your question.
          * 
          * The `onEnter` property sets the CSS classes to add when the transition starts and
          * the element becomes visible.
          * 
          * @param { Component } onEntering - Remove enter start classes and add end classes.
          * 
          * @param {  } onEntered - Remove class(es) from the current node.
          * 
          * @param {  } onExit - Adds classes to the current component.
          * 
          * @param {  } onExiting - On exiting removes classes from the current element and
          * adds the leave end classes.
          * 
          * @param {  } onExited - The `onExited` property is called after the component has
          * completely exited the transition and all CSS properties have been removed from the
          * DOM element reference. It will remove any remaining exiting classes from the element.
          */
         /**
          * @description This component renders a transition effect on entering and exiting
          * states using React CSSTransition and also applies classes to the DOM element
          * depending on its state (appear/show/leave) with addClass/removeClass methods
          * 
          * @param { boolean } appear - The "appear" prop inside a ReactCSSTransition determines
          * if an instant appear transition or fade-in occurs as soon as enter is called without
          * going through any of the intervening states
          * 
          * @param { Component } nodeRef - The `nodeRef` property is used to pass a reference
          * to a DOM element that this component will transition. The `nodeRef.current` property
          * refers to the actual DOM element that has been passed to the transitioning component
          * and allows for event handling within the `ReactCSSTransition`.
          * 
          * @param { Component } unmountOnExit - The `unmountOnExit` property sets the removal
          * of a reference to the DOM node that was passed into the `nodeRef` property. It
          * does so when an exit animation completes and therefore effectively causes the
          * referenced element's exit animation. This makes the unmounting (removal) happen
          * once an animation is over - this can ensure clean finishings of transitions before
          * new components are rendered or hidden elements clean themselves up completely
          * rather than just 'disappearing.'
          * 
          * What is your takeaway from this component snippet? What did you find most
          * interesting/surprising from reading the provided code sample related to react-transition-group?
          * 
          * @param { boolean } in - The "in" property specifies whether or not the transition
          * should occur when the component is inserted into the DOM. When "in" is true (as
          * it is here), the transition will occur whenever the component is first added to
          * the DOM.
          * 
          * @param {  } addEndListener - The "addEndListener" function adds a transitionend
          * event listener to the dom element being transitioned and triggers the onEntered
          * or onExited function when the animation completes depending on the direction of
          * the transitions (entering or leaving)
          * 
          * @param { Component } onEnter - The `onEnter` event triggers when the transition
          * has completed its enter animation and removes all `enterStartClass`.
          * 
          * @param { Component } onEntering - The onEntering event handler is called just
          * before the transition begins (when the entering classnames are being applied) and
          * is responsible for removing the enterStartClassNames and adding the enterEndClassNames
          * to the dom node.
          * 
          * @param {  } onEntered - The "onEntered" property removes any of the "enterEndClasses"
          * that were added when the enter state was finished entering.
          * 
          * @param { Component } onExit - The onExit property adds classes to the referenced
          * node upon exit.
          * 
          * @param { Component } onExiting - The onExiting function is called before the
          * transition is complete and the exit animation has started. This allows you to apply
          * leaving classes or styles before the component exits and removes itself from the
          * DOM.
          * 
          * @param { Component } onExited - The "onExited" property removes any CSS classes
          * on the node if it's being unmounted.
          */
  return (
    <ReactCSSTransition
      appear={appear}
      nodeRef={nodeRef}
      unmountOnExit={removeFromDom}
      in={show}
      addEndListener={(done) => {
        nodeRef.current.addEventListener('transitionend', done, false)
      }}
      onEnter={() => {
        if (!removeFromDom) nodeRef.current.style.display = null;
        addClasses(nodeRef.current, [...enterClasses, ...enterStartClasses])
      }}
      onEntering={() => {
        removeClasses(nodeRef.current, enterStartClasses)
        addClasses(nodeRef.current, enterEndClasses)
      }}
      onEntered={() => {
        removeClasses(nodeRef.current, [...enterEndClasses, ...enterClasses])
      }}
      onExit={() => {
        addClasses(nodeRef.current, [...leaveClasses, ...leaveStartClasses])
      }}
      onExiting={() => {
        removeClasses(nodeRef.current, leaveStartClasses)
        addClasses(nodeRef.current, leaveEndClasses)
      }}
      onExited={() => {
        removeClasses(nodeRef.current, [...leaveEndClasses, ...leaveClasses])
        if (!removeFromDom) nodeRef.current.style.display = 'none';
      }}
    >
      <Component ref={nodeRef} {...rest} style={{ display: !removeFromDom ? 'none': null }}>{children}</Component>
    </ReactCSSTransition>
  )
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
    )
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
  )
}

export default Transition;
