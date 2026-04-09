<script lang="ts">
  import TooltipCard from "../../../../lib/components/cards/TooltipCard.svelte";

  const trait = {
    name: "Intelligent",
    entityType: "trait",
    summary: "This species excels at advanced reasoning and research.",
    effects: ["+10% Research from Jobs"],
    requirements: [],
    restrictions: [],
    patchChangedIn: "4.3",
    sourceLabel: "Stellaris Wiki",
    sourceUrl: "https://stellaris.paradoxwikis.com/Traits",
    tags: ["science", "research", "biological"]
  };
</script>

<svelte:head>
  <title>Intelligent · Traits Codex · Astral Ledger</title>
</svelte:head>

<div class="page-grid">
  <section class="panel">
    <div class="section-header">
      <div>
        <p class="eyebrow">Trait</p>
        <h1>{trait.name}</h1>
      </div>
      <span class="patch-badge">Patch {trait.patchChangedIn}</span>
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
        patchChangedIn={trait.patchChangedIn}
        sourceLabel={trait.sourceLabel}
        sourceUrl={trait.sourceUrl}
        tags={trait.tags}
        variant="detail"
      />
    </div>
  </section>
</div>
