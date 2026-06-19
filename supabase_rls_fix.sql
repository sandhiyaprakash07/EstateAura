    -- Run this once in Supabase Dashboard → SQL Editor → New query → Run
    -- Fixes: frontend cannot read properties/inquiries (RLS blocks anonymous SELECT)

    DROP POLICY IF EXISTS "Allow public read on properties" ON public.properties;
    CREATE POLICY "Allow public read on properties"
    ON public.properties
    FOR SELECT
    TO anon, authenticated
    USING (true);

    DROP POLICY IF EXISTS "Allow public read on inquiries" ON public.inquiries;
    CREATE POLICY "Allow public read on inquiries"
    ON public.inquiries
    FOR SELECT
    TO anon, authenticated
    USING (true);

    DROP POLICY IF EXISTS "Allow public insert on inquiries" ON public.inquiries;
    CREATE POLICY "Allow public insert on inquiries"
    ON public.inquiries
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
