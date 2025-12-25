-- テスト用データ追加スクリプト

-- 1. 工賃フェーズを作成
INSERT INTO wage_phases (id, phase_name, min_months, max_months, level_1_wage, level_2_wage, level_3_wage, level_4_wage, color_from, color_to, text_color, created_at)
VALUES
  (gen_random_uuid(), '0〜3ヶ月', 0, 3, 200, 300, 400, 500, '#9333ea', '#3b82f6', '#ffffff', NOW()),
  (gen_random_uuid(), '4〜9ヶ月', 4, 9, 250, 400, 550, 700, '#ec4899', '#8b5cf6', '#ffffff', NOW()),
  (gen_random_uuid(), '9ヶ月以上', 10, NULL, 300, 500, 700, 1000, '#10b981', '#06b6d4', '#ffffff', NOW());

-- 2. テスト用事業所を作成
INSERT INTO facilities (id, name, plan_type, address, phone, email, created_at, updated_at)
VALUES (
  'test-facility-001',
  'テスト事業所',
  'FLEXIBLE',
  '東京都渋谷区テスト1-2-3',
  '03-1234-5678',
  'test@revelapp.jp',
  NOW(),
  NOW()
);

-- 3. テスト用ユーザー（スタッフ）を作成
INSERT INTO users (
  id,
  facility_id,
  wordpress_user_id,
  role,
  email,
  name,
  initials,
  status,
  start_date,
  continuation_months,
  created_at,
  updated_at
)
VALUES (
  'test-user-staff-001',
  'test-facility-001',
  1,  -- WordPress User ID（仮）
  'STAFF',
  'staff@revelapp.jp',
  'テストスタッフ',
  'TS',
  'ACTIVE',
  NOW() - INTERVAL '12 months',
  12,
  NOW(),
  NOW()
);

-- 4. テスト用利用者を複数作成
INSERT INTO users (
  id,
  facility_id,
  wordpress_user_id,
  role,
  email,
  name,
  initials,
  status,
  start_date,
  continuation_months,
  created_at,
  updated_at
)
VALUES
  ('test-user-member-001', 'test-facility-001', 101, 'MEMBER', 'member1@revelapp.jp', '山田太郎', '山太', 'ACTIVE', NOW() - INTERVAL '6 months', 6, NOW(), NOW()),
  ('test-user-member-002', 'test-facility-001', 102, 'MEMBER', 'member2@revelapp.jp', '佐藤花子', '佐花', 'ACTIVE', NOW() - INTERVAL '3 months', 3, NOW(), NOW()),
  ('test-user-member-003', 'test-facility-001', 103, 'MEMBER', 'member3@revelapp.jp', '鈴木一郎', '鈴一', 'ACTIVE', NOW() - INTERVAL '1 year', 12, NOW(), NOW());

-- 5. ゲームを作成
INSERT INTO games (id, name, level, requires_anydesk, image_url, manual_url, video_url, description, created_at)
VALUES
  ('ikaruga-lv1', '斑鳩', 1, false, '/images/games/ikaruga.jpg', 'https://example.com/manual/ikaruga', 'https://example.com/video/ikaruga', '弾幕シューティングゲーム', NOW()),
  ('minecraft-lv2', 'マインクラフト', 2, false, '/images/games/minecraft.jpg', 'https://example.com/manual/minecraft', 'https://example.com/video/minecraft', 'サンドボックスゲーム', NOW()),
  ('tetris-lv1', 'テトリス', 1, false, '/images/games/tetris.jpg', 'https://example.com/manual/tetris', 'https://example.com/video/tetris', 'パズルゲーム', NOW()),
  ('amongus-lv3', 'Among Us', 3, false, '/images/games/amongus.jpg', 'https://example.com/manual/amongus', 'https://example.com/video/amongus', '人狼系ゲーム', NOW()),
  ('valorant-lv4', 'VALORANT', 4, true, '/images/games/valorant.jpg', 'https://example.com/manual/valorant', 'https://example.com/video/valorant', 'FPSゲーム', NOW()),
  ('stardewvalley-lv2', 'スターデューバレー', 2, false, '/images/games/stardew.jpg', 'https://example.com/manual/stardew', 'https://example.com/video/stardew', '農業シミュレーション（予備）', NOW());

