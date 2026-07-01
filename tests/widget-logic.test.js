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

const sandbox = {
  console,
  Color,
  Device: { language: () => "en" },
};

vm.createContext(sandbox);
vm.runInContext(
  source.replace(/\r?\nawait main\(\);\s*$/, `
globalThis.__widgetTestExports = {
  cacheMatches,
  cacheRequest,
  clampDays,
  formatDurationShort,
  formatTokens,
  normalizeApiKey,
  normalizeApiUrl,
  parseConfigInput,
  summarize,
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
}))), {
  apiKey: "vbu_json-1",
  apiUrl: "https://example.com",
  days: 90,
  language: "zh",
  theme: "dark",
  topList: "model",
});

assert.equal(widget.formatTokens(1200), "1.2K");
assert.equal(widget.formatTokens(1200000), "1.2M");
assert.equal(widget.formatDurationShort(3660), "1h 1m");
assert.equal(widget.formatDurationShort(11 * 86400), "11d 0h");

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

console.log("widget logic smoke tests passed");
