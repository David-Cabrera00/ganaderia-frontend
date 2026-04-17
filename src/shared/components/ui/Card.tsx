import type { PropsWithChildren } from "react";

interface CardProps {
  title?: string;
}

const Card = ({ title, children }: PropsWithChildren<CardProps>) => {
  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      {title && <h3 style={{ marginBottom: "16px" }}>{title}</h3>}
      {children}
    </section>
  );
};

export default Card;