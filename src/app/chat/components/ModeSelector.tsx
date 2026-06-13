import { modeEntries } from "../constants";
import type { Mode } from "../types";

type ModeSelectorProps = {
  mode: Mode;
  isLoading: boolean;
  onChangeMode: (mode: Mode) => void;
};

export function ModeSelector({ mode, isLoading, onChangeMode }: ModeSelectorProps) {
  return (
    <nav aria-label="AI機能のモード切替" className="grid gap-2 md:grid-cols-3">
      {modeEntries.map(([value, option]) => {
        const isActive = mode === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onChangeMode(value)}
            disabled={isLoading}
            aria-pressed={isActive}
            className={`rounded-lg border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60 ${
              isActive
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            <span
              className={`mt-1 block text-xs ${
                isActive ? "text-slate-200" : "text-slate-500"
              }`}
            >
              {option.description}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
