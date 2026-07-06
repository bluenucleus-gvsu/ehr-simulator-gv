CREATE TABLE IF NOT EXISTS public.case_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    preview_url TEXT NOT NULL,
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO storage.buckets (id, name, public)
VALUES ('case-media', 'case-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public upload to case-media" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'case-media');

CREATE POLICY "Allow public read from case-media" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'case-media');

CREATE POLICY "Allow public delete from case-media" 
ON storage.objects FOR DELETE 
TO public 
USING (bucket_id = 'case-media');