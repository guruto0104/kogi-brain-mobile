-- ============================================================
--  KOGI BRAIN  ダミーデータ INSERT SQL
--  Supabase SQL Editor に貼り付けて実行してください
-- ============================================================

-- 1. テーブル作成 -----------------------------------------------

create table if not exists staffs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists manuals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null,
  created_at timestamptz default now()
);

create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  staff_name text not null,
  question text not null,
  category text not null,
  created_at timestamptz default now()
);

-- 2. RLS 無効化（開発用。本番は適切に設定してください）----------
alter table staffs  disable row level security;
alter table manuals disable row level security;
alter table logs    disable row level security;

-- 3. スタッフデータ ---------------------------------------------
insert into staffs (name, is_active) values
  ('はると', true),
  ('たかし', true),
  ('ゆう',   true),
  ('ゆい',   true),
  ('ちえり', true)
on conflict do nothing;

-- 4. マニュアルデータ -------------------------------------------
insert into manuals (title, content, category) values
  ('レジの現金締めの手順',
   '1. POSレジの「締め」ボタンを押す。2. 現金を種類ごとに数える。3. レジ内現金と売上を照合する。4. 差異がある場合は店長に報告。5. 締め記録用紙に記入してファイルする。',
   'レジ・会計'),
  ('クーポンの使い方',
   'アプリクーポンは「クーポン確認」ボタンで表示を確認後、POSにクーポンコードを入力します。紙クーポンは回収してレジ横のボックスへ。割引は自動計算されます。',
   'レジ・会計'),
  ('領収書の発行手順',
   '「領収書」ボタンを押し、宛名と金額を確認して印刷。但し書きはお客様に確認。社名宛の場合は正式名称を入力してください。',
   'レジ・会計'),
  ('鶏肉の下処理の手順',
   '1. 流水で軽く洗う。2. 余分な脂肪を除去。3. 一口大にカット（約30g）。4. 塩・胡椒で下味。5. 10分置いてから使用。鮮度確認を必ず行うこと。',
   '仕込み・調理'),
  ('キムチの保存方法について',
   '仕込んだキムチは密封容器に入れ、冷蔵庫（4℃以下）で保存。開封後は7日以内に使用。発酵が進みすぎた場合はキムチチゲ用として活用可。',
   '仕込み・調理'),
  ('タレの配合レシピ',
   'ヤンニョムダレ：コチュジャン3：醤油1：砂糖0.5：にんにく0.3：ごま油0.2。大量仕込みの際は比率を守り、必ず試食確認してから提供。',
   '仕込み・調理'),
  ('アレルギー対応の基本について',
   'お客様からアレルギーの申告があった場合は必ず厨房に口頭で伝える。8大アレルゲン（小麦・卵・乳・そば・落花生・えび・かに・くるみ）を確認し、不明な場合は提供を断る。',
   '提供・接客'),
  ('お客様への声かけのタイミング',
   '着席後30秒以内にお水とおしぼりを提供。注文は2分以内に伺う。料理提供時は料理名を告げる。食事中は適度な間隔で様子を確認。お帰り際は必ず「ありがとうございました」。',
   '提供・接客'),
  ('クレーム対応マニュアル',
   'まず謝罪→原因確認→解決策提案の順で対応。料理に関するクレームはすぐに厨房に報告。返金・作り直しの判断は店長に相談。記録用紙に状況を記入。',
   '提供・接客'),
  ('アイスコーヒーの作り方',
   '1. エスプレッソを2ショット抽出。2. グラスに氷を満タンに入れる。3. ミルク（または水）を3/4まで注ぐ。4. エスプレッソをゆっくり注ぐ。5. ストローを添えて提供。',
   'ドリンク'),
  ('ビールサーバーの洗浄方法',
   '営業終了後：1. サーバーの電源を切る。2. ノズルを外して専用洗剤で洗浄。3. 水でよくすすぐ。4. 乾燥させてから再装着。週1回は内部ラインの洗浄も実施。',
   'ドリンク'),
  ('マッコリの提供温度',
   'マッコリは5℃前後で提供。よく振ってから注ぐ（沈殿物を混ぜる）。電子レンジ等での加熱は品質劣化の原因になるため禁止。賞味期限は開封後3日以内。',
   'ドリンク')
