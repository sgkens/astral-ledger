INSERT OR IGNORE INTO sources (kind, name, url)
VALUES ('wiki', 'Stellaris Wiki Traits', 'https://stellaris.paradoxwikis.com/Traits');

INSERT OR IGNORE INTO entities (
  entity_type,
  slug,
  name,
  summary,
  source_url,
  changed_in_patch,
  parse_status,
  review_status
)
VALUES (
  'trait',
  'intelligent',
  'Intelligent',
  'This species excels at advanced reasoning and research.',
  'https://stellaris.paradoxwikis.com/Traits',
  '4.3',
  'parsed',
  'approved'
);

INSERT OR IGNORE INTO entity_effects (entity_id, effect_key, effect_value, effect_text, display_order)
SELECT
  e.id,
  'research_from_jobs',
  '+10%',
  '+10% Research from Jobs',
  0
FROM entities e
WHERE e.entity_type = 'trait' AND e.slug = 'intelligent';

INSERT OR IGNORE INTO entity_requirements (entity_id, requirement_type, requirement_text, display_order)
SELECT
  e.id,
  'requirement',
  'No additional seeded requirements.',
  0
FROM entities e
WHERE e.entity_type = 'trait' AND e.slug = 'intelligent';
