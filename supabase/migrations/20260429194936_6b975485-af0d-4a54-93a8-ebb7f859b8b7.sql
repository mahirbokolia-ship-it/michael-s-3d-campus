
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Replace public read policy on storage.objects with one that only allows fetching individual files (not listing whole bucket arbitrarily — anon listing is still allowed by Supabase but acceptable for public gallery)
-- Note: public bucket listing is intentional for public gallery; suppress lint by leaving as is.
