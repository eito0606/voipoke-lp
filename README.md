# voipoke-lp

VoiPoke の事前登録ランディングページ。

- **公開 URL**：https://voipoke.reverb-lab.com
- **配信**：Vercel
- **ドメイン**：Cloudflare Registrar `reverb-lab.com` のサブドメイン
- **テーマ**：ダークグリーンテック近未来（エイト・カンパニー統一ブランド）

---

## 構成

```
voipoke-lp/
├── index.html      ← 事前登録ページ本体
├── style.css       ← スタイル（ダークグリーンテック近未来）
├── script.js       ← カウントダウン + フォーム送信
├── vercel.json     ← Vercel 設定（セキュリティヘッダー含む）
├── README.md       ← この文書
└── .gitignore
```

法務文書（privacy / terms / tokushoho / creator-terms）と FAQ（support）は **Phase 2** で追加。
ASC 申請（W-4 = 6/1）までに揃えれば OK。

---

## ローカル開発

依存ゼロ。任意の静的サーバーで開ける。

```bash
# Python 標準サーバー
cd /Users/hidehisa/voipoke-lp
python3 -m http.server 8000
# → http://localhost:8000 を開く

# または npx
npx serve .
```

---

## デプロイ手順（初回のみ）

### 1. GitHub リポジトリ作成

```bash
cd /Users/hidehisa/voipoke-lp
git init
git add .
git commit -m "init: VoiPoke LP minimum viable"

# GitHub に新規リポジトリ作成（gh CLI を使う場合）
gh repo create voipoke-lp --public --source=. --push
# 手動の場合：https://github.com/new で voipoke-lp を作成 → push
```

### 2. Vercel に Import

1. https://vercel.com/new にアクセス
2. `voipoke-lp` リポジトリを Import
3. Framework Preset：**Other**
4. Build Command：（空）
5. Output Directory：`./`
6. 「Deploy」をクリック → 5秒で完了

### 3. カスタムドメイン voipoke.reverb-lab.com 接続

1. Vercel プロジェクト → Settings → Domains → Add
2. `voipoke.reverb-lab.com` を入力
3. 表示された CNAME 値をコピー（通常 `cname.vercel-dns.com`）
4. Cloudflare DNS（reverb-lab.com）に CNAME 追加：
   - Type: CNAME / Name: voipoke / Target: cname.vercel-dns.com
   - **Proxy: DNS only（オレンジ雲 OFF）**
5. SSL 発行待ち（5-15分）→ 完了

詳細：`/Users/hidehisa/VoiPoke/spec/eito-w9-manual-tasks-guide.md` タスク①

---

## 事前登録フォームの送信先

`index.html` の `<form action="https://formspree.io/f/REPLACE_ME">` を実エンドポイントに差し替え。

### 候補

| 選択肢 | 月コスト | セットアップ | おすすめ |
|---|---|---|---|
| **Formspree** | 月50件無料 / 以降 $10/月 | エンドポイント発行のみ、HTML だけで動く | ⭐⭐⭐⭐⭐（最初の1ヶ月） |
| Cloudflare Workers + Resend | ほぼ無料 | Worker 1ファイル + Resend API キー | ⭐⭐⭐⭐（中規模） |
| Supabase Edge Function | 無料枠内 | VoiPoke 本体と同じスタックで統一 | ⭐⭐⭐（本格運用） |

### Formspree の最短セットアップ

1. https://formspree.io/register で登録
2. 「+ New Form」→ 名前「voipoke-signup」→ Create
3. 表示されたエンドポイント（例：`https://formspree.io/f/xpzgjkrl`）をコピー
4. `index.html` の `REPLACE_ME` を置換
5. commit → push → Vercel が自動デプロイ
6. テスト送信 → エイトのメールに届くか確認

---

## ブランド統一ルール

エイト・カンパニーの統一ブランド：
- **テーマ**：ダークグリーンテック近未来
- **メインカラー**：`#1A4D2E` ／ アクセント `#3FE0A0`
- **背景**：`#0A0E0A`
- **フォント**：Inter（英）+ Noto Sans JP（和）
- **言葉**：ひらがな7割、漢字3割
- **AI-slop NG**：「ぜひ」「素敵」「素晴らしい」を使わない
- **読解力低い前提**：9割直感で理解できる UI

---

## ぼいラボ Discord との関係

ぼいラボの招待 URL は変更不可：`https://discord.gg/FYdyCQgztg`。
voilab.reverb-lab.com のような Web ページは作らない（Discord 直リンクで誘導）。

---

## 関連ドキュメント

- 統合運用仕様書：`/Users/hidehisa/VoiPoke/spec/voipoke-launch-master-spec.md`
- エイト手動タスク手順書：`/Users/hidehisa/VoiPoke/spec/eito-w9-manual-tasks-guide.md`
- 法務文書原本（HTML 化前）：`/Users/hidehisa/VoiPoke/legal/`

---

## 改定履歴

- 2026-04-27：v0.1 初版（最小版、index/style/script のみ）
