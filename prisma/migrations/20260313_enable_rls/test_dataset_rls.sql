-- Drop and recreate policies with absolute paths and explicit checks
DROP POLICY IF EXISTS dataset_isolation_policy ON "Dataset";

CREATE POLICY dataset_isolation_policy ON "Dataset"
    FOR ALL
    TO PUBLIC
    USING ("workspaceId" = current_setting('app.current_workspace_id'));

-- Test with a simple query
SET app.current_workspace_id = 'cmmokfhme0001lfxwp1dmgm9r'; -- Workspace 2 ID from previous run
SELECT count(*) FROM "Dataset";
