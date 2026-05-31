# TSC Concierge AI — Cloudflare Worker

サイトのチャット UI から AI に問い合わせる小さなプロキシ Worker。

**デフォルトはコスト ¥0**（Cloudflare Workers AI 無料枠）。後から Anthropic Claude にアップグレードも可能。

---

## 1. 用意するもの（必須）

- Cloudflare アカウント（無料）
- Node.js 18+

API キーは **不要**。

---

## 2. wrangler のセットアップ（初回のみ）

```bash
npm install -g wrangler
cd /Users/exx/aurum-experience/worker
wrangler login
```

ブラウザが開いて Cloudflare にログイン → 認可。

---

## 3. デプロイ（コマンド 1 回）

```bash
wrangler deploy
```

数秒で URL が返ってきます：

```
https://tsc-concierge-ai.<your-account>.workers.dev
```

ブラウザで開く → `{"status":"ok","service":"tsc-concierge-ai","provider":"cloudflare-ai"}` が表示されれば成功。

---

## 4. サイト側に URL を設定

`src/lib/conciergeFlow.js`：

```js
export const AI_ENDPOINT = "";
```

を

```js
export const AI_ENDPOINT = "https://tsc-concierge-ai.<your-account>.workers.dev";
```

に変更 → 通常のビルド & デプロイ。

```bash
cd /Users/exx/aurum-experience
npm run build
# dist/index.html を本番反映
```

これで チャット UI の自由入力欄が動きます。

---

## 5. コスト

| 項目 | 無料枠 | TSC 想定使用量 |
|---|---|---|
| Cloudflare Workers (compute) | 100,000 req/日 | 100req/日 程度 |
| Workers AI (Llama 3.1 8B) | 10,000 ニューロン/日 | ≈ 3,000 往復/日まで無料 |

→ TSC 規模なら **完全に ¥0** で運用可能。

---

## 6. 後で品質を上げたい場合（Anthropic Claude へアップグレード）

Cloudflare Workers AI の Llama 3.1 8B は実用十分ですが、より自然な応答が欲しくなったら Claude にも切り替えられます（小額課金あり、月 ¥30〜50 目安）。

```bash
wrangler secret put ANTHROPIC_API_KEY
# Anthropic Console (https://console.anthropic.com/settings/keys) で取得した
# sk-ant-... を貼り付け
wrangler deploy
```

Worker は **キーが設定されていれば自動的に Anthropic を優先**します。元に戻すには:

```bash
wrangler secret delete ANTHROPIC_API_KEY
```

---

## 7. 後で変えたい時

### モデルを変える
`wrangler.toml` の `[vars]` に追記して `wrangler deploy`。

```toml
[vars]
MODEL_CF = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"   # より高品質
# または
MODEL_CF = "@cf/qwen/qwen1.5-14b-chat-awq"              # 日本語に強い
```

### 許可ドメインを増やす
```toml
[vars]
ALLOWED_ORIGINS = "https://xx0019v.github.io,https://tsc.example.com"
```

### 削除
```bash
wrangler delete tsc-concierge-ai
```

---

## 8. システムプロンプトの編集

`src/index.js` の `SYSTEM_PROMPT` を編集 → `wrangler deploy`。
レッスン詳細・キャンペーン情報・FAQ など追加すると AI 回答の精度が上がります。
