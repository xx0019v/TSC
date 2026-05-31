# TSC Concierge AI — Cloudflare Worker

サイトのチャット UI から AI（Anthropic Claude Haiku）に問い合わせるための小さなプロキシ Worker。
API キーをブラウザに出さず、Cloudflare 側で安全に保管します。

---

## 1. 用意するもの

- Cloudflare アカウント（無料）
- Anthropic の API キー
  - 取得: <https://console.anthropic.com/settings/keys>
  - 「Create Key」→ コピーしておく
- Node.js 18+ がローカルにあること

費用目安：Claude Haiku 4.5 で 1 往復あたり ¥0.2〜0.5。月 100 往復で **¥30〜50/月** 程度。

---

## 2. wrangler のセットアップ（初回のみ）

```bash
npm install -g wrangler
cd /Users/exx/aurum-experience/worker
wrangler login
```

ブラウザが開いて Cloudflare にログイン → 認可。

---

## 3. API キーを Cloudflare に登録

ブラウザではなく **サーバー側（Worker）** に保存します。

```bash
cd /Users/exx/aurum-experience/worker
wrangler secret put ANTHROPIC_API_KEY
```

プロンプトで Anthropic の API キー（`sk-ant-...`）を貼り付け → Enter。

---

## 4. デプロイ

```bash
wrangler deploy
```

数秒後に URL が返ってきます：

```
https://tsc-concierge-ai.<your-account>.workers.dev
```

ブラウザで開いてみる → `{"status":"ok","service":"tsc-concierge-ai"}` が表示されれば成功。

---

## 5. サイト側に URL を設定

`src/lib/conciergeFlow.js` の先頭：

```js
export const AI_ENDPOINT = ""; // ← ここに上の URL を貼る
```

を

```js
export const AI_ENDPOINT = "https://tsc-concierge-ai.<your-account>.workers.dev";
```

に変更 → 通常通りビルド & デプロイ：

```bash
cd /Users/exx/aurum-experience
npm run build
# dist/index.html を本番反映する
```

これで チャット UI に **自由入力欄** が出現し、AI 応答が動きます。

---

## 6. 動作確認

サイトのチャットを開く → 下のテキスト入力に「業務で英語の電話会議が増えそうなんですが」など入力 → 送信。
2〜4 秒後に AI からの応答が返ってきます。

---

## 7. 後で変えたい時

### モデルを変える
`wrangler.toml` の `[vars]` で `MODEL = "claude-sonnet-4-5"` 等を指定 → `wrangler deploy`。

### 許可するドメインを増やす（独自ドメインに移行した時など）
```bash
wrangler secret put ALLOWED_ORIGINS
# 値: https://xx0019v.github.io,https://tsc.example.com
```

### キーをローテーションしたい
```bash
wrangler secret put ANTHROPIC_API_KEY
# 新しいキーを入れる
```

### 削除したい
```bash
wrangler delete tsc-concierge-ai
```

---

## 8. システムプロンプトのカスタマイズ

`src/index.js` の `SYSTEM_PROMPT` を編集 → `wrangler deploy`。
レッスン詳細・キャンペーン情報・FAQ など追加すると AI の回答精度が上がります。
