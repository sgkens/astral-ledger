<script lang="ts">
  import TooltipCard from "../../../../lib/components/cards/TooltipCard.svelte";
  import type { CodexDetail } from "../../../../../../packages/contracts/src";

  export let data: { authority: CodexDetail };
  const authority = data.authority;
</script>

<svelte:head>
  <title>{authority.slug} · Authorities Codex · Astral Ledger</title>
</svelte:head>

<div class="page-grid">
  <section class="panel">
    <div class="section-header">
      <div>
        <p class="eyebrow">Authority</p>
        <h1>{authority.name}</h1>
      </div>
      <span class="patch-badge">Patch {authority.patchHistory[0]?.patchVersion ?? "Unknown"}</span>
    </div>

    <p class="lede">{authority.summary}</p>

    <div class="detail-grid">
      <div class="panel panel-subtle">
        <h2>Effects</h2>
        <ul class="list">
          {#each authority.effects as effect}
            <li>{effect}</li>
          {/each}
        </ul>
      </div>

      <TooltipCard
        name={authority.name}
        entityType={authority.entityType}
        summary={authority.summary}
        effects={authority.effects}
        requirements={authority.requirements}
        restrictions={authority.restrictions}
        patchChangedIn={authority.patchHistory[0]?.patchVersion}
        sourceLabel={authority.source.label}
        sourceUrl={authority.source.url}
        tags={authority.tags ?? []}
        variant="detail"
      />
    </div>
  </section>
</div>
