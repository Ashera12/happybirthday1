-- =====================================================
-- ULTRA SIMPLE DATABASE UPDATE - No DO blocks
-- Only basic ALTER TABLE statements
-- =====================================================

-- Add missing columns one by one
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_birthday_cards_username ON birthday_cards(username);
CREATE INDEX IF NOT EXISTS idx_birthday_cards_created_at ON birthday_cards(created_at DESC);

-- Enable RLS
ALTER TABLE birthday_cards ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Public read access" ON birthday_cards;
DROP POLICY IF EXISTS "Public insert access" ON birthday_cards;
DROP POLICY IF EXISTS "Public update access" ON birthday_cards;
DROP POLICY IF EXISTS "Public delete access" ON birthday_cards;

CREATE POLICY "Public read access" ON birthday_cards FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON birthday_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON birthday_cards FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON birthday_cards FOR DELETE USING (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('birthday-cards', 'birthday-cards', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
CREATE POLICY "Anyone can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'birthday-cards');
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'birthday-cards');

-- Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_birthday_cards_updated_at ON birthday_cards;
CREATE TRIGGER update_birthday_cards_updated_at
  BEFORE UPDATE ON birthday_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update existing rows
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

-- Grant permissions
GRANT ALL ON birthday_cards TO anon;
GRANT ALL ON birthday_cards TO authenticated;

-- Simple verification
SELECT '✅ Database update completed successfully!' as status;

-- Show table structure
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'birthday_cards'
ORDER BY ordinal_position;

-- Show sample data
SELECT 
  username,
  recipient,
  sender,
  message,
  background,
  stickers,
  created_at
FROM birthday_cards 
ORDER BY created_at DESC
LIMIT 3;

-- =====================================================
-- ULTRA SIMPLE UPDATE COMPLETE!
-- =====================================================
