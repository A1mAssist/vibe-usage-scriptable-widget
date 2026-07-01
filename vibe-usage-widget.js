// Vibe Usage iPhone widget for Scriptable.
// Shows token/cost stats from vibecafe.ai using the same vbu_ API key as
// `npx @vibe-cafe/vibe-usage summary` and the Vibe Usage Mac app.

const CONFIG = {
  apiUrl: "https://vibecafe.ai",
  days: 7,
  refreshMinutes: 5,
  keychainKey: "vibeusage.widget.config",
  cacheFile: "vibeusage-widget-cache.json",
};

const DEFAULT_SETTINGS = {
  language: "auto",
  theme: "auto",
};

const SOURCE_LABELS = {
  "claude-code": "Claude",
  codex: "Codex",
  cursor: "Cursor",
  "gemini-cli": "Gemini",
  opencode: "OpenCode",
  openclaw: "OpenClaw",
  "qwen-code": "Qwen",
  "kimi-code": "Kimi",
  amp: "Amp",
  droid: "Droid",
  hermes: "Hermes",
  kiro: "Kiro",
  cline: "Cline",
  "roo-code": "Roo",
  zcode: "ZCode",
};

let COLORS = buildColors("auto");
let ACTIVE_LANGUAGE = "en";

const LAYOUT = {
  mediumContentWidth: 291,
  largeContentWidth: 300,
};

const I18N = {
  en: {
    title: "Token Usage",
    smallTitle: "Token",
    token: "Token",
    cost: "Cost",
    active: "Active",
    cache: "Cache",
    in: "In",
    out: "Out",
    think: "Reasoning",
    tokenMix: "Token mix",
    topSources: "Top sources",
    lastDays: "Last {days} days",
    updated: "Updated {time}",
    yesterday: "Yesterday",
    dayBeforeYesterday: "Day before yesterday",
    usingCachedData: "Using cached data",
    noData: "No data yet. Run vibe-usage sync on your Mac first.",
    apiKeyRequired: "API key required",
    setupHint: "Copy your vbu_ key, then run this script once in Scriptable.",
    configuredTitle: "Vibe Usage configured",
    configuredMessage: "API key saved to Scriptable Keychain. Refresh the widget on your Home Screen.",
    setupTitle: "API key required",
    setupMessage: "Copy your vbu_ Vibe Usage API key, or place vibeusage-widget.json in Scriptable iCloud Drive, then run once.",
    ok: "OK",
    invalidKey: "API key is invalid or revoked",
    fetchFailed: "Fetch failed",
    settingsTitle: "Token Usage Settings",
    settingsMessage: "These choices are saved in Scriptable Keychain.",
    refreshCompleteTitle: "Refresh complete",
    refreshCompleteMessage: "Latest usage has been fetched and cached.",
    preview: "Preview",
    language: "Language",
    appearance: "Appearance",
    days: "Days",
    system: "System",
    english: "English",
    chinese: "Chinese",
    light: "Light",
    dark: "Dark",
    save: "Save",
    cancel: "Cancel",
  },
  zh: {
    title: "Token 用量",
    smallTitle: "Token",
    token: "总量",
    cost: "费用",
    active: "活跃",
    cache: "缓存",
    in: "输入",
    out: "输出",
    think: "推理",
    tokenMix: "Token 组成",
    topSources: "主要来源",
    lastDays: "近 {days} 天",
    updated: "{time} 更新",
    yesterday: "昨天",
    dayBeforeYesterday: "前天",
    usingCachedData: "正在使用缓存数据",
    noData: "暂无数据。先在 Mac 上运行 vibe-usage 同步。",
    apiKeyRequired: "需要 API Key",
    setupHint: "复制 vbu_ 开头的 Key，然后在 Scriptable 里运行一次脚本。",
    configuredTitle: "Vibe Usage 已配置",
    configuredMessage: "API Key 已保存到 Scriptable Keychain。回到桌面刷新小组件即可。",
    setupTitle: "需要先导入 API Key",
    setupMessage: "复制 vbu_ 开头的 Vibe Usage API Key，或把 vibeusage-widget.json 放进 Scriptable 的 iCloud 文件夹后再运行一次。",
    ok: "好",
    invalidKey: "API Key 无效或已撤销",
    fetchFailed: "拉取失败",
    settingsTitle: "Token 用量设置",
    settingsMessage: "设置会保存到 Scriptable Keychain。",
    refreshCompleteTitle: "刷新完成",
    refreshCompleteMessage: "最新用量已拉取并缓存。",
    preview: "预览",
    language: "语言",
    appearance: "外观",
    days: "天数",
    system: "跟随系统",
    english: "English",
    chinese: "中文",
    light: "浅色",
    dark: "深色",
    save: "保存",
    cancel: "取消",
  },
};

function makeColor(hex, alpha) {
  return alpha === undefined ? new Color(hex) : new Color(hex, alpha);
}

function adaptiveColor(theme, lightHex, darkHex, lightAlpha, darkAlpha) {
  if (theme === "light") return makeColor(lightHex, lightAlpha);
  if (theme === "dark") return makeColor(darkHex, darkAlpha);
  return Color.dynamic(makeColor(lightHex, lightAlpha), makeColor(darkHex, darkAlpha));
}

