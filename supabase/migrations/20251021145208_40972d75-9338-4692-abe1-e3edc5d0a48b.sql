-- Update RLS policies to allow club members to access shared data

-- Prefecture Events (section: prefettura)
DROP POLICY IF EXISTS "Users can view their own prefecture events" ON prefecture_events;
DROP POLICY IF EXISTS "Users can create their own prefecture events" ON prefecture_events;
DROP POLICY IF EXISTS "Users can update their own prefecture events" ON prefecture_events;
DROP POLICY IF EXISTS "Users can delete their own prefecture events" ON prefecture_events;

CREATE POLICY "Club members can view prefecture events"
ON prefecture_events FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = prefecture_events.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage prefecture events"
ON prefecture_events FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = prefecture_events.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'prefettura', prefecture_events.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- Presidency Projects (section: presidenza)
DROP POLICY IF EXISTS "Users can view their own presidency projects" ON presidency_projects;
DROP POLICY IF EXISTS "Users can create their own presidency projects" ON presidency_projects;
DROP POLICY IF EXISTS "Users can update their own presidency projects" ON presidency_projects;
DROP POLICY IF EXISTS "Users can delete their own presidency projects" ON presidency_projects;

CREATE POLICY "Club members can view presidency projects"
ON presidency_projects FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = presidency_projects.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage presidency projects"
ON presidency_projects FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = presidency_projects.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'presidenza', presidency_projects.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- Commissions (section: commissioni)
DROP POLICY IF EXISTS "Users can manage their own commissions" ON commissions;

CREATE POLICY "Club members can view commissions"
ON commissions FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = commissions.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage commissions"
ON commissions FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = commissions.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'commissioni', commissions.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- Members (section: soci)
DROP POLICY IF EXISTS "Users can manage their own members" ON members;

CREATE POLICY "Club members can view members"
ON members FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = members.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage members"
ON members FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = members.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'soci', members.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- Position History (section: soci)
DROP POLICY IF EXISTS "Users can manage their own position history" ON position_history;

CREATE POLICY "Club members can view position history"
ON position_history FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = position_history.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage position history"
ON position_history FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = position_history.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'soci', position_history.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- Transactions (section: tesoreria)
DROP POLICY IF EXISTS "Users can manage their own transactions" ON transactions;

CREATE POLICY "Club members can view transactions"
ON transactions FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = transactions.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage transactions"
ON transactions FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = transactions.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'tesoreria', transactions.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- Budgets (section: tesoreria)
DROP POLICY IF EXISTS "Users can manage their own budgets" ON budgets;

CREATE POLICY "Club members can view budgets"
ON budgets FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = budgets.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage budgets"
ON budgets FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = budgets.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'tesoreria', budgets.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- Member Fees (section: tesoreria)
DROP POLICY IF EXISTS "Users can manage their own member fees" ON member_fees;

CREATE POLICY "Club members can view member fees"
ON member_fees FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = member_fees.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage member fees"
ON member_fees FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = member_fees.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'tesoreria', member_fees.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- Contacts (section: comunicazione)
DROP POLICY IF EXISTS "Users can manage their own contacts" ON contacts;

CREATE POLICY "Club members can view contacts"
ON contacts FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = contacts.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage contacts"
ON contacts FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = contacts.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'comunicazione', contacts.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- District Events (section: prefettura)
DROP POLICY IF EXISTS "Users can manage their own district events" ON district_events;

CREATE POLICY "Club members can view district events"
ON district_events FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = district_events.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage district events"
ON district_events FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = district_events.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'prefettura', district_events.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- Document Templates (section: segreteria)
DROP POLICY IF EXISTS "Users can view their own templates" ON document_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON document_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON document_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON document_templates;

CREATE POLICY "Club members can view document templates"
ON document_templates FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = document_templates.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage document templates"
ON document_templates FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = document_templates.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'segreteria', document_templates.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- Documents (section: segreteria)
DROP POLICY IF EXISTS "Users can manage their own documents" ON documents;

CREATE POLICY "Club members can view documents"
ON documents FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = documents.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage documents"
ON documents FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = documents.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'segreteria', documents.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- Email Campaigns (section: comunicazione)
DROP POLICY IF EXISTS "Users can manage their own email campaigns" ON email_campaigns;

CREATE POLICY "Club members can view email campaigns"
ON email_campaigns FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = email_campaigns.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage email campaigns"
ON email_campaigns FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = email_campaigns.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'comunicazione', email_campaigns.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- Flyers (section: comunicazione)
DROP POLICY IF EXISTS "Users can manage their own flyers" ON flyers;

CREATE POLICY "Club members can view flyers"
ON flyers FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = flyers.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage flyers"
ON flyers FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = flyers.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'comunicazione', flyers.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- Protocols (section: direttivo)
DROP POLICY IF EXISTS "Users can manage their own protocols" ON protocols;

CREATE POLICY "Club members can view protocols"
ON protocols FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = protocols.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage protocols"
ON protocols FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = protocols.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'direttivo', protocols.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- Recurring Meetings (section: segreteria)
DROP POLICY IF EXISTS "Users can manage their own recurring meetings" ON recurring_meetings;

CREATE POLICY "Club members can view recurring meetings"
ON recurring_meetings FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = recurring_meetings.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage recurring meetings"
ON recurring_meetings FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = recurring_meetings.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'segreteria', recurring_meetings.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);

-- VIP Guests (section: prefettura)
DROP POLICY IF EXISTS "Users can manage their own vip guests" ON vip_guests;

CREATE POLICY "Club members can view vip guests"
ON vip_guests FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.user_id = auth.uid()
    AND club_members.club_owner_id = vip_guests.user_id
    AND club_members.status = 'active'
  )
);

CREATE POLICY "Club members with permission can manage vip guests"
ON vip_guests FOR ALL
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.user_id = auth.uid()
      AND club_members.club_owner_id = vip_guests.user_id
      AND club_members.status = 'active'
    )
    AND user_has_section_permission(auth.uid(), 'prefettura', vip_guests.user_id)
  )
)
WITH CHECK (
  get_club_owner_id(auth.uid()) = user_id
);