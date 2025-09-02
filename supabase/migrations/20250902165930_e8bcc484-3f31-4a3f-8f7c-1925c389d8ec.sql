-- Create table for district events
CREATE TABLE public.district_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  luogo TEXT,
  giorno INTEGER, -- Day of month (1-31)  
  mese INTEGER, -- Month (1-12), NULL for events that happen every month
  giorni_consecutivi INTEGER DEFAULT 1, -- Number of consecutive days
  descrizione TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.district_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own district events" 
ON public.district_events 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_district_events_updated_at
BEFORE UPDATE ON public.district_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get district events for current month
CREATE OR REPLACE FUNCTION public.get_district_events_for_month(user_uuid uuid, target_month integer DEFAULT EXTRACT(month FROM now())::integer)
RETURNS TABLE(nome text, luogo text, data_evento date, descrizione text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_year INTEGER := EXTRACT(year FROM now())::INTEGER;
  event_record RECORD;
  event_date DATE;
  day_offset INTEGER;
BEGIN
  FOR event_record IN 
    SELECT * FROM public.district_events 
    WHERE user_id = user_uuid 
  LOOP
    -- If event happens every month or in the target month
    IF event_record.mese IS NULL OR event_record.mese = target_month THEN
      -- If day is specified, calculate exact dates
      IF event_record.giorno IS NOT NULL THEN
        -- Create the base date
        event_date := make_date(current_year, target_month, event_record.giorno);
        
        -- Return each day for multi-day events
        FOR day_offset IN 0..(event_record.giorni_consecutivi - 1) LOOP
          nome := event_record.nome;
          luogo := event_record.luogo;
          data_evento := event_date + day_offset;
          descrizione := event_record.descrizione;
          RETURN NEXT;
        END LOOP;
      ELSE
        -- For events without specific day, return with null date
        nome := event_record.nome;
        luogo := event_record.luogo;
        data_evento := NULL;
        descrizione := event_record.descrizione;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
END;
$function$;