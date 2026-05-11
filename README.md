# KOGI Brain - 店舗マニュアル検索

スタッフ用スマホ画面。高級感のある韓国居酒屋スタイルのUIです。

## セットアップ

```bash
npm install
npm run dev
```

## 環境変数

`.env.local` はすでに設定済みです：

```
NEXT_PUBLIC_SUPABASE_URL=https://uevprxenlymbdhgreeuv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Supabase テーブル構造

### staffs
| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| name | text | スタッフ名 |
| is_active | boolean | 有効/無効 |
| created_at | timestamptz | 作成日時 |

### manuals
| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| title | text | タイトル |
| content | text | 本文 |
| memo | text (nullable) | 補足メモ |
| category | text (nullable) | カテゴリ |
| tags | text[] (nullable) | タグ |
| created_at / updated_at | timestamptz | 日時 |

### logs
| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| staff_name | text | スタッフ名 |
| question | text | 検索クエリ |
| answer | text (nullable) | 最初のヒット内容 |
| category | text (nullable) | カテゴリ |
| created_at | timestamp | 作成日時 |

## ⚠️ セキュリティ注意事項

現在 RLS（Row Level Security）が無効です。
本番環境では以下を実行してください：

```sql
ALTER TABLE public.staffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
```

詳細: https://supabase.com/docs/guides/database/postgres/row-level-security
