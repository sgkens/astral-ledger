import type { CodexListItem, CodexDetail } from "@astral-ledger/contracts";

export async function getTraitsList(): Promise<CodexListItem[]> {
  return [
    {
      slug: "intelligent",
      name: "Intelligent",
      entityType: "trait",
      summary: "This species excels at advanced reasoning and research.",
      imageThumb: "/images/traits/intelligent/thumb.webp",
      patchChangedIn: "4.3",
      tags: ["science", "research", "biological"]
    }
  ];
}

export async function getTraitDetail(slug: string): Promise<CodexDetail | null> {
  if (slug !== "intelligent") return null;

  return {
    name: "Intelligent",
    slug: "intelligent",
    entityType: "trait",
    summary: "This species excels at advanced reasoning and research.",
    effects: ["+10% Research from Jobs"],
    requirements: [],
    restrictions: [],
    patchHistory: [
      {
        patchVersion: "4.3",
        changeKind: "modified",
        changeSummary: "Seeded baseline detail record."
      }
    ],
    source: {
      label: "Stellaris Wiki",
      url: "https://stellaris.paradoxwikis.com/Traits"
    },
    image: {
      thumb: "/images/traits/intelligent/thumb.webp",
      original: "/images/traits/intelligent/original.png"
    },
    tags: ["science", "research", "biological"]
  };
}
