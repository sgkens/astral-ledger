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
    }>;
  };

  let parseRuns = data.parseRuns;
  let parseIssues = data.parseIssues;
  let reviewQueue = data.reviewQueue;
  let actionState = "";

  async function sendAction(targetType: "queue" | "issue", id: number, actionKind: "approve" | "reject" | "resolve") {
    actionState = `Running ${actionKind} on ${targetType} ${id}...`;

    const response = await fetch("/api/admin/review/action", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        targetType,
        id,
        actionKind
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
              message: `${item.message} [${actionKind}]`
            }
          : item
      );
    }

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
      <span class="patch-badge">Actions enabled</span>
    </div>
    <p class="lede">
      This screen surfaces parse runs, parse issues, and review queue records created by the ingest pipeline.
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
          </div>
          <div class="meta-grid">
            {#if issue.code}<span class="tag">{issue.code}</span>{/if}
            <span class="tag">{issue.created_at}</span>
            <button on:click={() => sendAction("issue", issue.id, "resolve")}>Resolve</button>
            <button on:click={() => sendAction("issue", issue.id, "reject")}>Reject</button>
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
          </div>
          <div class="meta-grid">
            <span class="tag">{item.created_at}</span>
            {#if item.resolved_at}<span class="tag">{item.resolved_at}</span>{/if}
            <button on:click={() => sendAction("queue", item.id, "approve")}>Approve</button>
            <button on:click={() => sendAction("queue", item.id, "reject")}>Reject</button>
            <button on:click={() => sendAction("queue", item.id, "resolve")}>Resolve</button>
          </div>
        </article>
      {/each}
    </div>
  </section>
</div>
