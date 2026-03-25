#!/usr/bin/env bun
/**
 * xray — X/Twitter intelligence CLI for catcatcat.
 *
 * New commands (content strategy):
 *   scout                       Find reply opportunities from your graph
 *   pulse <lane>                What's hot in a lane (design, ai, studio, tokyo, crypto)
 *   track                       Top posts from tracked accounts this week
 *   mirror                      Your own accounts' recent performance
 *   prospect                    Find founders who just launched (Nick Buzz playbook)
 *
 * Core commands:
 *   search <query> [options]    Search tweets (recent or full-archive)
 *   thread <tweet_id>           Fetch full conversation thread
 *   profile <username>          Recent tweets from a user
 *   tweet <tweet_id>            Fetch a single tweet
 *
 * Graph management:
 *   graph                       Show your full social graph
 *   graph add <group> <user>    Add user to a group (engage, track)
 *   graph remove <user>         Remove user from graph
 *
 * Utility:
 *   cache clear                 Clear search cache
 *   lanes                       List configured lanes and their queries
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import * as api from "./lib/api";
import * as cache from "./lib/cache";
import * as fmt from "./lib/format";

const SKILL_DIR = import.meta.dir;
const CONFIG_PATH = join(SKILL_DIR, "config.json");
const TEMPLATE_PATH = join(SKILL_DIR, "config.template.json");

interface AccountEntry {
  handle: string;
  label?: string;
  note?: string;
  followers?: number;
}

interface Config {
  accounts: {
    own: AccountEntry[];
    engage: AccountEntry[];
    track: AccountEntry[];
  };
  lanes: Record<
    string,
    { label: string; queries: string[]; noise: string }
  >;
  prospect: { queries: string[]; note: string };
  defaults: Record<string, any>;
  paths: { research: string; drafts: string };
}

function loadConfig(): Config {
  if (!existsSync(CONFIG_PATH)) {
    // No config yet — check if we should run setup or just fail gracefully
    throw new ConfigMissingError();
  }
  return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
}

function saveConfig(config: Config) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function resolvePath(p: string): string {
  return p.replace(/^~/, process.env.HOME!);
}

class ConfigMissingError extends Error {
  constructor() {
    super("config_missing");
  }
}

function isConfigured(): boolean {
  if (!existsSync(CONFIG_PATH)) return false;
  try {
    const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    return config.accounts?.own?.length > 0;
  } catch {
    return false;
  }
}

// ============================================================
// LANE PRESETS — common topic configurations
// ============================================================

const LANE_PRESETS: Record<string, { label: string; queries: string[]; noise: string }> = {
  design: {
    label: "Design Engineering",
    queries: [
      "(UI OR UX OR animation OR interaction) (design OR craft OR detail)",
      "(tailwind OR shadcn OR framer motion OR radix) (component OR system)",
      "(landing page OR hero OR scroll) (redesign OR animation OR breakdown)",
    ],
    noise: "-is:retweet",
  },
  ai: {
    label: "AI / Agents",
    queries: [
      "(claude code OR claude agent OR anthropic) (skill OR workflow OR build)",
      "(AI agent OR LLM) (tool OR workflow OR ship)",
      "(cursor OR copilot OR claude) (coding OR building OR shipped)",
    ],
    noise: "-is:retweet",
  },
  dev: {
    label: "Software Dev",
    queries: [
      "(typescript OR javascript OR react OR next.js) (shipped OR released OR tip)",
      "(open source OR github) (launched OR trending OR starred)",
      "(developer OR engineering) (productivity OR workflow OR tool)",
    ],
    noise: "-is:retweet",
  },
  startup: {
    label: "Startups / Indie",
    queries: [
      "(startup OR indie OR bootstrapped) (launched OR revenue OR MRR)",
      "#buildinpublic (shipped OR milestone OR update)",
      "(SaaS OR product) (launch OR growth OR pricing)",
    ],
    noise: "-is:retweet",
  },
  creative: {
    label: "Creative / Art",
    queries: [
      "(generative art OR creative coding OR p5js) (sketch OR daily OR experiment)",
      "(illustration OR motion OR 3D) (process OR breakdown OR tutorial)",
    ],
    noise: "-is:retweet",
  },
  crypto: {
    label: "Crypto / Trading",
    queries: [
      "(solana OR $SOL) (launch OR pump OR dev)",
      "(memecoin OR token) (launch OR new OR alpha)",
      "(degen OR CT) (alpha OR call OR gem)",
    ],
    noise: "-is:retweet -airdrop -giveaway -whitelist -follow",
  },
  marketing: {
    label: "Marketing / Growth",
    queries: [
      "(content strategy OR social media) (growth OR engagement OR viral)",
      "(copywriting OR landing page) (conversion OR A/B OR headline)",
      "(newsletter OR audience) (building OR growth OR monetize)",
    ],
    noise: "-is:retweet",
  },
  studio: {
    label: "Creative Studio / Agency",
    queries: [
      "(design studio OR creative agency OR freelance) (pricing OR client OR project)",
      "(agency OR studio) (launched OR shipped OR case study)",
      "(web design OR brand) (portfolio OR showcase OR award)",
    ],
    noise: "-is:retweet -hiring",
  },
};

// ============================================================
// SETUP — First-run interview
// ============================================================

async function cmdSetup() {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (q: string): Promise<string> =>
    new Promise((resolve) => rl.question(q, resolve));

  const askList = (q: string): Promise<string[]> =>
    ask(q).then((a) =>
      a
        .split(/[,\n]+/)
        .map((s) => s.trim().replace(/^@/, ""))
        .filter(Boolean)
    );

  console.log(`
xray — setup
${"─".repeat(30)}

Let's build your social graph. This takes about 2 minutes.
Everything saves to config.json — edit it anytime.
`);

  // Step 1: Own accounts
  console.log("1. YOUR ACCOUNTS");
  console.log("   These are the accounts you post from. Used by 'mirror' to check your performance.\n");
  const ownInput = await askList("   Your X handle(s), comma-separated: @");
  const ownAccounts: AccountEntry[] = ownInput.map((h) => ({ handle: h }));

  if (ownAccounts.length > 1) {
    for (const acct of ownAccounts) {
      const label = await ask(`   Label for @${acct.handle} (e.g. "personal", "studio"): `);
      if (label.trim()) acct.label = label.trim();
    }
  }

  // Step 2: Topics / Lanes
  console.log(`\n2. YOUR LANES`);
  console.log("   What topics do you post about? These power the 'pulse' command.\n");
  console.log("   Available presets:");
  for (const [key, lane] of Object.entries(LANE_PRESETS)) {
    console.log(`     ${key.padEnd(12)} ${lane.label}`);
  }
  console.log(`\n   Pick presets (comma-separated), or type 'custom' to build your own.`);
  const laneInput = await askList("   Lanes: ");

  const lanes: Config["lanes"] = {};
  for (const key of laneInput) {
    if (key === "custom") {
      const name = await ask("   Custom lane name (one word): ");
      const label = await ask("   Display label: ");
      console.log("   Enter 2-3 search queries (one per line, empty line to finish):");
      const queries: string[] = [];
      while (true) {
        const q = await ask("     > ");
        if (!q.trim()) break;
        queries.push(q.trim());
      }
      if (name && queries.length > 0) {
        lanes[name.toLowerCase()] = { label: label || name, queries, noise: "-is:retweet" };
      }
    } else if (LANE_PRESETS[key]) {
      lanes[key] = LANE_PRESETS[key];
    } else {
      console.log(`   (skipping unknown preset: ${key})`);
    }
  }

  // Step 3: Engage accounts
  console.log(`\n3. ENGAGE ACCOUNTS`);
  console.log("   Bigger accounts in your space that you want to reply to daily.");
  console.log("   'scout' finds their recent posts so you can write thoughtful replies.\n");
  const engageInput = await askList("   Handles to engage with (comma-separated, or blank to skip): @");
  const engageAccounts: AccountEntry[] = engageInput.map((h) => ({ handle: h }));

  // Step 4: Track accounts
  console.log(`\n4. TRACK ACCOUNTS`);
  console.log("   Accounts you study for competitive intel — what formats and topics work for them.");
  console.log("   'track' shows their top posts each week.\n");
  const trackInput = await askList("   Handles to track (comma-separated, or blank to skip): @");
  const trackAccounts: AccountEntry[] = trackInput.map((h) => ({ handle: h }));

  // Step 5: Save paths
  console.log(`\n5. SAVE PATHS (optional)`);
  console.log("   Where should xray save research files? Press enter for defaults.\n");
  const researchPath =
    (await ask(`   Research path [~/xray-research]: `)).trim() || "~/xray-research";
  const draftsPath =
    (await ask(`   Drafts path [~/xray-drafts]: `)).trim() || "~/xray-drafts";

  // Build config
  const template = existsSync(TEMPLATE_PATH)
    ? JSON.parse(readFileSync(TEMPLATE_PATH, "utf-8"))
    : {};

  const config: Config = {
    accounts: {
      own: ownAccounts,
      engage: engageAccounts,
      track: trackAccounts,
    },
    lanes,
    prospect: template.prospect || {
      queries: [
        '"just launched" (website OR landing page OR app) -is:retweet',
        '("Product Hunt" OR "launched on") (website OR SaaS OR app) -is:retweet',
        '#buildinpublic (launched OR live OR shipped) (site OR app OR product) -is:retweet',
      ],
      note: "Find founders who just launched — redesign opportunities",
    },
    defaults: template.defaults || {
      scout_since: "3h",
      scout_limit: 10,
      pulse_since: "24h",
      pulse_sort: "likes",
      pulse_limit: 15,
      track_count: 5,
      mirror_count: 10,
    },
    paths: {
      research: researchPath,
      drafts: draftsPath,
    },
  };

  saveConfig(config);
  rl.close();

  console.log(`\n${"─".repeat(30)}`);
  console.log(`Config saved to config.json\n`);
  console.log(`Your graph:`);
  console.log(`  ${ownAccounts.length} own account${ownAccounts.length !== 1 ? "s" : ""}`);
  console.log(`  ${engageAccounts.length} engage target${engageAccounts.length !== 1 ? "s" : ""}`);
  console.log(`  ${trackAccounts.length} tracked account${trackAccounts.length !== 1 ? "s" : ""}`);
  console.log(`  ${Object.keys(lanes).length} lane${Object.keys(lanes).length !== 1 ? "s" : ""}`);
  console.log(`\nReady. Try: xray scout, xray pulse ${Object.keys(lanes)[0] || "design"}, or xray graph`);

  // Check for X_BEARER_TOKEN
  try {
    const { readFileSync: rf } = await import("fs");
    let hasToken = !!process.env.X_BEARER_TOKEN;
    if (!hasToken) {
      try {
        const envFile = rf(join(process.env.HOME!, ".env.keys"), "utf-8");
        hasToken = /X_BEARER_TOKEN/.test(envFile);
      } catch {}
    }
    if (!hasToken) {
      console.log(`\nNote: X_BEARER_TOKEN not found. Get one at https://developer.x.com`);
      console.log(`Then add to ~/.env.keys: X_BEARER_TOKEN=your_token_here`);
    }
  } catch {}
}

// --- Arg parsing ---

const args = process.argv.slice(2);
const command = args[0];

function getFlag(name: string): boolean {
  const idx = args.indexOf(`--${name}`);
  if (idx >= 0) {
    args.splice(idx, 1);
    return true;
  }
  return false;
}

function getOpt(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  if (idx >= 0 && idx + 1 < args.length) {
    const val = args[idx + 1];
    args.splice(idx, 2);
    return val;
  }
  return undefined;
}

// ============================================================
// SCOUT — Find reply opportunities from your graph
// ============================================================

async function cmdScout() {
  const config = loadConfig();
  const since = getOpt("since") || config.defaults.scout_since || "3h";
  const limit = parseInt(getOpt("limit") || String(config.defaults.scout_limit || 10));
  const lane = args[1]; // optional lane filter
  const asJson = getFlag("json");

  // Determine which accounts to scout
  let accounts = [...config.accounts.engage];

  // If a lane is specified, also search that lane's queries
  let laneTweets: api.Tweet[] = [];
  if (lane && config.lanes[lane]) {
    const laneConfig = config.lanes[lane];
    const query = laneConfig.queries[0] + " " + laneConfig.noise;
    laneTweets = await api.search(query, {
      sortOrder: "recency",
      since,
    });
  }

  // Batch fetch recent posts from engage accounts
  const handles = accounts.map((a) => a.handle);
  const graphTweets = await api.batchProfiles(handles, {
    count: 3,
    since,
  });

  // Flatten all tweets, score by opportunity value
  let allTweets: api.Tweet[] = [...laneTweets];
  for (const tweets of graphTweets.values()) {
    allTweets.push(...tweets);
  }

  // Dedupe
  allTweets = api.dedupe(allTweets);

  // Filter: skip own accounts
  const ownHandles = new Set(config.accounts.own.map((a) => a.handle.toLowerCase()));
  allTweets = allTweets.filter(
    (t) => !ownHandles.has(t.username.toLowerCase())
  );

  // Score: recent + some engagement but not viral yet (sweet spot for replies)
  allTweets = allTweets.map((t) => {
    const age = (Date.now() - new Date(t.created_at).getTime()) / 3_600_000; // hours
    const recencyBoost = Math.max(0, 10 - age); // newer = better
    const engagementSweet =
      t.metrics.likes >= 5 && t.metrics.likes <= 500 ? 5 : 0; // sweet spot
    const lowReplies = t.metrics.replies < 20 ? 3 : 0; // less competition
    const followerBoost =
      t.author_followers && t.author_followers > 5000 ? 3 : 0;
    (t as any)._score =
      recencyBoost + engagementSweet + lowReplies + followerBoost;
    return t;
  });

  // Sort by opportunity score
  allTweets.sort((a, b) => ((b as any)._score || 0) - ((a as any)._score || 0));

  if (asJson) {
    console.log(JSON.stringify(allTweets.slice(0, limit), null, 2));
  } else {
    console.log(fmt.formatScoutResults(allTweets, { limit }));
    console.error(`\n${fmt.formatCost(allTweets.length, "scout")}`);
  }
}

// ============================================================
// PULSE — What's hot in a lane right now
// ============================================================

async function cmdPulse() {
  const config = loadConfig();
  const laneName = args[1];
  const since = getOpt("since") || config.defaults.pulse_since || "24h";
  const sortOpt = getOpt("sort") || config.defaults.pulse_sort || "likes";
  const limit = parseInt(
    getOpt("limit") || String(config.defaults.pulse_limit || 15)
  );
  const quality = getFlag("quality");
  const asJson = getFlag("json");
  const asMarkdown = getFlag("markdown");
  const save = getFlag("save");
  const archive = getFlag("archive");

  if (!laneName) {
    // Show available lanes
    console.log("Available lanes:\n");
    for (const [key, lane] of Object.entries(config.lanes)) {
      console.log(`  ${key.padEnd(10)} ${lane.label}`);
      for (const q of lane.queries) {
        console.log(`               ${q}`);
      }
      console.log();
    }
    console.log("Usage: pulse <lane> [--since 12h] [--quality] [--save]");
    return;
  }

  const lane = config.lanes[laneName];
  if (!lane) {
    console.error(
      `Unknown lane: ${laneName}. Available: ${Object.keys(config.lanes).join(", ")}`
    );
    process.exit(1);
  }

  // Run all lane queries, merge results
  let allTweets: api.Tweet[] = [];
  const cacheTtlMs = 900_000; // 15 min

  for (const baseQuery of lane.queries) {
    const query = `${baseQuery} ${lane.noise}`;
    const cacheParams = `pulse=${laneName}&sort=${sortOpt}&since=${since}`;
    const cached = cache.get(query, cacheParams, cacheTtlMs);

    if (cached) {
      allTweets.push(...cached);
      console.error(`(cached: "${baseQuery.slice(0, 40)}...")`);
    } else {
      const tweets = await api.search(query, {
        sortOrder: sortOpt === "recent" ? "recency" : "relevancy",
        since,
        archive,
      });
      allTweets.push(...tweets);
      cache.set(query, cacheParams, tweets);
    }
  }

  // Dedupe, filter, sort
  allTweets = api.dedupe(allTweets);

  if (quality) {
    allTweets = api.filterEngagement(allTweets, { minLikes: 10 });
  }

  if (sortOpt !== "recent") {
    allTweets = api.sortBy(
      allTweets,
      sortOpt as "likes" | "impressions" | "retweets"
    );
  }

  // Output
  const header = `Pulse: ${lane.label} (last ${since})`;

  if (asJson) {
    console.log(JSON.stringify(allTweets.slice(0, limit), null, 2));
  } else if (asMarkdown) {
    console.log(
      fmt.formatResearchMarkdown(`${lane.label} pulse`, allTweets, {
        queries: lane.queries,
      })
    );
  } else {
    console.log(fmt.formatResults(allTweets, { header, limit }));
  }

  if (save) {
    const dir = resolvePath(config?.paths?.research || "~/xray-research");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const date = new Date().toISOString().split("T")[0];
    const path = join(dir, `pulse-${laneName}-${date}.md`);
    const md = fmt.formatResearchMarkdown(`${lane.label} pulse`, allTweets, {
      queries: lane.queries,
    });
    writeFileSync(path, md);
    console.error(`Saved to ${path}`);
  }

  console.error(`\n${fmt.formatCost(allTweets.length, "pulse")}`);
}

// ============================================================
// TRACK — Competitive intelligence from tracked accounts
// ============================================================

async function cmdTrack() {
  const config = loadConfig();
  const count = parseInt(
    getOpt("count") || String(config.defaults.track_count || 5)
  );
  const since = getOpt("since") || "7d";
  const asJson = getFlag("json");
  const save = getFlag("save");

  const accounts = config.accounts.track;
  if (accounts.length === 0) {
    console.log("No tracked accounts. Add with: graph add track <username>");
    return;
  }

  console.error(`Tracking ${accounts.length} accounts (last ${since})...\n`);

  const handles = accounts.map((a) => a.handle);
  const results = await api.batchProfiles(handles, { count, since });

  if (asJson) {
    const obj: Record<string, any> = {};
    for (const [k, v] of results) obj[k] = v;
    console.log(JSON.stringify(obj, null, 2));
  } else {
    console.log(fmt.formatTrackResults(results));
  }

  if (save) {
    const dir = resolvePath(config?.paths?.research || "~/xray-research");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const date = new Date().toISOString().split("T")[0];
    const path = join(dir, `track-${date}.md`);
    let md = `# Competitive Track — ${date}\n\n`;
    for (const [username, tweets] of results) {
      md += `## @${username}\n\n`;
      if (tweets.length === 0) {
        md += `No recent posts.\n\n`;
        continue;
      }
      md += tweets.map(fmt.formatTweetMarkdown).join("\n\n");
      md += "\n\n";
    }
    writeFileSync(path, md);
    console.error(`Saved to ${path}`);
  }

  let totalTweets = 0;
  for (const tweets of results.values()) totalTweets += tweets.length;
  console.error(`\n${fmt.formatCost(totalTweets, "track")}`);
}

// ============================================================
// MIRROR — Your own accounts' performance
// ============================================================

async function cmdMirror() {
  const config = loadConfig();
  const count = parseInt(
    getOpt("count") || String(config.defaults.mirror_count || 10)
  );
  const asJson = getFlag("json");

  const results: {
    handle: string;
    label: string;
    user?: any;
    tweets: api.Tweet[];
  }[] = [];

  for (const acct of config.accounts.own) {
    try {
      const { user, tweets } = await api.profile(acct.handle, { count });
      results.push({
        handle: acct.handle,
        label: acct.label || acct.handle,
        user,
        tweets,
      });
    } catch (e: any) {
      console.error(`Error fetching @${acct.handle}: ${e.message}`);
      results.push({
        handle: acct.handle,
        label: acct.label || acct.handle,
        tweets: [],
      });
    }
  }

  if (asJson) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(fmt.formatMirrorResults(results));
  }

  let totalTweets = 0;
  for (const r of results) totalTweets += r.tweets.length;
  console.error(`\n${fmt.formatCost(totalTweets, "mirror")}`);
}

// ============================================================
// PROSPECT — Find founders who just launched (redesign targets)
// ============================================================

async function cmdProspect() {
  const config = loadConfig();
  const since = getOpt("since") || "24h";
  const limit = parseInt(getOpt("limit") || "15");
  const quality = getFlag("quality");
  const asJson = getFlag("json");
  const save = getFlag("save");

  let allTweets: api.Tweet[] = [];

  for (const query of config.prospect.queries) {
    const tweets = await api.search(query, {
      sortOrder: "relevancy",
      since,
    });
    allTweets.push(...tweets);
  }

  allTweets = api.dedupe(allTweets);

  if (quality) {
    allTweets = api.filterEngagement(allTweets, { minLikes: 5 });
  }

  // Sort by engagement (higher engagement = more visibility for your redesign reply)
  allTweets = api.sortBy(allTweets, "likes");

  if (asJson) {
    console.log(JSON.stringify(allTweets.slice(0, limit), null, 2));
  } else {
    const header = `Prospect — founders who just launched (last ${since})`;
    console.log(fmt.formatResults(allTweets, { header, limit }));
  }

  if (save) {
    const dir = resolvePath(config?.paths?.research || "~/xray-research");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const date = new Date().toISOString().split("T")[0];
    const path = join(dir, `prospect-${date}.md`);
    const md = fmt.formatResearchMarkdown("Prospect — launch targets", allTweets, {
      queries: config.prospect.queries,
    });
    writeFileSync(path, md);
    console.error(`Saved to ${path}`);
  }

  console.error(`\n${fmt.formatCost(allTweets.length, "prospect")}`);
}

// ============================================================
// SEARCH — General purpose (enhanced)
// ============================================================

function tryLoadConfig(): Config | null {
  try {
    return loadConfig();
  } catch {
    return null;
  }
}

async function cmdSearch() {
  const config = tryLoadConfig();
  const quick = getFlag("quick");
  const quality = getFlag("quality");
  const fromUser = getOpt("from");
  const archive = getFlag("archive");
  const lang = getOpt("lang");

  const sortOpt = getOpt("sort") || "likes";
  const minLikes = parseInt(getOpt("min-likes") || "0");
  const minImpressions = parseInt(getOpt("min-impressions") || "0");
  let pages = Math.min(parseInt(getOpt("pages") || "1"), 5);
  let limit = parseInt(getOpt("limit") || "15");
  const since = getOpt("since");
  const noReplies = getFlag("no-replies");
  const save = getFlag("save");
  const asJson = getFlag("json");
  const asMarkdown = getFlag("markdown");

  if (quick) {
    pages = 1;
    limit = Math.min(limit, 10);
  }

  const queryParts = args.slice(1).filter((a) => !a.startsWith("--"));
  let query = queryParts.join(" ");

  if (!query) {
    console.error("Usage: xray search <query> [options]");
    process.exit(1);
  }

  if (fromUser && !query.toLowerCase().includes("from:")) {
    query += ` from:${fromUser.replace(/^@/, "")}`;
  }
  if (lang) {
    query += ` lang:${lang}`;
  }
  if (!query.includes("is:retweet")) {
    query += " -is:retweet";
  }
  if ((quick || noReplies) && !query.includes("is:reply")) {
    query += " -is:reply";
  }

  const cacheTtlMs = quick ? 3_600_000 : 900_000;
  const cacheParams = `sort=${sortOpt}&pages=${pages}&since=${since || "7d"}&archive=${archive}`;
  const cached = cache.get(query, cacheParams, cacheTtlMs);
  let tweets: api.Tweet[];

  if (cached) {
    tweets = cached;
    console.error(`(cached — ${tweets.length} tweets)`);
  } else {
    tweets = await api.search(query, {
      pages,
      sortOrder: sortOpt === "recent" ? "recency" : "relevancy",
      since: since || undefined,
      archive,
    });
    cache.set(query, cacheParams, tweets);
  }

  const rawCount = tweets.length;

  if (minLikes > 0 || minImpressions > 0) {
    tweets = api.filterEngagement(tweets, {
      minLikes: minLikes || undefined,
      minImpressions: minImpressions || undefined,
    });
  }
  if (quality) {
    tweets = api.filterEngagement(tweets, { minLikes: 10 });
  }
  if (sortOpt !== "recent") {
    tweets = api.sortBy(tweets, sortOpt as "likes" | "impressions" | "retweets");
  }
  tweets = api.dedupe(tweets);

  if (asJson) {
    console.log(JSON.stringify(tweets.slice(0, limit), null, 2));
  } else if (asMarkdown) {
    console.log(
      fmt.formatResearchMarkdown(query, tweets, { queries: [query] })
    );
  } else {
    console.log(fmt.formatResults(tweets, { query, limit }));
  }

  if (save) {
    const dir = resolvePath(config?.paths?.research || "~/xray-research");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const slug = query
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40)
      .toLowerCase();
    const date = new Date().toISOString().split("T")[0];
    const path = join(dir, `search-${slug}-${date}.md`);
    writeFileSync(
      path,
      fmt.formatResearchMarkdown(query, tweets, { queries: [query] })
    );
    console.error(`Saved to ${path}`);
  }

  console.error(`\n${fmt.formatCost(rawCount, quick ? "quick" : "search")}`);
}

// ============================================================
// THREAD, PROFILE, TWEET — Core commands (kept)
// ============================================================

async function cmdThread() {
  const tweetId = args[1];
  if (!tweetId) {
    console.error("Usage: xray thread <tweet_id>");
    process.exit(1);
  }

  const pages = Math.min(parseInt(getOpt("pages") || "2"), 5);
  const tweets = await api.thread(tweetId, { pages });

  if (tweets.length === 0) {
    console.log("No tweets found in thread.");
    return;
  }

  console.log(`Thread (${tweets.length} tweets)\n`);
  for (const t of tweets) {
    console.log(fmt.formatTweet(t, undefined, { full: true }));
    console.log();
  }
}

async function cmdProfile() {
  const username = args[1]?.replace(/^@/, "");
  if (!username) {
    console.error("Usage: xray profile <username>");
    process.exit(1);
  }

  const count = parseInt(getOpt("count") || "20");
  const includeReplies = getFlag("replies");
  const asJson = getFlag("json");

  const { user, tweets } = await api.profile(username, {
    count,
    includeReplies,
  });

  if (asJson) {
    console.log(JSON.stringify({ user, tweets }, null, 2));
  } else {
    console.log(fmt.formatProfile(user, tweets));
  }
}

async function cmdTweet() {
  const tweetId = args[1];
  if (!tweetId) {
    console.error("Usage: xray tweet <tweet_id>");
    process.exit(1);
  }

  const tweet = await api.getTweet(tweetId);
  if (!tweet) {
    console.log("Tweet not found.");
    return;
  }

  if (getFlag("json")) {
    console.log(JSON.stringify(tweet, null, 2));
  } else {
    console.log(fmt.formatTweet(tweet, undefined, { full: true }));
  }
}

// ============================================================
// GRAPH — Social graph management
// ============================================================

async function cmdGraph() {
  const config = loadConfig();
  const sub = args[1];

  if (sub === "add") {
    const group = args[2] as "engage" | "track";
    const handle = args[3]?.replace(/^@/, "");
    const note = args.slice(4).join(" ") || undefined;

    if (!group || !handle || !["engage", "track"].includes(group)) {
      console.error("Usage: xray graph add <engage|track> <username> [note]");
      process.exit(1);
    }

    const existing = config.accounts[group].find(
      (a) => a.handle.toLowerCase() === handle.toLowerCase()
    );
    if (existing) {
      console.log(`@${handle} already in ${group}.`);
      return;
    }

    config.accounts[group].push({ handle, note });
    saveConfig(config);
    console.log(`Added @${handle} to ${group}.${note ? ` (${note})` : ""}`);
    return;
  }

  if (sub === "remove" || sub === "rm") {
    const handle = args[2]?.replace(/^@/, "");
    if (!handle) {
      console.error("Usage: xray graph remove <username>");
      process.exit(1);
    }

    let removed = false;
    for (const group of ["engage", "track"] as const) {
      const before = config.accounts[group].length;
      config.accounts[group] = config.accounts[group].filter(
        (a) => a.handle.toLowerCase() !== handle.toLowerCase()
      );
      if (config.accounts[group].length < before) removed = true;
    }

    if (removed) {
      saveConfig(config);
      console.log(`Removed @${handle} from graph.`);
    } else {
      console.log(`@${handle} not found in graph.`);
    }
    return;
  }

  // Default: show graph
  console.log("Social Graph\n");

  console.log("Own accounts:");
  for (const a of config.accounts.own) {
    console.log(`  @${a.handle}  ${a.label || ""}`);
  }

  console.log("\nEngage (daily reply targets):");
  for (const a of config.accounts.engage) {
    const note = a.note ? ` — ${a.note}` : "";
    const followers = a.followers ? ` [${fmt.compactNumber(a.followers)}]` : "";
    console.log(`  @${a.handle}${followers}${note}`);
  }

  console.log("\nTrack (competitive intel):");
  for (const a of config.accounts.track) {
    const note = a.note ? ` — ${a.note}` : "";
    const followers = a.followers ? ` [${fmt.compactNumber(a.followers)}]` : "";
    console.log(`  @${a.handle}${followers}${note}`);
  }

  console.log(
    `\nTotal: ${config.accounts.own.length} own + ${config.accounts.engage.length} engage + ${config.accounts.track.length} track`
  );
}

// ============================================================
// LANES — Show configured lanes
// ============================================================

function cmdLanes() {
  const config = loadConfig();
  console.log("Configured lanes:\n");
  for (const [key, lane] of Object.entries(config.lanes)) {
    console.log(`  ${key}`);
    console.log(`  ${lane.label}`);
    for (const q of lane.queries) {
      console.log(`    ${q}`);
    }
    console.log();
  }
}

// ============================================================
// CACHE — Clear/prune
// ============================================================

function cmdCache() {
  const sub = args[1];
  if (sub === "clear") {
    const removed = cache.clear();
    console.log(`Cleared ${removed} cached entries.`);
  } else {
    const removed = cache.prune();
    console.log(`Pruned ${removed} expired entries.`);
  }
}

// ============================================================
// USAGE
// ============================================================

function usage() {
  console.log(`xray — X/Twitter content intelligence

Content strategy:
  scout [lane]          Reply opportunities from your graph (default: last 3h)
  pulse <lane>          What's hot in a lane (design, ai, studio, tokyo, crypto)
  track                 Top posts from tracked accounts (default: last 7d)
  mirror                Your own accounts' performance
  prospect              Founders who just launched (redesign targets)

Core:
  search <query>        Search tweets (add --archive for full history)
  thread <tweet_id>     Full conversation thread
  profile <username>    Recent tweets from a user
  tweet <tweet_id>      Single tweet

Graph:
  graph                 Show your social graph
  graph add <group> <user> [note]   Add to engage or track
  graph remove <user>   Remove from graph
  lanes                 Show configured lanes

Setup:
  setup                 Build your config interactively

Search options:
  --sort likes|impressions|retweets|recent
  --since 1h|3h|12h|1d|7d   --min-likes N   --min-impressions N
  --pages N   --limit N   --from <user>   --lang <code>
  --quick   --quality   --archive   --no-replies
  --save   --json   --markdown`);
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  // Setup command always works, even without config
  if (command === "setup") {
    await cmdSetup();
    return;
  }

  // Commands that don't need config
  if (!command) {
    if (!isConfigured()) {
      console.log(`xray — X/Twitter content intelligence\n`);
      console.log(`First time? Run: xray setup`);
      console.log(`Or if you're in a Claude Code session, just say "set up xray for me"\n`);
      usage();
      return;
    }
    usage();
    return;
  }

  // Commands that need config — check for it
  const needsConfig = [
    "scout", "sc", "pulse", "p", "track", "tr", "mirror", "mi",
    "prospect", "pr", "graph", "g", "lanes",
  ];

  if (needsConfig.includes(command) && !isConfigured()) {
    console.log(`xray isn't configured yet.\n`);
    if (process.stdin.isTTY) {
      console.log(`Running setup...\n`);
      await cmdSetup();
      return;
    } else {
      console.log(`Run: xray setup`);
      console.log(`Or in Claude Code: "set up xray for me"`);
      process.exit(1);
    }
  }

  switch (command) {
    case "setup":
      await cmdSetup();
      break;
    case "scout":
    case "sc":
      await cmdScout();
      break;
    case "pulse":
    case "p":
      await cmdPulse();
      break;
    case "track":
    case "tr":
      await cmdTrack();
      break;
    case "mirror":
    case "mi":
      await cmdMirror();
      break;
    case "prospect":
    case "pr":
      await cmdProspect();
      break;
    case "search":
    case "s":
      await cmdSearch();
      break;
    case "thread":
    case "th":
      await cmdThread();
      break;
    case "profile":
    case "prof":
      await cmdProfile();
      break;
    case "tweet":
    case "tw":
      await cmdTweet();
      break;
    case "graph":
    case "g":
      await cmdGraph();
      break;
    case "lanes":
      cmdLanes();
      break;
    case "cache":
      cmdCache();
      break;
    default:
      usage();
  }
}

main().catch((e) => {
  if (e instanceof ConfigMissingError) {
    console.log(`xray isn't configured yet. Run: xray setup`);
    process.exit(1);
  }
  // Smart error for missing API token
  if (e.message?.includes("X_BEARER_TOKEN")) {
    console.error(`X API token not found.\n`);
    console.error(`Get one at https://developer.x.com (pay-per-use, no subscription)`);
    console.error(`Then add to ~/.env.keys:  X_BEARER_TOKEN=your_token_here`);
    process.exit(1);
  }
  // Smart error for rate limiting
  if (e.message?.includes("Rate limited")) {
    console.error(e.message);
    console.error(`Tip: use --quick for cheaper searches, or wait and retry.`);
    process.exit(1);
  }
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
