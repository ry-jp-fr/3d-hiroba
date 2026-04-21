# 3Dひろば

3Dペンユーザーの作品を集めたギャラリーコミュニティサイト。特定ブランドに依存せず、3Dペンを楽しむユーザー全体のための場所です。[Scrib3D](https://scrib3d.com/)（スクリブ3D）が公式パートナーとしてコミュニティを支援しています。

## 特徴

- **3つの作品選定方法を GUI で管理** (`/admin`)
  1. ハッシュタグ登録による Instagram 自動取得
  2. Instagram 投稿 URL のピンポイント登録
  3. 画像・動画の手動アップロード
- **Next.js App Router + TypeScript + Tailwind CSS**
- **Vercel にそのままデプロイ可能**（DB不要）
- **日本語UI**、シンプルな構成

## セットアップ

```bash
npm install
cp .env.example .env.local   # Instagram 連携 / 管理画面パスワードを設定
npm run dev
```

- サイト: `http://localhost:3000`
- 管理画面: `http://localhost:3000/admin`

### 型チェック

```bash
npm run typecheck
```

### ビルド

```bash
npm run build
npm start
```

## 作品管理ダッシュボード

管理画面 `/admin` から、3つの方法で掲載作品を選定できます。編集内容は
`data/curation.json` に保存され、サイト側のキャッシュは自動的に再検証されます。

### 1. ハッシュタグで選定 (`/admin/hashtags`)

ハッシュタグを登録すると、Instagram Graph API でそのタグの最近の投稿を取得して
ギャラリーに反映します。スイッチで一時停止も可能です。

### 2. URLで選定 (`/admin/instagram-urls`)

Instagram の投稿 URL と、カバー画像 URL・キャプションなどを登録して
ピンポイントで掲載します。Instagram の画像は直リンクが制限される場合があるため、
Cloudinary などにアップロードした画像 URL を使うのが安全です。

### 3. 手動アップロード (`/admin/uploads`)

ブラウザから画像・動画を直接アップロードします。ファイルは
`public/uploads/` に保存され、サイトから直接配信されます。
動画 (mp4 / mov / webm) の場合はカバー画像も任意でアップロードできます。

> Vercel などエフェメラルなランタイムにデプロイする場合は、
> アップロード先を Vercel Blob / S3 / Cloudinary 等の外部ストレージに
> 差し替えることを推奨します（`app/api/admin/upload/route.ts` を編集）。

## 環境変数

| 環境変数 | 説明 |
| --- | --- |
| `INSTAGRAM_ACCESS_TOKEN` | Instagram Graph API の長期アクセストークン |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Instagram ビジネス/クリエイターアカウントID |
| `INSTAGRAM_HASHTAG` | 管理画面にハッシュタグ登録がない場合のフォールバック（既定: `3dひろば`） |
| `ADMIN_PASSWORD` | `/admin` のログインパスワード。未設定時は誰でもアクセス可能 |

ISR により1時間ごとにハッシュタグ経由の取得がキャッシュされます (`revalidate = 3600`)。

## ディレクトリ構成

```
app/
  layout.tsx                 # 全体レイアウト
  page.tsx                   # ホーム（ギャラリー）
  about/ partners/ submit/   # 固定ページ
  admin/                     # 作品管理ダッシュボード
    page.tsx                 # 概要
    hashtags/                # ハッシュタグ管理
    instagram-urls/          # URL 選定管理
    uploads/                 # 手動アップロード管理
    login/                   # ログイン
  api/
    instagram/route.ts       # Instagram取得の公開エンドポイント
    admin/
      hashtags/route.ts      # ハッシュタグ CRUD
      picks/route.ts         # URL選定・手動アップロードの CRUD
      upload/route.ts        # ファイルアップロード
      login/route.ts         # 管理画面ログイン
components/                  # 公開UIコンポーネント
lib/
  types.ts
  manual-posts.ts            # 旧 JSON 読み込み（後方互換）
  curation.ts                # /admin のストレージ層
  curation-posts.ts          # curation.json → GalleryPost
  instagram.ts               # Graph API 呼び出し
  posts.ts                   # 3ソースのマージ
  admin-auth.ts              # 管理画面認証
data/
  manual-posts.json          # 既存の手動ピックアップ（編集不要）
  curation.json              # 管理画面で編集されるデータ
public/uploads/              # 手動アップロードの保存先
```

## Vercel へのデプロイ

1. GitHub に push
2. Vercel で Import
3. 上記環境変数を設定
4. **Vercel Blob ストレージを作成**（管理画面で永続化するため）
   - Vercel ダッシュボーム → プロジェクト → **Storage** → **Create** → **Blob**
   - 作成すると `BLOB_READ_WRITE_TOKEN` が自動で環境変数に追加されます
5. デプロイ

### データ永続化の仕組み

`BLOB_READ_WRITE_TOKEN` が設定されている場合、管理画面の以下のデータは Vercel Blob に保存されます:

- **`data/curation.json`** → Vercel Blob の `curation/curation.json`
- **アップロード画像/動画** → Vercel Blob の `uploads/*`

`BLOB_READ_WRITE_TOKEN` が未設定の場合（ローカル開発時など）は、従来通り
`data/curation.json` と `public/uploads/` にファイルシステム経由で保存します。
