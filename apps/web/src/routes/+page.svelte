<script lang="ts">
  const featured = [
    {
      name: "Golden Neural Consortium",
      summary: "Trade and science focused megacorp build.",
      style: "Trade / Science",
      patch: "4.3"
    }
  ];
</script>

<svelte:head>
  <title>Astral Ledger</title>
</svelte:head>

<div class="app-shell">
  <header class="hero panel">
    <p class="eyebrow">Astral Ledger</p>
    <h1>Stellaris codex and empire builder</h1>
    <p class="lede">
      Canonical gameplay data, patch-aware build guides, and a reusable tooltip-driven UI system.
    </p>
  </header>

  <section class="panel section">
    <div class="section-header">
      <h2>Featured build</h2>
      <span class="patch-badge">Patch 4.3</span>
    </div>

    {#each featured as item}
      <article class="entity-card">
        <div>
          <h3>{item.name}</h3>
          <p>{item.summary}</p>
        </div>
        <div class="meta-grid">
          <span>{item.style}</span>
          <span>{item.patch}</span>
        </div>
      </article>
    {/each}
  </section>
</div>
