# VoiPoke LP 画像生成プロンプト集（2026-06-13）

VoiPoke LP（voipoke-lp.reverb-lab.com）用の画像9枚を Genspark / GPT Image 2 で生成するためのプロンプト集。

## ブランド/ガード（生成前に必ず確認）
- テーマ：白緑グラスモーフィズム近未来（high-key / 明るい / クリーン）
- カラー基準（`/Users/hidehisa/voilab-lp/index.html` トークン踏襲）
  - `--mint #10b981`（メインの緑）
  - `--mint-deep #047857`（深い緑・アクセント）
  - `--mint-tint #d8f0e6`（淡いミント・面）
  - `--paper #eef5f0` / `--paper-2 #e3eee8`（紙のような明色地）
  - ガラス面＝白の半透明（rgba(255,255,255,.58〜.78)）+ ぼかし
- 被写体は実写の日本人。ダーク/重い雰囲気は禁止。
- 画像内に文字・ロゴ・透かし・絵文字・矢印記号は入れない（全部UI側で付ける）。
- 未発売（2026-06-30予定）なので、発売済み・実績・口コミ・残数を匂わせる演出は入れない。純粋に「体験の雰囲気」だけを描く。
- 需要側（リスナー）の画像なので、養成所・オーディション・ボイトレといった供給側の語や小道具は一切混ぜない。
- 環境音は全8種（確定値）。本数を画面に描く必要はない。

## 画像src規約（生成後の配置先）
| 用途 | 配置パス | 状態 |
|---|---|---|
| ヒーロー丸窓1 | `/LP_HERO1.jpeg` | 既存（生成不要） |
| ヒーロー丸窓2 | `/LP_HERO2.jpeg` | 本書で生成 |
| ヒーロー丸窓3 | `/LP_HERO3.jpeg` | 本書で生成 |
| 日常1（家事の合間に） | `/assets/daily-1.jpeg` | 本書で生成 |
| 日常2（作業のおとも） | `/assets/daily-2.jpeg` | 本書で生成 |
| 日常3（眠る前にベッドで） | `/assets/daily-3.jpeg` | 本書で生成 |
| 比較4（従来・無機質） | `/assets/compare-1a.jpeg` | 本書で生成 |
| 比較5（VoiPoke・没入） | `/assets/compare-1b.jpeg` | 本書で生成 |
| 比較6（従来・画面に縛られ単調） | `/assets/compare-2a.jpeg` | 本書で生成 |
| 比較7（VoiPoke・場所を選び自由） | `/assets/compare-2b.jpeg` | 本書で生成 |

> LP_HERO2 / LP_HERO3 と日常/比較画像は未生成のため、`img` に `onerror` で白緑のプレースホルダ（薄緑地 `--mint-tint` + 「準備中」ラベル）を出すと親切。後でエイトが差し込む。

---

## 1. LP_HERO2（ヒーロー丸窓・夜ベッドでヘッドホン）
配置先：`/LP_HERO2.jpeg`
【アスペクト比】1:1（正方形／丸窓マスク前提・中心に被写体）

```
A photoreal Japanese woman in her mid-twenties lying relaxed on a bed at night, wearing soft over-ear headphones, eyes gently closed with a calm contented half-smile. Soft bedside lamp glow kept high-key and airy, not dark. Bedding and walls in clean off-white and pale mint-green tones. She is the centered focus, framed for a circular window crop with breathing room around the head and shoulders. Tranquil, immersive, blissful private listening moment. Shallow depth of field with a soft blurred background. Subtle frosted-glass light bloom in the corners.
```

## 2. LP_HERO3（ヒーロー丸窓・通勤中に聴く）
配置先：`/LP_HERO3.jpeg`
【アスペクト比】1:1（正方形／丸窓マスク前提・中心に被写体）

```
A photoreal Japanese woman in her mid-twenties commuting, standing near a bright train window in daylight, wearing slim wireless earbuds, gazing softly outside with a serene relaxed expression as if absorbed in audio. Bright high-key morning light, airy clean atmosphere. Outfit in soft white and pale mint-green palette, surroundings light and minimal. Centered composition with space around the head and shoulders for a circular window crop. Modern near-future calm mood. Shallow depth of field, softly blurred bright background, subtle frosted-glass bloom at the edges.
```

---

## 3. 画像1 / 家事の合間に（2×3カードの画像側）
配置先：`/assets/daily-1.jpeg`
【アスペクト比】4:3（横）

```
A photoreal Japanese woman in her mid-twenties at home doing light housework, pausing for a moment with one wireless earbud in, a soft relieved smile as she listens. Bright airy kitchen or living space in clean white and pale mint-green tones, plants and soft daylight. Casual comfortable loungewear. Candid lifestyle moment, warm and effortless. High-key lighting, gentle shadows, shallow depth of field, soft frosted-glass light in the background.
```

