import type { PropsWithChildren } from "react";

const Table = ({ children }: PropsWithChildren) => {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#ffffff",
        }}
      >
        {children}
      </table>
    </div>
  );
};

export default Table;