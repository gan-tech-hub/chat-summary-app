import type { ModeOption } from "../types";

type ChatInputProps = {
  input: string;
  currentMode: ModeOption;
  isLoading: boolean;
  onChangeInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onUseSampleInput: () => void;
};

export function ChatInput({
  input,
  currentMode,
  isLoading,
  onChangeInput,
  onSubmit,
  onKeyDown,
  onUseSampleInput,
}: ChatInputProps) {
  return (
    <div className="flex flex-col gap-3">
      {currentMode.sampleInput && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            入力例を使ってすぐ試せます。内容は送信前に編集できます。
          </p>
          <button
            type="button"
            onClick={onUseSampleInput}
            disabled={isLoading}
            className="self-start rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            サンプルを入力
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <textarea
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading}
          placeholder={`${currentMode.placeholder}（Enter送信・Shift+Enter改行）`}
          className="min-h-24 flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        ></textarea>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-300 sm:self-stretch"
        >
          送信
        </button>
      </form>
    </div>
  );
}
