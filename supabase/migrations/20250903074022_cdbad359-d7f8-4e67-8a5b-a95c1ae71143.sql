-- Create storage policies for document-assets bucket
CREATE POLICY "Users can view document assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'document-assets');

CREATE POLICY "Users can upload their own document assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'document-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own document assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'document-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own document assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'document-assets' AND auth.uid()::text = (storage.foldername(name))[1]);