-- Apply responsible-only modification pattern to all section tables

-- TESORERIA: Transactions, Budgets, Member Fees
DROP POLICY IF EXISTS "Club members with permission can manage transactions" ON transactions;
DROP POLICY IF EXISTS "Club members can view transactions" ON transactions;
DROP POLICY IF EXISTS "Section responsible can manage transactions" ON transactions;

CREATE POLICY "Club members can view transactions" 
ON transactions FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = transactions.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'tesoreria', user_id)));

CREATE POLICY "Section responsible can manage transactions" 
ON transactions FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = transactions.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'tesoreria', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- Budgets
DROP POLICY IF EXISTS "Club members with permission can manage budgets" ON budgets;
DROP POLICY IF EXISTS "Club members can view budgets" ON budgets;
DROP POLICY IF EXISTS "Section responsible can manage budgets" ON budgets;

CREATE POLICY "Club members can view budgets" 
ON budgets FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = budgets.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'tesoreria', user_id)));

CREATE POLICY "Section responsible can manage budgets" 
ON budgets FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = budgets.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'tesoreria', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- Member Fees
DROP POLICY IF EXISTS "Club members with permission can manage member fees" ON member_fees;
DROP POLICY IF EXISTS "Club members can view member fees" ON member_fees;
DROP POLICY IF EXISTS "Section responsible can manage member fees" ON member_fees;

CREATE POLICY "Club members can view member fees" 
ON member_fees FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = member_fees.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'tesoreria', user_id)));

CREATE POLICY "Section responsible can manage member fees" 
ON member_fees FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = member_fees.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'tesoreria', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- COMMISSIONI: Commissions, Presidency Projects
DROP POLICY IF EXISTS "Club members with permission can manage commissions" ON commissions;
DROP POLICY IF EXISTS "Club members can view commissions" ON commissions;
DROP POLICY IF EXISTS "Section responsible can manage commissions" ON commissions;

CREATE POLICY "Club members can view commissions" 
ON commissions FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = commissions.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'commissioni', user_id)));

CREATE POLICY "Section responsible can manage commissions" 
ON commissions FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = commissions.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'commissioni', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- PREFETTURA: Prefecture Events, VIP Guests, District Events
DROP POLICY IF EXISTS "Club members with permission can manage prefecture events" ON prefecture_events;
DROP POLICY IF EXISTS "Club members can view prefecture events" ON prefecture_events;
DROP POLICY IF EXISTS "Section responsible can manage prefecture events" ON prefecture_events;

CREATE POLICY "Club members can view prefecture events" 
ON prefecture_events FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = prefecture_events.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'prefettura', user_id)));

CREATE POLICY "Section responsible can manage prefecture events" 
ON prefecture_events FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = prefecture_events.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'prefettura', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- VIP Guests
DROP POLICY IF EXISTS "Club members with permission can manage vip guests" ON vip_guests;
DROP POLICY IF EXISTS "Club members can view vip guests" ON vip_guests;
DROP POLICY IF EXISTS "Section responsible can manage vip guests" ON vip_guests;

CREATE POLICY "Club members can view vip guests" 
ON vip_guests FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = vip_guests.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'prefettura', user_id)));

CREATE POLICY "Section responsible can manage vip guests" 
ON vip_guests FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = vip_guests.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'prefettura', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);

-- District Events
DROP POLICY IF EXISTS "Club members with permission can manage district events" ON district_events;
DROP POLICY IF EXISTS "Club members can view district events" ON district_events;
DROP POLICY IF EXISTS "Section responsible can manage district events" ON district_events;

CREATE POLICY "Club members can view district events" 
ON district_events FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = district_events.user_id AND club_members.status = 'active') AND user_has_section_permission(auth.uid(), 'prefettura', user_id)));

CREATE POLICY "Section responsible can manage district events" 
ON district_events FOR ALL TO authenticated
USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM club_members WHERE club_members.user_id = auth.uid() AND club_members.club_owner_id = district_events.user_id AND club_members.status = 'active') AND user_is_section_responsible(auth.uid(), 'prefettura', user_id)))
WITH CHECK (get_club_owner_id(auth.uid()) = user_id);