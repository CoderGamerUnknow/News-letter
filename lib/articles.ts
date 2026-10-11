import { generateStories } from "./generate";

export type Section =
  | "World"
  | "Politics"
  | "Business"
  | "Technology"
  | "Culture"
  | "Sports";

export type Article = {
  slug: string;
  headline: string;
  dek: string;
  section: Section;
  author: string;
  /** ISO date string, e.g. "2026-10-09". */
  date: string;
  readingTime: number;
  /** Two colors used to render the card's placeholder image. */
  tone: [string, string];
  /** Article text, one entry per paragraph. */
  body: string[];
};

/**
 * Everything a story card needs, without the article body. Client components
 * receive these so a grid never ships dozens of full articles (bodies and all)
 * in the page payload. `Article` is assignable to this, so server-rendered
 * cards can still take the full object.
 */
export type StorySummary = Omit<Article, "body">;

/** Strip the body from an article for card-only consumers. */
export function summarize(article: Article): StorySummary {
  return {
    slug: article.slug,
    headline: article.headline,
    dek: article.dek,
    section: article.section,
    author: article.author,
    date: article.date,
    readingTime: article.readingTime,
    tone: article.tone,
  };
}

export const newspaper = {
  name: "The Daily Ledger",
  tagline: "Independent journalism since 1892",
  issue: "Vol. CXXXIV, No. 47",
} as const;

/**
 * Absolute base URL used by metadata, the sitemap, robots.txt and the feed.
 * Set NEXT_PUBLIC_SITE_URL when deploying; the fallback keeps local builds and
 * previews working without a domain.
 */
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://daily-ledger.example",
);

/** Absolute URL for a route path, e.g. "/section/world". */
export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).href;
}

export const sections: Section[] = [
  "World",
  "Politics",
  "Business",
  "Technology",
  "Culture",
  "Sports",
];

