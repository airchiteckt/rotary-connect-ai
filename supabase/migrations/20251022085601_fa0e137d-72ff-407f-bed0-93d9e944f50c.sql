-- Add responsible sections and commission fields to members table
ALTER TABLE members 
ADD COLUMN responsible_sections app_section[] DEFAULT ARRAY[]::app_section[],
ADD COLUMN responsible_commission_id uuid REFERENCES commissions(id) ON DELETE SET NULL;