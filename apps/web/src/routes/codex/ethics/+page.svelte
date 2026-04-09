<script lang="ts">
  import TooltipCard from "../../../lib/components/cards/TooltipCard.svelte";
  import type { CodexListItem } from "../../../../../packages/contracts/src";

  export let data: { items: CodexListItem[] };
</script>

<svelte:head>
  <title>Ethics Codex · Astral Ledger</title>
</svelte:head>

<div class="page-grid">
  <section class="panel">
    <div class="section-header">
      <h1>Ethics</h1>
      <span class="patch-badge">Route load</span>
    </div>

    <div class="stack">
      {#each data.items as item}
        <article class="entity-card">
          <div>
            <h2><a href={`/codex/ethics/${item.slug}`}>{item.name}</a></h2>
            <p>{item.summary}</p>
          </div>

          <TooltipCard
            name={item.name}
            entityType={item.entityType}
            summary={item.summary}
            effects={[]}
            patchChangedIn={item.patchChangedIn}
            sourceLabel="Stellaris Wiki"
            sourceUrl="https://stellaris.paradoxwikis.com/Ethics"
            tags={item.tags ?? []}
            variant="compact"
          />
        </article>
      {/each}
    </div>
  </section>
</div>
