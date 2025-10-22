-- Enable realtime for club_invites and club_members tables
ALTER TABLE club_invites REPLICA IDENTITY FULL;
ALTER TABLE club_members REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE club_invites;
ALTER PUBLICATION supabase_realtime ADD TABLE club_members;