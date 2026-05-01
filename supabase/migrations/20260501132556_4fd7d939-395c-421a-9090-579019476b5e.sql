-- Allow anonymous inserts on uploads table
DROP POLICY IF EXISTS "Authenticated users insert own uploads" ON public.uploads;

CREATE POLICY "Anyone can insert uploads"
ON public.uploads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anonymous uploads to a shared 'anonymous' folder in storage
DROP POLICY IF EXISTS "Authenticated users upload to own folder" ON storage.objects;

CREATE POLICY "Anyone can upload to school-uploads"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'school-uploads'
  AND (
    (auth.uid() IS NOT NULL AND auth.uid()::text = (storage.foldername(name))[1])
    OR (auth.uid() IS NULL AND (storage.foldername(name))[1] = 'anonymous')
  )
);