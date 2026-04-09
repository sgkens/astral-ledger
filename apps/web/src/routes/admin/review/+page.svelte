<script lang="ts">
  export let data: {
    parseRuns: Array<{
      id: number;
      run_kind: string;
      status: string;
      started_at: string;
      finished_at: string | null;
      summary: string | null;
    }>;
    parseIssues: Array<{
      id: number;
      entity_type: string | null;
      page_url: string | null;
      severity: string;
      code: string | null;
      message: string;
      raw_context: string | null;
      created_at: string;
      codex_href: string | null;
    }>;
    reviewQueue: Array<{
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
    }>;
    reviewActions: Array<{
      id: number;
      review_queue_id: number | null;
      parse_issue_id: number | null;
      action_kind: string;
      note: string | null;
      created_at: string;
    }>;
  };

  let parseRuns = data.parseRuns;
  let parseIssues = data.parseIssues;
  let reviewQueue = data.reviewQueue;
  let reviewActions = data.reviewActions;
  let actionState = "";
  let notes: Record<string, string> = {};

  function keyFor(targetType: "queue" | "issue", id: number) {
    return `${targetType}:${id}`;
  }

  function historyForQueue(id: number) {
    return reviewActions.filter((item) => item.review_queue_id === id);
  }

  function historyForIssue(id: number) {
    return reviewActions.filter((item) => item.parse_issue_id === id);
  }

  async function sendAction(targetType: "queue" | "issue", id: number, actionKind: "approve" | "reject" | "resolve") {
    const noteKey = keyFor(targetType, id);
    const note = (notes[noteKey] ?? "").trim();
    actionState = `Running ${actionKind} on ${targetType} ${id}...`;

    const response = await fetch("/api/admin/review/action", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        targetType,
        id,
        actionKind,
        note: note || undefined
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      actionState = result.error || "Action failed.";
      return;
    }

    if (targetType === "queue") {
      reviewQueue = reviewQueue.map((item) =>
        item.id === id
          ? {
              ...item,
              status: result.status ?? item.status,
              resolved_at: new Date().toISOString()
            }
          : item
      );
    }

    if (targetType === "issue") {
      parseIssues = parseIssues.map((item) =>
        item.id === id
          ? {
              ...item,
              message: `${item.message} [${actionKind}${note ? ` | ${note}` : ""}]`
            }
          : item
      );
    }

    reviewActions = [
      {
        id: Date.now(),
        review_queue_id: targetType === "queue" ? id : null,
        parse_issue_id: targetType === "issue" ? id : null,
        action_kind: actionKind,
        note: note || null,
        created_at: new Date().toISOString()
      },
      ...reviewActions
    ];

    notes[noteKey] = "";
    actionState = `${actionKind} completed for ${targetType} ${id}.`;
  }
</script>

<svelte:head>
  <title>Admin Review · Astral Ledger</title>
</svelte:head>