const curatedArticles: Article[] = [
  {
    slug: "harbor-treaty-signed",
    headline: "Pacific Nations Sign Landmark Harbor Treaty",
    dek: "After eighteen months of talks, delegates agreed on a shared framework for shipping lanes, fishing rights and disaster response.",
    section: "World",
    author: "Mara Ellison",
    date: "2026-10-09",
    readingTime: 11,
    tone: ["#1d3557", "#457b9d"],
    body: [
      "Delegates from twelve Pacific nations signed the Harbor Accord on Thursday, closing eighteen months of negotiations over the busiest shipping corridor in the hemisphere. The agreement establishes shared traffic lanes, a common registry for fishing catches and a standing response team for storms and oil spills. It is the first binding maritime framework the region has produced in a generation, and negotiators stayed in the conference hall nearly two hours past the scheduled signing to settle the final wording on enforcement.",
      "The corridor in question carries roughly a third of the world's container traffic and, in a typical year, more than four million tons of fish move through its waters. For a decade, the twelve governments had managed it through a patchwork of bilateral understandings that rarely outlasted a change of administration. The accord replaces that patchwork with a single secretariat, seated in a neutral port city, that will keep the registry, publish traffic data and convene the response team on short notice.",
      "Negotiators described the registry as the hardest piece of the package. Fleets have long questioned rival catch reports, and the accord requires vessels to transmit tonnage data within six hours of docking. An independent panel, seated by the signatories, will audit the records twice a year. The audit power was the last concession to clear; two delegations walked out over it in the spring before agreeing to a compromise that limits the panel to the twelve signatory registries and their licensed partners.",
      "The disaster clause commits each member to keep two patrol vessels and a medical ship within three days of the corridor. Ports will share weather telemetry in real time, a change officials said would have cut response times during the typhoon season that closed three main harbors last autumn. During that storm, forecasters in three countries worked from incompatible models and disagreed for nearly a day about the track; the shared feed is meant to prevent a repeat.",
      "Environmental groups offered a qualified welcome. They praised the telemetry and search-and-rescue provisions but argued the accord stops short of enforcing the existing moratorium on bottom trawling along the seamount chain. Coalition letters sent to the delegations in the final week urged a binding bycatch standard, and several negotiators said the issue is expected to return when the accord's first review convenes in two years.",
      "Shipping lines reacted cautiously, with two major carriers issuing statements welcoming the clarity of the traffic lanes while warning that the six-hour reporting rule will require new onboard systems. Smaller operators have asked the secretariat for a grace period; the accord allows one year of technical assistance before penalties begin, and the first fines cannot be assessed until the second review.",
      "The accord takes effect in January, once four of the twelve legislatures ratify it. Two governments have already scheduled votes; others face opposition from fishing cooperatives that argue the registry advantages larger fleets. In one coastal district, cooperatives have organized daily harbor protests for three weeks, and the fisheries minister there has said she will seek a delayed implementation clause for vessels under twenty meters.",
      "Talks on a common tariff schedule are set to resume in the spring. That schedule, which the negotiators deferred repeatedly, is widely seen as the real test of whether the accord's institutions can survive their first serious disagreement. For now, the delegations are counting the signature itself as the win; the secretariat's interim staff begin work next month in temporary offices overlooking the harbor the treaty is named for.",
    ],
  },
  {
    slug: "central-bank-holds-rates",
    headline: "Central Bank Holds Rates as Inflation Cools",
    dek: "Policymakers left the benchmark rate unchanged for a third straight meeting, citing steady job growth and easing prices.",
    section: "Business",
    author: "Desmond Cole",
    date: "2026-10-09",
    readingTime: 8,
    tone: ["#5c4033", "#a2693d"],
    body: [
      "The central bank held its benchmark rate steady on Wednesday for the third consecutive meeting, keeping borrowing costs at a level it has described as restrictive enough to finish the job on inflation without stalling hiring. The decision was unanimous and matched what economists had forecast, but the accompanying statement dropped a phrase about further tightening that had appeared in the previous two releases.",
      "Consumer prices rose 2.4 percent over the past year, down from 3.1 percent in the spring and the slowest pace since 2021. Food and energy costs fell outright last month, while services inflation remained the stubborn component, running near 3.6 percent. Officials singled out shelter costs, which have eased only slowly as new leases signed over the summer work their way into the index.",
      "In a statement accompanying the decision, the board noted that payroll growth has averaged 148,000 jobs a month this quarter and that unemployment holds at 4.1 percent. Two members favored a quarter-point cut, according to minutes released with the announcement. Both wrote that the lagged effects of last year's increases argue for beginning to normalize now rather than waiting for further confirmation on prices.",
      "The board's chair told reporters that the committee wants \"more than one more good reading\" before changing course, framing the choice as a balance between two risks that have grown closer together. Six months ago, the panel argued the greater danger was inflation settling above target; the updated language, for the first time, lists an unnecessarily weak labor market alongside it.",
      "Market reaction was muted. Two-year yields fell four basis points while the broader curve barely moved, and futures markets now price the first reduction at just better than even odds for the December meeting. The currency traded within a half percent of its level from the morning of the announcement, a sign that the decision itself carried few surprises.",
      "Analysts note that the bank's own forecasts leave room for a cut without contradicting the hold. Under the staff projection, inflation drifts toward the two percent target through the second half of next year even with rates unchanged, which gives the board the option to wait. Several economists warned, though, that the shelter component alone could keep the headline rate near 2.5 percent well into the spring.",
      "The decision arrives as fiscal policy shifts in the opposite direction. A spending package that takes effect in January adds stimulus at a time when the board is trying to keep demand restrained, a tension the chair declined to address directly beyond saying the committee sets policy \"independently of the budget calendar.\"",
      "Analysts expect the first reduction no earlier than December. Bond yields dipped after the decision, and the currency weakened slightly against a basket of trading partners. The board next meets in seven weeks, and by then it will have two more monthly price reports and a revised employment count from the revisions that have run larger than usual this cycle.",
    ],
  },
  {
    slug: "senate-passes-transit-bill",
    headline: "Senate Passes Sweeping Transit Bill",
    dek: "The measure funnels $94 billion toward rail modernization and rural bus networks over the next decade.",
    section: "Politics",
    author: "Priya Nair",
    date: "2026-10-08",
    readingTime: 9,
    tone: ["#3a0ca3", "#7209b7"],
    body: [
      "The Senate approved a $94 billion transit package on Tuesday, sending the bill to the House with bipartisan support after six weeks of amendments. The vote was 64 to 35, with nineteen members of the majority joining every member of the minority in support. The measure is the largest single investment in passenger rail since the interstate system was completed.",
      "Roughly two thirds of the money is earmarked for rail: signal replacement on the eastern corridor, a second track along the southern freight line, and station accessibility upgrades at 210 stops. The remainder goes to bus networks, with a dedicated rural fund that guarantees every county at least one daily route by 2033. Transit agencies had spent two years compiling wish lists, and the final formula weights ridership less heavily than earlier drafts.",
      "The bill also raises the federal share of project costs from 50 to 65 percent, a change mayors had lobbied for across two sessions. In exchange, agencies must publish construction timelines and report quarterly on delays exceeding ninety days. Supporters called the reporting requirement the price of the larger federal share; several big-city transit heads have already said they will meet it by publishing dashboards that already track similar metrics.",
      "The signal program drew the most attention in floor debate. The eastern corridor's equipment dates in places to the 1970s, and a cascade of failures last winter delayed trains for hours on four consecutive days. The bill funds a full replacement over eight years and requires the railroad to install a backup power system at every relay tower, a provision added after investigators found that a single substation failure had halted an entire line.",
      "Rural advocates spent weeks arguing that the guarantee of one daily route sets a floor that some counties will struggle to reach on their own. The final text softens the requirement to a planning obligation with a waiver process, but it attaches $8 billion to the fund and lets counties pool routes across borders. Two regional councils have already proposed shared service maps.",
      "Opponents raised the cost. Several senators noted that the bill's ten-year window assumes annual appropriations that no Congress is bound to honor, and that the trust fund that finances transit is projected to run short within five years. The majority leader agreed to a separate vote on replenishing the fund, which failed by four votes but drew enough support to suggest a later deal.",
      "Labor provisions were among the last to be settled. The measure requires project labor agreements on federally funded rail work above $200 million and funds apprenticeship slots tied to the accessibility program. Unions called it the strongest hiring language in any recent infrastructure bill; contractor groups sought, and failed to win, an exemption for small rural projects.",
      "The House is expected to take up the measure after the recess. Its transportation chair has signaled support for the funding formula but wants a shorter compliance window for smaller systems. Leadership has not committed to a floor date, and the bill's path is entangled with a broader spending package that must move before the end of the year.",
      "Even if the House clears the bill unchanged, agencies expect the first construction money in the spring. Several projects are shovel-ready, including two tunnel rehabilitations and a bridge replacement that have cleared environmental review. The accessibility upgrades, which touch the most stations, are scheduled to begin first because they can proceed line by line without shutting corridors.",
    ],
  },
  {
    slug: "chip-startup-unveils-fab",
    headline: "Domestic Chip Startup Unveils First Fabrication Plant",
    dek: "The $6 billion facility promises 4,000 jobs and a new chapter for homegrown semiconductor manufacturing.",
    section: "Technology",
    author: "Julian Voss",
    date: "2026-10-09",
    readingTime: 12,
    tone: ["#0b525b", "#219ebc"],
    body: [
      "A nine-year-old chip design company opened its first fabrication plant on Friday, a $6 billion facility that shifts the firm from ordering silicon abroad to producing its own wafers. The opening ceremony ran three hours long, and the governor flew in for the ribbon cutting; by the end of the day the company had already shipped its first production lot to an automotive customer.",
      "The plant will start with 180-nanometer power-management chips before moving to 90-nanometer parts next year, a deliberate choice of mature nodes over leading-edge geometry. Executives said the demand for power conversion in cars, appliances and grid equipment is steadier than the market for the fastest processors, and far less exposed to the boom-and-bust cycle that has repeatedly stranded leading-edge capacity.",
      "The site itself took four years to build and sits on reclaimed industrial land beside a river that once powered a steel mill. Construction employed 2,800 workers at peak; the permanent workforce ramps to 4,000 at full capacity, about a third of them engineers. The company has signed two regional colleges to run a technician program, and the first 240 apprentices began coursework in August.",
      "Cleanroom space covers roughly the area of nine football fields, and the fab runs around the clock once qualification completes. A facilities director described the water system as the plant's most demanding subsystem: the fab recirculates more than 80 percent of what it draws, and a series of settling ponds treat the remainder before it leaves the site.",
      "Supply chain questions linger. The company still licenses several process patents from overseas partners and buys most of its substrates and specialty gases abroad. Officials at the opening said a domestic supplier park, on land already zoned beside the plant, is the next milestone. Two gas suppliers have signed letters of interest; neither has committed to a timetable.",
      "The economics are unproven. Mature-node margins run thinner than leading-edge ones, and the plant must run at high utilization to service the debt behind its construction. The company's chief financial officer said the order book covers about 60 percent of planned capacity through the first two years, with the balance expected from grid and appliance manufacturers that have not yet signed.",
      "Industry analysts were broadly positive but cautious. Several noted that the region has no cluster of tool suppliers or specialty chemical vendors, which raises costs for every wafer produced. Others pointed to the plant's advantage: proximity to customers who spent the shortages of recent years redesigning circuits to use whatever chips they could get.",
      "Labor could prove the binding constraint. The fab needs technicians who can troubleshoot equipment measured in nanometers, and the surrounding counties have offered no comparable jobs in a generation. College administrators expect the apprenticeship to draw from a pool that includes career-changers from the old mill, and the program's first cohort skews older than a typical incoming class.",
      "Production is not yet a full story. Executives were candid at the opening that the first year is a learning curve, and that yields on a new line typically climb for three quarters before stabilizing. The company has committed to a quarterly yield report, a level of disclosure unusual in the industry, which it framed as a promise to the taxpayers who backed part of the construction.",
      "State incentives covered about a fifth of the plant's cost through a package that ties the subsidy to employment thresholds. If the company falls short of its hiring commitments, part of the grant converts to a repayable loan. The state's economic development agency said the clawback clause was non-negotiable from the first round of talks.",
      "For now, the region is treating the opening as a turning point. Land prices around the site have risen sharply, and a developer has broken ground on housing for an influx of engineers. The company says it will decide on a second phase, likely a research line, by the end of next year.",
    ],
  },
  {
    slug: "museum-reopens-wing",
    headline: "City Museum Reopens Restored East Wing",
    dek: "A four-year renovation returns a century of photography and sculpture to public view, free of charge.",
    section: "Culture",
    author: "Naomi Adeyemi",
    date: "2026-10-07",
    readingTime: 7,
    tone: ["#6a4c93", "#b5179e"],
    body: [
      "The city museum reopened its east wing on Saturday after four years of work, returning sixteen galleries and more than 2,000 objects to public view. Crowds lined the block before opening, and by noon the museum had admitted more visitors than the wing drew in its final month before closing.",
      "The renovation replaced the roof, rebuilt climate control and moved the photography collection into daylight-filtered rooms for the first time. Curators said the change lets them display fragile prints for longer stretches without risking the silver emulsion. The old galleries had kept the photography in near-darkness, which protected the prints but made them hard to see.",
      "A structural engineer described the roof as the project's quiet center. The original 1961 membrane had been patched for decades, and the replacement had to carry the weight of new mechanical equipment without transferring load to walls that were never designed for it. The solution added an independent steel frame that sits clear of the historic fabric.",
      "Admission to the wing stays free, funded by an endowment raised alongside the construction budget. The museum also added a study room where visitors can request works that are not on display. Curators expect the room to draw researchers but also casual visitors curious about the parts of the collection that rarely travel.",
      "The opening exhibition pairs early street photography with sculpture from the same decades, tracing how both practices turned toward ordinary urban life. The pairing is deliberate: a bronze of a newsboy stands near a photograph of the same corner sixty years later, and the wall text invites visitors to compare what each medium chose to keep.",
      "The wing also restores a skylit atrium that had been walled off since the 1980s. Architects reopened it as a gathering space, and the museum now programs it with free evening concerts through the winter. The atrium's travertine had been painted over; stripping the paint took the better part of a year.",
      "Not everything made it back. A set of murals removed during an earlier renovation remains in storage, too fragile to reinstall and too large for the study room. The museum says it is exploring a traveling exhibition that could carry them to three other cities beginning in two years.",
      "The opening exhibition pairs early street photography with sculpture from the same decades, tracing how both practices turned toward ordinary urban life. It runs through February, and the museum has extended its hours on Thursdays to accommodate the expected crowds. Memberships, which grant early access, have already doubled from last year's total.",
    ],
  },
  {
    slug: "marathon-record-falls",
    headline: "Course Record Falls at Autumn Marathon",
    dek: "Running through steady rain, the 27-year-old shattered a mark that had stood since 2011.",
    section: "Sports",
    author: "Tomás Rivera",
    date: "2026-10-08",
    readingTime: 6,
    tone: ["#1b4332", "#40916c"],
    body: [
      "A 27-year-old runner broke the course record at the Autumn Marathon on Sunday, finishing in 2 hours 6 minutes 41 seconds despite rain that never let up along the riverfront stretch. The margin over the previous mark was eleven seconds, and it came in a race the winner spent nearly alone for its second half.",
      "The previous record had stood since 2011. The winner separated from the lead pack at the nineteenth mile, on a gradual climb that has historically been where the race is decided, and ran the final 10 kilometers alone. Splits show the decisive move was not a surge but a refusal to slow: the pace between miles nineteen and twenty-three was faster than the miles before it.",
      "The conditions were worse than they looked on paper. Steady rain and a headwind on the return leg pushed effective temperatures down, and organizers had treated the course as a potential record risk only in the opening hours before the forecast shifted. \"We honestly thought the wind would take it off the table,\" the race director said afterward.",
      "Organizers said 31,400 runners started, about 800 fewer than last year, with 400 treated for weather-related complaints on a colder-than-forecast morning. Medical staff set up an additional warming tent at the twenty-mile mark after the forecast firmed up on Friday, and it saw more use than any single station on the course.",
      "The women's race was decided by four seconds in a sprint finish, the closest in the event's history. The two leaders traded the lead twice in the final kilometer, and the runner-up said afterward she had not realized how close the finish would be until the grandstand came into view.",
      "Beneath the elite race, the event's broader numbers held steady. Charity entries raised a record sum, and the wheelchair division produced a course best as well. The organizer said entries for next year open in two weeks and that the field will be capped at the same size.",
      "The course record carries a bonus on top of the prize money. Race officials said next year's date is already set, and they expect a deeper field now that the mark has fallen. The winner, who trains at altitude, said the rain had not been part of the plan but that the course suited a grinder's style.",
    ],
  },
  {
    slug: "wildfire-season-outlook",
    headline: "Forecasters Warn of a Longer Wildfire Season",
    dek: "Dry conditions and shifting winds could push the risk window well into November, officials said.",
    section: "World",
    author: "Mara Ellison",
    date: "2026-10-06",
    readingTime: 8,
    tone: ["#7f5539", "#ddb892"],
    body: [
      "Fire forecasters warned Monday that this year's risk window could stretch into late November, well past the historical end of the season, after a summer of below-average rainfall and a slow-building drought across the interior. The outlook is the latest in a series of revisions that have pushed the season longer in each of the past five years.",
      "Soil moisture readings at a third of monitoring stations are at their lowest for early October in twenty years. Grass and brush that grew during last spring's wet spell have since cured, leaving what one official called continuous fuel across several districts. The concern is not a single dry year but a stack of them, which has left the water table lower than the surface readings suggest.",
      "The outlook points to a shift from timber fires toward fast-moving grass fires near the urban edge, which are cheaper to fight but harder to predict and often reach structures within an hour of ignition. A fire behavior analyst compared the difference to a campfire versus a blowtorch: the grass fires move with the wind and outrun anything on wheels.",
      "Communities along the foothills have spent the summer on mitigation. One county cleared brush along thirty miles of roadside and offered free chipping to residents who hauled cuttings to designated depots. Officials said the work pays off most where structures sit close together, since embers in those blocks spread fire from roof to roof.",
      "Emergency agencies have extended seasonal crew contracts by six weeks and kept two water-bombing aircraft on standby. A regional coordination center has also moved to daily briefings, a shift that one director said reflects how quickly grass fires can grow once a wind shift lines up with a fuel break.",
      "Forecasters are watching an unusual pattern in which the jet stream has settled far to the north, blocking the fall storms that normally end the season. The pattern has persisted for three weeks, and forecasters put even odds on whether it breaks before November. A shift would bring rain but also the lightning that often starts fires in dry country.",
      "Insurance has become part of the conversation. Two national reinsurers have raised rates in the highest-risk districts, and one has stopped writing new policies there entirely. State regulators held a hearing last month on a proposal to spread the cost through a shared pool, a model that has drawn both praise and warnings about moral hazard.",
      "Officials urged residents in the foothills to clear defensible space and to sign up for evacuation alerts. They noted that the majority of structures lost in recent fires have burned in the first hour, before crews could arrive, which makes early warning and simple hardening the most reliable defenses available.",
      "The season's end, when it comes, will likely arrive with the first sustained cold front rather than a single rain. Forecasters said that even a wet November would not reverse the drought, and that the fuels cured over five dry years will keep the risk elevated into next spring unless the pattern changes decisively.",
    ],
  },
  {
    slug: "union-talks-resume",
    headline: "Dockworkers and Ports Resume Contract Talks",
    dek: "Negotiators returned to the table after a two-week pause, with automation at the center of the dispute.",
    section: "Business",
    author: "Desmond Cole",
    date: "2026-10-07",
    readingTime: 7,
    tone: ["#283618", "#606c38"],
    body: [
      "Dockworkers and port operators resumed contract talks on Tuesday after a two-week pause, with both sides describing the session as constructive but declining to detail progress. The talks, now in their fifth month, have taken on outsized importance because the ports involved handle a disproportionate share of the region's containerized freight.",
      "Automation remains the central dispute. The ports want to deploy driverless yard equipment at four terminals; the union has offered to staff semi-automated cranes in exchange for retraining guarantees and a share of the productivity gains. Both positions have hardened and softened at different points, and observers say the outline of a deal is visible even as the gap remains wide.",
      "The union's proposal ties automation to headcount floors rather than job bans, a shift from earlier rounds. Under the plan, no current worker would be laid off because of automation, and new equipment would be staffed at ratios the two sides negotiate terminal by terminal. Operators have resisted the ratios as too rigid for a business with seasonal swings.",
      "Port authorities counter that the technology's whole purpose is flexibility. They point to terminals overseas where a single operator monitors a fleet of vehicles, and argue that locking in staffing ratios would leave them less competitive than rival ports two hundred miles down the coast. The union responds that overseas deployments have so far kept human spotters on every lane.",
      "The existing agreement expired in June and has been extended twice. Cargo has moved without interruption so far, though shippers have begun routing some seasonal freight through alternate ports as a precaution. One large retailer has moved a third of its holiday volume to a rival port, a decision that will be hard to reverse before spring.",
      "Economists watching the talks note that the dispute arrives at a fragile moment for shipping. Volumes are up modestly after two flat years, and carriers have capacity to spare, which gives them somewhere to divert cargo if a slowdown stretches on. That leverage cuts both ways: the ports lose revenue the longer the uncertainty persists.",
      "A federal mediator has scheduled sessions through the end of the month, including two marathon weekends designed to close the remaining articles. Both sides said they would not comment publicly while talks continue, and the mediator has asked contractors and terminals alike to keep negotiations quiet.",
      "Local businesses near the docks have begun to feel the ambiguity. Trucking firms report drivers asking for guarantees about weekend work, and a cluster of restaurants that serve the terminals has seen lunch crowds thin. One chamber of commerce has urged both sides to settle before the holiday shipping peak.",
      "The next session is set for next week. Observers will be watching for movement on the staffing ratios, which both sides have identified as the last serious obstacle. A deal before the end of the year would come none too soon for shippers who have already begun planning around the possibility of a lockout.",
    ],
  },
  {
    slug: "border-river-pact-final-round",
    headline: "Border River Pact Reaches Final Round",
    dek: "Two nations close in on a sharing formula for a river that supplies a tenth of the region's drinking water.",
    section: "World",
    author: "Mara Ellison",
    date: "2026-10-05",
    readingTime: 9,
    tone: ["#22333b", "#5c6f76"],
    body: [
      "Negotiators entered the final round of talks on a shared river pact on Sunday, with a drafting formula on the table that would divide water between two nations that have argued over the waterway for three decades. The river supplies drinking water to twelve million people and irrigates a valley that produces a third of the region's grain.",
      "The current proposal splits the flow by season rather than by volume, allocating a larger share upstream during the dry months when the channel runs low. That structure reflects the geography: the upstream nation controls the reservoirs that feed the river in summer, while the downstream country depends on the spring melt for its irrigation canals.",
      "Both sides have incentives to settle. A drought four years ago dropped the river to its lowest recorded level, and the downstream country was forced to release reservoir reserves that took two seasons to refill. The upstream nation, for its part, wants certainty for a hydroelectric expansion that is financed but stalled without an agreement.",
      "A shared monitoring regime is part of the package. Gauges at six points along the river would report flow in real time, with data going to a joint commission that can call emergency sessions. Scientists who have studied the basin said the transparency matters as much as the numbers, since past disputes have begun with disagreement over how much water was actually moving.",
      "The pact's hardest clause concerns aquifers. Groundwater has quietly made up the difference during dry years, and the current draft limits extraction to monitored basins on both sides. Farm groups on both banks have protested, arguing that wells have sustained harvests that the surface allocation alone could not support.",
      "Diplomats involved in the talks said the final round will focus on enforcement. An earlier agreement collapsed over how to handle a shortfall, and the new text proposes a graduated response: voluntary reductions first, then arbitration, with penalties reserved for a sustained refusal. No side wants a clause that turns a dry year into a dispute.",
      "Environmental organizations have pressed for ecological flows, a guaranteed minimum that stays in the channel for the river's own health. The draft reserves a modest share during the spring migration window, a first for the basin. Birdwatchers and fishing communities along the lower river have campaigned hard for the provision.",
      "The two governments have set a deadline of the end of the month, and their foreign ministers will sign if the round closes successfully. Observers note that elections upstream next year could harden positions, which gives negotiators a narrow window. Both delegations have stayed in the same hotel throughout the talks, a small sign of the pace they intend to keep.",
      "A signing ceremony is being planned for the spring, on a bridge that crosses the river at the point where the two countries meet. The downstream nation's water minister said the agreement would be remembered less for its numbers than for the fact that it exists at all.",
    ],
  },
  {
    slug: "aid-convoy-reaches-province",
    headline: "Aid Convoy Reaches Cut-Off Province",
    dek: "The first trucks in three weeks crossed a mountain pass to deliver food and medicine to a stranded region.",
    section: "World",
    author: "Mara Ellison",
    date: "2026-10-04",
    readingTime: 8,
    tone: ["#344e41", "#588157"],
    body: [
      "A convoy of forty trucks crossed a mountain pass on Saturday to reach a province cut off for three weeks, delivering the first substantial food and medicine since landslides closed the only road in. The provincial capital's hospitals had been operating on rationed supplies, and clinics in the outlying districts had run out of insulin entirely.",
      "The road failed in two places at once after a week of rain, and engineers said the repair was complicated by the terrain: the slope above the lower slide is still moving, and a single heavy rain could close it again. The convoy used a seasonal track that bypasses the worst section but is impassable to large trucks in bad weather.",
      "Relief officials described the deliveries as a reprieve rather than a solution. The convoy carries roughly enough grain to last the province's households ten days, and the plan is to keep a truck every other day while the road is repaired. Fuel, which the province also needs, remains the hardest cargo to move over the track.",
      "The provincial hospital used the first hours of the delivery to restart elective procedures that had been postponed since the road closed. A surgeon there said the priority list had grown longer than the operating schedule could absorb, and that some patients had been stabilized only to deteriorate while waiting.",
      "Communications were restored before the food. A helicopter brought satellite terminals five days after the slides, and phone service has been intermittent since. Officials said the restored links let them send accurate supply requests for the first time, replacing the estimates that had driven earlier, smaller drops.",
      "The landslides killed four people and destroyed more than a hundred homes in the villages nearest the failures. Rebuilding is expected to take through the winter, and the government has promised temporary housing for families whose houses sat directly in the path of the mud.",
      "For residents, the convoy's arrival carried an emotional weight beyond its cargo. Shopkeepers in the capital reopened their shutters within hours of the trucks arriving, and a line formed outside the one bakery that had fuel to fire its ovens. \"We could finally breathe,\" one resident said.",
      "Engineers will begin stabilizing the slope above the lower slide next week, work that is expected to take a month under good conditions. The authorities have warned that the seasonal track may not hold through the autumn rains, and they are pre-positioning supplies in the province before the weather turns.",
      "The convoy's success has renewed calls for a second road into the province, a project proposed for decades and never funded. Officials said the landslides had made the case more urgent, and that a feasibility study would be commissioned before the end of the year.",
    ],
  },
  {
    slug: "committee-subpoenas-records",
    headline: "Committee Subpoenas Agency Records",
    dek: "Lawmakers escalated a year-long oversight fight, demanding emails and calendars from three officials.",
    section: "Politics",
    author: "Priya Nair",
    date: "2026-10-06",
    readingTime: 8,
    tone: ["#5f0f40", "#9a031e"],
    body: [
      "A Senate committee issued subpoenas on Monday for emails and calendars belonging to three agency officials, escalating an oversight fight that has dragged on for a year. The committee has sought the documents voluntarily; the agency had released excerpts but withheld roughly two-thirds on deliberative-process grounds.",
      "The records concern a procurement decision that the committee's ranking member has called \"the whole ballgame\" in understanding how a contract grew from $40 million to more than $300 million over two years. The agency maintains that the increases tracked a broadened scope of work and were reviewed at each stage.",
      "Committee staff spent months narrowing the request, cutting it from tens of thousands of documents to a defined set tied to four decision points. That narrowing was designed to survive a legal challenge, since courts have grown skeptical of broad oversight demands that look more like fishing expeditions.",
      "The agency's inspector general is conducting a separate review and has asked the committee to wait for its findings. The chair declined, saying the oversight mandate and the audit serve different purposes and that waiting could push the matter past the next appropriations cycle.",
      "Legal scholars expect a fight over executive privilege, though the officials in question are career staff rather than political appointees, which narrows the administration's ability to claim broad protection. One former ethics official noted that prior disputes over similar documents were settled in the courts' favor for Congress.",
      "The subpoenas carry a return date of three weeks, and the committee has scheduled a hearing shortly after. Both sides have signaled they would rather negotiate than litigate, but neither has publicly budged on the central question of how much of the deliberative record becomes part of the public file.",
      "The timing is not accidental. The committee's majority has made the procurement part of a broader argument about oversight ahead of next year's budget fights, and the ranking member has warned that the subpoenas could poison cooperation on unrelated legislation.",
      "Agency officials have retained outside counsel, a step that usually signals a prolonged dispute. The general counsel said in a memo to staff that the agency would comply with any court order and that employees should preserve all records tied to the contract, a directive that itself became a point of contention.",
      "A resolution is possible but unlikely soon. Prior committee subpoenas of this kind have taken months to wind through the courts, and both sides appear to be preparing for that timeline even as they leave the door open to a negotiated release.",
    ],
  },
  {
    slug: "governors-press-disaster-fund",
    headline: "Governors Press for Disaster Fund Fix",
    dek: "A bipartisan group warned that the relief fund will run dry before the next storm season without action.",
    section: "Politics",
    author: "Priya Nair",
    date: "2026-10-05",
    readingTime: 7,
    tone: ["#3c1642", "#7b2d8e"],
    body: [
      "A bipartisan group of sixteen governors wrote to congressional leaders on Friday urging a fix for the disaster relief fund, warning that it will run dry before next year's storm season without a supplemental appropriation. The fund has been stretched by three consecutive years of major storms and a wildfire season that has yet to end.",
      "The letter walks a careful line, praising the existing program while arguing that its pacing rules leave states holding costs they cannot recover. Under current rules, states front the money for emergency work and seek reimbursement later, a structure that has strained budgets in smaller states especially.",
      "The administration has already asked Congress for a supplemental, but the request has been caught in a broader spending fight. Governors of both parties are hoping that framing the issue around storm readiness rather than politics can move it before the session ends.",
      "State emergency managers describe a fund that works well for individual disasters but struggles when several overlap. The past two years have brought a hurricane, a wildfire and a flood in the same season, and the reimbursements for the earlier events have not cleared while the later ones accumulate.",
      "Congressional appropriators have signaled openness but disagree about offsets. One proposal would trim unrelated programs to pay for the supplemental; another would treat the disaster fund as mandatory spending, insulating it from annual budget fights. The governors' letter endorses the second approach without saying so explicitly.",
      "Local officials back the governors. A county commissioner from a storm-battered district testified last month that his government had borrowed to cover debris removal and was paying interest on money the federal program has acknowledged it owes. Similar stories have multiplied in the delegations' inboxes.",
      "The letter's timing, arriving just before a scheduled committee markup, is meant to keep the issue visible. Leadership has not committed to a vote, but the bipartisan framing gives cover to members who want to act without appearing to side with either party's leadership.",
      "A deal before the end of the year is possible but not certain. The governors have pledged to keep pressure on, with a follow-up letter planned if the supplemental stalls and a summit of affected states set for early next year.",
    ],
  },
  {
    slug: "rail-freight-volumes-rebound",
    headline: "Rail Freight Volumes Rebound",
    dek: "Carload counts rose for the fifth straight week, a sign that inventories have finally cleared.",
    section: "Business",
    author: "Desmond Cole",
    date: "2026-10-05",
    readingTime: 6,
    tone: ["#432818", "#99582a"],
    body: [
      "Rail freight volumes rose for the fifth consecutive week, according to industry counts released Monday, a streak that carriers and shippers alike have taken as a signal that the inventory drawdown that suppressed traffic for two years is finally over. Intercontainer traffic led the gain.",
      "The rebound is broad rather than concentrated. Grain shipments have picked up with the harvest, coal has stabilized after years of decline, and intermodal traffic has grown as retailers restock. One analyst described the pattern as the healthiest in the series since before the downturn, because no single commodity is carrying it.",
      "Carriers have responded by adding crews and returning stored locomotives to service. Two major railroads have reopened crew bases that they had consolidated, a reversal that hiring managers said reflects confidence that the volume is not a one-week artifact.",
      "Shippers, who spent two years complaining about service during the lean period, are now watching capacity tighten. Spot rates on several lanes have risen from their lows, and some contracts have been repriced upward for the first time in three years.",
      "The recovery is uneven by region. Lines serving ports have gained the most, while branches that depend on single industrial customers remain soft. Railroads have kept a disciplined eye on costs, and several have warned that they will not add capacity speculatively as they did in past cycles.",
      "Economists treat rail volumes as a lagging but reliable signal, since the goods counted have already been ordered. The five-week streak, taken with retail sales and trucking rates, has led several forecasters to nudge their fourth-quarter growth estimates higher.",
      "Still, carriers counsel caution. Intermodal gains can reverse quickly if retailers over-ordered, and the grain harvest that is helping now will not repeat at the same pace. The test will come in December, when the holiday peak either sustains the trend or exposes it as a pull-forward.",
      "For now, the mood on the railroads has shifted. Conductors who were furloughed two years ago have been recalled, and dispatchers describe trains running fuller than they have in years. The industry's trade group has scheduled a supply conference for next month that it expects to draw its largest crowd since the downturn began.",
    ],
  },
  {
    slug: "small-manufacturers-report-gains",
    headline: "Small Manufacturers Report First Gains",
    dek: "A survey found order books growing for the first time in eight quarters, led by equipment and parts.",
    section: "Business",
    author: "Desmond Cole",
    date: "2026-10-03",
    readingTime: 6,
    tone: ["#6b705c", "#a5a58d"],
    body: [
      "Small manufacturers reported growing order books for the first time in eight quarters, according to a survey released Thursday. The index, which tracks firms with fewer than 250 employees, rose above the break-even line for the first time since early 2024, led by equipment and precision parts makers.",
      "The improvement is modest but broad. Respondents cited steadier input prices and the end of a destocking cycle that had kept buyers on the sidelines for most of the past two years. Several described customers reordering at volumes close to their pre-downturn patterns.",
      "Capital goods makers reported the strongest gains, with one firm describing its backlog as the fullest since it opened. Reshoring of some assembly work has helped, since domestic parts suppliers benefit when final assembly moves closer to home.",
      "Not every sector shared in the recovery. Builders' suppliers remained soft, and firms dependent on a single large customer reported caution about the year ahead. The survey's authors noted that hiring plans have improved more slowly than orders, a sign of lingering uncertainty.",
      "Access to credit, a persistent complaint in prior surveys, eased slightly. Bankers reported more willingness to lend against confirmed orders, and several manufacturers said they had financed equipment purchases at rates they considered fair after two years of deferral.",
      "The survey's forward-looking component turned positive for the first time, with respondents expecting conditions to hold through the spring. Economists caution that small-firm surveys can swing with sentiment, but note that this one has been unusually stable in its downturn and may be equally steady on the way up.",
      "Trade groups are cautiously optimistic. One association has scheduled a series of regional forums to help smaller firms plan for growth they have not managed in years, including help with workforce recruitment that has stymied many openings.",
      "The next survey, due in early January, will show whether the gains held through the holiday quarter. For now, the mood among small manufacturers is the best it has been in years, even if many are hesitant to say so out loud.",
    ],
  },
  {
    slug: "undersea-cable-lands",
    headline: "New Undersea Cable Lands on Coast",
    dek: "The 8,000-kilometer line will double the region's international bandwidth when it comes online next year.",
    section: "Technology",
    author: "Julian Voss",
    date: "2026-10-04",
    readingTime: 8,
    tone: ["#10002b", "#7b2cbf"],
    body: [
      "A new undersea cable came ashore on the coast this week, the final leg of an 8,000-kilometer line that will double the region's international bandwidth when it comes online next year. The landing station, a low concrete building set back from the beach, connects to the shore through a conduit bored more than a kilometer inland.",
      "The cable itself is thinner than a garden hose but carries more than a hundred fiber pairs, each capable of transmitting data faster than the entire route it replaces. Engineers laid it across the ocean floor in eleven months, a pace made possible by purpose-built ships that spool cable as they sail.",
      "The route was chosen to avoid the underwater landslides that have severed older cables in the region. Surveys mapped the seabed in detail, and the final path swings wide around a canyon that has been the site of three breaks in a decade. Redundancy was the other priority: the cable lands at two points several hundred kilometers apart.",
      "For consumers, the effect will be felt as capacity rather than speed. Streaming services and cloud providers have long throttled regional traffic during peak hours, and the new cable gives them room to relax those limits. Mobile operators expect it to ease congestion on their backhaul links as well.",
      "The economics are less certain. Cables carry bulk bandwidth whose price has fallen for a decade, and the operators who financed this one are betting on demand growth rather than scarcity. Two content providers have already committed to capacity, which covers a third of the cable's cost over its lifetime.",
      "Regulators attached conditions to the landing permit, including a requirement to share the shore-end infrastructure with competitors. The cable's operators agreed, saying the shared facility lowers costs for everyone and speeds the permitting they had already waited two years for.",
      "The landing ceremony was modest by the standards of such projects. Crews who had spent months at sea joined engineers and local officials on a beach that will look little different afterward, since the cable itself lies buried beneath the dunes. A plaque commemorates the work inside the station.",
      "Testing begins in the spring, when the far end is energized and the cable's pairs are lit one at a time. Operators expect commercial traffic by midyear, and a second cable on a parallel route has already been surveyed for a landing three years from now.",
      "For the region, the cable is infrastructure whose importance will be easy to overlook. It carries no visible traffic and sits buried where no one will see it. But the analysts who track connectivity said the difference will show up in every service that depends on the ocean floor.",
    ],
  },
  {
    slug: "grid-battery-trial",
    headline: "Grid Operators Trial Battery Reserves",
    dek: "A pilot will store midday solar surplus to cover the evening demand peak.",
    section: "Technology",
    author: "Julian Voss",
    date: "2026-10-03",
    readingTime: 7,
    tone: ["#03045e", "#0077b6"],
    body: [
      "Grid operators began a pilot this week that will store surplus midday solar generation in utility-scale batteries and release it during the evening demand peak. The trial pairs four solar farms with a storage site that can hold enough energy to power about 30,000 homes for four hours.",
      "The problem it addresses has a name among operators: the duck curve. Solar output peaks at midday when demand is modest, forcing operators to ramp other plants up steeply as the sun sets and households come home. Storage smooths that ramp by shifting the midday surplus to the evening.",
      "The storage site occupies a former industrial lot and holds battery containers arranged in rows, each about the size of a shipping container. Engineers said the fastest part of the project was the interconnection; the batteries themselves arrived on trucks and were commissioned in weeks.",
      "Safety drove much of the design. The site includes fire walls between container rows, a dedicated response crew and a monitoring system that can isolate any cell within seconds. Neighbors, who were consulted early, secured a buffer of trees and a sound wall that also screens the cooling equipment.",
      "Regulators approved the pilot under a framework written for traditional power plants, a mismatch the commission acknowledged and said it would revisit. The trial's economics will inform a permanent rule, and the operators have committed to publishing their data so other utilities can learn from it.",
      "For the solar farms, storage changes the value of their output. Selling at midday into a saturated market had pushed prices down; storing the surplus to sell into the evening peak earns more. One farm's manager described the batteries as a way to stop giving power away.",
      "Environmental groups support the pilot while urging a faster build-out. They note that storage lets the grid absorb more renewables without backup gas plants, but that the pace of deployment lags the growth in solar generation it is meant to balance.",
      "The pilot runs for eighteen months, and operators expect to expand it if the economics work. A second site is already under study, and the commission has signaled that storage will feature prominently in next year's resource planning cycle.",
    ],
  },
  {
    slug: "novelist-wins-prize",
    headline: "Novelist Wins Prestigious Literary Prize",
    dek: "The judges praised a family saga spanning three generations and two continents.",
    section: "Culture",
    author: "Naomi Adeyemi",
    date: "2026-10-06",
    readingTime: 7,
    tone: ["#80ffdb", "#72efdd"],
    body: [
      "A novelist won the year's most watched literary prize on Thursday, for a family saga that follows three generations across two continents. The judges called the book \"a work of great patience and greater force,\" and awarded it the prize in a unanimous decision that was announced at a ceremony in the capital.",
      "The novel spans seventy years, beginning in a coastal village and ending in a city the family's youngest generation has come to call home. Its structure is braided, moving between time periods in a way that reveals connections the characters themselves cannot see. The judges singled out the final section as among the finest they had read.",
      "The author, who has published three earlier novels to critical acclaim but modest sales, said the prize had come as a surprise. \"I wrote this book for people who would never meet each other,\" the author said in an acceptance speech that drew a standing ovation. \"To learn they found one another on the page is the whole thing.\"",
      "The book took six years to write, and the author spent two of them researching the family histories that inspired it. Interviews with relatives, archive work in two countries and a stack of letters all fed into a manuscript the author described as rewritten four times before it felt finished.",
      "Critics have been near-unanimous. Reviews praised the novel's restraint and its refusal to sentimentalize either the village it leaves or the city it arrives in. One critic noted that the book's emotional power comes from what it declines to say, a quality rare in a novel of such scope.",
      "The prize carries a substantial award and, more importantly, a readership. Booksellers reported preorders climbing within an hour of the announcement, and the publisher has rushed a reprint. Translations into a dozen languages have already been sold.",
      "The author's previous novels had gone out of print, a fate the prize is likely to reverse. A regional bookshop that had kept one title on its shelves for years reported selling its entire stock by noon, and the author's first book is being reissued next month.",
      "At the ceremony, the author read a short passage from the novel's opening pages, which describe a grandmother telling stories to a grandchild who will never see the village she describes. The room, filled with writers and booksellers, listened without the shuffling that usually accompanies such readings.",
      "The author will embark on a brief tour, ending in the city where the novel is set. Asked about the next book, the author demurred, saying only that \"there is more to say about these people,\" which drew laughter and applause in equal measure.",
    ],
  },
  {
    slug: "restored-theater-reopens",
    headline: "Restored Theater Reopens Downtown",
    dek: "A 1920s movie palace returns as a performing arts venue after a decade of vacancy.",
    section: "Culture",
    author: "Naomi Adeyemi",
    date: "2026-10-02",
    readingTime: 6,
    tone: ["#ffb703", "#fb8500"],
    body: [
      "A 1920s movie palace reopened downtown on Friday as a performing arts venue, ending a decade of vacancy that had left one of the city's grandest interiors dark. The first performance was a symphony concert that sold out within minutes of tickets going on sale.",
      "The restoration took four years and cost more than the original building. Craftspeople repaired the gilded ceiling by hand, working from photographs after the plaster patterns were lost. A painted dome, hidden behind a dropped ceiling since the 1960s, was uncovered and conserved.",
      "The auditorium's acoustics had been altered by decades of changes, and the project's engineers rebuilt the rear balcony to restore the sound reflections the architects had intended. Musicians who rehearsed in the space before opening described the results as warm without being muddy.",
      "The theater's organ, silent since 1971, was rebuilt from instruments salvaged across the region. A volunteer corps of organ enthusiasts spent two years reassembling the pipes, and the instrument will accompany silent film screenings the venue plans to program monthly.",
      "Community groups pushed for the reopening to include affordable access, and the venue has committed to a block of ten-dollar tickets for every performance plus free matinees for school groups. A local arts council helped fund the program with a grant tied to educational use.",
      "The building's marquee, a landmark in its own right, was reproduced using the original sign shop's drawings. Electricians replaced every bulb with LED equivalents that match the warm glow of the originals while drawing a fraction of the power.",
      "The venue's first season mixes symphony, theater and film, with a schedule its programmers described as deliberately broad. A winter residency for a regional theater company will bring plays that had nowhere else to land downtown.",
      "For the neighborhood, the reopening caps a stretch of change. Restaurants that had opened nearby during the vacancy are reporting fuller tables, and a hotel across the street has extended its hours. The city's planning department has pointed to the theater as evidence that preservation and development can align.",
      "The first concert ended with the hall's lights brought up slowly, revealing the ceiling the audience had been sitting beneath all evening. The applause, witnesses said, lasted longer than the encore.",
    ],
  },
  {
    slug: "underdogs-take-league-title",
    headline: "Underdogs Take League Title in Extra Time",
    dek: "A club picked to finish mid-table won the championship with a goal in the 118th minute.",
    section: "Sports",
    author: "Tomás Rivera",
    date: "2026-10-07",
    readingTime: 7,
    tone: ["#003049", "#669bbc"],
    body: [
      "A club picked by most pundits to finish mid-table won the league championship on Sunday, scoring in the 118th minute of a final that had seemed headed for penalties. The goal, a header from a corner, ended a season that had exceeded every expectation set for it in August.",
      "The winning team had been promoted only two years ago and spent this season on a budget smaller than several rivals' wage bills. Their manager built the squad from free agents and players released by bigger clubs, a recruitment strategy that looked reckless in preseason and brilliant by spring.",
      "The final itself was tense and often ugly. Both teams created few chances, and the game's best moment came in the second half when a goalkeeper saved a shot that had beaten him, pushing it onto the post from the rebound. The match looked destined for penalties until the corner arrived.",
      "The goalscorer had joined the club in January as a backup. He described the moment afterward in flat terms, saying only that he had aimed for the space and the ball found him. Teammates mobbed him, and the bench emptied in a scene the club's fans had waited a generation to see.",
      "The manager, in his third season, has become a cult figure for a style that prizes work rate over flair. Players who had been discarded elsewhere have revived their careers, and the squad's average age is among the oldest in the league. \"We are not the best team,\" the manager said. \"We are the team that keeps going.\"",
      "Fans flooded the streets around the stadium after the final whistle, and the club scheduled an open-top bus parade for midweek. The celebration continued into the evening, with the town's pubs reporting they had run dry before midnight.",
      "The achievement carries a practical cost. The club must now rebuild for a continental competition it has never entered, which will strain a squad built for domestic survival. The manager has said the core stays, but reinforcements are needed and the budget will not stretch easily.",
      "Rivals have already begun plotting. One bigger club's manager congratulated his counterpart while noting that sustaining success is harder than achieving it. The champion's response came from the stands, where the fans sang the manager's name long after the players had left the pitch.",
      "For a town that has waited, the title settles something. Supporters who had watched from lower divisions for decades described Sunday as the day the club's long apprenticeship ended. The trophy will be displayed in the stadium's small museum, which until now had featured almost nothing.",
    ],
  },
  {
    slug: "swimmer-clears-world-mark",
    headline: "Swimmer Clears Second World Mark",
    dek: "The record fell in a semifinal, a day after the same swimmer broke the mark in the heats.",
    section: "Sports",
    author: "Tomás Rivera",
    date: "2026-10-05",
    readingTime: 6,
    tone: ["#48cae4", "#00b4d8"],
    body: [
      "A swimmer broke the world record for a second time in two days, lowering the mark in a semifinal a day after first setting it in the heats. The swimmer touched in a time nearly a full second faster than the record that had stood for three years before this week.",
      "The swimmer's coach said the second swim was the better race technically, with a turn that cut the wall approach by a fraction of a second and a final lap the coach called \"relentless.\" The swimmer had been unaware of the record during the race, learning of it from the scoreboard.",
      "Records in the event have historically fallen in finals, which makes a semifinal mark unusual. The swimmer explained afterward that the seeding had left nothing to save for later, and that the plan had been to win the heat decisively rather than manage energy.",
      "Rivals offered generous reactions. The defending champion, watching from the stands, said the performance had raised the bar for everyone and that the final would be \"a race for second unless something changes.\" The remark was playful but pointed.",
      "The swimmer's federation has invested in a technical program that rebuilt the stroke after a lean stretch. Coaches involved said the changes were subtle but cumulative, adjusting the catch angle and breathing pattern in ways that add up over a full race.",
      "The record carries a bonus, and the swimmer has spoken about what the prize money will fund. A training group for young swimmers in the hometown, which the swimmer credits for an early start, will receive the majority of it.",
      "The final is set for Friday, and the swimmer has said the goal is to swim faster still. History suggests the record will hold, since back-to-back swims at this level are rare. But the semifinal has rewritten what observers expect from the race.",
      "For the sport's administrators, the week has been a windfall. Ticket prices for the final have tripled on resale, and broadcasters have moved the session to a primetime slot. The swimmer, characteristically, deflected attention to the teammates who qualified alongside.",
    ],
  },
];

