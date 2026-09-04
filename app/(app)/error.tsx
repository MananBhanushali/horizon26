"use client";

import { ErrorState } from "@/components/ui/SystemStates";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid place-items-center min-h-[60vh]">
      <ErrorState
        title="Something went off-pattern."
        body="The terminal hit an unexpected state. You can retry or jump back to the dashboard."
        diagnostic={`${error.message}${error.digest ? `\ndigest: ${error.digest}` : ""}`}
        onRetry={reset}
      />
    </div>
  );
}
