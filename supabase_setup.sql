-- Supabase Setup SQL for Birthday Card App
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create birthday_cards table
CREATE TABLE IF NOT EXISTS birthday_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    recipient TEXT NOT NULL,
    sender TEXT,
    message TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_birthday_cards_username ON birthday_cards(username);

-- Enable Row Level Security
ALTER TABLE birthday_cards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read
CREATE POLICY "Allow public read access" 
ON birthday_cards 
FOR SELECT 
TO PUBLIC 
USING (true);

-- Create policy to allow anyone to insert (for creating cards)
CREATE POLICY "Allow public insert" 
ON birthday_cards 
FOR INSERT 
TO PUBLIC 
WITH CHECK (true);

-- Create policy to allow updates by anyone (since we use simple username-based auth)
CREATE POLICY "Allow public update" 
ON birthday_cards 
ON birthday_cards 
FOR UPDATE 
TO PUBLIC 
USING (true) 
WITH CHECK (true);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('birthday-cards', 'birthday-cards', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to storage bucket
CREATE POLICY "Allow public access to birthday-cards bucket"
ON storage.objects
FOR SELECT
TO PUBLIC
USING (bucket_id = 'birthday-cards');

-- Allow public upload to storage bucket
CREATE POLICY "Allow public upload to birthday-cards bucket"
ON storage.objects
FOR INSERT
TO PUBLIC
WITH CHECK (bucket_id = 'birthday-cards');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_birthday_cards_updated_at 
    BEFORE UPDATE ON birthday_cards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
