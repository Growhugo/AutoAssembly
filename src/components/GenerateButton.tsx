"use client";

interface GenerateButtonProps {
  dateRange: string;
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export default function GenerateButton({
  dateRange,
  onClick,
  disabled,
  loading,
}: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl px-6 py-4 text-lg font-bold shadow-lg transition-all ${
        disabled
          ? "cursor-not-allowed bg-gray-300 text-gray-500"
          : "bg-cca-gold text-cca-blue hover:bg-cca-gold/90 hover:shadow-xl active:scale-[0.98]"
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Generating Report...
        </span>
      ) : (
        <>
          Generate Assembly Report
          <div className="mt-1 text-sm font-normal opacity-80">{dateRange}</div>
        </>
      )}
    </button>
  );
}
