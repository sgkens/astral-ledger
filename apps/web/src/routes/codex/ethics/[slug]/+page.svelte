<script lang="ts">
  import TooltipCard from "../../../../lib/components/cards/TooltipCard.svelte";
  import { onMount } from "svelte";
  import { fetchEthic } from "../../../../lib/api/codex";
  import type { CodexDetail } from "../../../../../../packages/contracts/src";

  export let data: { params?: { slug?: string } } | undefined;

  let ethic: CodexDetail | null = null;
  let loading = true;
  let error = "";
  const slug = data?.params?.slug ?? "fanatic-materialist";

  onMount(async () => {
    try {
      ethic = await fetchEthic(slug);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load ethic.";
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>{slug} · Ethics Codex · Astral Ledger</title>
</svelte:head>

<div class="page-grid">
  <section class="panel">
    {#if loading}
      <p class="lede">Loading ethic...</p>
    {:else if error || !ethic}
      <p class="lede">{error || "Ethic not found."}</p>
    {:else}
      <div class="section-header">
        <div>
          <p class="eyebrow">Ethic</p>
          <h1>{ethic.name}</h1>
        </div>
        <span class="patch-badge">Patch {ethic.patchHistory[0]?.patchVersion ?? "Unknown"}</span>
      </div>

      <p class="lede">{ethic.summary}</p>

      <div class="detail-grid">
        <div class="panel panel-subtle">
          <h2>Effects</h2>
          <ul class="list">
            {#each ethic.effects as effect}
              <li>{effect}</li>
            {/each}
          </ul>
        </div>

        <TooltipCard
          name={ethic.name}
          entityType={ethic.entityType}
          summary={ethic.summary}
          effects={ethic.effects}
          requirements={ethic.requirements}
          restrictions={ethic.restrictions}
          patchChangedIn={ethic.patchHistory[0]?.patchVersion}
          sourceLabel={ethic.source.label}
          sourceUrl={ethic.source.url}
          tags={ethic.tags ?? []}
          variant="detail"
        />
      </div>
    {/if}
  </section>
</div>
