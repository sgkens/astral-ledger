<script lang="ts">
  export let data: any;
  let identity = data.identity;
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
    return reviewActions.filter((item: any) => item.review_queue_id === id);
  }

  function historyForIssue(id: number) {
    return reviewActions.filter((item: any) => item.parse_issue_id === id);
  }

  function actorLabel(action: any) {
    const email = action.actor_email ?? "unknown";
    const source = action.actor_source ?? "unknown";
    return `${email} (${source})`;
  }

  async function sendAction(targetType: "queue" | "issue", id: number, actionKind: "approve" | "reject" | "resolve") {
    if (!identity.permissions.write.allowed) {
      actionState = identity.permissions.write.reason;
      return;
    }

    const noteKey = keyFor(targetType, id);
    const note = (notes[noteKey] ?? "").trim();
    actionState = `Running ${actionKind} on ${targetType} ${id}...`;

    const response = await fetch("/api/admin/review/action", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ targetType, id, actionKind, note: note || undefined })
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      actionState = result.error || "Action failed.";
      return;
    }

    reviewActions = [
      {
        id: Date.now(),
        review_queue_id: targetType === "queue" ? id : null,
        parse_issue_id: targetType === "issue" ? id : null,
        action_kind: actionKind,
        note: note || null,
        actor_email: result.actor_email ?? identity.email,
        actor_subject: result.actor_subject ?? identity.subject,
        actor_source: result.actor_source ?? identity.source,
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
      <span class="patch-badge">Actor traceability</span>
    </div>
    <p class="lede">
      Review actions now persist reviewer identity metadata so the history feed can show who performed each moderation decision.
    </p>
    {#if actionState}<p class="lede">{actionState}</p>{/if}
  </section>

  <section class="panel section">
    <div class="section-header">
      <h2>Authenticated Identity</h2>
      <span class="patch-badge">{identity.source}</span>
    </div>

    <article class="entity-card">
      <div>
        <h3>{identity.email ?? "Unknown identity"}</h3>
        <p class="lede">Subject: {identity.subject ?? "unknown"}</p>
        <p class="lede">Roles: {identity.roles.length ? identity.roles.join(", ") : "none"}</p>
        <p class="lede">Groups: {identity.groups.length ? identity.groups.join(", ") : "none"}</p>
      </div>
      <div class="stack">
        <div class="history-panel">
          <h4>Read permission</h4>
          <p>{identity.permissions.read.allowed ? "Allowed" : "Blocked"}</p>
          <p>{identity.permissions.read.reason}</p>
        </div>
        <div class="history-panel">
          <h4>Write permission</h4>
          <p>{identity.permissions.write.allowed ? "Allowed" : "Blocked"}</p>
          <p>{identity.permissions.write.reason}</p>
        </div>
      </div>
    </article>
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
            {#if issue.codex_href}<p><a href={issue.codex_href}>Open entity in codex</a></p>{/if}
          </div>
          <div class="stack">
            <input placeholder="Optional action note" bind:value={notes[keyFor("issue", issue.id)]} disabled={!identity.permissions.write.allowed} />
            <div class="meta-grid">
              <span class="tag">{issue.created_at}</span>
              <button disabled={!identity.permissions.write.allowed} title={identity.permissions.write.reason} on:click={() => sendAction("issue", issue.id, "resolve")}>Resolve</button>
              <button disabled={!identity.permissions.write.allowed} title={identity.permissions.write.reason} on:click={() => sendAction("issue", issue.id, "reject")}>Reject</button>
            </div>
            {#if !identity.permissions.write.allowed}
              <p class="permission-note">{identity.permissions.write.reason}</p>
            {/if}
            {#if historyForIssue(issue.id).length}
              <div class="history-panel">
                <h4>History</h4>
                {#each historyForIssue(issue.id) as action}
                  <div class="history-item">
                    <span class="tag">{action.action_kind}</span>
                    <span>{action.created_at}</span>
                    <p class="lede">By: {actorLabel(action)}</p>
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
            {#if item.codex_href}<p><a href={item.codex_href}>Open {item.entity_name ?? "entity"} in codex</a></p>{/if}
          </div>
          <div class="stack">
            <input placeholder="Optional action note" bind:value={notes[keyFor("queue", item.id)]} disabled={!identity.permissions.write.allowed} />
            <div class="meta-grid">
              <span class="tag">{item.created_at}</span>
              <button disabled={!identity.permissions.write.allowed} title={identity.permissions.write.reason} on:click={() => sendAction("queue", item.id, "approve")}>Approve</button>
              <button disabled={!identity.permissions.write.allowed} title={identity.permissions.write.reason} on:click={() => sendAction("queue", item.id, "reject")}>Reject</button>
              <button disabled={!identity.permissions.write.allowed} title={identity.permissions.write.reason} on:click={() => sendAction("queue", item.id, "resolve")}>Resolve</button>
            </div>
            {#if !identity.permissions.write.allowed}
              <p class="permission-note">{identity.permissions.write.reason}</p>
            {/if}
            {#if historyForQueue(item.id).length}
              <div class="history-panel">
                <h4>History</h4>
                {#each historyForQueue(item.id) as action}
                  <div class="history-item">
                    <span class="tag">{action.action_kind}</span>
                    <span>{action.created_at}</span>
                    <p class="lede">By: {actorLabel(action)}</p>
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
            <p class="lede">Queue: {action.review_queue_id ?? "none"} · Issue: {action.parse_issue_id ?? "none"}</p>
            <p class="lede">By: {actorLabel(action)}</p>
            {#if action.note}<p>{action.note}</p>{/if}
          </div>
          <div class="meta-grid">
            <span class="tag">{action.created_at}</span>
          </div>
        </article>
      {/each}
    </div>
  </section>
</div>
