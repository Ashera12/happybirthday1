-- =====================================================
-- UPDATE EXISTING TABLE - Only add missing columns
-- Run this if table "birthday_cards" already exists
-- =====================================================

-- 1. Add missing columns if they don't exist
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS background TEXT DEFAULT 'gradient1';
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#ffffff';
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS show_stickers BOOLEAN DEFAULT true;
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS stickers TEXT DEFAULT '🎉,🎂,🎁';
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS sticker_positions JSONB DEFAULT '[
    {"emoji": "🎉", "x": 10, "y": 10},
    {"emoji": "🎂", "x": 80, "y": 10},
    {"emoji": "🎁", "x": 50, "y": 85}
  ]';
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT true;
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS custom_sound TEXT DEFAULT 'default';
ALTER TABLE birthday_cards ADD COLUMN IF NOT EXISTS effects JSONB DEFAULT '{"confetti": true, "sparkles": true, "floating": true}';

-- 2. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_birthday_cards_username ON birthday_cards(username);
CREATE INDEX IF NOT EXISTS idx_birthday_cards_created_at ON birthday_cards(created_at DESC);

-- 3. Enable RLS if not enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class 
    WHERE relname = 'birthday_cards' AND relrowse = true
  ) THEN
    ALTER TABLE birthday_cards ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS enabled';
  END IF;
END $$;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON birthday_cards;
DROP POLICY IF EXISTS "Public insert access" ON birthday_cards;
DROP POLICY IF EXISTS "Public update access" ON birthday_cards;
DROP POLICY IF EXISTS "Public delete access" ON birthday_cards;

-- 5. Create new policies
CREATE POLICY "Public read access" ON birthday_cards FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON birthday_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON birthday_cards FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON birthday_cards FOR DELETE USING (true);

-- 6. Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('birthday-cards', 'birthday-cards', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Create storage policies if they don't exist
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
CREATE POLICY "Anyone can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'birthday-cards');
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'birthday-cards');

-- 8. Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger if not exists
DROP TRIGGER IF EXISTS update_birthday_cards_updated_at ON birthday_cards;
CREATE TRIGGER update_birthday_cards_updated_at
  BEFORE UPDATE ON birthday_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Update existing rows with default values for new columns
UPDATE birthday_cards 
SET 
  background = COALESCE(background, 'gradient1'),
  background_color = COALESCE(background_color, '#ffffff'),
  show_stickers = COALESCE(show_stickers, true),
  stickers = COALESCE(stickers, '🎉,🎂,🎁'),
  sticker_positions = COALESCE(sticker_positions, '[
    {"emoji": "🎉", "x": 10, "y": 10},
    {"emoji": "🎂", "x": 80, "y": 10},
    {"emoji": "🎁", "x": 50, "y": 85}
  ]'),
  sound_enabled = COALESCE(sound_enabled, true),
  custom_sound = COALESCE(custom_sound, 'default'),
  effects = COALESCE(effects, '{"confetti": true, "sparkles": true, "floating": true}')
WHERE background IS NULL 
   OR background_color IS NULL 
   OR show_stickers IS NULL 
   OR stickers IS NULL 
   OR sticker_positions IS NULL 
   OR sound_enabled IS NULL 
   OR custom_sound IS NULL 
   OR effects IS NULL;

-- 11. Grant permissions
GRANT ALL ON birthday_cards TO anon;
GRANT ALL ON birthday_cards TO authenticated;

-- 12. Verification
DO $$
DECLARE
  column_count INTEGER;
  table_exists BOOLEAN;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'birthday_cards'
  ) INTO table_exists;
  
  -- Count columns
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns 
  WHERE table_name = 'birthday_cards';
  
  RAISE NOTICE '=== DATABASE UPDATE COMPLETE ===';
  RAISE NOTICE 'Table birthday_cards: %', CASE WHEN table_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'Total columns: %', column_count;
  RAISE NOTICE 'Missing columns added successfully!';
  RAISE NOTICE 'Policies updated!';
  RAISE NOTICE 'Storage bucket ready!';
  RAISE NOTICE 'Trigger created!';
  RAISE NOTICE 'Permissions granted!';
  RAISE NOTICE 'Existing rows updated with default values!';
  RAISE NOTICE '===================================';
END $$;

-- 13. Test query to show current structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'birthday_cards'
ORDER BY ordinal_position;

-- 14. Test query to show sample data
SELECT 
  username,
  recipient,
  sender,
  message,
  background,
  stickers,
  effects,
  created_at
FROM birthday_cards 
ORDER BY created_at DESC
LIMIT 3;

-- =====================================================
-- UPDATE COMPLETE!
-- =====================================================
