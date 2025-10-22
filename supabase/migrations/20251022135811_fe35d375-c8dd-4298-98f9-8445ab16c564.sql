-- Create function to check if user is responsible for a section
CREATE OR REPLACE FUNCTION public.user_is_section_responsible(user_uuid uuid, section_name text, club_owner_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  -- Admin always has full access
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is responsible for the section
  RETURN EXISTS (
    SELECT 1 
    FROM public.member_permissions 
    WHERE user_id = user_uuid 
      AND section = section_name::public.app_section
      AND club_owner_id = club_owner_uuid
      AND is_responsible = true
  );
END;
$$;

-- Update documents policies: only responsible can modify, others can view
DROP POLICY IF EXISTS "Club members with permission can manage documents" ON documents;
DROP POLICY IF EXISTS "Club members can view documents" ON documents;
DROP POLICY IF EXISTS "Section responsible can manage documents" ON documents;

-- View policy for members with permission
CREATE POLICY "Club members can view documents" 
ON documents 
FOR SELECT 
TO authenticated
USING (
  (auth.uid() = user_id) OR 
  (
    EXISTS (
      SELECT 1 FROM club_members 
      WHERE club_members.user_id = auth.uid() 
        AND club_members.club_owner_id = documents.user_id 
        AND club_members.status = 'active'
    ) 
    AND user_has_section_permission(auth.uid(), 'segreteria', user_id)
  )
);

-- Only responsible can insert/update/delete
CREATE POLICY "Section responsible can manage documents" 
ON documents 
FOR ALL
TO authenticated
USING (
  (auth.uid() = user_id) OR 
  (
    EXISTS (
      SELECT 1 FROM club_members 
      WHERE club_members.user_id = auth.uid() 
        AND club_members.club_owner_id = documents.user_id 
        AND club_members.status = 'active'
    ) 
    AND user_is_section_responsible(auth.uid(), 'segreteria', user_id)
  )
)
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- Apply same pattern to other section-specific tables
-- Document templates
DROP POLICY IF EXISTS "Club members with permission can manage document templates" ON document_templates;
DROP POLICY IF EXISTS "Club members can view document templates" ON document_templates;
DROP POLICY IF EXISTS "Section responsible can manage document templates" ON document_templates;

CREATE POLICY "Club members can view document templates" 
ON document_templates 
FOR SELECT 
TO authenticated
USING (
  (auth.uid() = user_id) OR 
  (
    EXISTS (
      SELECT 1 FROM club_members 
      WHERE club_members.user_id = auth.uid() 
        AND club_members.club_owner_id = document_templates.user_id 
        AND club_members.status = 'active'
    ) 
    AND user_has_section_permission(auth.uid(), 'segreteria', user_id)
  )
);

CREATE POLICY "Section responsible can manage document templates" 
ON document_templates 
FOR ALL
TO authenticated
USING (
  (auth.uid() = user_id) OR 
  (
    EXISTS (
      SELECT 1 FROM club_members 
      WHERE club_members.user_id = auth.uid() 
        AND club_members.club_owner_id = document_templates.user_id 
        AND club_members.status = 'active'
    ) 
    AND user_is_section_responsible(auth.uid(), 'segreteria', user_id)
  )
)
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- Members (Soci section)
DROP POLICY IF EXISTS "Club members with permission can manage members" ON members;
DROP POLICY IF EXISTS "Club members can view members" ON members;
DROP POLICY IF EXISTS "Section responsible can manage members" ON members;

CREATE POLICY "Club members can view members" 
ON members 
FOR SELECT 
TO authenticated
USING (
  (auth.uid() = user_id) OR 
  (
    EXISTS (
      SELECT 1 FROM club_members 
      WHERE club_members.user_id = auth.uid() 
        AND club_members.club_owner_id = members.user_id 
        AND club_members.status = 'active'
    ) 
    AND user_has_section_permission(auth.uid(), 'soci', user_id)
  )
);

CREATE POLICY "Section responsible can manage members" 
ON members 
FOR ALL
TO authenticated
USING (
  (auth.uid() = user_id) OR 
  (
    EXISTS (
      SELECT 1 FROM club_members 
      WHERE club_members.user_id = auth.uid() 
        AND club_members.club_owner_id = members.user_id 
        AND club_members.status = 'active'
    ) 
    AND user_is_section_responsible(auth.uid(), 'soci', user_id)
  )
)
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);