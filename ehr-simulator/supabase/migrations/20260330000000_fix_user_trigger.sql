-- Fix: restore pre-provisioning-aware trigger.

CREATE OR REPLACE FUNCTION public.link_new_user_profile()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.users
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(new.email))
  ) THEN
    UPDATE public.users
    SET
      id         = new.id,
      is_active  = true,
      full_name  = COALESCE(
                     full_name,
                     new.raw_user_meta_data->>'full_name',
                     new.raw_user_meta_data->>'name'
                   ),
      updated_at = now()
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(new.email));
  ELSE
    -- Brand-new user: insert a fresh student record.
    INSERT INTO public.users (id, role, full_name, email, is_active)
    VALUES (
      new.id,
      'student',
      COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name'
      ),
      LOWER(TRIM(new.email)),
      true
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
