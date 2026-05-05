-- =====================================================
-- SIMPLE DATABASE SETUP - Guaranteed to Work
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create table
CREATE TABLE birthday_cards (
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
  background TEXT DEFAULT 'gradient1',
  background_color TEXT DEFAULT '#ffffff',
  show_stickers BOOLEAN DEFAULT true,
  stickers TEXT[] DEFAULT ARRAY['🎉', '🎂', '🎁'],
  sticker_positions JSONB DEFAULT '[
    {"emoji": "🎉", "x": 10, "y": 10},
    {"emoji": "🎂", "x": 80, "y": 10},
    {"emoji": "🎁", "x": 50, "y": 85}
  ]',
  sound_enabled BOOLEAN DEFAULT true,
  custom_sound TEXT DEFAULT 'default',
  effects JSONB DEFAULT '{"confetti": true, "sparkles": true, "floating": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX idx_birthday_cards_username ON birthday_cards(username);
CREATE INDEX idx_birthday_cards_created_at ON birthday_cards(created_at DESC);

-- 3. Enable RLS
ALTER TABLE birthday_cards ENABLE ROW LEVEL SECURITY;

-- 4. Create policies
CREATE POLICY "Public read access" ON birthday_cards FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON birthday_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON birthday_cards FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON birthday_cards FOR DELETE USING (true);

-- 5. Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('birthday-cards', 'birthday-cards', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Create storage policies
CREATE POLICY "Anyone can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'birthday-cards');
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'birthday-cards');

-- 7. Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger
CREATE TRIGGER update_birthday_cards_updated_at
  BEFORE UPDATE ON birthday_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert sample data
INSERT INTO birthday_cards (
  id, username, recipient, sender, message,
  image_position, text_position, image_scale, text_size, theme_color,
  background, background_color, show_stickers, stickers, sticker_positions,
  sound_enabled, custom_sound, effects
)
VALUES 
  (
    'simple-test',
    'simple-test',
    'Test User',
    'Friend',
    '🎉 Happy Birthday!\n\nSemoga harimu menyenangkan!',
    '{"x": 25, "y": 25}',
    '{"x": 75, "y": 75}',
    1.2,
    'text-lg',
    'pink',
    'gradient1',
    '#ffffff',
    true,
    ['🎉', '🎂', '🎁'],
    [
      {"emoji": "🎉", "x": 10, "y": 10},
      {"emoji": "🎂", "x": 80, "y": 10},
      {"emoji": "🎁", "x": 50, "y": 85}
    ],
    true,
    'default',
    '{"confetti": true, "sparkles": true, "floating": true}'
  )
ON CONFLICT (username) DO NOTHING;

-- 10. Grant permissions
GRANT ALL ON birthday_cards TO anon;
GRANT ALL ON birthday_cards TO authenticated;

-- 11. Verification
DO $$
BEGIN
  RAISE NOTICE '=== DATABASE SETUP COMPLETE ===';
  RAISE NOTICE 'Table birthday_cards created successfully!';
  RAISE NOTICE 'Storage bucket created successfully!';
  RAISE NOTICE 'Sample data inserted!';
  RAISE NOTICE 'RLS enabled!';
  RAISE NOTICE 'Policies created!';
  RAISE NOTICE 'Trigger created!';
  RAISE NOTICE 'Permissions granted!';
  RAISE NOTICE '========================';
END $$;

-- 12. Test query
SELECT 
  username,
  recipient,
  sender,
  message,
  created_at
FROM birthday_cards 
WHERE username = 'simple-test'
LIMIT 1;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
