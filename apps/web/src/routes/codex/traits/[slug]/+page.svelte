<script lang="ts">
  import TooltipCard from "../../../../lib/components/cards/TooltipCard.svelte";
  import { onMount } from "svelte";
  import { fetchTrait } from "../../../../lib/api/codex";
  import type { CodexDetail } from "../../../../../../packages/contracts/src";

  export let data: { params?: { slug?: string } } | undefined;

  let trait: CodexDetail | null = null;
  let loading = true;
  let error = "";
  const slug = data?.params?.slug ?? "intelligent";

  onMount(async () => {
    try {
      trait = await fetchTrait(slug);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load trait.";
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>{slug} · Traits Codex · Astral Ledger</title>
</svelte:head>

<div class="page-grid">
  <section class="panel">
    {#if loading}
      <p class="lede">Loading trait...</p>
    {:else if error || !trait}
      <p class="lede">{error || "Trait not found."}</p>
    {:else}
      <div class="section-header">
        <div>
          <p class="eyebrow">Trait</p>
          <h1>{trait.name}</h1>
        </div>
        <span class="patch-badge">Patch {trait.patchHistory[0]?.patchVersion ?? "Unknown"}</span>
      </div>

      <p class="lede">{trait.summary}</p>

      <div class="detail-grid">
        <div class="panel panel-subtle">
          <h2>Effects</h2>
          <ul class="list">
            {#each trait.effects as effect}
              <li>{effect}</li>
            {/each}
          </ul>
        </div>

        <TooltipCard
          name={trait.name}
          entityType={trait.entityType}
          summary={trait.summary}
          effects={trait.effects}
          requirements={trait.requirements}
          restrictions={trait.restrictions}
          patchChangedIn={trait.patchHistory[0]?.patchVersion}
          sourceLabel={trait.source.label}
          sourceUrl={trait.source.url}
          tags={trait.tags ?? []}
          variant="detail"
        />
      </div>
    {/if}
  </section>
</div>
