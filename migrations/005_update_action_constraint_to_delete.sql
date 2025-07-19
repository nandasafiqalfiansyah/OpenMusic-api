-- 005 - Update action constraint: 'remove' => 'delete'

-- 1. Drop constraint lama
ALTER TABLE playlist_song_activities
DROP CONSTRAINT IF EXISTS playlist_song_activities_action_check;

-- 2. Tambahkan constraint baru yang memperbolehkan 'add' dan 'delete'
ALTER TABLE playlist_song_activities
ADD CONSTRAINT playlist_song_activities_action_check 
CHECK (action IN ('add', 'delete'));

-- 3. Update data lama agar nilai 'remove' diganti menjadi 'delete'
UPDATE playlist_song_activities
SET action = 'delete'
WHERE action = 'remove';

-- 4. (Opsional) Catatan log migrasi
-- Perubahan ini bertujuan untuk menyelaraskan istilah aksi dengan standar CRUD