on conflict do nothing;

-- 5. ログデータ（今日の日付で生成）-----------------------------
do $$
declare
  today date := current_date;
  base_ts timestamptz;
begin
  base_ts := (today || ' 09:00:00')::timestamptz;

  insert into logs (staff_name, question, category, created_at) values
    ('はると', 'レジの現金締めの手順を教えてください',       'レジ・会計',  base_ts + interval '0 minutes'),
    ('たかし', '鶏肉の下処理の手順を教えてください',         '仕込み・調理', base_ts + interval '6 minutes'),
    ('ゆう',   'アレルギー対応の基本について',               '提供・接客',  base_ts + interval '12 minutes'),
    ('ゆい',   'アイスコーヒーの作り方を教えてください',     'ドリンク',    base_ts + interval '18 minutes'),
    ('ちえり', 'クーポンの使い方を教えてください',           'レジ・会計',  base_ts + interval '24 minutes'),
    ('はると', 'キムチの保存方法について',                   '仕込み・調理', base_ts + interval '30 minutes'),
    ('たかし', 'お客様への声かけのタイミングは？',           '提供・接客',  base_ts + interval '36 minutes'),
    ('ゆう',   'ビールサーバーの洗浄方法を教えてください',   'ドリンク',    base_ts + interval '42 minutes'),
    ('ゆい',   '領収書の発行手順を教えてください',           'レジ・会計',  base_ts + interval '48 minutes'),
    ('ちえり', 'タレの配合レシピを確認したい',               '仕込み・調理', base_ts + interval '54 minutes'),
    ('はると', 'クレーム対応マニュアルを見たい',             '提供・接客',  base_ts + interval '60 minutes'),
    ('たかし', 'マッコリの提供温度は何度？',                 'ドリンク',    base_ts + interval '66 minutes'),
    ('ゆう',   '現金締めの差異が出た場合の対応',             'レジ・会計',  base_ts + interval '72 minutes'),
    ('ゆい',   '鶏肉の保存期間について',                     '仕込み・調理', base_ts + interval '78 minutes'),
    ('ちえり', 'アレルゲン一覧を教えてください',             '提供・接客',  base_ts + interval '84 minutes'),
    ('はると', 'ドリンクのラストオーダーの案内方法',         'ドリンク',    base_ts + interval '90 minutes'),
    ('たかし', 'POSレジのエラー対応',                        'レジ・会計',  base_ts + interval '96 minutes'),
    ('ゆう',   '仕込みの優先順位について',                   '仕込み・調理', base_ts + interval '102 minutes'),
    ('はると', '予約のキャンセル対応',                       '提供・接客',  base_ts + interval '108 minutes'),
    ('ちえり', 'ソフトドリンクのレシピ',                     'ドリンク',    base_ts + interval '114 minutes'),
    ('ゆい',   '売上レポートの見方',                         'レジ・会計',  base_ts + interval '120 minutes'),
    ('たかし', 'ソースの仕込み量の目安',                     '仕込み・調理', base_ts + interval '126 minutes'),
    ('はると', 'お子様連れのお客様への対応',                 '提供・接客',  base_ts + interval '132 minutes'),
    ('ゆう',   'カクテルの作り方',                           'ドリンク',    base_ts + interval '138 minutes'),
    ('ちえり', 'ポイントカードの処理方法',                   'レジ・会計',  base_ts + interval '144 minutes'),
    ('はると', 'ナムルの調理手順',                           '仕込み・調理', base_ts + interval '150 minutes'),
    ('たかし', 'テーブルセッティングの基本',                 '提供・接客',  base_ts + interval '156 minutes'),
    ('ゆい',   'ノンアルコールドリンクの種類',               'ドリンク',    base_ts + interval '162 minutes');
end $$;

-- 確認クエリ
select '=== staffs ===' as info;
select * from staffs;
select '=== manuals count ===' as info;
select count(*) from manuals;
select '=== logs count (today) ===' as info;
select count(*) from logs where created_at >= current_date;
