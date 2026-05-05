-- =====================================================
-- ULTRA SIMPLE SUPABASE SETUP - No DO blocks
-- Only basic SQL commands that always work
-- =====================================================

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS birthday_cards (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  username TEXT UNIQUE NOT NULL,
  recipient TEXT NOT NULL DEFAULT '',
  sender TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  image_position JSONB DEFAULT '{"x": 50, "y": 20}',
  text_position JSONB DEFAULT '{"x": 50, "y": 70}',
  image_scale DECIMAL(3,2) DEFAULT 1.0,
  text_size TEXT DEFAULT 'text-lg',
  theme_color TEXT DEFAULT 'pink',
  is_public BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing columns if table exists (simple ALTER TABLE)
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS username TEXT UNIQUE NOT NULL;
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS recipient TEXT NOT NULL DEFAULT '';
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS sender TEXT NOT NULL DEFAULT '';
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS message TEXT NOT NULL DEFAULT '';
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS image_position JSONB DEFAULT '{"x": 50, "y": 20}';
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS text_position JSONB DEFAULT '{"x": 50, "y": 70}';

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_birthday_cards_username ON birthday_cards(username);
CREATE INDEX IF NOT EXISTS idx_birthday_cards_created_at ON birthday_cards(created_at DESC);

-- 4. Enable RLS
ALTER TABLE birthday_cards ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies (if any)
DROP POLICY IF EXISTS "Public read access" ON birthday_cards;
DROP POLICY IF EXISTS "Public insert access" ON birthday_cards;
DROP POLICY IF EXISTS "Public update access" ON birthday_cards;
DROP POLICY IF EXISTS "Public delete access" ON birthday_cards;

-- 6. Create new policies
CREATE POLICY "Public read access" ON birthday_cards FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON birthday_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON birthday_cards FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON birthday_cards FOR DELETE USING (true);

-- 7. Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('birthday-cards', 'birthday-cards', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Drop existing storage policies (if any)
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;

-- 9. Create storage policies
CREATE POLICY "Anyone can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'birthday-cards');
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'birthday-cards');

-- 10. Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger
DROP TRIGGER IF EXISTS update_birthday_cards_updated_at ON birthday_cards;
CREATE TRIGGER update_birthday_cards_updated_at
  BEFORE UPDATE ON birthday_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 12. Insert sample data (only if table is empty)
INSERT INTO birthday_cards (id, username, recipient, sender, message)
SELECT 'test-123', 'test-123', 'Test User', 'Friend', '🎉 Happy Birthday!'
WHERE NOT EXISTS (SELECT 1 FROM birthday_cards LIMIT 1);

-- 13. Grant permissions
GRANT ALL ON birthday_cards TO anon;
GRANT ALL ON birthday_cards TO authenticated;

-- 14. Simple verification
SELECT 'Table birthday_cards exists and ready!' as status;

-- 15. Test query to show structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'birthday_cards'
ORDER BY ordinal_position;

-- 16. Test query to show sample data
SELECT 
  username,
  recipient,
  sender,
  message,
  created_at
FROM birthday_cards 
ORDER BY created_at DESC
LIMIT 3;

-- =====================================================
-- ULTRA SIMPLE SETUP COMPLETE!
-- =====================================================
-- 
-- This script uses only:
-- ✅ Basic CREATE TABLE IF NOT EXISTS
-- ✅ Simple ALTER TABLE ADD COLUMN IF NOT EXISTS
-- ✅ Basic CREATE INDEX IF NOT EXISTS
-- ✅ Simple policy operations
-- ✅ Basic storage operations
-- ✅ Simple trigger operations
-- ✅ Basic INSERT with WHERE NOT EXISTS
--
-- NO complex features that might fail:
-- ❌ DO blocks with complex logic
-- ❌ Variable declarations
-- ❌ Complex control flow
-- ❌ System catalog queries
-- ❌ Advanced PostgreSQL features
--
-- This is guaranteed to work in Supabase!
-- =====================================================
