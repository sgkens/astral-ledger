INSERT OR IGNORE INTO sources (kind, name, url)
VALUES ('wiki', 'Stellaris Wiki Ethics', 'https://stellaris.paradoxwikis.com/Ethics');

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
  'ethic',
  'fanatic-materialist',
  'Fanatic Materialist',
  'A strongly materialist society that prioritizes scientific progress and rational systems.',
  'https://stellaris.paradoxwikis.com/Ethics',
  '4.3',
  'parsed',
  'approved'
),
(
  'ethic',
  'xenophile',
  'Xenophile',
  'A society that embraces cooperation, diplomacy, and openness toward alien civilizations.',
  'https://stellaris.paradoxwikis.com/Ethics',
  '4.3',
  'parsed',
  'approved'
);

INSERT OR IGNORE INTO entity_effects (entity_id, effect_key, effect_value, effect_text, display_order)
SELECT e.id, 'research_speed', '+10%', '+10% Research Speed', 0
FROM entities e
WHERE e.entity_type = 'ethic' AND e.slug = 'fanatic-materialist';

INSERT OR IGNORE INTO entity_effects (entity_id, effect_key, effect_value, effect_text, display_order)
SELECT e.id, 'robot_upkeep', '-10%', '-10% Robot Upkeep', 1
FROM entities e
WHERE e.entity_type = 'ethic' AND e.slug = 'fanatic-materialist';

INSERT OR IGNORE INTO entity_effects (entity_id, effect_key, effect_value, effect_text, display_order)
SELECT e.id, 'envoy_count', '+1', '+1 Envoy', 0
FROM entities e
WHERE e.entity_type = 'ethic' AND e.slug = 'xenophile';

INSERT OR IGNORE INTO entity_effects (entity_id, effect_key, effect_value, effect_text, display_order)
SELECT e.id, 'trade_value', '+10%', '+10% Trade Value', 1
FROM entities e
WHERE e.entity_type = 'ethic' AND e.slug = 'xenophile';
