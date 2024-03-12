import { FC } from "react";
import classNames from "classnames";
import { ButtonProps } from "@/types";

/**
 * @description creates a React button component with customizable classes based on
 * props and renders a `button` element with given children.
 * 
 * @param { `ReactNode`. } .children - element that will be wrapped with the `button`
 * component.
 * 
 * 		- `children`: The content of the button, which can be any valid React component
 * or a string of HTML.
 * 		- `color`: A string that represents the button's background color. It can take
 * values like "primary", "secondary", "info", etc. (ignored in this implementation)
 * 		- `size`: A string that represents the button's size. It can take values like
 * "small", "medium", "large" (ignored in this implementation)
 * 		- `loading`: A boolean value indicating whether the button is currently loading
 * or not. (used to add a loading animation to the button)
 * 		- `wide`: A boolean value indicating whether the button should be wider than
 * usual. (used to create a wider button on larger screens)
 * 		- `wideMobile`: A boolean value indicating whether the button should be wider
 * than usual on mobile devices. (used to create a wider button on mobile devices)
 * 		- `disabled`: A boolean value indicating whether the button is disabled and
 * cannot be interacted with. (ignored in this implementation)
 * 
 * 	Note that some of these properties are not used in the provided code snippet, but
 * they may be present in other implementations or use cases.
 * 
 * 
 * @param { string } .className - additional class names to be added to the button
 * element, and is used to create a unique class name by combining it with other class
 * names using the `classNames()` function.
 * 
 * @param { string } .tag - HTML tag name for the button element, which is used to
 * specify the tag name in the classNames utility function.
 * 
 * @param { string } .type - type attribute of the button element, which can be set
 * to "submit" or other types to specify the form submission behavior.
 * 
 * @param { string } .color - color class for the button, which can be `button-red`,
 * `button-green`, or any other valid class name to customize the button's appearance.
 * 
 * @param { string } .size - size of the button, which can be used to apply a class
 * name for that size.
 * 
 * @param { false } .loading - state of the button as "is-loading" when set to `true`,
 * and removes the "is-loading" class when set to `false`.
 * 
 * @param { false } .wide - wide button state, which when set to `true`, applies the
 * `button-wide` class to the button element.
 * 
 * @param { false } .wideMobile - wide button style on mobile devices when it is set
 * to `true`.
 * 
 * @param { false } .disabled - state of the button, allowing it to be disabled if
 * set to `true`.
 * 
 * @param { any[] } .props - additional properties of the component that are passed
 * from the parent element or from another source, and it is used to generate the
 * corresponding class names for the button element.
 * 
 * @returns { `HTMLButtonElement`. } a button element with custom classes and properties.
 * 
 * 		- `classes`: This is an array of class names that are applied to the button
 * element. It consists of the following elements: "button", "button-submit",
 * "button-loading", "button-wide-mobile", "button-block", and "button-${color}"
 * (where ${color} is a value representing the color property).
 * 		- `disabled`: A boolean value indicating whether the button is disabled or not.
 * 		- `children`: The content of the button, which can be any valid React element.
 */
const Button: FC<ButtonProps> = ({
  children,
  className,
  tag = "button", // eslint-disable-line
  type = "submit", // eslint-disable-line
  color = "",
  size = "",
  loading = false,
  wide = false,
  wideMobile = false,
  disabled = false,
  ...props
}) => {
  const classes = classNames(
    "button",
    color && `button-${color}`,
    size && `button-${size}`,
    loading && "is-loading",
    wide && "button-block",
    wideMobile && "button-wide-mobile",
    className,
  );

  return (
    <button {...props} className={classes} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
