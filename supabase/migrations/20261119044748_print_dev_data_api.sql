-- Preserve the existing DEV schemas and expose print through PostgREST.
alter role authenticator set pgrst.db_schemas = 'public, graphql_public, print';
notify pgrst, 'reload config';
notify pgrst, 'reload schema';