## 4. 画像2 / 作業のおとも（2×3カードの画像側）
配置先：`/assets/daily-2.jpeg`
【アスペクト比】4:3（横）

```
A photoreal Japanese woman in her mid-twenties working at a tidy home desk, wearing soft on-ear headphones while focused on a laptop, relaxed shoulders and a calm absorbed expression. Bright minimal workspace in white and pale mint-green tones with a small plant and soft daylight from a window. Clean near-future ambience, comfortable and focused. High-key lighting, shallow depth of field, softly blurred background, subtle frosted-glass glow.
```

## 5. 画像3 / 眠る前にベッドで（2×3カードの画像側）
配置先：`/assets/daily-3.jpeg`
【アスペクト比】4:3（横）

```
A photoreal Japanese woman in her mid-twenties settling into bed before sleep, lying on a pillow with wireless earbuds in, eyes softly closed, a peaceful unwinding expression. Kept bright and airy with a soft warm bedside glow, not dark or moody. Bedding and room in clean white and pale mint-green tones. Cozy intimate end-of-day calm. High-key soft lighting, shallow depth of field, gently blurred background, subtle frosted-glass light bloom.
```

---

## 6. 画像4 / 従来ASMR（比較 before・無機質）
配置先：`/assets/compare-1a.jpeg`
【アスペクト比】1:1（正方形推奨）

```
A photoreal Japanese woman in her mid-twenties listening to audio with headphones but looking faintly bored and unsatisfied, a slightly tired flat expression as if hearing the same thing again. Plain ordinary room, muted desaturated palette, a little dull and impersonal, flat even lighting with no warmth. Sense of monotony and detachment. Realistic candid framing, neutral background. No text or logo.
```

## 7. 画像5 / VoiPoke（比較 after・距離を選べて没入）
配置先：`/assets/compare-1b.jpeg`
【アスペクト比】1:1（正方形推奨）

```
A photoreal Japanese woman in her mid-twenties deeply immersed in audio with soft headphones, eyes gently closed, a satisfied blissful smile, as if the sound feels vividly close and present. Bright airy interior in clean white and pale mint-green tones, soft natural daylight, fresh and uplifting. Sense of rich immersion and control over how near the voice feels. High-key lighting, shallow depth of field, soft blurred background, subtle frosted-glass light bloom. No text or logo.
```

## 8. 画像6 / 従来（比較 before・画面に縛られ単調）
配置先：`/assets/compare-2a.jpeg`
【アスペクト比】1:1（正方形推奨）

```
A photoreal Japanese woman in her mid-twenties sitting hunched and tethered to a phone screen, eyes fixed on the display in a rigid static posture, a slightly weary monotonous expression. Plain dim-leaning ordinary room, muted desaturated tones, flat lighting, confined and repetitive feeling. Realistic candid framing, neutral cluttered background suggesting being stuck in one spot. No text or logo.
```

## 9. 画像7 / VoiPoke（比較 after・場所を選び自由・ながら）
配置先：`/assets/compare-2b.jpeg`
【アスペクト比】1:1（正方形推奨）

```
A photoreal Japanese woman in her mid-twenties relaxing freely, away from any screen, listening with wireless earbuds while stretching or sipping tea by a bright window, an easy comfortable smile, free to move around. Bright airy space in clean white and pale mint-green tones, soft daylight, open and unrestricted feeling. Sense of freedom to listen anywhere while doing something else. High-key lighting, shallow depth of field, softly blurred bright background, subtle frosted-glass glow. No text or logo.
```

---

## 共通 STYLE / NEG ブロック（全プロンプト末尾に必ず追記）

### STYLE（足す）
```
STYLE: white-green glassmorphism near-future aesthetic, photoreal Japanese subject, high-key bright airy lighting, clean off-white and pale mint-green palette (mint #10b981, deep mint #047857, mint tint #d8f0e6, paper #eef5f0), soft frosted-glass light and gentle bloom, calm intentional modern mood, natural skin and realistic textures, shallow depth of field.
```

### NEG（避ける／除外する）
```
NEG: no text, no letters, no captions, no logo, no watermark, no UI elements, no emoji, no arrows or directional symbols; no dark mood, no moody low-key lighting, no heavy shadows, no neon cyberpunk; no oversaturated colors, no harsh contrast; no extra fingers, no distorted hands, no deformed face, no extra limbs; no studio microphone, no audio booth, no recording equipment (listener scenes only); no clutter, no busy background.
```

> 比較 before（画像4・6）だけは high-key を弱め、STYLE の "high-key bright airy lighting" を "flat muted neutral lighting" に置き換える。after（画像5・7）と日常/ヒーローは STYLE をそのまま使う。
