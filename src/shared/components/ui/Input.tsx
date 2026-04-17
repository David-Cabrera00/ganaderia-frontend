import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, error, id, style, ...props }: InputProps) => {
  return (
    <div style={{ display: "grid", gap: "6px" }}>
      {label && <label htmlFor={id}>{label}</label>}

      <input
        id={id}
        style={{
          padding: "10px 12px",
          borderRadius: "10px",
          border: `1px solid ${error ? "#dc2626" : "#d1d5db"}`,
          outline: "none",
          ...style,
        }}
        {...props}
      />

      {error && (
        <span style={{ color: "#dc2626", fontSize: "14px" }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;