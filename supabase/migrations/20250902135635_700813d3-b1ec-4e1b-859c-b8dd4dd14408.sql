-- Create table for recurring meeting settings
CREATE TABLE public.recurring_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meeting_type TEXT NOT NULL CHECK (meeting_type IN ('direttivo', 'assemblea', 'caminetto')),
  frequency_type TEXT NOT NULL CHECK (frequency_type IN ('weekly', 'monthly', 'custom')),
  frequency_value JSONB NOT NULL, -- e.g., {"week": 3, "day": 4} for third Thursday
  meeting_time TIME NOT NULL DEFAULT '19:00',
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for recurring_meetings
ALTER TABLE public.recurring_meetings ENABLE ROW LEVEL SECURITY;

-- Create policies for recurring_meetings
CREATE POLICY "Users can manage their own recurring meetings" 
ON public.recurring_meetings 
FOR ALL 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_recurring_meetings_updated_at
BEFORE UPDATE ON public.recurring_meetings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate next meeting dates
CREATE OR REPLACE FUNCTION calculate_next_meeting_dates(
  user_uuid UUID,
  months_ahead INTEGER DEFAULT 6
)
RETURNS TABLE (
  meeting_type TEXT,
  meeting_date DATE,
  meeting_time TIME,
  location TEXT
) AS $$
DECLARE
  meeting_record RECORD;
  current_date DATE := CURRENT_DATE;
  end_date DATE := CURRENT_DATE + INTERVAL '1 month' * months_ahead;
  calculated_date DATE;
  week_of_month INTEGER;
  day_of_week INTEGER;
  first_day_of_month DATE;
  target_date DATE;
BEGIN
  FOR meeting_record IN 
    SELECT * FROM public.recurring_meetings 
    WHERE user_id = user_uuid AND is_active = true
  LOOP
    -- Calculate dates based on frequency type
    IF meeting_record.frequency_type = 'monthly' THEN
      -- Extract week and day from JSON
      week_of_month := (meeting_record.frequency_value->>'week')::INTEGER;
      day_of_week := (meeting_record.frequency_value->>'day')::INTEGER; -- 0=Sunday, 1=Monday, etc.
      
      -- Calculate for each month in the range
      FOR month_offset IN 0..months_ahead LOOP
        first_day_of_month := DATE_TRUNC('month', current_date + INTERVAL '1 month' * month_offset);
        
        -- Find the nth occurrence of the specified day of week
        target_date := first_day_of_month + 
          INTERVAL '1 day' * (
            (day_of_week - EXTRACT(DOW FROM first_day_of_month)::INTEGER + 7) % 7 +
            (week_of_month - 1) * 7
          );
        
        -- Only return future dates
        IF target_date >= current_date AND target_date <= end_date THEN
          meeting_type := meeting_record.meeting_type;
          meeting_date := target_date;
          meeting_time := meeting_record.meeting_time;
          location := meeting_record.location;
          RETURN NEXT;
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;