function buildColors(theme) {
  return {
    bgTop: adaptiveColor(theme, "#f7f8fc", "#101015"),
    bgBottom: adaptiveColor(theme, "#edf0f7", "#08080b"),
    card: adaptiveColor(theme, "#000000", "#ffffff", 0.055, 0.075),
    cardStrong: adaptiveColor(theme, "#000000", "#ffffff", 0.085, 0.105),
    text: adaptiveColor(theme, "#101116", "#f4f4f6"),
    muted: adaptiveColor(theme, "#555b66", "#b1b1b8"),
    faint: adaptiveColor(theme, "#8a8d98", "#777782"),
    drawFaint: makeColor("#858895"),
    blue: makeColor("#5ca7ff"),
    green: makeColor("#32d583"),
    purple: makeColor("#a78bfa"),
    gray: makeColor("#8e8e96"),
    cache: makeColor("#79b8c8"),
    amber: makeColor("#f7b955"),
    track: makeColor("#8e8e96", 0.26),
  };
}

function normalizeConfig(config) {
  const c = config || {};
  const language = ["auto", "en", "zh"].includes(c.language) ? c.language : DEFAULT_SETTINGS.language;
  const theme = ["auto", "light", "dark"].includes(c.theme) ? c.theme : DEFAULT_SETTINGS.theme;
  return {
    ...c,
    apiUrl: c.apiUrl || CONFIG.apiUrl,
    days: clampDays(c.days || CONFIG.days),
    language,
    theme,
  };
}

function resolveLanguage(mode) {
  if (mode === "en" || mode === "zh") return mode;
  try {
    const lang = String(Device.language ? Device.language() : "").toLowerCase();
    if (lang.startsWith("zh")) return "zh";
  } catch {}
  return "en";
}

function applyRuntimeSettings(config) {
  const c = normalizeConfig(config);
  ACTIVE_LANGUAGE = resolveLanguage(c.language);
  COLORS = buildColors(c.theme);
  return c;
}

function t(key, vars = {}) {
  const dict = I18N[ACTIVE_LANGUAGE] || I18N.en;
  const template = dict[key] || I18N.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
}

function languageName(value) {
  if (value === "en") return t("english");
  if (value === "zh") return t("chinese");
  return t("system");
}

function themeName(value) {
  if (value === "light") return t("light");
  if (value === "dark") return t("dark");
  return t("system");
}

function getConfig() {
  if (!Keychain.contains(CONFIG.keychainKey)) return null;
  try {
    return normalizeConfig(JSON.parse(Keychain.get(CONFIG.keychainKey)));
  } catch {
    return null;
  }
}

function saveConfig(config) {
  Keychain.set(CONFIG.keychainKey, JSON.stringify(normalizeConfig(config)));
}

function cachePath() {
  const fm = FileManager.local();
  return fm.joinPath(fm.documentsDirectory(), CONFIG.cacheFile);
}

function saveCache(payload) {
  try {
    FileManager.local().writeString(cachePath(), JSON.stringify(payload));
  } catch {}
}

function loadCache() {
  try {
    const fm = FileManager.local();
    const path = cachePath();
    if (!fm.fileExists(path)) return null;
    return JSON.parse(fm.readString(path));
  } catch {
    return null;
  }
}

async function bootstrapIfNeeded() {
  const existing = getConfig();
  let raw = "";

  try {
    const fm = FileManager.iCloud();
    const p = fm.joinPath(fm.documentsDirectory(), "vibeusage-widget.json");
    if (fm.fileExists(p)) {
      if (!fm.isFileDownloaded(p)) await fm.downloadFileFromiCloud(p);
      raw = fm.readString(p);
      try {
        fm.remove(p);
      } catch {}
    }
  } catch {}

  if (!raw) {
    try {
      raw = Pasteboard.paste();
    } catch {}
  }

  const imported = parseConfigInput(raw);
  if (imported) {
    const merged = applyRuntimeSettings(normalizeConfig({ ...existing, ...imported }));
    saveConfig(merged);
    if (!config.runsInWidget) {
      const a = new Alert();
      a.title = t("configuredTitle");
      a.message = t("configuredMessage");
      a.addAction(t("ok"));
      await a.present();
    }
    return merged;
  }

  if (existing?.apiKey) return applyRuntimeSettings(existing);

  if (!config.runsInWidget) {
    applyRuntimeSettings(existing || DEFAULT_SETTINGS);
    const a = new Alert();
    a.title = t("setupTitle");
    a.message = t("setupMessage");
    a.addAction(t("ok"));
    await a.present();
  }
  return null;
}

