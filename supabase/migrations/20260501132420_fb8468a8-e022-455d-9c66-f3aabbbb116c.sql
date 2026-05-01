-- Replace admin-only policies on uploads with authenticated-user policies
DROP POLICY IF EXISTS "Admins insert uploads" ON public.uploads;
DROP POLICY IF EXISTS "Admins update uploads" ON public.uploads;
DROP POLICY IF EXISTS "Admins delete uploads" ON public.uploads;

CREATE POLICY "Authenticated users insert own uploads"
ON public.uploads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users update own uploads"
ON public.uploads
FOR UPDATE
TO authenticated
USING (auth.uid() = uploader_id);

CREATE POLICY "Users delete own uploads or admins delete any"
ON public.uploads
FOR DELETE
TO authenticated
USING (auth.uid() = uploader_id OR public.has_role(auth.uid(), 'admin'));

-- Storage policies for school-uploads bucket: allow any authenticated user to upload to their own folder
DROP POLICY IF EXISTS "Admins can upload to school-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update school-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete school-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public can read school-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users update own files in school-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own files in school-uploads" ON storage.objects;

CREATE POLICY "Public can read school-uploads"
ON storage.objects
FOR SELECT
USING (bucket_id = 'school-uploads');

CREATE POLICY "Authenticated users upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users update own files in school-uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'school-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own files in school-uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-uploads'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
);