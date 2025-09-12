-- Create table for prefecture events (ceremonies and events)
CREATE TABLE public.prefecture_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'ceremony', 'event', 'protocol', 'vip_guest'
  ceremony_type TEXT, -- 'insediamento', 'premiazione', 'ammissione' (for ceremonies)
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'cancelled'
  participants INTEGER DEFAULT 0,
  notes TEXT,
  protocol_document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prefecture_events ENABLE ROW LEVEL SECURITY;

-- Create policies for prefecture_events
CREATE POLICY "Users can view their own prefecture events" 
ON public.prefecture_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prefecture events" 
ON public.prefecture_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prefecture events" 
ON public.prefecture_events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prefecture events" 
ON public.prefecture_events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create table for VIP guests
CREATE TABLE public.vip_guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  title TEXT, -- 'Sindaco', 'Governatore', 'Presidente', etc.
  organization TEXT,
  email TEXT,
  phone TEXT,
  special_requirements TEXT,
  protocol_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for VIP guests
ALTER TABLE public.vip_guests ENABLE ROW LEVEL SECURITY;

-- Create policies for vip_guests
CREATE POLICY "Users can manage their own vip guests" 
ON public.vip_guests 
FOR ALL 
USING (auth.uid() = user_id);

-- Create table for protocols and procedures
CREATE TABLE public.protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'ceremony', 'event', 'guest_reception', 'general'
  content TEXT NOT NULL,
  is_template BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'approved', 'archived'
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for protocols
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;

-- Create policies for protocols
CREATE POLICY "Users can manage their own protocols" 
ON public.protocols 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_prefecture_events_updated_at
BEFORE UPDATE ON public.prefecture_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vip_guests_updated_at
BEFORE UPDATE ON public.vip_guests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_protocols_updated_at
BEFORE UPDATE ON public.protocols
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();