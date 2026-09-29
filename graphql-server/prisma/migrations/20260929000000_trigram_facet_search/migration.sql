-- Substring search for the employer and job-title dropdowns. Keep the existing
-- B-tree title index for exact selected-title filters.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "Employer_name_trgm_idx"
  ON "Employer" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "LCADisclosure_normalizedJobTitle_trgm_idx"
  ON "LCADisclosure" USING GIN ("normalizedJobTitle" gin_trgm_ops);
COMMIT;
