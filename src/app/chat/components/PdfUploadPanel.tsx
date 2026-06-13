import type { PdfFileInfo } from "../types";
import { formatFileSize } from "../utils";

type PdfUploadPanelProps = {
  isLoading: boolean;
  pdfFileInfo: PdfFileInfo | null;
  pdfUploadError: string | null;
  onPDFUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function PdfUploadPanel({
  isLoading,
  pdfFileInfo,
  pdfUploadError,
  onPDFUpload,
}: PdfUploadPanelProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              PDFファイルをアップロード
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              10MB以下のPDFを選択すると、自動で要約を開始します。
            </p>
          </div>

          <label
            htmlFor="pdf-upload"
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition ${
              isLoading
                ? "cursor-not-allowed bg-slate-300 text-white"
                : "cursor-pointer bg-slate-900 text-white hover:bg-slate-700"
            }`}
          >
            PDFを選択
          </label>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={onPDFUpload}
            disabled={isLoading}
            className="sr-only"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
            {pdfFileInfo ? (
              <div className="flex flex-col gap-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {pdfFileInfo.name}
                </p>
                <p className="text-xs text-slate-500">
                  直近で選択したPDF / {formatFileSize(pdfFileInfo.size)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-slate-700">
                  選択中のPDFはありません
                </p>
                <p className="text-xs text-slate-500">
                  ファイル名とサイズは選択後にここへ表示されます。
                </p>
              </div>
            )}
          </div>

          <div
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500"
            aria-live="polite"
          >
            {isLoading && pdfFileInfo ? "PDF要約中" : "上限 10MB"}
          </div>
        </div>

        {isLoading && pdfFileInfo && (
          <p className="text-xs text-slate-500" aria-live="polite">
            {pdfFileInfo.name} を解析して要約しています。完了までしばらくお待ちください。
          </p>
        )}

        {pdfUploadError && (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {pdfUploadError}
          </p>
        )}

        <p className="text-xs text-slate-500">
          大きなPDFは処理に時間がかかる場合があります。10MBを超えるPDFはアップロード前にブロックされます。
        </p>
      </div>
    </div>
  );
}
