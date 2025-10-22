-- Continue with remaining sections

-- PRESIDENZA: Goals, Milestones, Presidency Projects, Presidency Notes
DROP POLICY IF EXISTS "Club members with permission can manage goals" ON goals;
DROP POLICY IF EXISTS "Club members can view goals" ON goals;
DROP POLICY IF EXISTS "Section responsible can manage goals" ON goals;

CREATE POLICY "Club members can view goals" 
ON goals FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = goals.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'presidenza', user_id)));

CREATE POLICY "Section responsible can manage goals" 
ON goals FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = goals.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'presidenza', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- Milestones
DROP POLICY IF EXISTS "Club members with permission can manage milestones" ON milestones;
DROP POLICY IF EXISTS "Club members can view milestones" ON milestones;
DROP POLICY IF EXISTS "Section responsible can manage milestones" ON milestones;

CREATE POLICY "Club members can view milestones" 
ON milestones FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = milestones.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'presidenza', user_id)));

CREATE POLICY "Section responsible can manage milestones" 
ON milestones FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = milestones.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'presidenza', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- Presidency Projects
DROP POLICY IF EXISTS "Club members with permission can manage presidency projects" ON presidency_projects;
DROP POLICY IF EXISTS "Club members can view presidency projects" ON presidency_projects;
DROP POLICY IF EXISTS "Section responsible can manage presidency projects" ON presidency_projects;

CREATE POLICY "Club members can view presidency projects" 
ON presidency_projects FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = presidency_projects.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'presidenza', user_id)));

CREATE POLICY "Section responsible can manage presidency projects" 
ON presidency_projects FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = presidency_projects.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'presidenza', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- Presidency Notes
DROP POLICY IF EXISTS "Club members with permission can manage presidency notes" ON presidency_notes;
DROP POLICY IF EXISTS "Club members can view presidency notes" ON presidency_notes;
DROP POLICY IF EXISTS "Section responsible can manage presidency notes" ON presidency_notes;

CREATE POLICY "Club members can view presidency notes" 
ON presidency_notes FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = presidency_notes.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'presidenza', user_id)));

CREATE POLICY "Section responsible can manage presidency notes" 
ON presidency_notes FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = presidency_notes.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'presidenza', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- DIRETTIVO: Protocols
DROP POLICY IF EXISTS "Club members with permission can manage protocols" ON protocols;
DROP POLICY IF EXISTS "Club members can view protocols" ON protocols;
DROP POLICY IF EXISTS "Section responsible can manage protocols" ON protocols;

CREATE POLICY "Club members can view protocols" 
ON protocols FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = protocols.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'direttivo', user_id)));

CREATE POLICY "Section responsible can manage protocols" 
ON protocols FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = protocols.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'direttivo', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- COMUNICAZIONE: Contacts, Email Campaigns, Flyers
DROP POLICY IF EXISTS "Club members with permission can manage contacts" ON contacts;
DROP POLICY IF EXISTS "Club members can view contacts" ON contacts;
DROP POLICY IF EXISTS "Section responsible can manage contacts" ON contacts;

CREATE POLICY "Club members can view contacts" 
ON contacts FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = contacts.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'comunicazione', user_id)));

CREATE POLICY "Section responsible can manage contacts" 
ON contacts FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = contacts.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'comunicazione', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- Email Campaigns
DROP POLICY IF EXISTS "Club members with permission can manage email campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Club members can view email campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Section responsible can manage email campaigns" ON email_campaigns;

CREATE POLICY "Club members can view email campaigns" 
ON email_campaigns FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = email_campaigns.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'comunicazione', user_id)));

CREATE POLICY "Section responsible can manage email campaigns" 
ON email_campaigns FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = email_campaigns.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'comunicazione', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- Flyers
DROP POLICY IF EXISTS "Club members with permission can manage flyers" ON flyers;
DROP POLICY IF EXISTS "Club members can view flyers" ON flyers;
DROP POLICY IF EXISTS "Section responsible can manage flyers" ON flyers;

CREATE POLICY "Club members can view flyers" 
ON flyers FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = flyers.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'comunicazione', user_id)));

CREATE POLICY "Section responsible can manage flyers" 
ON flyers FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = flyers.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'comunicazione', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- SOCI: Position History
DROP POLICY IF EXISTS "Club members with permission can manage position history" ON position_history;
DROP POLICY IF EXISTS "Club members can view position history" ON position_history;
DROP POLICY IF EXISTS "Section responsible can manage position history" ON position_history;

CREATE POLICY "Club members can view position history" 
ON position_history FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = position_history.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'soci', user_id)));

CREATE POLICY "Section responsible can manage position history" 
ON position_history FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = position_history.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'soci', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- SEGRETERIA: Recurring Meetings
DROP POLICY IF EXISTS "Club members with permission can manage recurring meetings" ON recurring_meetings;
DROP POLICY IF EXISTS "Club members can view recurring meetings" ON recurring_meetings;
DROP POLICY IF EXISTS "Section responsible can manage recurring meetings" ON recurring_meetings;

CREATE POLICY "Club members can view recurring meetings" 
ON recurring_meetings FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = recurring_meetings.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'segreteria', user_id)));

CREATE POLICY "Section responsible can manage recurring meetings" 
ON recurring_meetings FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = recurring_meetings.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'segreteria', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);