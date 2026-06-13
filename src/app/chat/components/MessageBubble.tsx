import type { Message, MessageRole, ResponseMeta } from "../types";
import { formatDuration, formatFileSize, formatNumber } from "../utils";

type MessageBubbleProps = {
  message: Message;
  index: number;
  copiedMessageIndex: number | null;
  isLoading: boolean;
  onCopyMessage: (content: string, index: number) => void;
  onDownloadMessage: (content: string, fileName?: string) => void;
  onReuseMessage: (message: Message) => void;
};

const getMessageClassName = (role: MessageRole) => {
  if (role === "user") {
    return "bg-slate-900 text-white";
  }

  if (role === "error") {
    return "border border-red-200 bg-red-50 text-red-700";
  }

  return "border border-slate-200 bg-white text-slate-800 shadow-sm";
};

const getMetaItems = (meta?: ResponseMeta) => {
  if (!meta) return [];

  const items: { label: string; value: string }[] = [];
  const duration = formatDuration(meta.elapsed_ms);
  const extractedTextChars = formatNumber(meta.extracted_text_chars);

  if (duration) items.push({ label: "処理時間", value: duration });
  if (meta.file_size_bytes) {
    items.push({ label: "PDFサイズ", value: formatFileSize(meta.file_size_bytes) });
  }
  if (extractedTextChars) {
    items.push({ label: "抽出文字数", value: `${extractedTextChars}文字` });
  }
  if (typeof meta.chunk_count === "number") {
    const maxChunks = typeof meta.max_chunks === "number" ? ` / ${meta.max_chunks}` : "";
    items.push({ label: "チャンク数", value: `${meta.chunk_count}${maxChunks}` });
  }
  if (typeof meta.openai_call_count === "number") {
    items.push({ label: "API呼び出し", value: `${meta.openai_call_count}回` });
  }

  return items;
};

export function MessageBubble({
  message,
  index,
  copiedMessageIndex,
  isLoading,
  onCopyMessage,
  onDownloadMessage,
  onReuseMessage,
}: MessageBubbleProps) {
  const metaItems = getMetaItems(message.meta);

  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-6 ${getMessageClassName(message.role)}`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.role === "user" && message.mode !== "pdf-summary" && (
          <div className="mt-3 flex justify-end border-t border-white/10 pt-2">
            <button
              type="button"
              onClick={() => onReuseMessage(message)}
              disabled={isLoading}
              className="text-xs font-medium text-slate-200 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              再入力
            </button>
          </div>
        )}
        {message.role === "assistant" && (
          <>
            {metaItems.length > 0 && (
              <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:grid-cols-2">
                {metaItems.map((item) => (
                  <div
                    key={`${item.label}-${item.value}`}
                    className="rounded-md bg-slate-50 px-2.5 py-1.5"
                  >
                    <span className="font-medium text-slate-600">{item.label}:</span>{" "}
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => onCopyMessage(message.content, index)}
                className="text-xs font-medium text-slate-500 transition hover:text-slate-900"
              >
                {copiedMessageIndex === index ? "コピー済み" : "コピー"}
              </button>
              {message.mode === "pdf-summary" && (
                <button
                  type="button"
                  onClick={() => onDownloadMessage(message.content, message.fileName)}
                  className="text-xs font-medium text-slate-500 transition hover:text-slate-900"
                >
                  TXT保存
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
