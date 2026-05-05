-- Database Setup for Birthday Cards App
-- Run this in your Supabase SQL Editor

-- Create birthday_cards table with new schema
CREATE TABLE IF NOT EXISTS birthday_cards (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL, -- New field for custom URLs
  recipient TEXT,
  sender TEXT,
  message TEXT,
  image_url TEXT,
  image_position JSONB DEFAULT '{"x": 50, "y": 20}', -- Position as percentage
  text_position JSONB DEFAULT '{"x": 50, "y": 70}', -- Position as percentage
  image_scale DECIMAL(3,2) DEFAULT 1.0, -- Scale factor (0.5 to 2.0)
  text_size TEXT DEFAULT 'text-lg', -- Tailwind text size classes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_birthday_cards_username ON birthday_cards(username);

-- Enable Row Level Security (RLS)
ALTER TABLE birthday_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
-- Allow anyone to read cards
CREATE POLICY "Cards are viewable by everyone" ON birthday_cards
  FOR SELECT USING (true);

-- Allow anyone to insert cards (for creating new cards)
CREATE POLICY "Anyone can create cards" ON birthday_cards
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update cards (for editing existing cards)
CREATE POLICY "Anyone can update cards" ON birthday_cards
  FOR UPDATE USING (true);

-- Create storage bucket for images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('birthday-cards', 'birthday-cards', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Anyone can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'birthday-cards');

CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'birthday-cards');

CREATE POLICY "Anyone can update their own images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'birthday-cards');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_birthday_cards_updated_at
  BEFORE UPDATE ON birthday_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional - you can remove this)
INSERT INTO birthday_cards (id, username, recipient, sender, message)
VALUES (
  'sample-card',
  'sample',
  'Sample Recipient',
  'Sample Sender',
  'Happy Birthday! 🎉\n\nWishing you a wonderful day filled with joy and happiness!'
)
ON CONFLICT (username) DO NOTHING;
