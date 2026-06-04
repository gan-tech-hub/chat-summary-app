# AI Chat & PDF Summary Frontend

Next.js と TypeScript で構築した、生成AIチャット・テキスト要約・PDF要約アプリのフロントエンドです。

FastAPIバックエンドと連携し、OpenAI APIを利用したチャット応答、テキスト要約、PDF要約を画面から操作できます。OpenAI APIキーはバックエンド側でのみ管理し、フロントエンドには公開しません。

## Features

- チャットモード
- テキスト要約モード
- PDF要約モード
- PDFアップロード
- PDFファイルサイズの事前チェック
- Backendから返された標準APIレスポンスの表示
- エラーメッセージ表示
- ローディングスピナー表示

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Fetch API

## Architecture

```text
Browser
   |
   v
Next.js Frontend
   |
   | NEXT_PUBLIC_API_URL
   v
FastAPI Backend
   |
   v
OpenAI API
```

## Backend Integration

Frontendは以下の環境変数を使ってFastAPI Backendへリクエストします。

`.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

末尾にスラッシュ `/` は付けません。

## API Response Handling

Backendは以下の標準形式でレスポンスを返します。

成功時:

```json
{
  "success": true,
  "data": {
    "message": "要約またはチャット応答本文"
  },
  "error": null
}
```

エラー時:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "PDF_FILE_TOO_LARGE",
    "message": "PDFファイルサイズが大きすぎます。10MB以下のPDFをアップロードしてください。"
  }
}
```

Frontendでは `data.message` または `error.message` を表示します。

## PDF Upload Guard

Frontend側でも、10MBを超えるPDFはバックエンドへ送信する前にブロックします。

```text
Max PDF file size: 10MB
```

これにより、大容量PDFを送信してバックエンド処理が重くなる前に、ユーザーへ分かりやすいエラーを表示します。

## Directory Structure

```text
chat-summary-app/
├── public/
├── src/
│   └── app/
│       ├── chat/
│       │   └── page.tsx
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

## Main Files

| File | Responsibility |
| --- | --- |
| `src/app/chat/page.tsx` | チャットUI、モード切替、PDFアップロード、APIレスポンス表示 |
| `src/app/layout.tsx` | Next.js App Routerの共通レイアウト |
| `src/app/globals.css` | Tailwind CSSとグローバルスタイル |
| `package.json` | scriptsと依存関係 |

## Local Setup

Windows PowerShellでの起動例です。

```powershell
cd C:\dev\GItHub\fastapi_app\chat-summary-app
npm install
Set-Content -Path .env.local -Value "NEXT_PUBLIC_API_URL=http://localhost:8000" -Encoding ascii
npm run dev
```

起動後:

```text
http://localhost:3000/chat
```

Backendも別ターミナルで起動しておきます。

```powershell
cd C:\dev\GItHub\fastapi_app\fastapi-gpt-app
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

## Development Note

Codexサイドパネルなどで `npm` が認識されない場合は、Node.jsのPATHが通っていない可能性があります。すでに `node_modules` が存在する場合は、Node.jsからNext.jsを直接起動できます。

```powershell
cd C:\dev\GItHub\fastapi_app\chat-summary-app
& "C:\Users\gan01\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" .\node_modules\next\dist\bin\next dev
```

## Operation Check

- チャットモードで応答が表示される
- テキスト要約モードで要約が表示される
- PDF要約モードで短いPDFが要約される
- 10MB超PDFでエラーが表示される
- Backend停止時に通信エラーが表示される

## Portfolio Highlights

- Next.jsからFastAPI Backendを呼び出すフロントエンド実装
- OpenAI APIキーをFrontendに持たせない安全な構成
- Backendの標準APIレスポンス `success / data / error` に対応
- PDFアップロード前のファイルサイズチェック
- ユーザーに分かりやすいエラー表示とローディング表示

## Future Improvements

- PDFファイル名・サイズの表示
- 要約中の詳細ステータス表示
- 要約スタイル選択
- 要約結果のコピー・ダウンロード
- PDF内容への質問機能
- UIデザインの改善
