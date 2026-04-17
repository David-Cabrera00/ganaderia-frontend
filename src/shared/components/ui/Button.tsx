import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const getVariantStyles = (variant: ButtonVariant): React.CSSProperties => {
  switch (variant) {
    case "secondary":
      return {
        backgroundColor: "#f3f4f6",
        color: "#111827",
        border: "1px solid #d1d5db",
      };
    case "danger":
      return {
        backgroundColor: "#dc2626",
        color: "#ffffff",
        border: "1px solid #dc2626",
      };
    case "primary":
    default:
      return {
        backgroundColor: "#111827",
        color: "#ffffff",
        border: "1px solid #111827",
      };
  }
};

const Button = ({
  children,
  variant = "primary",
  fullWidth = false,
  disabled,
  style,
  ...props
}: PropsWithChildren<ButtonProps>) => {
  return (
    <button
      disabled={disabled}
      style={{
        padding: "10px 16px",
        borderRadius: "10px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        width: fullWidth ? "100%" : "auto",
        ...getVariantStyles(variant),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;