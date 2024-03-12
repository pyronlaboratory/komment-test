import { FC } from "react";
import classNames from "classnames";
import { ButtonProps } from "@/types";

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
