export async function load({ fetch }: { fetch: typeof globalThis.fetch }) {
  async function getJson<T>(path: string): Promise<T> {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to fetch ${path}: ${response.status}`);
    return await response.json() as T;
  }

  const [identity, runs, issues, queue, actions] = await Promise.all([
    getJson<any>("/api/admin/identity"),
    getJson<{ items: any[] }>("/api/admin/review/parse-runs"),
    getJson<{ items: any[] }>("/api/admin/review/parse-issues"),
    getJson<{ items: any[] }>("/api/admin/review/review-queue"),
    getJson<{ items: any[] }>("/api/admin/review/actions")
  ]);

  return {
    identity,
    parseRuns: runs.items,
    parseIssues: issues.items,
    reviewQueue: queue.items,
    reviewActions: actions.items
  };
}
