-- Create members table for club members management
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  membership_start_date DATE NOT NULL,
  current_position TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create position_history table for tracking position changes over time
CREATE TABLE public.position_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_history ENABLE ROW LEVEL SECURITY;

-- Create policies for members table
CREATE POLICY "Users can manage their own members" 
ON public.members 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies for position_history table
CREATE POLICY "Users can manage their own position history" 
ON public.position_history 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on members
CREATE TRIGGER update_members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on position_history
CREATE TRIGGER update_position_history_updated_at
BEFORE UPDATE ON public.position_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_members_user_id ON public.members(user_id);
CREATE INDEX idx_members_email ON public.members(email);
CREATE INDEX idx_members_status ON public.members(status);
CREATE INDEX idx_position_history_member_id ON public.position_history(member_id);
CREATE INDEX idx_position_history_user_id ON public.position_history(user_id);