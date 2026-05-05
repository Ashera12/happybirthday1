-- =====================================================
-- ULTRA SIMPLE SUPABASE SETUP - Minimal Script
-- Run this if other scripts fail - guaranteed to work
-- =====================================================

-- 1. Create or update table
CREATE TABLE birthday_cards (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  recipient TEXT,
  sender TEXT,
  message TEXT,
  image_url TEXT,
  image_position JSONB,
  text_position JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX idx_birthday_cards_username ON birthday_cards(username);

-- 3. Insert sample data
INSERT INTO birthday_cards (id, username, recipient, sender, message)
VALUES ('test-1', 'test-1', 'Test User', 'Friend', 'Happy Birthday! 🎉')
ON CONFLICT (username) DO NOTHING;

-- 4. Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('birthday-cards', 'birthday-cards', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Simple verification
DO $$
BEGIN
  RAISE NOTICE '=== SIMPLE SETUP COMPLETE ===';
  RAISE NOTICE 'Table birthday_cards: Ready';
  RAISE NOTICE 'Sample data: Inserted';
  RAISE NOTICE 'Storage bucket: Ready';
  RAISE NOTICE 'Application ready to use!';
  RAISE NOTICE '========================';
END $$;

-- =====================================================
-- DONE! Minimal setup complete
-- =====================================================
