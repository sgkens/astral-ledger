type ParseRun = {
  id: number;
  run_kind: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  summary: string | null;
};

type ParseIssue = {
  id: number;
  entity_type: string | null;
  page_url: string | null;
  severity: string;
  code: string | null;
  message: string;
  raw_context: string | null;
  created_at: string;
  codex_href: string | null;
};

type ReviewQueueItem = {
  id: number;
  entity_id: number | null;
  snapshot_id: number | null;
  issue_id: number | null;
  review_kind: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  entity_slug: string | null;
  entity_type: string | null;
  entity_name: string | null;
  codex_href: string | null;
};

type ReviewAction = {
  id: number;
  review_queue_id: number | null;
  parse_issue_id: number | null;
  action_kind: string;
  note: string | null;
  created_at: string;
};

export async function load({ fetch }: { fetch: typeof globalThis.fetch }) {
  async function getJson<T>(path: string): Promise<T> {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to fetch ${path}: ${response.status}`);
    return await response.json() as T;
  }

  const [runs, issues, queue, actions] = await Promise.all([
    getJson<{ items: ParseRun[] }>("/api/admin/review/parse-runs"),
    getJson<{ items: ParseIssue[] }>("/api/admin/review/parse-issues"),
    getJson<{ items: ReviewQueueItem[] }>("/api/admin/review/review-queue"),
    getJson<{ items: ReviewAction[] }>("/api/admin/review/actions")
  ]);

  return {
    parseRuns: runs.items,
    parseIssues: issues.items,
    reviewQueue: queue.items,
    reviewActions: actions.items
  };
}
