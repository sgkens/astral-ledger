CREATE TABLE IF NOT EXISTS parse_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_kind TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  summary TEXT
);

CREATE TABLE IF NOT EXISTS parse_issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parse_run_id INTEGER,
  entity_type TEXT,
  page_url TEXT,
  severity TEXT NOT NULL,
  code TEXT,
  message TEXT NOT NULL,
  raw_context TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parse_run_id) REFERENCES parse_runs(id)
);

CREATE TABLE IF NOT EXISTS review_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER,
  snapshot_id INTEGER,
  issue_id INTEGER,
  review_kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  FOREIGN KEY (entity_id) REFERENCES entities(id),
  FOREIGN KEY (snapshot_id) REFERENCES source_snapshots(id),
  FOREIGN KEY (issue_id) REFERENCES parse_issues(id)
);

CREATE INDEX IF NOT EXISTS idx_parse_issues_parse_run_id ON parse_issues(parse_run_id);
CREATE INDEX IF NOT EXISTS idx_review_queue_status ON review_queue(status);
