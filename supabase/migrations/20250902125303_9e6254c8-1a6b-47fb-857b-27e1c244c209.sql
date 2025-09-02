-- Create profiles table for user management and trial tracking
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  club_name TEXT,
  role TEXT CHECK (role IN ('admin', 'president', 'secretary', 'member')) DEFAULT 'member',
  trial_start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  subscription_type TEXT CHECK (subscription_type IN ('trial', 'active', 'expired')) DEFAULT 'trial',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contacts table for email management
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT CHECK (category IN ('socio_club', 'socio_rotary', 'direttivo_club', 'direttivo_distrettuale', 'other')) NOT NULL,
  club_name TEXT,
  district TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table for PDF generation
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('programma_mese', 'verbale_direttivo', 'comunicazioni')) NOT NULL,
  content JSONB NOT NULL, -- Store appointments, dates, and other data
  template_url TEXT, -- URL to uploaded template
  logo_url TEXT, -- URL to uploaded logo
  signature_url TEXT, -- URL to uploaded signature
  generated_pdf_url TEXT, -- URL to generated PDF
  ai_summary TEXT, -- AI-generated summary
  status TEXT CHECK (status IN ('draft', 'completed', 'sent')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flyers table for AI-generated event posters
CREATE TABLE public.flyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  format TEXT CHECK (format IN ('instagram_post', 'instagram_story', 'locandina_a3')) NOT NULL,
  logo_urls TEXT[], -- Array of logo URLs
  additional_images TEXT[], -- Array of additional image URLs
  generated_image_url TEXT, -- URL to AI-generated flyer
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email campaigns table
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  recipient_categories TEXT[] NOT NULL, -- Array of contact categories
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for contacts
CREATE POLICY "Users can manage their own contacts" 
ON public.contacts FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for documents
CREATE POLICY "Users can manage their own documents" 
ON public.documents FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for flyers
CREATE POLICY "Users can manage their own flyers" 
ON public.flyers FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for email campaigns
CREATE POLICY "Users can manage their own email campaigns" 
ON public.email_campaigns FOR ALL 
USING (auth.uid() = user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flyers_updated_at
  BEFORE UPDATE ON public.flyers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, club_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'club_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if user trial is still valid
CREATE OR REPLACE FUNCTION public.is_trial_valid(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  profile_rec RECORD;
BEGIN
  SELECT * INTO profile_rec 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- If subscription is active, return true
  IF profile_rec.subscription_type = 'active' THEN
    RETURN TRUE;
  END IF;
  
  -- If trial period (1 month) has expired, return false
  IF profile_rec.subscription_type = 'trial' AND 
     profile_rec.trial_start_date < (now() - INTERVAL '1 month') THEN
    -- Update subscription status to expired
    UPDATE public.profiles 
    SET subscription_type = 'expired' 
    WHERE user_id = user_uuid;
    RETURN FALSE;
  END IF;
  
  -- Trial is still valid
  RETURN TRUE;
END;
$$;