-- Allow public access to club profile data for public club pages
CREATE POLICY "Allow public read access to club profiles" 
ON public.profiles 
FOR SELECT 
USING (club_slug IS NOT NULL);

-- Also allow public access to club members for public pages
CREATE POLICY "Allow public read access to club members"
ON public.club_members
FOR SELECT
USING (true);

-- Allow public access to members data for organigramma
CREATE POLICY "Allow public read access to members for public pages"
ON public.members
FOR SELECT
USING (true);

-- Allow public access to events for public pages
CREATE POLICY "Allow public read access to prefecture events for public pages"
ON public.prefecture_events
FOR SELECT
USING (true);