import type { CodexDetail, CodexListItem } from "@astral-ledger/contracts";

export const fallbackTraitsList: CodexListItem[] = [
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

export const fallbackTraitDetails: Record<string, CodexDetail> = {
  intelligent: {
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
  }
};

export const fallbackEthicsList: CodexListItem[] = [
  {
    slug: "fanatic-materialist",
    name: "Fanatic Materialist",
    entityType: "ethic",
    summary: "A strongly materialist society that prioritizes scientific progress and rational systems.",
    patchChangedIn: "4.3",
    tags: ["science", "technology", "materialist"]
  },
  {
    slug: "xenophile",
    name: "Xenophile",
    entityType: "ethic",
    summary: "A society that embraces cooperation, diplomacy, and openness toward alien civilizations.",
    patchChangedIn: "4.3",
    tags: ["diplomacy", "trade", "federation"]
  }
];

export const fallbackEthicDetails: Record<string, CodexDetail> = {
  "fanatic-materialist": {
    name: "Fanatic Materialist",
    slug: "fanatic-materialist",
    entityType: "ethic",
    summary: "A strongly materialist society that prioritizes scientific progress and rational systems.",
    effects: ["+10% Research Speed", "-10% Robot Upkeep"],
    requirements: [],
    restrictions: [],
    patchHistory: [
      {
        patchVersion: "4.3",
        changeKind: "modified",
        changeSummary: "Seeded baseline ethic detail record."
      }
    ],
    source: {
      label: "Stellaris Wiki",
      url: "https://stellaris.paradoxwikis.com/Ethics"
    },
    tags: ["science", "technology", "materialist"]
  },
  xenophile: {
    name: "Xenophile",
    slug: "xenophile",
    entityType: "ethic",
    summary: "A society that embraces cooperation, diplomacy, and openness toward alien civilizations.",
    effects: ["+1 Envoy", "+10% Trade Value"],
    requirements: [],
    restrictions: [],
    patchHistory: [
      {
        patchVersion: "4.3",
        changeKind: "modified",
        changeSummary: "Seeded baseline ethic detail record."
      }
    ],
    source: {
      label: "Stellaris Wiki",
      url: "https://stellaris.paradoxwikis.com/Ethics"
    },
    tags: ["diplomacy", "trade", "federation"]
  }
};
