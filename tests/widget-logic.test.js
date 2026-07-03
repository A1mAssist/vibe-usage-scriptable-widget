const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const widgetPath = path.join(__dirname, "..", "vibe-usage-widget.js");
const source = fs.readFileSync(widgetPath, "utf8");

class Color {
  constructor(hex, alpha) {
    this.hex = hex;
    this.alpha = alpha;
  }

  static dynamic(light, dark) {
    return { light, dark, dynamic: true };
  }
}

class Size {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}

class Rect {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

class Path {
  addRoundedRect() {}
}

class DrawContext {
  constructor() {
    this.draws = 0;
  }

  setFont() {}
  setTextColor() {}
  addPath() {}
  setFillColor() {}
  fillPath() {
    this.draws += 1;
  }
  drawTextInRect() {
    this.draws += 1;
  }
  getImage() {
    return this.draws > 0 ? { type: "image" } : null;
  }
}

const Font = {
  semiboldMonospacedSystemFont: size => ({ size }),
  semiboldSystemFont: size => ({ size }),
};

const sandbox = {
  console,
  Color,
  DrawContext,
  Device: { language: () => "en" },
  Font,
  Path,
  Rect,
  Size,
};

vm.createContext(sandbox);
vm.runInContext(
  source.replace(/\r?\nawait main\(\);\s*$/, `
globalThis.__widgetTestExports = {
  cacheMatches,
  cacheRequest,
  clampDays,
  compareVersions,
  formatCostShort,
  formatDurationMetric,
  formatDurationShort,
  formatPercent,
  formatSharePercent,
  formatTokenRate,
  formatTokens,
  insightSummary,
  isVersionNewer,
  middleEllipsize,
  modelLabel,
  normalizeApiKey,
  normalizeApiUrl,
  normalizeLargeSummary,
  normalizeVersion,
  noUsageTitle,
  parseConfigInput,
  percentOf,
  segmentChipsImage,
  shouldCheckUpdate,
  summarize,
  tokenMixRailImage,
  topListSummary,
  topListRowImage,
  validateScriptUpdate,
};
`),
  sandbox,
  { filename: widgetPath },
);

const widget = sandbox.__widgetTestExports;
const plain = value => JSON.parse(JSON.stringify(value));

assert.equal(widget.normalizeApiKey(" vbu_abc-123_ "), "vbu_abc-123_");
assert.equal(widget.normalizeApiKey("vbu_bad key"), null);
assert.equal(widget.normalizeApiUrl("https://vibecafe.ai/"), "https://vibecafe.ai");
assert.equal(widget.normalizeApiUrl("ftp://example.com"), "https://vibecafe.ai");
assert.equal(widget.clampDays(200), 90);
assert.equal(widget.clampDays("bad"), 7);

assert.deepEqual(plain(widget.parseConfigInput(" vbu_direct-1 ")), {
  apiKey: "vbu_direct-1",
  apiUrl: "https://vibecafe.ai",
  days: 7,
});

assert.equal(widget.parseConfigInput(JSON.stringify({ apiKey: "vbu_bad key" })), null);
assert.deepEqual(plain(widget.parseConfigInput(JSON.stringify({
  apiKey: " vbu_json-1 ",
  apiUrl: "https://example.com/",
  days: 200,
  language: "zh",
  theme: "dark",
  topList: "model",
  largeSummary: ["sessions", "bad", "topShare", "sessions"],
  updateMode: "auto",
  oobeComplete: true,
}))), {
  apiKey: "vbu_json-1",
  apiUrl: "https://example.com",
  days: 90,
  language: "zh",
  theme: "dark",
  topList: "model",
  largeSummary: ["sessions", "topShare"],
  updateMode: "auto",
  oobeComplete: true,
});

assert.equal(widget.formatTokens(1200), "1.2K");
assert.equal(widget.formatTokens(1200000), "1.2M");
assert.equal(widget.formatTokens(999500000), "999.5M");
assert.equal(widget.formatCostShort(1234), "$1.2K");
assert.equal(widget.formatDurationShort(3660), "1h 1m");
assert.equal(widget.formatDurationShort(11 * 86400), "11d 0h");
assert.equal(widget.formatDurationMetric(23 * 3600 + 35 * 60), "23.6h");
assert.equal(widget.formatDurationMetric(5 * 3600 + 7 * 60), "5h 7m");
assert.equal(widget.formatDurationMetric(12 * 86400 + 8 * 3600), "12d 8h");
assert.equal(widget.formatDurationMetric(99 * 3600 + 30 * 60), "99.5h");
assert.equal(widget.formatPercent(widget.percentOf(119500000, 130000000)), "92%");
assert.equal(widget.formatPercent(widget.percentOf(1, 1000)), "0.1%");
assert.equal(widget.formatSharePercent(99.93), "99.9%");
assert.equal(widget.percentOf(1, 0), 0);
assert.equal(widget.formatTokenRate(5400000, 3600), "5.4M/hr");
assert.equal(widget.formatTokenRate(5400000, 0), "-/hr");
assert.equal(widget.noUsageTitle(1), "No Usage Today");
assert.equal(widget.noUsageTitle(7), "No Usage In This Window");
assert.equal(widget.modelLabel("claude-opus-4-8"), "opus-4.8");
assert.equal(widget.modelLabel("claude-opus-4.8"), "opus-4.8");
assert.equal(widget.modelLabel("claude-3-5-sonnet-20241022"), "sonnet-3.5");
assert.equal(widget.modelLabel("anthropic/claude-haiku-3-5-latest"), "haiku-3.5");
assert.equal(widget.modelLabel("gpt-5.5"), "gpt-5.5");
assert.equal(widget.middleEllipsize("Codex", 14), "Codex");
assert.deepEqual(plain(widget.normalizeLargeSummary(["topShare", "sessions", "topShare"])), ["topShare", "sessions"]);
assert.equal(widget.insightSummary({ cached: 0, totalTokens: 0, cost: 0, activeSeconds: 0 }, 1), "Cache 0% · $0.00/d · -/hr");

const now = Date.now();
const summary = widget.summarize({
  buckets: [
    {
      source: "codex",
      model: "gpt-5",
      inputTokens: 100,
      outputTokens: 50,
      cachedInputTokens: 25,
      reasoningOutputTokens: 10,
      estimatedCost: 0.12,
    },
    {
      source: "claude-code",
      model: "claude-sonnet",
      inputTokens: 400,
      estimatedCost: 0.2,
    },
  ],
  sessions: [
    {
      sessionHash: "same",
      firstMessageAt: new Date(now - 60 * 60 * 1000).toISOString(),
      lastMessageAt: new Date(now - 30 * 60 * 1000).toISOString(),
      activeSeconds: 1200,
    },
    {
      sessionHash: "same",
      firstMessageAt: new Date(now - 55 * 60 * 1000).toISOString(),
      lastMessageAt: new Date(now - 35 * 60 * 1000).toISOString(),
      activeSeconds: 1200,
    },
    {
      sessionHash: "old",
      firstMessageAt: new Date(now - 10 * 86400 * 1000).toISOString(),
      lastMessageAt: new Date(now - 9 * 86400 * 1000).toISOString(),
      activeSeconds: 100,
    },
  ],
}, 7);

assert.equal(summary.totalTokens, 585);
assert.equal(summary.cost, 0.32);
assert.equal(summary.sessions, 1);
assert.equal(summary.activeSeconds, 1200);
assert.equal(summary.topSources[0][0], "claude-code");
assert.equal(summary.topModels[0][0], "claude-sonnet");
assert.equal(widget.insightSummary(summary, 7), "Cache 4.3% · $0.05/d · 1.8K/hr");
assert.equal(widget.topListSummary(summary, summary.topSources), "1 Session · Avg/Session 585 · Top Share 68%");
assert.equal(widget.topListSummary(summary, summary.topSources, ["avgTokensPerSession"]), "Avg/Session 585");
assert.equal(widget.topListSummary(summary, summary.topSources, []), "");

const request = {
  apiKey: "vbu_one",
  apiUrl: "https://vibecafe.ai/",
  days: 7,
};
const cached = {
  request: widget.cacheRequest(request),
  payload: { summary },
};

assert.equal(widget.cacheMatches(cached, { ...request, apiUrl: "https://vibecafe.ai" }), true);
assert.equal(widget.cacheMatches(cached, { ...request, days: 30 }), false);
assert.equal(widget.cacheMatches(cached, { ...request, apiKey: "vbu_two" }), false);

assert.equal(widget.normalizeVersion("v1.2.3+build"), "1.2.3");
assert.equal(widget.compareVersions("1.2.4", "1.2.3"), 1);
assert.equal(widget.compareVersions("1.2.3", "1.2.3"), 0);
assert.equal(widget.compareVersions("1.2.3", "1.3.0"), -1);
assert.equal(widget.isVersionNewer("0.0.5", "0.0.4"), true);
assert.equal(widget.isVersionNewer("0.0.4", "0.0.4"), false);
assert.equal(widget.shouldCheckUpdate(Date.now()), false);
assert.equal(widget.shouldCheckUpdate(Date.now() - 25 * 3600 * 1000), true);
assert.equal(widget.validateScriptUpdate(source), true);
assert.equal(widget.validateScriptUpdate("alert('nope')"), false);
assert.deepEqual(widget.segmentChipsImage([{ value: 0 }], 124, 8, 3), { type: "image" });
assert.deepEqual(widget.tokenMixRailImage([{ label: "In", value: 0 }], 291, 22), { type: "image" });
assert.deepEqual(widget.topListRowImage(widget.modelLabel("claude-opus-4-8"), { tokens: 694100, cost: 0.81 }, 875900000, new Color("#5ca7ff"), 300, 18), { type: "image" });

console.log("widget logic smoke tests passed");
