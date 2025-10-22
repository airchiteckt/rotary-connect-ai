-- Create table for section requests and comments
CREATE TABLE public.section_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  club_owner_id UUID NOT NULL,
  section app_section NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.section_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.section_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Club members can view section requests"
ON public.section_requests
FOR SELECT
USING (
  auth.uid() = club_owner_id OR
  (EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = section_requests.club_owner_id
      AND club_members.status = 'active'
  ) AND user_has_section_permission(auth.uid(), section::text, club_owner_id))
);

CREATE POLICY "Club members can create section requests"
ON public.section_requests
FOR INSERT
WITH CHECK (
  get_club_owner_id(auth.uid()) = club_owner_id AND
  user_has_section_permission(auth.uid(), section::text, club_owner_id)
);

CREATE POLICY "Section responsible can manage section requests"
ON public.section_requests
FOR ALL
USING (
  auth.uid() = club_owner_id OR
  (EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = section_requests.club_owner_id
      AND club_members.status = 'active'
  ) AND user_is_section_responsible(auth.uid(), section::text, club_owner_id))
)
WITH CHECK (get_club_owner_id(auth.uid()) = club_owner_id);

-- Create trigger for updated_at
CREATE TRIGGER update_section_requests_updated_at
BEFORE UPDATE ON public.section_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();