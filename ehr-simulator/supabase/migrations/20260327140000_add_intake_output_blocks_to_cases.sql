-- 12h block summary from Case Builder Step 7 (Intake & Output)
-- JSON array: [{ "blockId": 1, "intake": 0, "output": 0 }, ...]
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS intake_output_blocks jsonb NOT NULL DEFAULT '[]'::jsonb;
