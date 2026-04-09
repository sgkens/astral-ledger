CREATE TABLE IF NOT EXISTS review_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_queue_id INTEGER,
  parse_issue_id INTEGER,
  action_kind TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_queue_id) REFERENCES review_queue(id),
  FOREIGN KEY (parse_issue_id) REFERENCES parse_issues(id)
);

CREATE INDEX IF NOT EXISTS idx_review_actions_review_queue_id ON review_actions(review_queue_id);
CREATE INDEX IF NOT EXISTS idx_review_actions_parse_issue_id ON review_actions(parse_issue_id);
