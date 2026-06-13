import type { ApiResponse, ApiResult } from "./types";

export const formatFileSize = (bytes: number) => {
  const sizeInMb = bytes / (1024 * 1024);
  return `${sizeInMb.toFixed(2)} MB`;
};

export const formatDuration = (ms?: number) => {
  if (typeof ms !== "number") return null;
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}秒` : `${ms}ms`;
};

export const formatNumber = (value?: number) => {
  if (typeof value !== "number") return null;
  return value.toLocaleString();
};

export const createDownloadFileName = (fileName?: string) => {
  if (!fileName) return "pdf-summary.txt";

  const baseName = fileName
    .replace(/\.pdf$/i, "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim();

  return `${baseName || "pdf"}-summary.txt`;
};

export const getApiResult = (data: ApiResponse, fallback: string): ApiResult => {
  if (data.success === true && data.data?.message) {
    return {
      role: "assistant",
      content: data.data.message,
      meta: data.data.meta,
    };
  }

  return {
    role: "error",
    content: data.error?.message ?? fallback,
  };
};

export const readApiResponse = async (
  response: Response,
  fallback: string
): Promise<ApiResult> => {
  try {
    const data = (await response.json()) as ApiResponse;
    const result = getApiResult(data, fallback);

    if (!response.ok && result.role !== "error") {
      return { role: "error", content: fallback };
    }

    return result;
  } catch {
    return {
      role: "error",
      content: response.ok ? fallback : "サーバーから正しいレスポンスを取得できませんでした",
    };
  }
};