function parseConfigInput(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();

  if (/^vbu_[A-Za-z0-9_-]+$/.test(trimmed)) {
    return { apiKey: trimmed, apiUrl: CONFIG.apiUrl, days: CONFIG.days };
  }

  try {
    const parsed = JSON.parse(trimmed);
    const apiKey = parsed.apiKey || parsed.key || parsed.vibeUsageApiKey;
    if (typeof apiKey === "string" && apiKey.startsWith("vbu_")) {
      return {
        apiKey,
        apiUrl: parsed.apiUrl || CONFIG.apiUrl,
        days: clampDays(parsed.days || CONFIG.days),
        language: parsed.language || DEFAULT_SETTINGS.language,
        theme: parsed.theme || DEFAULT_SETTINGS.theme,
      };
    }
  } catch {}

  return null;
}

function clampDays(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return CONFIG.days;
  return Math.min(90, Math.max(1, Math.round(n)));
}

async function fetchUsage(widgetConfig) {
  const apiUrl = (widgetConfig.apiUrl || CONFIG.apiUrl).replace(/\/+$/, "");
  const days = clampDays(widgetConfig.days || CONFIG.days);
  const req = new Request(`${apiUrl}/api/usage?days=${days}`);
  req.timeoutInterval = 15;
  req.headers = { Authorization: `Bearer ${widgetConfig.apiKey}` };
  const data = await req.loadJSON();
  const status = req.response ? req.response.statusCode : 200;
  if (status === 401) throw new Error(t("invalidKey"));
  if (status < 200 || status >= 300) throw new Error(`HTTP ${status}`);
  return data;
}

function summarize(data, days = CONFIG.days) {
  const buckets = Array.isArray(data?.buckets) ? data.buckets : [];
  const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
  const visibleSessions = sessionsInWindow(sessions, days);
  const totals = {
    cost: 0,
    input: 0,
    output: 0,
    cached: 0,
    reasoning: 0,
    activeSeconds: 0,
    sessions: visibleSessions.length,
    bySource: new Map(),
    byModel: new Map(),
  };

  for (const bucket of buckets) {
    const input = number(bucket.inputTokens);
    const output = number(bucket.outputTokens);
    const cached = number(bucket.cachedInputTokens);
    const reasoning = number(bucket.reasoningOutputTokens);
    const cost = number(bucket.estimatedCost);
    const total = input + output + reasoning + cached;

    totals.input += input;
    totals.output += output;
    totals.cached += cached;
    totals.reasoning += reasoning;
    totals.cost += cost;

    addTo(totals.bySource, bucket.source || "unknown", { tokens: total, cost });
    addTo(totals.byModel, bucket.model || "unknown", { tokens: total, cost });
  }

  totals.activeSeconds = activeSecondsInWindow(visibleSessions, days);

  totals.totalTokens = totals.input + totals.output + totals.reasoning + totals.cached;
  totals.topSources = topEntries(totals.bySource, "tokens", 4);
  totals.topModels = topEntries(totals.byModel, "tokens", 3);
  return totals;
}

