-- Create goals table for strategic planning
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Goals policies
CREATE POLICY "Club members can view goals"
ON public.goals
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = goals.user_id
      AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage goals"
ON public.goals
FOR ALL
USING (
  auth.uid() = user_id OR
  (EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = goals.user_id
      AND club_members.status = 'active'
  ) AND user_has_section_permission(auth.uid(), 'presidenza', user_id))
)
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- Create milestones table
CREATE TABLE public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Milestones policies
CREATE POLICY "Club members can view milestones"
ON public.milestones
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = milestones.user_id
      AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage milestones"
ON public.milestones
FOR ALL
USING (
  auth.uid() = user_id OR
  (EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = milestones.user_id
      AND club_members.status = 'active'
  ) AND user_has_section_permission(auth.uid(), 'presidenza', user_id))
)
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- Create presidency notes table
CREATE TABLE public.presidency_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_by_user_id UUID NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.presidency_notes ENABLE ROW LEVEL SECURITY;

-- Presidency notes policies
CREATE POLICY "Club members can view presidency notes"
ON public.presidency_notes
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = presidency_notes.user_id
      AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage presidency notes"
ON public.presidency_notes
FOR ALL
USING (
  auth.uid() = user_id OR
  (EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = presidency_notes.user_id
      AND club_members.status = 'active'
  ) AND user_has_section_permission(auth.uid(), 'presidenza', user_id))
)
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
BEFORE UPDATE ON public.milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_presidency_notes_updated_at
BEFORE UPDATE ON public.presidency_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();