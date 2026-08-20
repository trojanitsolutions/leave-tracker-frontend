interface SpinnerProps {
  className?: string;
}

export function Spinner({ className = "" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block h-4 w-4 flex-none animate-mz-spin rounded-full border-2 border-line border-t-accent ${className}`}
    />
  );
}

interface LoadingStateProps {
  label?: string;
  className?: string;
}

/** Inline loading indicator for a card/section awaiting an API response. */
export function LoadingState({ label = "Loading…", className = "" }: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center gap-[10px] py-[40px] text-[13px] text-muted ${className}`}>
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

/** Full-viewport loading indicator for gates that block an entire route (e.g. auth resolving). */
export function FullPageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-[12px] text-[13px] text-muted">
      <Spinner className="h-7 w-7 border-[3px]" />
      <span>{label}</span>
    </div>
  );
}
