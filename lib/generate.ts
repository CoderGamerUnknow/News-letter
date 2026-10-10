import type { Article, Section } from "./articles";
import { hashString, mulberry32 } from "./random";

/**
 * Deterministic, seeded filler-story generator.
 *
 * The paper ships a handful of hand-written features in `articles.ts`. This
 * module expands the edition to a full news cycle with stories generated from
 * a fixed seed, so the same build always produces the same output — no
 * randomness at runtime, no binary assets, no CMS.
 *
 * Generated stories are appended *after* the hand-written ones, so the front
 * page and section leads still surface the curated features first.
 */

type Rng = () => number;

const SECTION_TONES: Record<Section, [string, string][]> = {
  World: [
    ["#1d3557", "#457b9d"],
    ["#22333b", "#5c6f76"],
    ["#344e41", "#588157"],
  ],
  Politics: [
    ["#3a0ca3", "#7209b7"],
    ["#5f0f40", "#9a031e"],
    ["#3c1642", "#7b2d8e"],
  ],
  Business: [
    ["#5c4033", "#a2693d"],
    ["#283618", "#606c38"],
    ["#432818", "#99582a"],
  ],
  Technology: [
    ["#0b525b", "#219ebc"],
    ["#10002b", "#7b2cbf"],
    ["#03045e", "#0077b6"],
  ],
  Culture: [
    ["#6a4c93", "#b5179e"],
    ["#80ffdb", "#72efdd"],
    ["#ffb703", "#fb8500"],
  ],
  Sports: [
    ["#1b4332", "#40916c"],
    ["#003049", "#669bbc"],
    ["#48cae4", "#00b4d8"],
  ],
};

const AUTHORS: Record<Section, string[]> = {
  World: ["Mara Ellison", "Hana Okonkwo", "Felix Brandt"],
  Politics: ["Priya Nair", "Gerald Simmons", "Ana Duarte"],
  Business: ["Desmond Cole", "Rhea Kapoor", "Martin Vell"],
  Technology: ["Julian Voss", "Sana Iqbal", "Theo Marsh"],
  Culture: ["Naomi Adeyemi", "Lucas Fenn", "Iris Kowalski"],
  Sports: ["Tomás Rivera", "Dana Whitfield", "Kofi Mensah"],
};

const SUBJECTS: Record<Section, string[]> = {
  World: [
    "Border Commission",
    "Relief Agency",
    "Coastal Alliance",
    "Trade Delegation",
    "Refugee Accord",
    "Water Council",
    "Summit Hosts",
  ],
  Politics: [
    "Senate Committee",
    "City Council",
    "Election Board",
    "Budget Office",
    "Ethics Panel",
    "Transit Authority",
    "School Board",
  ],
  Business: [
    "Manufacturing Coalition",
    "Retail Federation",
    "Freight Operators",
    "Banking Group",
    "Startup Incubator",
    "Labor Union",
    "Export Council",
  ],
  Technology: [
    "Chip Consortium",
    "Grid Operators",
    "Cloud Providers",
    "Cyber Task Force",
    "Research Lab",
    "Telecom Carriers",
    "Open-Source Foundation",
  ],
  Culture: [
    "City Museum",
    "Film Festival",
    "Publishing House",
    "Symphony Orchestra",
    "Theater Company",
    "Art Collective",
    "Heritage Trust",
  ],
  Sports: [
    "League Governors",
    "Coaches Association",
    "Olympic Committee",
    "Club Owners",
    "Referees Union",
    "Fan Associations",
    "Youth Academy",
  ],
};

const ACTIONS: Record<Section, string[]> = {
  World: [
    "reaches a framework agreement",
    "opens a new round of talks",
    "signs a mutual-aid pact",
    "extends a ceasefire",
    "approves a shared registry",
  ],
  Politics: [
    "advances a sweeping bill",
    "blocks a key appointment",
    "orders an independent audit",
    "approves a funding formula",
    "delays a contested vote",
  ],
  Business: [
    "reports rising order books",
    "announces a regional expansion",
    "navigates a difficult quarter",
    "secures new investment",
    "reworks its supply chain",
  ],
  Technology: [
    "unveils a new platform",
    "sets an open standard",
    "trials a battery pilot",
    "launches a fabrication line",
    "strengthens its security posture",
  ],
  Culture: [
    "reopens a restored wing",
    "wins a prestigious prize",
    "premieres a new season",
    "acquires a landmark collection",
    "announces a free public program",
  ],
  Sports: [
    "takes the league title",
    "breaks a course record",
    "trades a star forward",
    "opens a new training academy",
    "clinches a playoff berth",
  ],
};

