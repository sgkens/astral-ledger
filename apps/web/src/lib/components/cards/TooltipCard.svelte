<script lang="ts">
  export let name: string;
  export let entityType: string;
  export let iconUrl: string | undefined = undefined;
  export let summary: string | undefined = undefined;
  export let effects: string[] = [];
  export let requirements: string[] = [];
  export let restrictions: string[] = [];
  export let patchChangedIn: string | undefined = undefined;
  export let sourceLabel: string | undefined = undefined;
  export let sourceUrl: string | undefined = undefined;
  export let tags: string[] = [];
  export let variant: "compact" | "detail" | "editorial" = "compact";
</script>

<article class={`tooltip-card tooltip-card--${variant}`}>
  <header class="tooltip-card__header">
    {#if iconUrl}
      <img class="tooltip-card__icon" src={iconUrl} alt={`${name} icon`} />
    {:else}
      <div class="tooltip-card__icon tooltip-card__icon--placeholder" aria-hidden="true"></div>
    {/if}
    <div>
      <p class="eyebrow">{entityType}</p>
      <h3>{name}</h3>
    </div>
  </header>

  {#if summary}
    <p class="tooltip-card__summary">{summary}</p>
  {/if}

  {#if effects.length}
    <section class="tooltip-card__effects">
      <h4>Effects</h4>
      <ul class="list">
        {#each effects as effect}
          <li>{effect}</li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if requirements.length}
    <section class="tooltip-card__requirements">
      <h4>Requirements</h4>
      <ul class="list">
        {#each requirements as item}
          <li>{item}</li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if restrictions.length}
    <section class="tooltip-card__requirements">
      <h4>Restrictions</h4>
      <ul class="list">
        {#each restrictions as item}
          <li>{item}</li>
        {/each}
      </ul>
    </section>
  {/if}

  <footer class="tooltip-card__footer">
    {#if patchChangedIn}
      <span class="patch-badge">Patch {patchChangedIn}</span>
    {/if}
    {#if sourceUrl && sourceLabel}
      <a href={sourceUrl} target="_blank" rel="noreferrer">{sourceLabel}</a>
    {/if}
  </footer>

  {#if tags.length}
    <div class="tag-row">
      {#each tags as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  {/if}
</article>
