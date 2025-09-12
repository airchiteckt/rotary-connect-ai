-- Create commissions table
CREATE TABLE public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  responsible_person TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Create policies for commissions
CREATE POLICY "Users can manage their own commissions" 
ON public.commissions 
FOR ALL 
USING (auth.uid() = user_id);

-- Add commission_id to presidency_projects
ALTER TABLE public.presidency_projects 
ADD COLUMN commission_id UUID REFERENCES public.commissions(id) ON DELETE SET NULL;

-- Create trigger for updated_at on commissions
CREATE TRIGGER update_commissions_updated_at
BEFORE UPDATE ON public.commissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();