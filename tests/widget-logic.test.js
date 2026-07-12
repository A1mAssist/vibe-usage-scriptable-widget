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

class WidgetNode {
  constructor(log = []) { this.log = log; }
  addStack() { return new WidgetNode(this.log); }
  addText(value) { this.log.push(String(value)); return {}; }
  addImage() { return {}; }
  addSpacer() {}
  layoutHorizontally() {}
  layoutVertically() {}
  centerAlignContent() {}
  setPadding() {}
}

const Font = {
  semiboldMonospacedSystemFont: size => ({ size }),
  semiboldSystemFont: size => ({ size }),
  systemFont: size => ({ size }),
};

const files = new Map();
const localFileManager = {
  documentsDirectory: () => "/docs",
  joinPath: (dir, name) => `${dir}/${name}`,
  fileExists: file => files.has(file),
  readString: file => files.get(file),
  writeString: (file, value) => files.set(file, value),
  remove: file => files.delete(file),
};

const sandbox = {
  console,
  Color,
  DrawContext,
  Device: { language: () => "en" },
  FileManager: { local: () => localFileManager },
  Font,
  Path,
  Rect,
  Script: { name: () => "Vibe Usage" },
  Size,
  WidgetNode,
};

vm.createContext(sandbox);
vm.runInContext(
  source.replace(/\r?\nawait main\(\);\s*$/, `
globalThis.__widgetTestExports = {
  activityPulse,
  activityPulseImage,
  applyWidgetParameter,
  budgetForecast,
  buildLargeWidget,
  buildMediumWidget,
  buildSmallWidget,
  cacheMatches,
  cacheRequest,
  clearCache,
  clampDays,
  compareVersions,
  formatBudgetPercent,
  formatCostShort,
  formatDurationMetric,
  formatDurationShort,
  formatPercent,
  formatSharePercent,
  formatTokenRate,
  formatTokens,
  insightSummary,
  isVersionNewer,
  loadCache,
  middleEllipsize,
  modelLabel,
  normalizeBudget,
  normalizeConfig,
  normalizeApiKey,
  normalizeApiUrl,
  normalizeLargeSummary,
  normalizeVersion,
  noUsageTitle,
  parseConfigInput,
  parseWidgetParameter,
  percentOf,
  projectListRowImage,
  projectName,
  relativeAgeShort,
  segmentChipsImage,
  shouldCheckUpdate,
  saveCache,
  summarize,
  tokenMixRailImage,
  topEntriesFor,
  topListSummary,
  topListRowImage,
  usageStatusKey,
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
  accent: "mint",
  privacyMode: true,
  largeView: "activity",
  topList: "model",
  topSort: "cost",
  largeSummary: ["sessions", "bad", "topShare", "sessions"],
  monthlyBudget: 25,
  updateMode: "auto",
  oobeComplete: true,
}))), {
  apiKey: "vbu_json-1",
  apiUrl: "https://example.com",
  days: 90,
  language: "zh",
  theme: "dark",
  accent: "mint",
  privacyMode: true,
  largeView: "activity",
  topList: "model",
  topSort: "cost",
  largeSummary: ["sessions", "topShare"],
  monthlyBudget: 25,
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
assert.equal(widget.normalizeBudget("12.345"), 12.35);
assert.equal(widget.normalizeBudget(-1), 0);
assert.equal(widget.projectName("C:\\work\\vibe-usage-widget\\"), "vibe-usage-widget");
assert.deepEqual(plain(widget.parseWidgetParameter("days=1,list=project,sort=sessions,view=activity,theme=dark,accent=coral,privacy=on,budget=30")), {
  days: 1,
  topList: "project",
  topSort: "sessions",
  largeView: "activity",
  theme: "dark",
  accent: "coral",
  privacyMode: true,
  monthlyBudget: 30,
});
const parameterConfig = widget.applyWidgetParameter({ apiKey: "vbu_test", days: 7, topList: "source", topSort: "tokens" }, "days=30,list=project,sort=active,privacy=on");
assert.equal(parameterConfig.days, 30);
assert.equal(parameterConfig.topList, "project");
assert.equal(parameterConfig.topSort, "active");
assert.equal(parameterConfig.privacyMode, true);
assert.equal(widget.applyWidgetParameter(parameterConfig, "list=source,sort=sessions").topSort, "tokens");
assert.equal(widget.usageStatusKey({ reasoning: 20, totalTokens: 100 }), "deepThink");
assert.equal(widget.usageStatusKey({ cached: 60, totalTokens: 100 }), "cacheHeavy");
assert.equal(widget.usageStatusKey({ output: 25, totalTokens: 100 }), "highOutput");
assert.deepEqual(plain(widget.normalizeLargeSummary(["topShare", "sessions", "topShare"])), ["topShare", "sessions"]);
assert.equal(widget.insightSummary({ cached: 0, totalTokens: 0, cost: 0, activeSeconds: 0, sessions: 0 }, 1), "Balanced · Cache 0% · $0.00/d · -/hr");
assert.deepEqual(plain(widget.budgetForecast({ cost: 7 }, 7, 60)), { budget: 60, dailyCost: 1, forecastCost: 30, ratio: 0.5 });
assert.equal(widget.formatBudgetPercent(1.26), "126%");

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
      project: "C:\\work\\alpha",
    },
    {
      sessionHash: "same",
      firstMessageAt: new Date(now - 55 * 60 * 1000).toISOString(),
      lastMessageAt: new Date(now - 35 * 60 * 1000).toISOString(),
      activeSeconds: 1200,
      project: "C:\\work\\alpha",
    },
    {
      sessionHash: "old",
      firstMessageAt: new Date(now - 10 * 86400 * 1000).toISOString(),
      lastMessageAt: new Date(now - 9 * 86400 * 1000).toISOString(),
      activeSeconds: 100,
      project: "/work/old",
    },
  ],
}, 7);

assert.equal(summary.totalTokens, 585);
assert.equal(summary.cost, 0.32);
assert.equal(summary.sessions, 1);
assert.equal(summary.activeSeconds, 1200);
assert.equal(summary.topSources[0][0], "claude-code");
assert.equal(summary.topModels[0][0], "claude-sonnet");
assert.equal(summary.topProjects[0][0], "C:\\work\\alpha");
assert.equal(widget.projectName(summary.topProjects[0][0]), "alpha");
assert.equal(summary.topProjects[0][1].sessions, 1);
assert.equal(summary.topSourcesByCost[0][0], "claude-code");
assert.equal(widget.topEntriesFor(summary, "source", "cost")[0][0], "claude-code");
assert.equal(widget.topEntriesFor(summary, "project", "active")[0][0], "C:\\work\\alpha");
assert.equal(widget.insightSummary(summary, 7), "Balanced · Cache 4.3% · $0.05/d · 1.8K/hr");
assert.equal(widget.insightSummary(summary, 7, { privacyMode: true }), "Balanced · Cache 4.3% · 1 Session");
assert.equal(widget.insightSummary(summary, 7, { privacyMode: true, monthlyBudget: 10 }).includes("$"), false);
assert.equal(widget.topListSummary(summary, summary.topSources), "1 Session · Avg/Session 585 · Top Share 68%");
assert.equal(widget.topListSummary(summary, summary.topSources, ["avgTokensPerSession"]), "Avg/Session 585");
assert.equal(widget.topListSummary(summary, summary.topSources, []), "");

const pulseNow = new Date(2026, 6, 12, 12, 0, 0).getTime();
const pulse = widget.activityPulse([
  { firstMessageAt: new Date(pulseNow - 2 * 3600000).toISOString(), lastMessageAt: new Date(pulseNow - 3600000).toISOString(), activeSeconds: 1800 },
  { firstMessageAt: new Date(pulseNow - 26 * 3600000).toISOString(), lastMessageAt: new Date(pulseNow - 25 * 3600000).toISOString(), activeSeconds: 1200 },
], 7, pulseNow);
assert.equal(pulse.days.length, 7);
assert.equal(pulse.streak, 2);
assert.equal(pulse.days.at(-1).activeSeconds, 1800);
assert.equal(pulse.days.at(-2).activeSeconds, 1200);
assert.equal(widget.relativeAgeShort(new Date(pulseNow - 2 * 3600000).toISOString(), pulseNow), "2h");
assert.equal(widget.relativeAgeShort(null, pulseNow), "-");
assert.deepEqual(plain(widget.topEntriesFor({}, "source", "tokens")), []);

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

widget.clearCache();
files.set("/docs/vibeusage-widget-cache.json", JSON.stringify(cached));
assert.equal(widget.loadCache(request).payload.summary.totalTokens, 585);
widget.saveCache({ request: widget.cacheRequest({ ...request, days: 30 }), payload: { marker: "30d" } });
assert.equal(widget.loadCache(request).payload.summary.totalTokens, 585);
assert.equal(widget.loadCache({ ...request, days: 30 }).payload.marker, "30d");

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
assert.deepEqual(widget.projectListRowImage("alpha", { activeSeconds: 3600, sessions: 2 }, 7200, new Color("#5ca7ff"), 300, 18), { type: "image" });
assert.deepEqual(widget.activityPulseImage(pulse.days, 300, 62, new Color("#5ca7ff")), { type: "image" });

const renderPayload = {
  configured: true,
  summary,
  days: 7,
  updatedAt: now,
  offline: false,
  topList: "project",
  topSort: "active",
  largeSummary: ["sessions", "topShare"],
  privacyMode: true,
  monthlyBudget: 10,
  largeView: "overview",
};
assert.doesNotThrow(() => widget.buildLargeWidget(new WidgetNode(), renderPayload));
const largeActivityNode = new WidgetNode();
assert.doesNotThrow(() => widget.buildLargeWidget(largeActivityNode, { ...renderPayload, largeView: "activity" }));
assert.equal(largeActivityNode.log.includes("Activity Pulse"), true);
assert.doesNotThrow(() => widget.buildMediumWidget(new WidgetNode(), renderPayload));
const mediumActivityNode = new WidgetNode();
assert.doesNotThrow(() => widget.buildMediumWidget(mediumActivityNode, { ...renderPayload, largeView: "activity" }));
assert.equal(mediumActivityNode.log.includes("Activity Pulse"), false);
assert.doesNotThrow(() => widget.buildSmallWidget(new WidgetNode(), renderPayload));
for (const largeView of ["overview", "activity"]) {
  for (const privacyMode of [false, true]) {
    for (const monthlyBudget of [0, 100]) {
      for (const [topList, topSort] of [["source", "tokens"], ["model", "cost"], ["project", "active"], ["project", "sessions"]]) {
        assert.doesNotThrow(() => widget.buildLargeWidget(new WidgetNode(), {
          ...renderPayload,
          largeView,
          privacyMode,
          monthlyBudget,
          topList,
          topSort,
        }));
      }
    }
  }
}

console.log("widget logic smoke tests passed");
