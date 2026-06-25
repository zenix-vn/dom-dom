-- Dữ liệu mẫu cho phát triển cục bộ.

-- Môn học (Lớp 4 — Kết nối tri thức)
insert into subjects (id, name, grade_band) values
  ('11111111-1111-1111-1111-111111111111', 'Lịch sử & Địa lý', 'tieu-hoc'),
  ('22222222-2222-2222-2222-222222222222', 'Tiếng Việt', 'tieu-hoc'),
  ('33333333-3333-3333-3333-333333333333', 'Tiếng Anh', 'tieu-hoc');

-- Bài học mẫu
insert into lessons (id, subject_id, title, sort_order) values
  ('aaaaaaaa-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111', 'Thành Cổ Loa', 1);

-- Câu hỏi mẫu (Cổ Loa)
insert into questions (lesson_id, stem, choices, answer, explanation) values
  ('aaaaaaaa-0000-0000-0000-000000000001',
   'Thành Cổ Loa được xây dựng dưới thời vua nào?',
   '["An Dương Vương", "Hùng Vương", "Lý Thái Tổ", "Ngô Quyền"]'::jsonb,
   0, 'An Dương Vương cho xây thành Cổ Loa làm kinh đô nước Âu Lạc.');

-- Game trong registry
insert into games (id, manifest, enabled) values
  ('typing-basic',
   '{"id":"typing-basic","name":"Luyện gõ phím","version":"0.1.0","category":"typing","grades":["tieu-hoc","thcs"],"platforms":["web"],"entry":"/games/typing/index.html"}'::jsonb,
   true),
  ('quiz',
   '{"id":"quiz","name":"Quiz kiến thức","version":"0.1.0","category":"quiz","grades":["tieu-hoc"],"platforms":["web","mobile"],"entry":"/games/quiz/index.html"}'::jsonb,
   true);
