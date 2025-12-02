-- Add contact details columns to prayer_requests
ALTER TABLE public.prayer_requests
ADD COLUMN contact_name TEXT,
ADD COLUMN contact_email TEXT,
ADD COLUMN contact_phone TEXT,
ADD COLUMN wants_contact BOOLEAN NOT NULL DEFAULT false;