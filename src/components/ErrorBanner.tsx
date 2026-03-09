"use client";

interface ErrorBannerProps {
  message: string;
  type?: "error" | "warning";
  onDismiss?: () => void;
}

export default function ErrorBanner({
  message,
  type = "error",
  onDismiss,
}: ErrorBannerProps) {
  const colors =
    type === "warning"
      ? "border-orange-300 bg-orange-50 text-orange-800"
      : "border-red-300 bg-red-50 text-red-800";

  return (
    <div className={`rounded-lg border p-3 ${colors}`}>
      <div className="flex items-start gap-2">
        <div className="flex-1 text-sm">{message}</div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-current opacity-50 hover:opacity-100"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