const DETAILS: Record<Section, string[]> = {
  World: [
    "The framework establishes shared monitoring and a standing response team.",
    "Negotiators described the registry as the hardest piece of the package.",
    "Enforcement powers were the last concession to clear the table.",
    "A joint commission will convene on short notice during emergencies.",
  ],
  Politics: [
    "The measure passed with bipartisan support after weeks of amendments.",
    "Oversight provisions require quarterly reporting on delays.",
    "The vote sharpens a fight ahead of next year's budget cycle.",
    "Leadership has not committed to a floor date.",
  ],
  Business: [
    "The figures mark the strongest showing in several quarters.",
    "Analysts caution that the recovery remains uneven by region.",
    "Access to credit eased slightly for smaller firms.",
    "The company is betting on demand growth rather than scarcity.",
  ],
  Technology: [
    "The system stores surplus generation to cover peak demand.",
    "Engineers called the interconnection the fastest part of the build.",
    "Regulators attached transparency and sharing conditions.",
    "Testing begins in the spring before commercial traffic.",
  ],
  Culture: [
    "Curators said the change lets them display fragile works longer.",
    "Admission stays free, funded by an endowment raised alongside the budget.",
    "The opening exhibition traces a century of practice.",
    "A study room lets visitors request works not on display.",
  ],
  Sports: [
    "The result exceeded every expectation set in the preseason.",
    "The decisive move came on a gradual climb late in the contest.",
    "Organizers called it the closest finish in the event's history.",
    "The squad's core stays, but reinforcements are needed.",
  ],
};

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const OPENERS = [
  "The decision landed after months of quiet groundwork.",
  "It is the most significant shift in the field in years.",
  "The announcement caught many observers off guard.",
  "Few outside the room expected the outcome to move this quickly.",
  "The change resolves a question that had lingered for the better part of a year.",
];

const BRIDGES = [
  "The implications extend well beyond the immediate parties.",
  "What happens next will depend on details still being worked out.",
  "The effects are likely to be felt unevenly across the sector.",
  "For the people closest to it, the change is already tangible.",
  "The full picture will not emerge for several weeks.",
];

const VOICES = [
  '"We are still working through the implications," one person close to the talks said.',
  '"This is the moment we have been preparing for," a senior official said.',
  'Critics were quick to caution that "the hard part starts now."',
  '"Do not mistake motion for progress," one veteran observer warned.',
  '"There is a lot to like here, and a lot to watch," an analyst said.',
];

const CLOSERS = [
  "Neither side would comment further, and additional announcements are expected in the weeks ahead.",
  "The next test comes when the details are put to a vote.",
  "For now, all eyes turn to how the commitment holds up under scrutiny.",
  "This is a developing story and will be updated as more information becomes available.",
  "A fuller account is expected once the relevant records are released.",
];

function buildBody(rng: Rng, section: Section, headline: string): string[] {
  const detail = pick(rng, DETAILS[section]);
  return [
    `${headline}. ${pick(rng, OPENERS)} ${detail}`,
    detail,
    `${pick(rng, BRIDGES)} ${pick(rng, VOICES)}`,
    `${pick(rng, BRIDGES)} ${pick(rng, VOICES)}`,
    pick(rng, CLOSERS),
  ];
}

function buildDek(rng: Rng, section: Section): string {
  return pick(rng, DETAILS[section]);
}

/**
 * Generate `count` filler stories, deterministically seeded. Slugs are unique
 * and prefixed so they never collide with the hand-written features.
 */
export function generateStories(count: number, seed = 20261010): Article[] {
  const sections = Object.keys(SECTION_TONES) as Section[];
  const stories: Article[] = [];

  for (let i = 0; i < count; i++) {
    const section = sections[i % sections.length];
    const rng = mulberry32(hashString(`${seed}:${i}`));
    const subject = pick(rng, SUBJECTS[section]);
    const action = pick(rng, ACTIONS[section]);
    const headline = `${subject} ${action}`;
    const tone = pick(rng, SECTION_TONES[section]);
    const author = pick(rng, AUTHORS[section]);

    // Spread dates across the recent past, newest first.
    const dayOffset = Math.floor(i / sections.length);
    const date = new Date(Date.UTC(2026, 9, 1)); // Oct 1, 2026
    date.setUTCDate(date.getUTCDate() - dayOffset);

    stories.push({
      slug: `wire-${i}-${slugify(headline)}`,
      headline,
      dek: buildDek(rng, section),
      section,
      author,
      date: date.toISOString().slice(0, 10),
      readingTime: 3 + Math.floor(rng() * 6),
      tone,
      body: buildBody(rng, section, headline),
    });
  }

  return stories;
}
