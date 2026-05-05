-- =====================================================
-- MINIMAL SUPABASE SETUP - Safe for existing tables
-- Only adds missing columns, preserves existing data
-- =====================================================

-- 1. Check if table exists and add missing columns if needed
DO $$
DECLARE
  has_username BOOLEAN;
  has_recipient BOOLEAN;
  has_sender BOOLEAN;
  has_message BOOLEAN;
  has_image_url BOOLEAN;
  has_image_position BOOLEAN;
  has_text_position BOOLEAN;
BEGIN
  -- Check required columns
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birthday_cards' AND column_name = 'username'
  ) INTO has_username;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birthday_cards' AND column_name = 'recipient'
  ) INTO has_recipient;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birthday_cards' AND column_name = 'sender'
  ) INTO has_sender;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birthday_cards' AND column_name = 'message'
  ) INTO has_message;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birthday_cards' AND column_name = 'image_url'
  ) INTO has_image_url;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birthday_cards' AND column_name = 'image_position'
  ) INTO has_image_position;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birthday_cards' AND column_name = 'text_position'
  ) INTO has_text_position;
  
  -- Add missing columns if needed
  IF NOT has_username THEN
    ALTER TABLE birthday_cards ADD COLUMN username TEXT UNIQUE NOT NULL;
    RAISE NOTICE '✅ Added username column';
  END IF;
  
  IF NOT has_recipient THEN
    ALTER TABLE birthday_cards ADD COLUMN recipient TEXT NOT NULL DEFAULT '';
    RAISE NOTICE '✅ Added recipient column';
  END IF;
  
  IF NOT has_sender THEN
    ALTER TABLE birthday_cards ADD COLUMN sender TEXT NOT NULL DEFAULT '';
    RAISE NOTICE '✅ Added sender column';
  END IF;
  
  IF NOT has_message THEN
    ALTER TABLE birthday_cards ADD COLUMN message TEXT NOT NULL DEFAULT '';
    RAISE NOTICE '✅ Added message column';
  END IF;
  
  IF NOT has_image_url THEN
    ALTER TABLE birthday_cards ADD COLUMN image_url TEXT;
    RAISE NOTICE '✅ Added image_url column';
  END IF;
  
  IF NOT has_image_position THEN
    ALTER TABLE birthday_cards ADD COLUMN image_position JSONB DEFAULT '{"x": 50, "y": 20}';
    RAISE NOTICE '✅ Added image_position column';
  END IF;
  
  IF NOT has_text_position THEN
    ALTER TABLE birthday_cards ADD COLUMN text_position JSONB DEFAULT '{"x": 50, "y": 70}';
    RAISE NOTICE '✅ Added text_position column';
  END IF;
  
  RAISE NOTICE '✅ Table structure updated successfully!';
END $$;

-- 2. Create indexes if not exists
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

-- 4. Create policies if not exists
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'birthday_cards';
  
  IF policy_count = 0 THEN
    CREATE POLICY "Public read access" ON birthday_cards FOR SELECT USING (true);
    CREATE POLICY "Public insert access" ON birthday_cards FOR INSERT WITH CHECK (true);
    CREATE POLICY "Public update access" ON birthday_cards FOR UPDATE USING (true);
    CREATE POLICY "Public delete access" ON birthday_cards FOR DELETE USING (true);
    RAISE NOTICE '✅ RLS policies created';
  END IF;
END $$;

-- 5. Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('birthday-cards', 'birthday-cards', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Create storage policies if not exists
DO $$
DECLARE
  storage_policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO storage_policy_count
  FROM pg_policies 
  WHERE tablename = 'storage.objects' AND policyname LIKE '%birthday-cards%';
  
  IF storage_policy_count = 0 THEN
    CREATE POLICY "Anyone can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'birthday-cards');
    CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'birthday-cards');
    RAISE NOTICE '✅ Storage policies created';
  END IF;
END $$;

-- 7. Create trigger if not exists
DO $$
DECLARE
  trigger_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE event_object_table = 'birthday_cards' AND trigger_name = 'update_birthday_cards_updated_at'
  ) INTO trigger_exists;
  
  IF NOT trigger_exists THEN
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
    
    RAISE NOTICE '✅ Trigger created';
  END IF;
END $$;

-- 8. Insert sample data if table is empty
DO $$
DECLARE
  card_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO card_count
  FROM birthday_cards;
  
  IF card_count = 0 THEN
    INSERT INTO birthday_cards (id, username, recipient, sender, message)
    VALUES (
      'minimal-test',
      'minimal-test',
      'Test User',
      'Friend',
      '🎉 Happy Birthday!'
    );
    RAISE NOTICE '✅ Sample data inserted';
  END IF;
END $$;

-- 9. Grant permissions
GRANT ALL ON birthday_cards TO anon;
GRANT ALL ON birthday_cards TO authenticated;

-- 10. Final verification
DO $$
DECLARE
  table_exists BOOLEAN;
  sample_count INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'birthday_cards'
  ) INTO table_exists;
  
  SELECT COUNT(*) INTO sample_count
  FROM birthday_cards 
  WHERE username LIKE 'sample-%' OR username = 'minimal-test';
  
  RAISE NOTICE '=== MINIMAL SETUP VERIFICATION ===';
  RAISE NOTICE 'Table birthday_cards: %', CASE WHEN table_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'Sample cards: %', sample_count;
  RAISE NOTICE '============================';
  
  IF table_exists AND sample_count > 0 THEN
    RAISE NOTICE '✅ SETUP COMPLETE - Ready to use!';
    RAISE NOTICE '🎉 Birthday card application ready!';
  ELSE
    RAISE NOTICE '⚠️  SETUP INCOMPLETE - Check errors above';
  END IF;
END $$;

-- 11. Test query
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
-- MINIMAL SETUP COMPLETE!
-- =====================================================
