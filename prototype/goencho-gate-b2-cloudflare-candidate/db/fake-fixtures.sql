INSERT OR IGNORE INTO goencho_teachers
  (teacher_id, display_name, status, created_at, updated_at)
VALUES
  ('fake_teacher_a', '青葉先生（架空）', 'active', 1789574400000, 1789574400000),
  ('fake_teacher_b', '若葉先生（架空）', 'active', 1789574400000, 1789574400000),
  ('fake_teacher_member', '花実先生（架空）', 'active', 1789574400000, 1789574400000);

INSERT OR IGNORE INTO goencho_participants
  (participant_id, display_name, display_rank, created_at, updated_at)
VALUES
  ('fake_participant_same_1', '水曜 はなこ（架空）', '8級', 1789574400000, 1789574400000),
  ('fake_participant_same_2', '水曜 はなこ（架空）', '3級', 1789574400000, 1789574400000),
  ('fake_participant_shared', '囲碁 みどり（架空）', '棋力確認中', 1789574400000, 1789574400000),
  ('fake_participant_member', '花実 しろ（架空）', '初段', 1789574400000, 1789574400000),
  ('fake_participant_04', '花野 たろう（架空）', '3級', 1789574400000, 1789574400000),
  ('fake_participant_05', '桜井 こよみ（架空）', '初段', 1789574400000, 1789574400000),
  ('fake_participant_06', '若草 つばき（架空）', '5級', 1789574400000, 1789574400000),
  ('fake_participant_07', '空木 あおい（架空）', '二段', 1789574400000, 1789574400000),
  ('fake_participant_08', '白石 すみれ（架空）', '10級', 1789574400000, 1789574400000),
  ('fake_participant_09', '小川 かえで（架空）', '7級', 1789574400000, 1789574400000),
  ('fake_participant_10', '森下 れん（架空）', '1級', 1789574400000, 1789574400000),
  ('fake_participant_11', '朝倉 ゆず（架空）', '4級', 1789574400000, 1789574400000),
  ('fake_participant_12', '月岡 りん（架空）', '6級', 1789574400000, 1789574400000),
  ('fake_participant_13', '川辺 なぎ（架空）', '2級', 1789574400000, 1789574400000),
  ('fake_participant_14', '野原 ひなた（架空）', '9級', 1789574400000, 1789574400000),
  ('fake_participant_15', '長いお名前の表示確認 はるか（架空）', '棋力確認中', 1789574400000, 1789574400000);

INSERT OR IGNORE INTO goencho_match_records
  (match_id, teacher_id, participant_id, played_on, played_at, result_code, handicap_text, source_reference, created_at)
VALUES
  ('fake_match_a_1', 'fake_teacher_a', 'fake_participant_same_1', '2026-09-17', '09:30', 'participant_loss', '5子局', 'fake:manual:a-1:v1', 1789574400000),
  ('fake_match_a_2', 'fake_teacher_a', 'fake_participant_same_1', '2026-09-17', '10:30', 'participant_win', '5子局', 'fake:manual:a-2:v1', 1789574400000),
  ('fake_match_a_old', 'fake_teacher_a', 'fake_participant_same_1', '2026-09-10', '13:10', 'participant_win', '6子局', 'fake:manual:a-old:v1', 1789574400000),
  ('fake_match_same_name', 'fake_teacher_a', 'fake_participant_same_2', '2026-09-17', '11:20', 'pending', '3子局', 'fake:manual:same-name:v1', 1789574400000),
  ('fake_match_shared_a', 'fake_teacher_a', 'fake_participant_shared', '2026-09-17', '13:30', 'participant_loss', '6子局', 'fake:manual:shared-a:v1', 1789574400000),
  ('fake_match_shared_b', 'fake_teacher_b', 'fake_participant_shared', '2026-09-17', '14:10', 'participant_win', '4子局', 'fake:manual:shared-b:v1', 1789574400000),
  ('fake_match_member', 'fake_teacher_member', 'fake_participant_member', '2026-09-17', '15:00', 'jigo', '先', 'fake:manual:member:v1', 1789574400000),
  ('fake_match_today_01', 'fake_teacher_a', 'fake_participant_same_1', '2026-09-18', '09:00', 'participant_loss', '5子局', 'fake:manual:today-01:v1', 1789660800000),
  ('fake_match_today_02', 'fake_teacher_a', 'fake_participant_same_2', '2026-09-18', '09:25', 'pending', '3子局', 'fake:manual:today-02:v1', 1789660800000),
  ('fake_match_today_03', 'fake_teacher_a', 'fake_participant_shared', '2026-09-18', '09:50', 'participant_win', '6子局・逆コミ3目', 'fake:manual:today-03:v1', 1789660800000),
  ('fake_match_today_04', 'fake_teacher_a', 'fake_participant_04', '2026-09-18', '10:15', 'participant_win', '3子局', 'fake:manual:today-04:v1', 1789660800000),
  ('fake_match_today_05', 'fake_teacher_a', 'fake_participant_05', '2026-09-18', '10:40', 'jigo', '先', 'fake:manual:today-05:v1', 1789660800000),
  ('fake_match_today_06', 'fake_teacher_a', 'fake_participant_06', '2026-09-18', '11:05', 'participant_loss', '5子局', 'fake:manual:today-06:v1', 1789660800000),
  ('fake_match_today_07', 'fake_teacher_a', 'fake_participant_07', '2026-09-18', '11:30', 'participant_win', '先', 'fake:manual:today-07:v1', 1789660800000),
  ('fake_match_today_08', 'fake_teacher_a', 'fake_participant_08', '2026-09-18', '12:00', 'pending', '9子局', 'fake:manual:today-08:v1', 1789660800000),
  ('fake_match_today_09', 'fake_teacher_a', 'fake_participant_09', '2026-09-18', '13:00', 'participant_loss', '7子局', 'fake:manual:today-09:v1', 1789660800000),
  ('fake_match_today_10', 'fake_teacher_a', 'fake_participant_10', '2026-09-18', '13:25', 'participant_win', '2子局', 'fake:manual:today-10:v1', 1789660800000),
  ('fake_match_today_11', 'fake_teacher_a', 'fake_participant_11', '2026-09-18', '13:50', 'participant_loss', '4子局', 'fake:manual:today-11:v1', 1789660800000),
  ('fake_match_today_12', 'fake_teacher_a', 'fake_participant_12', '2026-09-18', '14:15', 'participant_win', '6子局', 'fake:manual:today-12:v1', 1789660800000),
  ('fake_match_today_13', 'fake_teacher_a', 'fake_participant_13', '2026-09-18', '14:40', 'jigo', '2子局', 'fake:manual:today-13:v1', 1789660800000),
  ('fake_match_today_14', 'fake_teacher_a', 'fake_participant_14', '2026-09-18', '15:05', 'pending', '9子局', 'fake:manual:today-14:v1', 1789660800000),
  ('fake_match_today_15', 'fake_teacher_a', 'fake_participant_15', '2026-09-18', '15:30', 'unknown_future_code', '棋力・手合を確認中', 'fake:manual:today-15:v1', 1789660800000),
  ('fake_match_today_16', 'fake_teacher_a', 'fake_participant_same_1', '2026-09-18', '15:55', 'participant_win', '4子局', 'fake:manual:today-16:v1', 1789660800000);
