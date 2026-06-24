import type { BackendStatus } from "../types";

type BackendWakePanelProps = {
  status: BackendStatus;
  elapsedSeconds: number;
  retryCount: number;
  errorMessage: string | null;
  onRetry: () => void;
};

export function BackendWakePanel({
  status,
  elapsedSeconds,
  retryCount,
  errorMessage,
  onRetry,
}: BackendWakePanelProps) {
  const isError = status === "error";
  const title = isError
    ? "バックエンドに接続できませんでした"
    : status === "checking"
      ? "バックエンドに接続しています"
      : "バックエンドを起動しています";
  const description = isError
    ? "Renderの起動に時間がかかっているか、一時的に接続できない可能性があります。"
    : status === "checking"
      ? "しばらくお待ちください。"
      : "初回アクセス時は30秒ほどかかる場合があります。接続でき次第、自動で開始します。";

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50/70 p-4">
      <div
        className={`w-full max-w-md rounded-lg border bg-white px-6 py-5 text-center shadow-sm ${
          isError ? "border-red-200" : "border-slate-200"
        }`}
        role={isError ? "alert" : "status"}
        aria-live="polite"
      >
        {!isError && (
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          </div>
        )}

        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            経過時間: {elapsedSeconds}秒
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            再試行: {retryCount}回
          </div>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {isError && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            再試行
          </button>
        )}
      </div>
    </div>
  );
}
