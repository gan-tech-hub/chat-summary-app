"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackendWakePanel } from "./components/BackendWakePanel";
import { ChatInput } from "./components/ChatInput";
import { MessageList } from "./components/MessageList";
import { ModeSelector } from "./components/ModeSelector";
import { PdfUploadPanel } from "./components/PdfUploadPanel";
import {
  BACKEND_HEALTH_CHECK_INTERVAL_MS,
  BACKEND_HEALTH_CHECK_MAX_WAIT_MS,
  BACKEND_HEALTH_CHECK_TIMEOUT_MS,
  MAX_PDF_FILE_SIZE_BYTES,
  modeOptions,
} from "./constants";
import type { ApiResponse, BackendStatus, Message, Mode, PdfFileInfo } from "./types";
import { createDownloadFileName, fetchWithTimeout, readApiResponse, sleep } from "./utils";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");
  const [pdfFileInfo, setPdfFileInfo] = useState<PdfFileInfo | null>(null);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [backendCheckStartedAt, setBackendCheckStartedAt] = useState<number | null>(null);
  const [backendElapsedSeconds, setBackendElapsedSeconds] = useState(0);
  const [backendRetryCount, setBackendRetryCount] = useState(0);
  const [backendErrorMessage, setBackendErrorMessage] = useState<string | null>(null);
  const backendCheckRunRef = useRef(0);
  const currentMode = modeOptions[mode];
  const isBackendReady = backendStatus === "ready";
  const canClearHistory =
    messages.length > 0 || input.trim() !== "" || pdfFileInfo !== null || pdfUploadError !== null;

  const startBackendCheck = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const runId = backendCheckRunRef.current + 1;
    const startedAt = Date.now();

    backendCheckRunRef.current = runId;
    setBackendStatus("checking");
    setBackendCheckStartedAt(startedAt);
    setBackendElapsedSeconds(0);
    setBackendRetryCount(0);
    setBackendErrorMessage(null);

    if (!apiUrl) {
      setBackendStatus("error");
      setBackendErrorMessage("API URLが設定されていません。NEXT_PUBLIC_API_URLを確認してください。");
      return;
    }

    while (
      backendCheckRunRef.current === runId &&
      Date.now() - startedAt < BACKEND_HEALTH_CHECK_MAX_WAIT_MS
    ) {
      try {
        const res = await fetchWithTimeout(
          `${apiUrl}/health`,
          BACKEND_HEALTH_CHECK_TIMEOUT_MS,
          {
            cache: "no-store",
          }
        );
        const data = (await res.json()) as ApiResponse;

        if (res.ok && data.success === true) {
          setBackendStatus("ready");
          setBackendErrorMessage(null);
          return;
        }
      } catch (error) {
        console.error("Backend health check failed.", error);
      }

      if (backendCheckRunRef.current !== runId) return;

      setBackendStatus("waking");
      setBackendRetryCount((current) => current + 1);
      await sleep(BACKEND_HEALTH_CHECK_INTERVAL_MS);
    }

    if (backendCheckRunRef.current === runId) {
      setBackendStatus("error");
      setBackendErrorMessage("時間をおいて再試行してください。");
    }
  }, []);

  useEffect(() => {
    startBackendCheck();

    return () => {
      backendCheckRunRef.current += 1;
    };
  }, [startBackendCheck]);

  useEffect(() => {
    if (!backendCheckStartedAt || isBackendReady) return;

    const intervalId = window.setInterval(() => {
      setBackendElapsedSeconds(
        Math.floor((Date.now() - backendCheckStartedAt) / 1000)
      );
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [backendCheckStartedAt, isBackendReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || !isBackendReady) return;

    const newUserMessage: Message = { role: "user", content: trimmedInput, mode };
    const updatedMessages = [...messages, newUserMessage];
    const apiMessages = updatedMessages
      .filter((msg) => msg.role !== "error")
      .map(({ role, content }) => ({ role, content }));

    setMessages(updatedMessages);
    setIsLoading(true);
    setInput("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: apiMessages,
          mode,
        }),
      });

      const result = await readApiResponse(res, "エラーが発生しました");
      setMessages([...updatedMessages, { ...result, mode }]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: "error",
        content: "サーバーに接続できませんでした",
        mode,
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || isLoading || !isBackendReady) return;

    setPdfUploadError(null);

    if (selectedFile.size > MAX_PDF_FILE_SIZE_BYTES) {
      const errorText =
        "PDFファイルサイズが大きすぎます。10MB以下のPDFをアップロードしてください。";
      const errorMessage: Message = {
        role: "error",
        content: errorText,
        mode: "pdf-summary",
      };
      setPdfFileInfo(null);
      setPdfUploadError(errorText);
      setMessages((prev) => [...prev, errorMessage]);
      e.target.value = "";
      return;
    }

    setPdfFileInfo({
      name: selectedFile.name,
      size: selectedFile.size,
    });
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pdf-summary`, {
        method: "POST",
        body: formData,
      });

      const result = await readApiResponse(res, "PDF要約でエラーが発生しました");
      setMessages((prev) => [
        ...prev,
        { ...result, mode: "pdf-summary", fileName: selectedFile.name },
      ]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: "error",
        content: "サーバーに接続できませんでした",
        mode: "pdf-summary",
        fileName: selectedFile.name,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  const handleClearHistory = () => {
    if (isLoading) return;

    setMessages([]);
    setInput("");
    setPdfFileInfo(null);
    setPdfUploadError(null);
    setCopiedMessageIndex(null);
  };

  const handleCopyMessage = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageIndex(index);
      window.setTimeout(() => setCopiedMessageIndex(null), 1500);
    } catch {
      setCopiedMessageIndex(null);
    }
  };

  const handleDownloadMessage = (content: string, fileName?: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = createDownloadFileName(fileName);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUseSampleInput = () => {
    if (!currentMode.sampleInput || isLoading) return;

    setInput(currentMode.sampleInput);
  };

  const handleReuseMessage = (message: Message) => {
    if (isLoading || message.role !== "user" || message.mode === "pdf-summary") return;

    setMode(message.mode ?? "chat");
    setInput(message.content);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-5xl flex-col gap-4">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Next.js / FastAPI / OpenAI API
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              AI Chat & PDF Summary
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              チャット、文章要約、PDF要約をひとつの画面で扱えるAIアシスタントです。
            </p>
          </div>

          <ModeSelector mode={mode} isLoading={isLoading} onChangeMode={setMode} />
        </header>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {currentMode.label}モード
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {isLoading
                    ? currentMode.loadingText
                    : isBackendReady
                      ? currentMode.emptyDescription
                      : "バックエンドの起動を待っています。"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500">
                  {messages.length} messages
                </span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  disabled={isLoading || !canClearHistory}
                  className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  履歴クリア
                </button>
              </div>
            </div>
          </div>

          {isBackendReady ? (
            <>
              <MessageList
                messages={messages}
                currentMode={currentMode}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
                copiedMessageIndex={copiedMessageIndex}
                onCopyMessage={handleCopyMessage}
                onDownloadMessage={handleDownloadMessage}
                onReuseMessage={handleReuseMessage}
              />

              <div className="border-t border-slate-200 bg-white p-4">
                {mode === "pdf-summary" ? (
                  <PdfUploadPanel
                    isLoading={isLoading}
                    pdfFileInfo={pdfFileInfo}
                    pdfUploadError={pdfUploadError}
                    onPDFUpload={handlePDFUpload}
                  />
                ) : (
                  <ChatInput
                    input={input}
                    currentMode={currentMode}
                    isLoading={isLoading}
                    onChangeInput={setInput}
                    onSubmit={handleSubmit}
                    onKeyDown={handleKeyDown}
                    onUseSampleInput={handleUseSampleInput}
                  />
                )}
              </div>
            </>
          ) : (
            <BackendWakePanel
              status={backendStatus}
              elapsedSeconds={backendElapsedSeconds}
              retryCount={backendRetryCount}
              errorMessage={backendErrorMessage}
              onRetry={startBackendCheck}
            />
          )}
        </section>
      </div>
    </main>
  );
}