function sessionsInWindow(sessions, days) {
  const now = Date.now();
  const start = now - clampDays(days) * 86400 * 1000;
  const seen = new Set();
  const out = [];

  for (const s of sessions) {
    const key = s.sessionHash || `${s.source || ""}|${s.project || ""}|${s.firstMessageAt || ""}|${s.lastMessageAt || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const first = parseTimeMs(s.firstMessageAt);
    const last = parseTimeMs(s.lastMessageAt);
    if (first != null && last != null) {
      if (last < start || first > now) continue;
    } else if (first != null && first < start) {
      continue;
    }
    out.push(s);
  }

  return out;
}

function activeSecondsInWindow(sessions, days) {
  const now = Date.now();
  const start = now - clampDays(days) * 86400 * 1000;
  const maxSeconds = clampDays(days) * 86400;
  const ranges = [];
  let active = 0;

  for (const s of sessions) {
    const first = parseTimeMs(s.firstMessageAt);
    const last = parseTimeMs(s.lastMessageAt);
    const rawActive = Math.max(0, number(s.activeSeconds));

    if (first != null && last != null) {
      const rangeStart = Math.max(start, Math.min(first, last));
      const rangeEnd = Math.min(now, Math.max(first, last));
      const rangeSeconds = Math.max(0, Math.round((rangeEnd - rangeStart) / 1000));
      if (rangeSeconds > 0) ranges.push([rangeStart, rangeEnd]);
      active += Math.min(rawActive, rangeSeconds || maxSeconds);
    } else {
      active += Math.min(rawActive, maxSeconds);
    }
  }

  const wallSeconds = mergeDurationSeconds(ranges);
  return Math.round(Math.min(active, wallSeconds || maxSeconds));
}

function mergeDurationSeconds(ranges) {
  if (ranges.length === 0) return 0;
  ranges.sort((a, b) => a[0] - b[0]);
  let total = 0;
  let [curStart, curEnd] = ranges[0];

  for (let i = 1; i < ranges.length; i++) {
    const [start, end] = ranges[i];
    if (start <= curEnd) {
      curEnd = Math.max(curEnd, end);
    } else {
      total += Math.max(0, curEnd - curStart);
      curStart = start;
      curEnd = end;
    }
  }
  total += Math.max(0, curEnd - curStart);
  return Math.round(total / 1000);
}

function parseTimeMs(value) {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

function addTo(map, key, delta) {
  const cur = map.get(key) || { tokens: 0, cost: 0 };
  cur.tokens += delta.tokens || 0;
  cur.cost += delta.cost || 0;
  map.set(key, cur);
}

function topEntries(map, sortBy, limit) {
  return [...map.entries()].sort((a, b) => b[1][sortBy] - a[1][sortBy]).slice(0, limit);
}

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatTokens(n) {
  if (n >= 1_000_000_000) return `${trim1(n / 1_000_000_000)}B`;
  if (n >= 1_000_000) return `${trim1(n / 1_000_000)}M`;
  if (n >= 1_000) return `${trim1(n / 1_000)}K`;
  return String(Math.round(n));
}

function formatCost(n) {
  if (n <= 0) return "$0.00";
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

function formatCostShort(n) {
  if (n >= 1000) return `$${trim1(n / 1000)}K`;
  return formatCost(n);
}

function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h <= 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDurationShort(seconds) {
  const s = Math.max(0, Math.round(seconds));
  if (s < 3600) return formatDuration(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h < 100) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (h < 240) return `${h}h`;
  const days = Math.floor(h / 24);
  const hours = h % 24;
  const dayHour = `${days}d ${hours}h`;
  if (dayHour.length <= 7) return dayHour;
  return `${(s / 86400).toFixed(1)}d`;
}

function trim1(n) {
  const s = n.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

function agoText(ts) {
  if (!ts) return formatClock(new Date());
  const date = new Date(ts);
  if (!Number.isFinite(date.getTime())) return formatClock(new Date());

  const today = startOfLocalDay(new Date());
  const day = startOfLocalDay(date);
  const diffDays = Math.round((today.getTime() - day.getTime()) / 86400000);

  if (diffDays <= 0) return formatClock(date);
  if (diffDays === 1) return t("yesterday");
  if (diffDays === 2) return t("dayBeforeYesterday");
  return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}`;
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatClock(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function sourceLabel(source) {
  return SOURCE_LABELS[source] || source || "Unknown";
}

function fitText(text, size, minSize) {
  const t = text;
  t.font = Font.semiboldMonospacedSystemFont(size);
  t.minimumScaleFactor = Math.max(0.45, minSize / size);
  t.lineLimit = 1;
  return t;
}

function refreshUrl() {
  try {
    if (typeof URLScheme !== "undefined" && URLScheme.forRunningScript) {
      const base = URLScheme.forRunningScript();
      return base + (base.includes("?") ? "&" : "?") + "refresh=1";
    }
  } catch {}
  return `scriptable:///run?scriptName=${encodeURIComponent(Script.name())}&refresh=1`;
}

function settingsUrl() {
  try {
    if (typeof URLScheme !== "undefined" && URLScheme.forRunningScript) {
      const base = URLScheme.forRunningScript();
      return base + (base.includes("?") ? "&" : "?") + "settings=1";
    }
  } catch {}
  return `scriptable:///run?scriptName=${encodeURIComponent(Script.name())}&settings=1`;
}

function refreshIconImage(size) {
  try {
    const symbol = SFSymbol.named("arrow.clockwise");
    symbol.applyFont(Font.semiboldSystemFont(size));
    return symbol.image;
  } catch {
    return null;
  }
}

function segmentChipsImage(parts, width, height, gap) {
  const ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  const visible = parts.filter(p => p.value > 0);
  if (visible.length === 0) return ctx.getImage();

  const total = Math.max(1, visible.reduce((sum, p) => sum + Math.max(0, p.value), 0));
  const available = Math.max(1, width - gap * (visible.length - 1));
  const minW = Math.min(height, available / visible.length);
  const widths = visible.map(p => Math.max(minW, available * p.value / total));
  let overflow = widths.reduce((sum, w) => sum + w, 0) - available;
  while (overflow > 0.1) {
    const flexible = widths.map((w, i) => w > minW + 0.1 ? i : -1).filter(i => i >= 0);
    if (flexible.length === 0) break;
    const reduceBy = overflow / flexible.length;
    for (const i of flexible) widths[i] = Math.max(minW, widths[i] - reduceBy);
    overflow = widths.reduce((sum, w) => sum + w, 0) - available;
  }

  let x = 0;
  visible.forEach((part, index) => {
    const seg = new Path();
    seg.addRoundedRect(new Rect(x, 0, widths[index], height), height / 2.8, height / 2.8);
    ctx.addPath(seg);
    ctx.setFillColor(part.color);
    ctx.fillPath();
    x += widths[index] + gap;
  });

  return ctx.getImage();
}

function tokenMixRailImage(parts, width, height) {
  const ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  ctx.setFont(Font.semiboldSystemFont(8));
  ctx.setTextColor(COLORS.drawFaint);

  const labels = parts.filter(p => p.label && p.value > 0).slice(0, 4);
  let labelX = 0;
  labels.forEach((part) => {
    const textWidth = Math.min(76, Math.max(18, part.label.length * 6.2));
    const dot = new Path();
    dot.addRoundedRect(new Rect(labelX, 2.5, 5, 5), 2.5, 2.5);
    ctx.addPath(dot);
    ctx.setFillColor(part.color);
    ctx.fillPath();

    ctx.setTextColor(COLORS.drawFaint);
    ctx.drawTextInRect(part.label, new Rect(labelX + 8, 0, textWidth, 11));
    labelX += 8 + textWidth + 9;
  });

  const railY = Math.max(15, height - 13);
  const railH = Math.min(13, height - railY);
  return overlayRailImage(ctx, parts, width, railY, railH, 4);
}

function overlayRailImage(ctx, parts, width, y, height, gap) {
  const visible = parts.filter(p => p.value > 0);
  if (visible.length === 0) return ctx.getImage();

  const track = new Path();
  track.addRoundedRect(new Rect(0, y, width, height), height / 2.8, height / 2.8);
  ctx.addPath(track);
  ctx.setFillColor(COLORS.track);
  ctx.fillPath();

  const total = Math.max(1, visible.reduce((sum, p) => sum + Math.max(0, p.value), 0));
  const available = Math.max(1, width - gap * (visible.length - 1));
  const minW = Math.min(height, available / visible.length);
  const widths = visible.map(p => Math.max(minW, available * p.value / total));
  let overflow = widths.reduce((sum, w) => sum + w, 0) - available;
  while (overflow > 0.1) {
    const flexible = widths.map((w, i) => w > minW + 0.1 ? i : -1).filter(i => i >= 0);
    if (flexible.length === 0) break;
    const reduceBy = overflow / flexible.length;
    for (const i of flexible) widths[i] = Math.max(minW, widths[i] - reduceBy);
    overflow = widths.reduce((sum, w) => sum + w, 0) - available;
  }

  let x = 0;
  visible.forEach((part, index) => {
    const seg = new Path();
    seg.addRoundedRect(new Rect(x, y, widths[index], height), height / 2.8, height / 2.8);
    ctx.addPath(seg);
    ctx.setFillColor(part.color);
    ctx.fillPath();
    x += widths[index] + gap;
  });

  return ctx.getImage();
}

function progressImage(ratio, width, height, color) {
  const ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  const track = new Path();
  track.addRoundedRect(new Rect(0, 0, width, height), height / 2, height / 2);
  ctx.addPath(track);
  ctx.setFillColor(COLORS.track);
  ctx.fillPath();

  const fillWidth = Math.max(height, width * Math.max(0, Math.min(1, ratio)));
  const fill = new Path();
  fill.addRoundedRect(new Rect(0, 0, fillWidth, height), height / 2, height / 2);
  ctx.addPath(fill);
  ctx.setFillColor(color);
  ctx.fillPath();

  return ctx.getImage();
}

function addHeader(widget, payload, options = {}) {
  const header = widget.addStack();
  header.layoutHorizontally();
  header.centerAlignContent();

  const left = header.addStack();
  left.layoutVertically();
  left.spacing = 1;

  const title = left.addText(t("title"));
  title.font = Font.semiboldSystemFont(15);
  title.textColor = COLORS.text;

  const subtitle = options.showUpdated === false
    ? t("lastDays", { days: payload.days })
    : `${t("lastDays", { days: payload.days })} - ${t("updated", { time: agoText(payload.updatedAt) })}`;
  const sub = left.addText(subtitle);
  sub.font = Font.systemFont(10);
  sub.textColor = COLORS.faint;
  sub.lineLimit = 1;

  header.addSpacer();

  const right = header.addStack();
  right.layoutHorizontally();
  right.centerAlignContent();
  right.url = refreshUrl();
  const icon = refreshIconImage(15);
  if (icon) {
    const refresh = right.addImage(icon);
    refresh.imageSize = new Size(15, 15);
    refresh.tintColor = COLORS.blue;
  }
}

function addMetric(stack, label, value, color, options = {}) {
  const compact = Boolean(options.compact);
  const detail = options.detail;
  const box = stack.addStack();
  if (options.width || options.height) {
    box.size = new Size(options.width || 0, options.height || 0);
  }
  box.layoutVertically();
  box.spacing = compact ? 2 : 3;
  box.backgroundColor = COLORS.card;
  box.cornerRadius = compact ? 9 : 10;
  box.setPadding(compact ? 6 : 8, 9, compact ? 6 : 8, 9);

  const l = box.addText(label);
  l.font = Font.semiboldSystemFont(9);
  l.textColor = COLORS.faint;
  l.lineLimit = 1;

  const v = fitText(box.addText(value), compact ? 18 : 18, compact ? 11 : 11);
  v.textColor = color || COLORS.text;

  if (detail) {
    const d = box.addText(detail);
    d.font = Font.systemFont(8);
    d.textColor = COLORS.muted;
    d.lineLimit = 1;
    d.minimumScaleFactor = 0.65;
  }
}

function addSourceRow(parent, label, item, maxTokens, color) {
  const row = parent.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  row.spacing = 7;

  const name = row.addText(label);
  name.font = Font.semiboldSystemFont(10);
  name.textColor = COLORS.muted;
  name.lineLimit = 1;
  name.minimumScaleFactor = 0.7;
  name.size = new Size(58, 0);

  const pct = maxTokens > 0 ? item.tokens / maxTokens : 0;
  const img = row.addImage(progressImage(pct, 96, 6, color));
  img.imageSize = new Size(96, 6);

  row.addSpacer();

  const value = row.addText(formatTokens(item.tokens));
  value.font = Font.semiboldMonospacedSystemFont(10);
  value.textColor = COLORS.text;
  value.lineLimit = 1;
}

function buildWidget(payload) {
  const widget = new ListWidget();
  const gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [COLORS.bgTop, COLORS.bgBottom];
  widget.backgroundGradient = gradient;
  widget.url = settingsUrl();

  const family = config.widgetFamily || "medium";
  if (family === "small") return buildSmallWidget(widget, payload);
  if (family === "large") return buildLargeWidget(widget, payload);
  return buildMediumWidget(widget, payload);
}

function buildMediumWidget(widget, payload) {
  widget.setPadding(18, 18, 18, 20);
  addHeader(widget, payload);
  widget.addSpacer(7);

  if (!payload.configured) {
    addSetupMessage(widget);
    return widget;
  }

  if (payload.error && !payload.summary) {
    addErrorMessage(widget, payload.error);
    return widget;
  }

  const s = payload.summary;
  const metricRow = widget.addStack();
  metricRow.layoutHorizontally();
  metricRow.addSpacer();
  const metrics = metricRow.addStack();
  metrics.layoutHorizontally();
  const metricGap = 5;
  const metricHeight = 58;
  const metricWidth = (LAYOUT.mediumContentWidth - metricGap * 3) / 4;
  metrics.spacing = metricGap;
  metrics.size = new Size(LAYOUT.mediumContentWidth, metricHeight);
  addMetric(metrics, t("token"), formatTokens(s.totalTokens), COLORS.text, {
    compact: true,
    width: metricWidth,
    height: metricHeight,
  });
  addMetric(metrics, t("cost"), formatCostShort(s.cost), COLORS.green, {
    compact: true,
    width: metricWidth,
    height: metricHeight,
  });
  addMetric(metrics, t("active"), formatDurationShort(s.activeSeconds), COLORS.blue, {
    compact: true,
    width: metricWidth,
    height: metricHeight,
  });
  addMetric(metrics, t("cache"), formatTokens(s.cached), COLORS.cache, {
    compact: true,
    width: metricWidth,
    height: metricHeight,
  });
  metricRow.addSpacer();

  widget.addSpacer(7);

  const mixRow = widget.addStack();
  mixRow.layoutHorizontally();
  mixRow.addSpacer();
  const mix = mixRow.addImage(tokenMixRailImage([
    { label: t("in"), value: s.input, color: COLORS.blue },
    { label: t("out"), value: s.output, color: COLORS.green },
    { label: t("think"), value: s.reasoning, color: COLORS.purple },
    { label: t("cache"), value: s.cached, color: COLORS.cache },
  ], LAYOUT.mediumContentWidth, 22));
  mix.imageSize = new Size(LAYOUT.mediumContentWidth, 22);
  mixRow.addSpacer();

  if (payload.offline) {
    widget.addSpacer(7);
    const note = widget.addText(t("usingCachedData"));
    note.font = Font.systemFont(9);
    note.textColor = COLORS.amber;
    note.lineLimit = 1;
  }

  widget.addSpacer();

  return widget;
}

function buildSmallWidget(widget, payload) {
  widget.setPadding(17, 15, 16, 15);

  const top = widget.addStack();
  top.layoutHorizontally();
  top.centerAlignContent();
  const title = top.addText(t("smallTitle"));
  title.font = Font.semiboldSystemFont(13);
  title.textColor = COLORS.faint;
  top.addSpacer();
  const refreshTarget = top.addStack();
  refreshTarget.layoutHorizontally();
  refreshTarget.centerAlignContent();
  refreshTarget.url = refreshUrl();
  const img = refreshIconImage(15);
  if (img) {
    const icon = refreshTarget.addImage(img);
    icon.imageSize = new Size(14, 14);
    icon.tintColor = COLORS.blue;
  }
  widget.addSpacer(8);

  if (!payload.configured) {
    addSetupMessage(widget);
    return widget;
  }
  if (payload.error && !payload.summary) {
    addErrorMessage(widget, payload.error);
    return widget;
  }

  const s = payload.summary;
  const total = fitText(widget.addText(formatTokens(s.totalTokens)), 30, 16);
  total.textColor = COLORS.text;
  widget.addSpacer(4);

  const cost = widget.addText(formatCostShort(s.cost));
  cost.font = Font.semiboldMonospacedSystemFont(15);
  cost.textColor = COLORS.green;
  widget.addSpacer(7);

  widget.addSpacer(12);
  const mixRow = widget.addStack();
  mixRow.layoutHorizontally();
  mixRow.addSpacer();
  const mix = mixRow.addImage(segmentChipsImage([
    { value: s.input, color: COLORS.blue },
    { value: s.output, color: COLORS.green },
    { value: s.reasoning, color: COLORS.purple },
    { value: s.cached, color: COLORS.cache },
  ], 124, 8, 3));
  mix.imageSize = new Size(124, 8);
  mixRow.addSpacer();
  widget.addSpacer();

  const updated = widget.addText(t("updated", { time: agoText(payload.updatedAt) }));
  updated.font = Font.systemFont(9);
  updated.textColor = COLORS.faint;
  return widget;
}

function buildLargeWidget(widget, payload) {
  widget.setPadding(16, 20, 16, 20);
  addHeader(widget, payload, { showUpdated: false });
  widget.addSpacer(10);

  if (!payload.configured) {
    addSetupMessage(widget);
    return widget;
  }
  if (payload.error && !payload.summary) {
    addErrorMessage(widget, payload.error);
    return widget;
  }

  const s = payload.summary;
  const metricRow = widget.addStack();
  metricRow.layoutHorizontally();
  metricRow.addSpacer();
  const metrics = metricRow.addStack();
  metrics.layoutHorizontally();
  const metricGap = 7;
  const metricWidth = (LAYOUT.largeContentWidth - metricGap * 3) / 4;
  metrics.spacing = metricGap;
  metrics.size = new Size(LAYOUT.largeContentWidth, 62);
  addMetric(metrics, t("token"), formatTokens(s.totalTokens), COLORS.text, { width: metricWidth, height: 62 });
  addMetric(metrics, t("cost"), formatCostShort(s.cost), COLORS.green, { width: metricWidth, height: 62 });
  addMetric(metrics, t("active"), formatDurationShort(s.activeSeconds), COLORS.blue, { width: metricWidth, height: 62 });
  addMetric(metrics, t("cache"), formatTokens(s.cached), COLORS.cache, { width: metricWidth, height: 62 });
  metricRow.addSpacer();

  widget.addSpacer(12);
  const section = widget.addStack();
  section.layoutHorizontally();
  section.centerAlignContent();
  const label = section.addText(t("tokenMix"));
  label.font = Font.semiboldSystemFont(11);
  label.textColor = COLORS.muted;
  section.addSpacer();
  const updated = section.addText(t("updated", { time: agoText(payload.updatedAt) }));
  updated.font = Font.systemFont(10);
  updated.textColor = COLORS.faint;

  widget.addSpacer(7);
  const mixRow = widget.addStack();
  mixRow.layoutHorizontally();
  mixRow.addSpacer();
  const mix = mixRow.addImage(segmentChipsImage([
    { value: s.input, color: COLORS.blue },
    { value: s.output, color: COLORS.green },
    { value: s.reasoning, color: COLORS.purple },
    { value: s.cached, color: COLORS.cache },
  ], 300, 16, 5));
  mix.imageSize = new Size(300, 16);
  mixRow.addSpacer();
  widget.addSpacer(7);

  const caption = widget.addStack();
  caption.layoutHorizontally();
  caption.spacing = 10;
  addRailCaption(caption, t("in"), COLORS.blue, s.input);
  addRailCaption(caption, t("out"), COLORS.green, s.output);
  addRailCaption(caption, t("think"), COLORS.purple, s.reasoning);
  addRailCaption(caption, t("cache"), COLORS.cache, s.cached);

  widget.addSpacer(14);
  const sourcesTitle = widget.addText(t("topSources"));
  sourcesTitle.font = Font.semiboldSystemFont(11);
  sourcesTitle.textColor = COLORS.muted;
  widget.addSpacer(7);
  addSourceList(widget, s.topSources.slice(0, 4), 4);
  return widget;
}

function addSourceList(parent, sources, limit) {
  const visible = sources.slice(0, limit);
  if (visible.length === 0) {
    const empty = parent.addText(t("noData"));
    empty.font = Font.systemFont(11);
    empty.textColor = COLORS.muted;
    empty.lineLimit = 2;
    return;
  }
  const max = visible[0][1].tokens || 1;
  const rows = parent.addStack();
  rows.layoutVertically();
  rows.spacing = limit > 2 ? 7 : 5;
  const palette = [COLORS.green, COLORS.blue, COLORS.purple, COLORS.cache];
  visible.forEach(([source, item], idx) => addSourceRow(rows, sourceLabel(source), item, max, palette[idx % palette.length]));
}

function addSetupMessage(parent) {
  const box = parent.addStack();
  box.layoutVertically();
  box.spacing = 5;
  box.backgroundColor = COLORS.card;
  box.cornerRadius = 10;
  box.setPadding(11, 11, 11, 11);
  const title = box.addText(t("apiKeyRequired"));
  title.font = Font.semiboldSystemFont(13);
  title.textColor = COLORS.text;
  const hint = box.addText(t("setupHint"));
  hint.font = Font.systemFont(10);
  hint.textColor = COLORS.muted;
  hint.lineLimit = 3;
}

function addErrorMessage(parent, message) {
  const err = parent.addText(message);
  err.font = Font.systemFont(12);
  err.textColor = COLORS.amber;
  err.lineLimit = 3;
}

function addLegend(parent, label, color) {
  const item = parent.addStack();
  item.layoutHorizontally();
  item.centerAlignContent();
  item.spacing = 4;
  const dot = item.addStack();
  dot.size = new Size(6, 6);
  dot.cornerRadius = 3;
  dot.backgroundColor = color;
  const text = item.addText(label);
  text.font = Font.systemFont(8);
  text.textColor = COLORS.faint;
}

function addRailCaption(parent, label, color, value) {
  if (value <= 0) return;
  const item = parent.addStack();
  item.layoutHorizontally();
  item.centerAlignContent();
  item.spacing = 4;
  const dot = item.addStack();
  dot.size = new Size(5, 5);
  dot.cornerRadius = 2.5;
  dot.backgroundColor = color;
  const text = item.addText(label);
  text.font = Font.systemFont(8);
  text.textColor = COLORS.faint;
}

function isRefreshRun() {
  try {
    return args?.queryParameters?.refresh === "1";
  } catch {
    return false;
  }
}

async function presentRefreshResult(payload) {
  const a = new Alert();
  if (payload.error) {
    a.title = t("fetchFailed");
    a.message = payload.error;
  } else {
    a.title = t("refreshCompleteTitle");
    a.message = t("refreshCompleteMessage");
  }
  a.addAction(t("ok"));
  await a.presentAlert();
}

async function chooseLanguage(current) {
  const a = new Alert();
  a.title = t("language");
  a.addAction(t("system"));
  a.addAction(t("english"));
  a.addAction(t("chinese"));
  a.addCancelAction(t("cancel"));
  const choice = await a.presentSheet();
  if (choice === 0) return "auto";
  if (choice === 1) return "en";
  if (choice === 2) return "zh";
  return current;
}

async function chooseTheme(current) {
  const a = new Alert();
  a.title = t("appearance");
  a.addAction(t("system"));
  a.addAction(t("light"));
  a.addAction(t("dark"));
  a.addCancelAction(t("cancel"));
  const choice = await a.presentSheet();
  if (choice === 0) return "auto";
  if (choice === 1) return "light";
  if (choice === 2) return "dark";
  return current;
}

async function chooseDays(current) {
  const a = new Alert();
  a.title = t("days");
  a.addTextField(String(CONFIG.days), String(current || CONFIG.days));
  a.addAction(t("save"));
  a.addCancelAction(t("cancel"));
  const choice = await a.presentAlert();
  if (choice < 0) return current;
  return clampDays(a.textFieldValue(0));
}

async function presentSettingsIfNeeded(widgetConfig) {
  if (config.runsInWidget || isRefreshRun() || !widgetConfig?.apiKey) return widgetConfig;

  let cfg = applyRuntimeSettings(widgetConfig);
  while (true) {
    const a = new Alert();
    a.title = t("settingsTitle");
    a.message = `${t("language")}: ${languageName(cfg.language)}\n${t("appearance")}: ${themeName(cfg.theme)}\n${t("days")}: ${cfg.days}\n\n${t("settingsMessage")}`;
    a.addAction(t("preview"));
    a.addAction(t("language"));
    a.addAction(t("appearance"));
    a.addAction(t("days"));
    a.addCancelAction(t("cancel"));
    const choice = await a.presentSheet();

    if (choice === 1) {
      cfg = applyRuntimeSettings({ ...cfg, language: await chooseLanguage(cfg.language) });
      saveConfig(cfg);
      continue;
    }
    if (choice === 2) {
      cfg = applyRuntimeSettings({ ...cfg, theme: await chooseTheme(cfg.theme) });
      saveConfig(cfg);
      continue;
    }
    if (choice === 3) {
      cfg = applyRuntimeSettings({ ...cfg, days: await chooseDays(cfg.days) });
      saveConfig(cfg);
      continue;
    }

    return cfg;
  }
}

async function main() {
  let widgetConfig = await bootstrapIfNeeded();
  widgetConfig = widgetConfig ? await presentSettingsIfNeeded(widgetConfig) : widgetConfig;
  if (widgetConfig) widgetConfig = applyRuntimeSettings(widgetConfig);
  let payload = {
    configured: Boolean(widgetConfig?.apiKey),
    apiUrl: widgetConfig?.apiUrl || CONFIG.apiUrl,
    days: clampDays(widgetConfig?.days || CONFIG.days),
    updatedAt: Date.now(),
    offline: false,
    summary: null,
    error: null,
  };

  if (widgetConfig?.apiKey) {
    try {
      const data = await fetchUsage(widgetConfig);
      const summary = summarize(data, clampDays(widgetConfig.days || CONFIG.days));
      payload = { ...payload, summary, updatedAt: Date.now() };
      saveCache({ payload });
    } catch (err) {
      const cached = loadCache();
      if (cached?.payload?.summary) {
        payload = { ...cached.payload, offline: true, error: err.message || t("fetchFailed") };
      } else {
        payload.error = err.message || t("fetchFailed");
      }
    }
  }

  const widget = buildWidget(payload);
  widget.refreshAfterDate = new Date(Date.now() + CONFIG.refreshMinutes * 60 * 1000);

  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else if (isRefreshRun()) {
    await presentRefreshResult(payload);
  } else {
    await widget.presentMedium();
  }
  Script.complete();
}

await main();
