-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily ping at 6:00 AM UTC
SELECT cron.schedule(
  'daily-ping-keepalive',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ajgyrhddxljfauwneput.supabase.co/functions/v1/ping',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqZ3lyaGRkeGxqZmF1d25lcHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTcyOTMsImV4cCI6MjA3MjM5MzI5M30.tniaCIQSSwKwNcJWt4yRsGunNeQk_g6ex02WRi3qOQ4"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);
