-- 1. Create a table for storing MRI scan results
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    predicted_class TEXT NOT NULL,
    class_probabilities JSONB NOT NULL,
    attention_map_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy that allows users to only see their own scans
CREATE POLICY "Users can view their own scans" 
ON public.scans 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Create a policy that allows users to insert their own scans
CREATE POLICY "Users can insert their own scans" 
ON public.scans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. Create a policy that allows users to delete their own scans
CREATE POLICY "Users can delete their own scans" 
ON public.scans 
FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Create a storage bucket for attention map images
-- Note: Run this separately if your Supabase version doesn't support 'insert into storage.buckets'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('scans', 'scans', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage Policies
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'scans');

CREATE POLICY "Authenticated Insert Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'scans' AND auth.role() = 'authenticated');
