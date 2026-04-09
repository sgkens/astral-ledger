-- Core source tracking
CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  content_type TEXT,
  byte_length INTEGER,
  parse_status TEXT NOT NULL DEFAULT 'pending',
  FOREIGN KEY (source_id) REFERENCES sources(id)
);

CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  source_url TEXT,
  source_hash TEXT,
  storage_key_original TEXT,
  storage_key_thumb TEXT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  summary TEXT,
  description_raw TEXT,
  effects_text TEXT,
  requirements_text TEXT,
  exclusions_text TEXT,
  dlc_requirement TEXT,
  image_id INTEGER,
  source_id INTEGER,
  source_snapshot_id INTEGER,
  source_url TEXT,
  source_hash TEXT,
  parse_status TEXT NOT NULL DEFAULT 'parsed',
  review_status TEXT NOT NULL DEFAULT 'draft',
  introduced_in_patch TEXT,
  changed_in_patch TEXT,
  removed_in_patch TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_type, slug),
  FOREIGN KEY (image_id) REFERENCES images(id),
  FOREIGN KEY (source_id) REFERENCES sources(id),
  FOREIGN KEY (source_snapshot_id) REFERENCES source_snapshots(id)
);

CREATE TABLE IF NOT EXISTS entity_effects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL,
  effect_key TEXT,
  effect_value TEXT,
  effect_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (entity_id) REFERENCES entities(id)
);

CREATE TABLE IF NOT EXISTS entity_requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL,
  requirement_type TEXT,
  requirement_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (entity_id) REFERENCES entities(id)
);

CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_slug ON entities(slug);
CREATE INDEX IF NOT EXISTS idx_entity_effects_entity_id ON entity_effects(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_requirements_entity_id ON entity_requirements(entity_id);
