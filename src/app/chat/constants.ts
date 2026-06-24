import type { Mode, ModeOption } from "./types";

export const MAX_PDF_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const BACKEND_HEALTH_CHECK_TIMEOUT_MS = 5000;
export const BACKEND_HEALTH_CHECK_INTERVAL_MS = 3000;
export const BACKEND_HEALTH_CHECK_MAX_WAIT_MS = 90000;

export const modeOptions: Record<Mode, ModeOption> = {
  chat: {
    label: "チャット",
    description: "質問や相談に回答",
    emptyTitle: "質問や相談内容を入力してください",
    emptyDescription: "会話履歴を踏まえて、AIが自然な回答を生成します。",
    loadingText: "回答を生成しています",
    placeholder: "質問や相談内容を入力してください",
    sampleInput:
      "生成AIを業務アプリに導入するメリットと注意点を、初心者にも分かるように説明してください。",
  },
  "text-summary": {
    label: "文章要約",
    description: "長文を短く整理",
    emptyTitle: "要約したい文章を貼り付けてください",
    emptyDescription: "長い文章から重要なポイントを短く整理します。",
    loadingText: "文章を要約しています",
    placeholder: "要約したい文章を貼り付けてください",
    sampleInput:
      "生成AIは、文章作成、要約、分類、検索補助、コード生成など、さまざまな業務に活用できます。一方で、入力情報の取り扱い、出力結果の正確性、著作権やセキュリティへの配慮が必要です。そのため、業務導入時には利用目的を明確にし、機密情報を入力しないルールや、人間による確認プロセスを整備することが重要です。",
  },
  "pdf-summary": {
    label: "PDF要約",
    description: "PDFを読み取り要約",
    emptyTitle: "PDFファイルを選択してください",
    emptyDescription: "10MB以下のPDFをアップロードすると、自動で要約を開始します。",
    loadingText: "PDFを解析して要約しています",
    placeholder: "",
  },
};

export const modeEntries = Object.entries(modeOptions) as [
  Mode,
  (typeof modeOptions)[Mode],
][];
