INSERT OR IGNORE INTO sources (kind, name, url)
VALUES ('wiki', 'Stellaris Wiki Government', 'https://stellaris.paradoxwikis.com/Government');

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
VALUES
(
  'authority',
  'corporate',
  'Corporate',
  'A corporate authority centered on commercial governance, executive power, and branch office expansion.',
  'https://stellaris.paradoxwikis.com/Government',
  '4.3',
  'parsed',
  'approved'
),
(
  'authority',
  'oligarchic',
  'Oligarchic',
  'A society governed by a ruling elite, balancing flexible leadership with institutional continuity.',
  'https://stellaris.paradoxwikis.com/Government',
  '4.3',
  'parsed',
  'approved'
);

INSERT OR IGNORE INTO entity_effects (entity_id, effect_key, effect_value, effect_text, display_order)
SELECT e.id, 'branch_office_access', 'enabled', 'Can establish Branch Offices', 0
FROM entities e
WHERE e.entity_type = 'authority' AND e.slug = 'corporate';

INSERT OR IGNORE INTO entity_effects (entity_id, effect_key, effect_value, effect_text, display_order)
SELECT e.id, 'government_type', 'megacorp', 'Unlocks Megacorp government mechanics', 1
FROM entities e
WHERE e.entity_type = 'authority' AND e.slug = 'corporate';

INSERT OR IGNORE INTO entity_effects (entity_id, effect_key, effect_value, effect_text, display_order)
SELECT e.id, 'agenda_flexibility', 'standard', 'Supports regular agenda-based government progression', 0
FROM entities e
WHERE e.entity_type = 'authority' AND e.slug = 'oligarchic';

INSERT OR IGNORE INTO entity_effects (entity_id, effect_key, effect_value, effect_text, display_order)
SELECT e.id, 'election_cycle', 'regular', 'Ruler is selected through periodic leadership rotation', 1
FROM entities e
WHERE e.entity_type = 'authority' AND e.slug = 'oligarchic';
