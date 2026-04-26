interface LoaderProps {
  centered?: boolean;
}

export function Loader({ centered = true }: LoaderProps) {
  if (centered) {
    return (
      <div className="loading-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return <div className="loading-spinner" />;
}
