import type { RefObject } from "react";
import { MessageBubble } from "./MessageBubble";
import type { Message, ModeOption } from "../types";

type MessageListProps = {
  messages: Message[];
  currentMode: ModeOption;
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  copiedMessageIndex: number | null;
  onCopyMessage: (content: string, index: number) => void;
  onDownloadMessage: (content: string, fileName?: string) => void;
  onReuseMessage: (message: Message) => void;
};

export function MessageList({
  messages,
  currentMode,
  isLoading,
  messagesEndRef,
  copiedMessageIndex,
  onCopyMessage,
  onDownloadMessage,
  onReuseMessage,
}: MessageListProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4">
      {messages.length === 0 && !isLoading && (
        <div className="flex min-h-full items-center justify-center">
          <div className="max-w-md rounded-lg border border-dashed border-slate-300 bg-white px-6 py-5 text-center">
            <p className="text-sm font-semibold text-slate-900">
              {currentMode.emptyTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {currentMode.emptyDescription}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            index={index}
            copiedMessageIndex={copiedMessageIndex}
            isLoading={isLoading}
            onCopyMessage={onCopyMessage}
            onDownloadMessage={onDownloadMessage}
            onReuseMessage={onReuseMessage}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              <span>{currentMode.loadingText}</span>
              <div className="flex space-x-1" aria-hidden="true">
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
