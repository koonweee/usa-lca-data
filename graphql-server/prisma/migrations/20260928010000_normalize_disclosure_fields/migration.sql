-- Transactional backfill. Preserve applications, resumes, source digits, and distinct ZIP+4s.
BEGIN;
LOCK TABLE "Employer", "LCADisclosure", "RawDisclosureData" IN ACCESS EXCLUSIVE MODE;
CREATE FUNCTION pg_temp.clean_lca_field(value TEXT) RETURNS TEXT
LANGUAGE SQL IMMUTABLE STRICT AS $function$
  SELECT btrim(regexp_replace(value,
    U&'[\0009-\000D\0020\00A0\1680\2000-\200A\2028\2029\202F\205F\3000\FEFF]+', ' ', 'g'));
$function$;
CREATE FUNCTION pg_temp.normalize_lca_postal(value TEXT) RETURNS TEXT
LANGUAGE SQL IMMUTABLE STRICT AS $function$
  SELECT regexp_replace(pg_temp.clean_lca_field(value), '^([0-9]{5}) *-? *([0-9]{4})$', '\1-\2');
$function$;

ALTER TABLE "Employer" ADD COLUMN "normalizedCity" TEXT;
ALTER TABLE "Employer" ADD COLUMN "postalCodeValid" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "LCADisclosure" ADD COLUMN "normalizedJobTitle" TEXT;
ALTER TABLE "LCADisclosure" ADD COLUMN "normalizedWorksiteCity" TEXT;
ALTER TABLE "LCADisclosure" ADD COLUMN "worksitePostalCodeValid" BOOLEAN;

-- Choose a readable existing spelling for each city within its state, not across states.
CREATE TEMP TABLE city_spellings ON COMMIT DROP AS
WITH spellings AS (
  SELECT lower(pg_temp.clean_lca_field(city)) AS city_key,
    NULLIF(upper(pg_temp.clean_lca_field(state)), '') AS state_key,
    pg_temp.clean_lca_field(city) AS display_city, count(*) AS uses
  FROM "Employer" GROUP BY 1, 2, 3
)
SELECT DISTINCT ON (city_key, state_key) city_key, state_key, display_city
FROM spellings
ORDER BY city_key, state_key,
  (display_city <> upper(display_city) AND display_city <> lower(display_city)) DESC,
  uses DESC, display_city COLLATE "C";

UPDATE "Employer" e SET city = c.display_city, state = c.state_key, "normalizedCity" = c.city_key
FROM city_spellings c
WHERE lower(pg_temp.clean_lca_field(e.city)) = c.city_key
  AND NULLIF(upper(pg_temp.clean_lca_field(e.state)), '') IS NOT DISTINCT FROM c.state_key;
ALTER TABLE "Employer" ALTER COLUMN "normalizedCity" SET NOT NULL;

-- ZIP formatting may reveal duplicate employers. Reconnect all references before removal.
CREATE TEMP TABLE postal_merge ON COMMIT DROP AS
SELECT uuid, pg_temp.normalize_lca_postal("postalCode") AS postal_code,
  first_value(uuid) OVER (
    PARTITION BY "normalizedName", pg_temp.normalize_lca_postal("postalCode")
    ORDER BY ("postalCode" = pg_temp.normalize_lca_postal("postalCode")) DESC, uuid
  ) AS survivor_uuid
FROM "Employer";
UPDATE "LCADisclosure" d SET "employerUuid" = m.survivor_uuid
FROM postal_merge m WHERE d."employerUuid" = m.uuid AND m.uuid <> m.survivor_uuid;
UPDATE "RawDisclosureData" d SET "employerUuid" = m.survivor_uuid
FROM postal_merge m WHERE d."employerUuid" = m.uuid AND m.uuid <> m.survivor_uuid;
DELETE FROM "Employer" e USING postal_merge m WHERE e.uuid = m.uuid AND m.uuid <> m.survivor_uuid;
UPDATE "Employer" e SET "postalCode" = m.postal_code,
  "postalCodeValid" = m.postal_code ~ '^[0-9]{5}(-[0-9]{4})?$'
FROM postal_merge m WHERE e.uuid = m.uuid AND m.uuid = m.survivor_uuid;

-- Keep job-title punctuation and seniority. Store a separate case/space-insensitive key.
UPDATE "LCADisclosure" SET
  "jobTitle" = pg_temp.clean_lca_field("jobTitle"),
  "normalizedJobTitle" = NULLIF(lower(pg_temp.clean_lca_field("jobTitle")), ''),
  "worksiteCity" = pg_temp.clean_lca_field("worksiteCity"),
  "normalizedWorksiteCity" = NULLIF(lower(pg_temp.clean_lca_field("worksiteCity")), ''),
  "worksiteState" = NULLIF(upper(pg_temp.clean_lca_field("worksiteState")), ''),
  "worksitePostalCode" = pg_temp.normalize_lca_postal("worksitePostalCode"),
  "worksitePostalCodeValid" = pg_temp.normalize_lca_postal("worksitePostalCode") ~ '^[0-9]{5}(-[0-9]{4})?$';
CREATE INDEX "LCADisclosure_normalizedJobTitle_idx" ON "LCADisclosure"("normalizedJobTitle");
COMMIT;
