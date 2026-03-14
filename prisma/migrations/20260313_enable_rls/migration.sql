-- Re-create all policies to be stricter and force check for session variable
-- This ensures that if the variable is not set, the query fails (stricter security)

DO $$ 
DECLARE 
    tbl text;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN ('User', '_PrismaMigrations')
    LOOP
        EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);
        EXECUTE format('DROP POLICY IF EXISTS isolation_policy ON %I', tbl);
    END LOOP;
END $$;

-- Policies for tables with workspaceId
CREATE POLICY isolation_policy ON "Workspace" USING (id = current_setting('app.current_workspace_id'));
CREATE POLICY isolation_policy ON "Membership" USING ("workspaceId" = current_setting('app.current_workspace_id'));
CREATE POLICY isolation_policy ON "Dataset" USING ("workspaceId" = current_setting('app.current_workspace_id'));
CREATE POLICY isolation_policy ON "Dashboard" USING ("workspaceId" = current_setting('app.current_workspace_id'));
CREATE POLICY isolation_policy ON "JobRun" USING ("workspaceId" = current_setting('app.current_workspace_id'));
CREATE POLICY isolation_policy ON "AuditLog" USING ("workspaceId" = current_setting('app.current_workspace_id'));

-- Policies for children tables (indirectly via workspace mapping)
CREATE POLICY isolation_policy ON "DatasetVersion" USING ("datasetId" IN (SELECT id FROM "Dataset" WHERE "workspaceId" = current_setting('app.current_workspace_id')));
CREATE POLICY isolation_policy ON "DashboardChart" USING ("dashboardId" IN (SELECT id FROM "Dashboard" WHERE "workspaceId" = current_setting('app.current_workspace_id')));
CREATE POLICY isolation_policy ON "Chart" USING ("datasetVersionId" IN (SELECT id FROM "DatasetVersion" WHERE "datasetId" IN (SELECT id FROM "Dataset" WHERE "workspaceId" = current_setting('app.current_workspace_id'))));
CREATE POLICY isolation_policy ON "AIAnalysis" USING ("datasetVersionId" IN (SELECT id FROM "DatasetVersion" WHERE "datasetId" IN (SELECT id FROM "Dataset" WHERE "workspaceId" = current_setting('app.current_workspace_id'))));
CREATE POLICY isolation_policy ON "ShareLink" USING ("dashboardId" IN (SELECT id FROM "Dashboard" WHERE "workspaceId" = current_setting('app.current_workspace_id')));
CREATE POLICY isolation_policy ON "Annotation" USING ("dashboardId" IN (SELECT id FROM "Dashboard" WHERE "workspaceId" = current_setting('app.current_workspace_id')));
