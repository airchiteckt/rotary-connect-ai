-- Create admin activity log table
CREATE TABLE public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  club_owner_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_admin_activity_log_admin_id ON public.admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_log_club_owner_id ON public.admin_activity_log(club_owner_id);
CREATE INDEX idx_admin_activity_log_created_at ON public.admin_activity_log(created_at);

-- Enable RLS
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view their own activity logs
CREATE POLICY "Admins can view their activity logs"
ON public.admin_activity_log
FOR SELECT
USING (
  auth.uid() = club_owner_id AND is_current_user_admin()
);

-- Create data snapshots table for point-in-time recovery
CREATE TABLE public.data_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_owner_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_data_snapshots_club_owner_id ON public.data_snapshots(club_owner_id);
CREATE INDEX idx_data_snapshots_record_id ON public.data_snapshots(record_id);
CREATE INDEX idx_data_snapshots_created_at ON public.data_snapshots(created_at);
CREATE INDEX idx_data_snapshots_table_name ON public.data_snapshots(table_name);

-- Enable RLS
ALTER TABLE public.data_snapshots ENABLE ROW LEVEL SECURITY;

-- Only admins can access snapshots
CREATE POLICY "Admins can access snapshots"
ON public.data_snapshots
FOR ALL
USING (
  auth.uid() = club_owner_id AND is_current_user_admin()
);

-- Function to log admin activity
CREATE OR REPLACE FUNCTION public.log_admin_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  club_owner_id_val UUID;
  action_type_val TEXT;
  old_data_val JSONB;
  new_data_val JSONB;
BEGIN
  -- Determine club owner ID
  IF TG_TABLE_NAME = 'profiles' THEN
    club_owner_id_val := COALESCE(NEW.user_id, OLD.user_id);
  ELSE
    club_owner_id_val := COALESCE(NEW.user_id, OLD.user_id);
  END IF;

  -- Only log if user is admin
  IF NOT is_user_admin(auth.uid()) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Determine action type and data
  IF TG_OP = 'INSERT' THEN
    action_type_val := 'INSERT';
    old_data_val := NULL;
    new_data_val := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type_val := 'UPDATE';
    old_data_val := to_jsonb(OLD);
    new_data_val := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    action_type_val := 'DELETE';
    old_data_val := to_jsonb(OLD);
    new_data_val := NULL;
  END IF;

  -- Insert activity log
  INSERT INTO public.admin_activity_log (
    admin_id,
    club_owner_id,
    action_type,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    club_owner_id_val,
    action_type_val,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    old_data_val,
    new_data_val
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to create data snapshots
CREATE OR REPLACE FUNCTION public.create_data_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  club_owner_id_val UUID;
BEGIN
  -- Determine club owner ID
  IF TG_TABLE_NAME = 'profiles' THEN
    club_owner_id_val := OLD.user_id;
  ELSE
    club_owner_id_val := OLD.user_id;
  END IF;

  -- Create snapshot before update or delete
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    INSERT INTO public.data_snapshots (
      club_owner_id,
      table_name,
      record_id,
      snapshot_data
    ) VALUES (
      club_owner_id_val,
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD)
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply triggers to important tables
CREATE TRIGGER log_members_activity
BEFORE INSERT OR UPDATE OR DELETE ON public.members
FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();

CREATE TRIGGER snapshot_members
BEFORE UPDATE OR DELETE ON public.members
FOR EACH ROW EXECUTE FUNCTION public.create_data_snapshot();

CREATE TRIGGER log_transactions_activity
BEFORE INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();

CREATE TRIGGER snapshot_transactions
BEFORE UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.create_data_snapshot();

CREATE TRIGGER log_documents_activity
BEFORE INSERT OR UPDATE OR DELETE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();

CREATE TRIGGER snapshot_documents
BEFORE UPDATE OR DELETE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.create_data_snapshot();

CREATE TRIGGER log_budgets_activity
BEFORE INSERT OR UPDATE OR DELETE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();

CREATE TRIGGER snapshot_budgets
BEFORE UPDATE OR DELETE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION public.create_data_snapshot();

CREATE TRIGGER log_commissions_activity
BEFORE INSERT OR UPDATE OR DELETE ON public.commissions
FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();

CREATE TRIGGER snapshot_commissions
BEFORE UPDATE OR DELETE ON public.commissions
FOR EACH ROW EXECUTE FUNCTION public.create_data_snapshot();

CREATE TRIGGER log_prefecture_events_activity
BEFORE INSERT OR UPDATE OR DELETE ON public.prefecture_events
FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();

CREATE TRIGGER snapshot_prefecture_events
BEFORE UPDATE OR DELETE ON public.prefecture_events
FOR EACH ROW EXECUTE FUNCTION public.create_data_snapshot();

-- Function to clean up old snapshots (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_snapshots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.data_snapshots
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  DELETE FROM public.admin_activity_log
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;