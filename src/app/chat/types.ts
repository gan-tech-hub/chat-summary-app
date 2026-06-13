export type Mode = "chat" | "text-summary" | "pdf-summary";

export type ResponseMeta = {
  mode?: Mode;
  elapsed_ms?: number;
  file_size_bytes?: number;
  extracted_text_chars?: number;
  chunk_count?: number;
  max_chunks?: number;
  chunk_size?: number;
  chunk_overlap?: number;
  openai_call_count?: number;
};

export type ApiResponse = {
  success?: boolean;
  data?: { message?: string; meta?: ResponseMeta } | null;
  error?: { code?: string; message?: string } | null;
};

export type MessageRole = "user" | "assistant" | "error";

export type Message = {
  role: MessageRole;
  content: string;
  mode?: Mode;
  fileName?: string;
  meta?: ResponseMeta;
};

export type ApiResult = {
  role: "assistant" | "error";
  content: string;
  meta?: ResponseMeta;
};

export type PdfFileInfo = {
  name: string;
  size: number;
};

export type ModeOption = {
  label: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  loadingText: string;
  placeholder: string;
  sampleInput?: string;
};
