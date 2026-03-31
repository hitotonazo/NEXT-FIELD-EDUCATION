# NEXT FIELD EDUCATION site01 v4

## R2 画像配信の設定
1. Cloudflare R2 に `site01/images` 配下の画像をアップロード
2. `js/config.js` の `R2_PUBLIC_BASE` を公開URLへ差し替え
   - 例: `https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev/next-field-education`
3. 画像URLは `R2_PUBLIC_BASE/<画像パス>` として読み込みます
   - 例: `https://pub-.../next-field-education/img_hero_1600x900.png`
   - 例: `https://pub-.../next-field-education/anomaly/img_warning_1200x800.png`
   - 例: `https://pub-.../next-field-education/truth/img_subject_034_1200x800.png`

## 実装方針
- HTML 上は `images/...` のまま置き、`js/script.js` で R2 URL に置き換えます
- `R2_PUBLIC_BASE` が未設定でも、ローカルの `images/` を読むフォールバック付きです
- X共有の元URLは `DEFAULT_SHARE_URL` を初期値にしています