/**
 * How many wire stories to append after the hand-written features. Bump this
 * to grow the edition; the generator is deterministic so the output is stable
 * across builds.
 */
export const WIRE_STORY_COUNT = 240;

/**
 * The full edition: curated features first (so they anchor the front page and
 * section leads), followed by deterministic wire stories to fill out the news
 * cycle. Every helper below operates on this combined list.
 */
export const articles: Article[] = [
  ...curatedArticles,
  ...generateStories(WIRE_STORY_COUNT),
];

/** The hand-written features, in case a route wants only curated stories. */
export const curated = curatedArticles;

/** The single lead story that anchors the front page. */
export function getFeatured(): Article {
  return articles[0];
}

/** Up to `limit` stories besides the featured one, newest first. */
export function getSecondary(limit = 3): Article[] {
  return articles
    .slice(1)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

/** The latest `limit` stories, newest first. */
export function getLatest(limit = 6): Article[] {
  return [...articles]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

/**
 * The latest `limit` stories that are not already published elsewhere on the
 * page, newest first. Used so a grid never repeats a story shown above it.
 */
export function getLatestExcluding(
  exclude: readonly string[],
  limit = 6,
): Article[] {
  const skip = new Set(exclude);
  return getLatest(articles.length)
    .filter((article) => !skip.has(article.slug))
    .slice(0, limit);
}

/** URL segment for a section, e.g. "Technology" -> "technology". */
export function sectionSlug(section: Section): string {
  return section.toLowerCase();
}

/**
 * Decode a URL segment without throwing.
 *
 * `decodeURIComponent` raises a `URIError` on malformed percent-encoding
 * (`/article/100%`, `/article/%zz`), which would surface as a 500 instead of
 * the 404 an unknown slug deserves. A segment that cannot be decoded simply
 * cannot match any slug, so returning it unchanged lets the caller report the
 * miss normally.
 */
export function safeDecodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/** Resolve a URL segment back to a section, or undefined when it is not one. */
export function sectionFromSlug(slug: string): Section | undefined {
  const normalized = safeDecodeSlug(slug).toLowerCase();
  return sections.find((section) => sectionSlug(section) === normalized);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

/** Every story in a section, newest first. */
export function getArticlesBySection(section: Section): Article[] {
  return articles
    .filter((article) => article.section === section)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** URL segment for an author, e.g. "Mara Ellison" -> "mara-ellison". */
export function authorSlug(author: string): string {
  return author.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Resolve an author slug back to the author's display name. */
export function authorFromSlug(slug: string): string | undefined {
  const normalized = safeDecodeSlug(slug).toLowerCase();
  const found = articles.find((article) => authorSlug(article.author) === normalized);
  return found?.author;
}

/** Every story by an author, newest first. */
export function getArticlesByAuthor(author: string): Article[] {
  return articles
    .filter((article) => article.author === author)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Every distinct author in the edition, sorted. */
export function getAllAuthors(): string[] {
  return [...new Set(articles.map((article) => article.author))].sort();
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "as",
  "at", "by", "from", "its", "is", "are", "was", "were", "it", "that", "this",
  "after", "over", "into", "new", "amid", "than", "but", "not", "be", "has",
  "have", "had", "will", "can", "their", "his", "her", "your", "our", "more",
]);

/** Lowercased content words from a block of text, used for relevance scoring. */
function keywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word)),
  );
}

/**
 * Related stories for an article, ranked by real relevance rather than section
 * alone. Each candidate scores for shared keywords in the headline and dek
 * (headline matches weigh more), with a same-section tiebreaker so thin
 * sections still produce sensible suggestions. Stories are labelled honestly:
 * `sameSection` really belongs to the article's section, while `elsewhere`
 * only pads the page out when the section is thin.
 */
export function getRelatedStories(
  article: Article,
  limit = 3,
): { sameSection: Article[]; elsewhere: Article[] } {
  const targetWords = keywords(`${article.headline} ${article.dek}`);
  const targetHeadline = keywords(article.headline);

  const scored = articles
    .filter((candidate) => candidate.slug !== article.slug)
    .map((candidate) => {
      const words = keywords(`${candidate.headline} ${candidate.dek}`);
      const headlineWords = keywords(candidate.headline);
      let score = 0;
      for (const word of words) {
        if (targetWords.has(word)) score += 1;
      }
      for (const word of headlineWords) {
        if (targetHeadline.has(word)) score += 2;
      }
      if (candidate.section === article.section) score += 1.5;
      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.candidate.date.localeCompare(a.candidate.date);
    })
    .map((entry) => entry.candidate);

  // Prefer same-section stories up to the limit, then top up with the best
  // cross-section matches so the block is always full when the edition is big.
  const sameSection = scored
    .filter((candidate) => candidate.section === article.section)
    .slice(0, limit);

  const elsewhere = scored
    .filter(
      (candidate) =>
        candidate.section !== article.section &&
        candidate.slug !== article.slug &&
        !sameSection.some((story) => story.slug === candidate.slug),
    )
    .slice(0, Math.max(0, limit - sameSection.length) || limit);

  return { sameSection, elsewhere };
}

/** Human-readable date, e.g. "October 9, 2026". */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
