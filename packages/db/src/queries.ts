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

export const fallbackAuthoritiesList: CodexListItem[] = [
  {
    slug: "corporate",
    name: "Corporate",
    entityType: "authority",
    summary: "A corporate authority centered on commercial governance, executive power, and branch office expansion.",
    patchChangedIn: "4.3",
    tags: ["megacorp", "trade", "branch-offices"]
  },
  {
    slug: "oligarchic",
    name: "Oligarchic",
    entityType: "authority",
    summary: "A society governed by a ruling elite, balancing flexible leadership with institutional continuity.",
    patchChangedIn: "4.3",
    tags: ["government", "flexible", "elite-rule"]
  }
];

export const fallbackAuthorityDetails: Record<string, CodexDetail> = {
  corporate: {
    name: "Corporate",
    slug: "corporate",
    entityType: "authority",
    summary: "A corporate authority centered on commercial governance, executive power, and branch office expansion.",
    effects: ["Can establish Branch Offices", "Unlocks Megacorp government mechanics"],
    requirements: [],
    restrictions: [],
    patchHistory: [
      {
        patchVersion: "4.3",
        changeKind: "modified",
        changeSummary: "Seeded baseline authority detail record."
      }
    ],
    source: {
      label: "Stellaris Wiki",
      url: "https://stellaris.paradoxwikis.com/Government"
    },
    tags: ["megacorp", "trade", "branch-offices"]
  },
  oligarchic: {
    name: "Oligarchic",
    slug: "oligarchic",
    entityType: "authority",
    summary: "A society governed by a ruling elite, balancing flexible leadership with institutional continuity.",
    effects: ["Supports regular agenda-based government progression", "Ruler is selected through periodic leadership rotation"],
    requirements: [],
    restrictions: [],
    patchHistory: [
      {
        patchVersion: "4.3",
        changeKind: "modified",
        changeSummary: "Seeded baseline authority detail record."
      }
    ],
    source: {
      label: "Stellaris Wiki",
      url: "https://stellaris.paradoxwikis.com/Government"
    },
    tags: ["government", "flexible", "elite-rule"]
  }
};