<div class="page-grid">
  <section class="panel">
    <div class="section-header">
      <h1>Admin Review</h1>
      <span class="patch-badge">Protected admin surface</span>
    </div>
    <p class="lede">
      Admin endpoints now require either a Cloudflare Access JWT header or a configured admin key header. Cloudflare recommends validating the `Cf-Access-Jwt-Assertion` header for Access-protected applications. citeturn939079search0turn939079search3
    </p>
    {#if actionState}
      <p class="lede">{actionState}</p>
    {/if}
  </section>

  <section class="panel section">
    <div class="section-header">
      <h2>Parse Runs</h2>
      <span class="patch-badge">{parseRuns.length} items</span>
    </div>

    <div class="stack">
      {#each parseRuns as run}
        <article class="entity-card">
          <div>
            <h3>Run #{run.id} · {run.run_kind}</h3>
            <p>{run.summary ?? "No summary"}</p>
          </div>
          <div class="meta-grid">
            <span class="tag">{run.status}</span>
            <span class="tag">{run.started_at}</span>
          </div>
        </article>
      {/each}
    </div>
  </section>

  <section class="panel section">
    <div class="section-header">
      <h2>Parse Issues</h2>
      <span class="patch-badge">{parseIssues.length} items</span>
    </div>

    <div class="stack">
      {#each parseIssues as issue}
        <article class="entity-card">
          <div>
            <h3>Issue #{issue.id} · {issue.severity}</h3>
            <p>{issue.message}</p>
            <p class="lede">{issue.entity_type ?? "unknown"} · {issue.page_url ?? "no page url"}</p>
            {#if issue.codex_href}
              <p><a href={issue.codex_href}>Open entity in codex</a></p>
            {/if}
          </div>
          <div class="stack">
            <input
              placeholder="Optional action note"
              bind:value={notes[keyFor("issue", issue.id)]}
            />
            <div class="meta-grid">
              {#if issue.code}<span class="tag">{issue.code}</span>{/if}
              <span class="tag">{issue.created_at}</span>
              <button on:click={() => sendAction("issue", issue.id, "resolve")}>Resolve</button>
              <button on:click={() => sendAction("issue", issue.id, "reject")}>Reject</button>
            </div>
            {#if historyForIssue(issue.id).length}
              <div class="history-panel">
                <h4>History</h4>
                {#each historyForIssue(issue.id) as action}
                  <div class="history-item">
                    <span class="tag">{action.action_kind}</span>
                    <span>{action.created_at}</span>
                    {#if action.note}<p>{action.note}</p>{/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  </section>

  <section class="panel section">
    <div class="section-header">
      <h2>Review Queue</h2>
      <span class="patch-badge">{reviewQueue.length} items</span>
    </div>

    <div class="stack">
      {#each reviewQueue as item}
        <article class="entity-card">
          <div>
            <h3>Queue #{item.id} · {item.review_kind}</h3>
            <p>Status: {item.status}</p>
            <p class="lede">Issue ID: {item.issue_id ?? "none"} · Entity ID: {item.entity_id ?? "none"} · Snapshot ID: {item.snapshot_id ?? "none"}</p>
            {#if item.codex_href}
              <p><a href={item.codex_href}>Open {item.entity_name ?? "entity"} in codex</a></p>
            {/if}
          </div>
          <div class="stack">
            <input
              placeholder="Optional action note"
              bind:value={notes[keyFor("queue", item.id)]}
            />
            <div class="meta-grid">
              <span class="tag">{item.created_at}</span>
              {#if item.resolved_at}<span class="tag">{item.resolved_at}</span>{/if}
              <button on:click={() => sendAction("queue", item.id, "approve")}>Approve</button>
              <button on:click={() => sendAction("queue", item.id, "reject")}>Reject</button>
              <button on:click={() => sendAction("queue", item.id, "resolve")}>Resolve</button>
            </div>
            {#if historyForQueue(item.id).length}
              <div class="history-panel">
                <h4>History</h4>
                {#each historyForQueue(item.id) as action}
                  <div class="history-item">
                    <span class="tag">{action.action_kind}</span>
                    <span>{action.created_at}</span>
                    {#if action.note}<p>{action.note}</p>{/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  </section>

  <section class="panel section">
    <div class="section-header">
      <h2>Global Review History</h2>
      <span class="patch-badge">{reviewActions.length} items</span>
    </div>

    <div class="stack">
      {#each reviewActions as action}
        <article class="entity-card">
          <div>
            <h3>Action #{action.id} · {action.action_kind}</h3>
            <p class="lede">
              Queue: {action.review_queue_id ?? "none"} · Issue: {action.parse_issue_id ?? "none"}
            </p>
            {#if action.note}
              <p>{action.note}</p>
            {/if}
          </div>
          <div class="meta-grid">
            <span class="tag">{action.created_at}</span>
          </div>
        </article>
      {/each}
    </div>
  </section>
</div>
