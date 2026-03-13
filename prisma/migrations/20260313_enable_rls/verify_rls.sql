-- Re-create policies to ensure they bypass the owner if necessary
-- Note: In a real prod env, the app user should NOT be the table owner to ensure RLS is enforced.
-- For local dev, we can force RLS for the owner.

ALTER TABLE "Workspace" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Membership" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Dataset" FORCE ROW LEVEL SECURITY;
ALTER TABLE "DatasetVersion" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Dashboard" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Chart" FORCE ROW LEVEL SECURITY;
ALTER TABLE "DashboardChart" FORCE ROW LEVEL SECURITY;
ALTER TABLE "AIAnalysis" FORCE ROW LEVEL SECURITY;
ALTER TABLE "ShareLink" FORCE ROW LEVEL SECURITY;
ALTER TABLE "JobRun" FORCE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Annotation" FORCE ROW LEVEL SECURITY;

-- Verify policies are active
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Test raw setting
SET app.current_workspace_id = 'test-id';
SHOW app.current_workspace_id;
