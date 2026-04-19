# 3Dひろば

3Dペンユーザーの作品を集めたギャラリーコミュニティサイト。特定ブランドに依存せず、3Dペンを楽しむユーザー全体のための場所です。[Scrib3D](https://scrib3d.com/)（スクリブ3D）が公式パートナーとしてコミュニティを支援しています。

## 特徴

- **2系統の作品ソース**
  1. Instagramの特定ハッシュタグ（既定: `#3dひろば`）を Graph API で自動取得
  2. 管理者が手動で選定したピックアップ作品を `data/manual-posts.json` で管理
- **Next.js 14 App Router + TypeScript + Tailwind CSS**
- **Vercel にそのままデプロイ可能**（DB不要、環境変数のみ設定）
- **日本語UI**、シンプルな構成

## セットアップ

```bash
npm install
cp .env.example .env.local   # Instagram 連携を使う場合のみ編集
npm run dev
```

`http://localhost:3000` で表示されます。

### 型チェック

```bash
npm run typecheck
```

### ビルド

```bash
npm run build
npm start
```

## 作品データの管理

### 1. 手動ピックアップ（JSONファイル）

`data/manual-posts.json` の `posts` 配列にエントリを追加するだけ。

```json
{
  "id": "manual-007",
  "title": "作品タイトル",
  "author": "@username",
  "authorUrl": "https://www.instagram.com/username/",
  "imageUrl": "https://.../image.jpg",
  "caption": "作品説明",
  "tags": ["3dひろば", "ドラゴン"],
  "permalink": "https://www.instagram.com/p/xxx/",
  "postedAt": "2026-04-01"
}
```

`next.config.mjs` の `images.remotePatterns` に必要に応じて画像ホストを追加してください。

### 2. Instagram 連携（ハッシュタグ自動取得）

Instagram Graph API の [Hashtag Search](https://developers.facebook.com/docs/instagram-api/guides/hashtag-search/) を利用します。
以下の環境変数を設定すると自動で取得されます。未設定でも JSON 由来のピックアップのみで動作します。

| 環境変数 | 説明 |
| --- | --- |
| `INSTAGRAM_ACCESS_TOKEN` | 長期アクセストークン |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Instagram ビジネス/クリエイターアカウントの ID |
| `INSTAGRAM_HASHTAG` | 取得対象のハッシュタグ（既定: `3dひろば`） |

ISR により1時間ごとに再検証されます（`app/page.tsx` の `revalidate = 3600`）。

## ディレクトリ構成

```
app/
  layout.tsx          # 全体レイアウト
  page.tsx            # ホーム（ギャラリー）
  about/page.tsx      # 3Dひろばとは
  partners/page.tsx   # 公式パートナー（Scrib3D）
  submit/page.tsx     # 投稿方法
  api/instagram/route.ts  # IG 取得のJSONエンドポイント
components/           # UI コンポーネント
lib/
  types.ts
  manual-posts.ts     # JSON 読み込み
  instagram.ts        # Graph API 呼び出し
  posts.ts            # 2ソースのマージ
data/manual-posts.json
```

## Vercel へのデプロイ

1. GitHub に push
2. Vercel で Import
3. 必要に応じて上記環境変数を設定
4. デプロイ