-- 6. 事業所ゲームを設定（Flexibleプラン: 5ゲーム + 予備1）
INSERT INTO facility_games (id, facility_id, game_id, is_backup, created_at)
VALUES
  (gen_random_uuid(), 'test-facility-001', 'ikaruga-lv1', false, NOW()),
  (gen_random_uuid(), 'test-facility-001', 'minecraft-lv2', false, NOW()),
  (gen_random_uuid(), 'test-facility-001', 'tetris-lv1', false, NOW()),
  (gen_random_uuid(), 'test-facility-001', 'amongus-lv3', false, NOW()),
  (gen_random_uuid(), 'test-facility-001', 'valorant-lv4', false, NOW()),
  (gen_random_uuid(), 'test-facility-001', 'stardewvalley-lv2', true, NOW());  -- 予備

-- 7. ゲームプレイ記録を追加
INSERT INTO game_play_records (id, user_id, game_id, played_at, session_duration, notes, created_at)
VALUES
  (gen_random_uuid(), 'test-user-member-001', 'minecraft-lv2', NOW() - INTERVAL '1 day', 60, '建築を楽しんだ', NOW()),
  (gen_random_uuid(), 'test-user-member-001', 'tetris-lv1', NOW() - INTERVAL '2 days', 30, 'ハイスコア更新', NOW()),
  (gen_random_uuid(), 'test-user-member-002', 'amongus-lv3', NOW() - INTERVAL '1 day', 45, 'チームワークが良かった', NOW()),
  (gen_random_uuid(), 'test-user-member-003', 'valorant-lv4', NOW() - INTERVAL '3 hours', 90, 'ランクアップした', NOW());

-- 8. 体調記録を追加
INSERT INTO health_records (
  id, user_id, record_date, fatigue_level, sleep_hours, mood, emotions,
  weather, temperature, has_pressure_change, achieved_tasks, difficult_tasks, free_notes, created_at, updated_at
)
VALUES
  (gen_random_uuid(), 'test-user-member-001', CURRENT_DATE - 1, 30, 7.5, '良い', '["楽しい", "嬉しい"]'::jsonb, 'sunny', 18.5, false, 'ゲームで目標達成', '特になし', '今日は調子が良かった', NOW(), NOW()),
  (gen_random_uuid(), 'test-user-member-001', CURRENT_DATE, 20, 8.0, 'とても良い', '["充実", "元気"]'::jsonb, 'cloudy', 16.2, false, 'スムーズに作業完了', '集中力が続いた', '快適な一日だった', NOW(), NOW()),
  (gen_random_uuid(), 'test-user-member-002', CURRENT_DATE - 1, 50, 6.0, '普通', '["普通"]'::jsonb, 'rainy', 15.0, true, 'いつも通りの作業', '少し疲れた', '雨で気圧が低い', NOW(), NOW()),
  (gen_random_uuid(), 'test-user-member-003', CURRENT_DATE, 40, 7.0, '良い', '["楽しい", "達成感"]'::jsonb, 'sunny', 19.0, false, 'ゲームで勝利', '難しい局面があった', 'チームプレイが楽しかった', NOW(), NOW());

-- 9. 月次工賃を作成
INSERT INTO monthly_wages (id, facility_id, year, month, total_amount, member_count, status, payment_date, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'test-facility-001', 2024, 11, 45000, 3, 'PAID', '2024-12-10', NOW(), NOW()),
  (gen_random_uuid(), 'test-facility-001', 2024, 12, 52000, 3, 'CONFIRMED', NULL, NOW(), NOW());

-- 10. 利用者別月次工賃（2024年12月分）
WITH december_wage AS (
  SELECT id FROM monthly_wages WHERE facility_id = 'test-facility-001' AND year = 2024 AND month = 12
)
INSERT INTO member_monthly_wages (id, monthly_wage_id, user_id, amount, play_count, created_at)
SELECT
  gen_random_uuid(),
  (SELECT id FROM december_wage),
  user_id,
  amount,
  play_count,
  NOW()
FROM (VALUES
  ('test-user-member-001', 18000, 12),
  ('test-user-member-002', 15000, 10),
  ('test-user-member-003', 19000, 13)
) AS t(user_id, amount, play_count);

-- 11. 繰越金額
INSERT INTO wage_carryovers (id, facility_id, year, month, amount, created_at)
VALUES
  (gen_random_uuid(), 'test-facility-001', 2025, 1, 8000, NOW());

-- 完了メッセージ
SELECT 'テストデータの作成が完了しました！' AS message,
       (SELECT COUNT(*) FROM facilities) AS facilities_count,
       (SELECT COUNT(*) FROM users) AS users_count,
       (SELECT COUNT(*) FROM games) AS games_count,
       (SELECT COUNT(*) FROM game_play_records) AS play_records_count,
       (SELECT COUNT(*) FROM health_records) AS health_records_count;
