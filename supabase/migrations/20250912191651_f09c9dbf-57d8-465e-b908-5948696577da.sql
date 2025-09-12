-- Create table for presidency projects
CREATE TABLE public.presidency_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ideas', -- 'ideas', 'to_organize', 'organized', 'completed'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  budget DECIMAL(10,2),
  deadline DATE,
  assigned_to TEXT,
  notes TEXT,
  progress INTEGER DEFAULT 0, -- 0-100
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.presidency_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for presidency_projects
CREATE POLICY "Users can view their own presidency projects" 
ON public.presidency_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own presidency projects" 
ON public.presidency_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presidency projects" 
ON public.presidency_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presidency projects" 
ON public.presidency_projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_presidency_projects_updated_at
BEFORE UPDATE ON public.presidency_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();