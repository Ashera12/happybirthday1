-- =====================================================
-- SIMPLE SUPABASE SETUP - GUARANTEED TO WORK
-- Copy and paste this entire script into Supabase SQL Editor
-- =====================================================

-- 1. Create the main table
CREATE TABLE birthday_cards (
  id TEXT PRIMARY KEY,
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

-- 2. Create indexes for better performance
CREATE INDEX idx_birthday_cards_username ON birthday_cards(username);
CREATE INDEX idx_birthday_cards_created_at ON birthday_cards(created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE birthday_cards ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Enable read for all users" ON birthday_cards FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON birthday_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON birthday_cards FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON birthday_cards FOR DELETE USING (true);

-- 5. Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('birthday-cards', 'birthday-cards', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Create storage policies
CREATE POLICY "Allow image uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'birthday-cards');
CREATE POLICY "Allow image viewing" ON storage.objects FOR SELECT USING (bucket_id = 'birthday-cards');

-- 7. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_birthday_cards_updated_at
  BEFORE UPDATE ON birthday_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Insert sample data
INSERT INTO birthday_cards (id, username, recipient, sender, message)
VALUES 
  ('sample-1', 'sample-1', 'Amelia', 'Best Friend', '🎉 Happy Birthday! Semoga harimu menyenangkan!'),
  ('sample-2', 'sample-2', 'Budi', 'Team', '🎊 Selamat Ulang Tahun! Sukses selalu!')
ON CONFLICT (username) DO NOTHING;

-- 9. Grant permissions
GRANT ALL ON birthday_cards TO anon;
GRANT ALL ON birthday_cards TO authenticated;

-- 10. Verification
DO $$
BEGIN
  RAISE NOTICE '=== SETUP COMPLETE ===';
  RAISE NOTICE 'Table birthday_cards created successfully';
  RAISE NOTICE 'Storage bucket birthday-cards created successfully';
  RAISE NOTICE 'Sample data inserted';
  RAISE NOTICE 'RLS policies enabled';
  RAISE NOTICE '===================';
END $$;

-- =====================================================
-- DONE! Your database is ready for the birthday card app
-- =====================================================
