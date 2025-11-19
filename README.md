# 💬 Chat Summary App (Frontend)

OpenAI API × FastAPI バックエンドと連携した、チャット＆PDF要約Webアプリのフロントエンドです。

---

## 🌐 アプリ概要

| 項目 | 内容 |
|------|------|
| フロントエンド | Next.js（App Router） |
| バックエンド | [FastAPI（Render）](https://chat-summary-backend.onrender.com) |
| デモURL | [https://chat-summary-app.vercel.app/chat](https://chat-summary-app.vercel.app/chat) |
| 機能 | - ChatGPT風チャット機能<br>- PDFをアップロードして要約表示 |

---

## 🧪 使用技術

- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui
- React Hook Form
- フロントバック連携：`fetch()`（API叩き）

---

## 🚀 セットアップ手順（ローカル）

```bash
# 依存パッケージのインストール
npm install

# .env.local を作成（環境変数を設定）
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 開発サーバー起動
npm run dev
```

---

## 🔐 環境変数（`.env.local`）

| 変数名                   | 説明                                                          |
| --------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | FastAPI側のURL（例：`https://chat-summary-backend.onrender.com`） |

※末尾に「スラッシュ `/`」を付けないよう注意！

---

## 🧭 機能一覧

### 🗨️ ChatGPT風チャット機能

* テキストを送信すると、OpenAI API（GPT）を経由して応答が返ってきます。
* ローディング中はスピナー表示。

### 📄 PDF要約機能

* PDFをアップロードすると、OpenAI APIが要約を生成。
* サーバー側は `/pdf-summary` エンドポイントを使用。

---

## 🔧 ディレクトリ構成（主なファイル）

```bash
next-fastapi-gpt/
├── app/
│   ├── page.tsx       # メインUI
│   ├── components/    # チャットUIなどのコンポーネント
├── public/            # PDFアップロード用UI
├── styles/            # グローバルCSS
├── .env.local         # 環境変数
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🌍 公開URL

* フロントエンド（Vercel）：[https://chat-summary-app.vercel.app/chat](https://chat-summary-app.vercel.app/chat)
* バックエンド（Render）：[https://chat-summary-backend.onrender.com](https://chat-summary-backend.onrender.com)

---

## 👤 作者

* 桜庭祐斗

[GitHub - gan-tech-hub](https://github.com/gan-tech-hub)

---

## 📷 スクリーンショット例

以下は画面のイメージ例です：

* **チャットモード**
<img width="615" height="822" alt="image" src="https://github.com/user-attachments/assets/f18c50cb-1d93-446d-926d-6f5b294e1981" />

* **テキスト要約モード**
<img width="615" height="831" alt="image" src="https://github.com/user-attachments/assets/9d4f7e16-0782-4b6e-b37c-d5930996ed55" />

* **PDF要約モード**
<img width="622" height="837" alt="image" src="https://github.com/user-attachments/assets/3bdfcd63-9da9-403d-8731-5722eb1b1f60" />

---

## ✅ 備考

* バックエンドとの連携が前提のアプリです。
* 開発環境ではFastAPIをローカル起動し、環境変数で切り替えてください。
