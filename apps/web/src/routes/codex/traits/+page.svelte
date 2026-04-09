<script lang="ts">
  import TooltipCard from "../../../lib/components/cards/TooltipCard.svelte";

  const items = [
    {
      slug: "intelligent",
      name: "Intelligent",
      entityType: "trait",
      summary: "This species excels at advanced reasoning and research.",
      patchChangedIn: "4.3",
      effects: ["+10% Research from Jobs"],
      sourceLabel: "Stellaris Wiki",
      sourceUrl: "https://stellaris.paradoxwikis.com/Traits",
      tags: ["science", "research", "biological"]
    }
  ];
</script>

<svelte:head>
  <title>Traits Codex · Astral Ledger</title>
</svelte:head>

<div class="page-grid">
  <section class="panel">
    <div class="section-header">
      <h1>Traits</h1>
      <span class="patch-badge">Seeded slice</span>
    </div>

    <div class="stack">
      {#each items as item}
        <article class="entity-card">
          <div>
            <h2><a href={`/codex/traits/${item.slug}`}>{item.name}</a></h2>
            <p>{item.summary}</p>
          </div>

          <TooltipCard
            name={item.name}
            entityType={item.entityType}
            summary={item.summary}
            effects={item.effects}
            patchChangedIn={item.patchChangedIn}
            sourceLabel={item.sourceLabel}
            sourceUrl={item.sourceUrl}
            tags={item.tags}
            variant="compact"
          />
        </article>
      {/each}
    </div>
  </section>
</div>
