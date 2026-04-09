<script lang="ts">
  import TooltipCard from "../../../lib/components/cards/TooltipCard.svelte";
  import { onMount } from "svelte";
  import { fetchEthics } from "../../../lib/api/codex";
  import type { CodexListItem } from "../../../../../packages/contracts/src";

  let items: CodexListItem[] = [];
  let loading = true;
  let error = "";

  onMount(async () => {
    try {
      items = await fetchEthics();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load ethics.";
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Ethics Codex · Astral Ledger</title>
</svelte:head>

<div class="page-grid">
  <section class="panel">
    <div class="section-header">
      <h1>Ethics</h1>
      <span class="patch-badge">Vertical slice</span>
    </div>

    {#if loading}
      <p class="lede">Loading ethics...</p>
    {:else if error}
      <p class="lede">{error}</p>
    {:else}
      <div class="stack">
        {#each items as item}
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
    {/if}
  </section>
</div>
