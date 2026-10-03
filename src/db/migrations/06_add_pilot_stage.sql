-- ============================================================================
-- Migration 06: Add 'pilot' Stage to Pipeline and Support Pilot Projects
-- ============================================================================

-- 1. Update CHECK constraint on opportunities stage to include 'pilot'
DO $$
BEGIN
  ALTER TABLE opportunities DROP CONSTRAINT IF EXISTS opportunities_stage_check;
  ALTER TABLE opportunities ADD CONSTRAINT opportunities_stage_check 
    CHECK (stage IN (
      'new','contacted','qualified','meeting_scheduled',
      'meeting_completed','proposal_sent','negotiation','pilot','won','lost'
    ));
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 2. Update CHECK constraint on projects status to include 'pilot'
DO $$
BEGIN
  ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
  ALTER TABLE projects ADD CONSTRAINT projects_status_check
    CHECK (status IN ('onboarding','in_progress','pilot','review','completed','cancelled'));
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;
