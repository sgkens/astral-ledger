<script lang="ts">
  import TooltipCard from "../../../lib/components/cards/TooltipCard.svelte";
  import type { CodexListItem } from "../../../../../packages/contracts/src";

  export let data: { items: CodexListItem[] };
</script>

<svelte:head>
  <title>Authorities Codex · Astral Ledger</title>
</svelte:head>

<div class="page-grid">
  <section class="panel">
    <div class="section-header">
      <h1>Authorities</h1>
      <span class="patch-badge">Vertical slice</span>
    </div>

    <div class="stack">
      {#each data.items as item}
        <article class="entity-card">
          <div>
            <h2><a href={`/codex/authorities/${item.slug}`}>{item.name}</a></h2>
            <p>{item.summary}</p>
          </div>

          <TooltipCard
            name={item.name}
            entityType={item.entityType}
            summary={item.summary}
            effects={[]}
            patchChangedIn={item.patchChangedIn}
            sourceLabel="Stellaris Wiki"
            sourceUrl="https://stellaris.paradoxwikis.com/Government"
            tags={item.tags ?? []}
            variant="compact"
          />
        </article>
      {/each}
    </div>
  </section>
</div>
