// Vibe Usage iPhone widget for Scriptable.
// Shows token/cost stats from vibecafe.ai using the same vbu_ API key as
// `npx @vibe-cafe/vibe-usage summary` and the Vibe Usage desktop app.

const CONFIG = {
  version: "0.2.0",
  apiUrl: "https://vibecafe.ai",
  days: 7,
  refreshMinutes: 5,
  keychainKey: "vibeusage.widget.config",
  cacheFile: "vibeusage-widget-cache.json",
  releaseApiUrl: "https://api.github.com/repos/A1mAssist/vibe-usage-scriptable-widget/releases/latest",
  releaseAssetName: "vibe-usage-widget.js",
  updateCheckHours: 24,
};

const DEFAULT_SETTINGS = {
  language: "auto",
  theme: "auto",
  accent: "blue",
  privacyMode: false,
  largeView: "overview",
  topList: "source",
  topSort: "tokens",
  largeSummary: ["sessions", "avgTokensPerSession", "topShare"],
  monthlyBudget: 0,
  updateMode: null,
  oobeComplete: false,
};

const LARGE_SUMMARY_METRICS = ["sessions", "avgTokensPerSession", "topShare"];

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

let COLORS = buildColors("auto", "blue");
let ACTIVE_LANGUAGE = "en";
let ACTIVE_THEME = "auto";
let ACTIVE_WIDGET_PARAMETER = "";

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
    tokenMix: "Token Mix",
    cacheShare: "Cache Share",
    dailyCost: "Daily Cost",
    tokenRate: "Token Rate",
    topSources: "Top Sources",
    topModels: "Top Models",
    topProjects: "Top Projects",
    projects: "Projects",
    project: "Project",
    session: "Session",
    sessions: "Sessions",
    sessionShort: "S",
    streak: "Streak",
    lastActive: "Last Active",
    activityPulse: "Activity Pulse",
    noActivityData: "No Activity Data In This Window",
    now: "Now",
    avgPerSessionShort: "Avg/Session",
    avgTokensPerSession: "Avg Token/Session",
    topShare: "Top Share",
    largeSummary: "Large Summary",
    done: "Done",
    lastDays: "Last {days} Days",
    updated: "Updated {time}",
    yesterday: "Yesterday",
    dayBeforeYesterday: "Day Before Yesterday",
    usingCachedData: "Using Cached Data",
    noData: "No data yet. Run vibe-usage sync on your computer first.",
    noCache: "No cached data for this API key and day range.",
    networkError: "Network request failed. Check connection or try manual refresh.",
    noUsageToday: "No Usage Today",
    noUsageWindow: "No Usage In This Window",
    noUsageHint: "Try a wider day range, or sync Vibe Usage on your computer.",
    apiKeyRequired: "API Key Required",
    setupHint: "Copy your vbu_ key, then run this script once in Scriptable.",
    configuredTitle: "Vibe Usage Configured",
    configuredMessage: "API key saved to Scriptable Keychain. Refresh the widget on your Home Screen.",
    setupTitle: "API Key Required",
    setupMessage: "Copy your vbu_ Vibe Usage API key, or place vibeusage-widget.json in Scriptable iCloud Drive, then run once.",
    ok: "OK",
    invalidKey: "API key is invalid or revoked",
    fetchFailed: "Fetch Failed",
    settingsTitle: "Token Usage Settings",
    settingsMessage: "These choices are saved in Scriptable Keychain.",
    welcomeTitle: "Welcome to Token Usage",
    welcomeMessage: "Choose how this script updates itself. Auto-update checks GitHub releases at most once per day, backs up the current script, then installs verified updates.",
    refreshCompleteTitle: "Refresh Complete",
    refreshCompleteMessage: "Latest usage has been fetched and cached.",
    preview: "Preview",
    small: "Small",
    medium: "Medium",
    large: "Large",
    currentVersion: "Current Version",
    language: "Language",
    appearance: "Appearance",
    changeKey: "Change API Key",
    checkUpdates: "Check For Updates",
    updateMode: "Script Updates",
    dataSettings: "Data Settings",
    displaySettings: "Display Settings",
    updateSettings: "Update Settings",
    diagnostics: "Diagnostics",
    restoreBackup: "Restore Backup",
    autoUpdate: "Auto-Update",
    manualUpdate: "Manual Checks",
    days: "Days",
    topList: "Large List",
    topSort: "Large Sort",
    largeView: "Large View",
    overviewView: "Overview",
    activityView: "Activity",
    privacyMode: "Privacy Mode",
    accentColor: "Accent Color",
    systemBlue: "System Blue",
    graphite: "Graphite",
    mint: "Mint",
    coral: "Coral",
    enabled: "Enabled",
    disabled: "Disabled",
    system: "System",
    english: "English",
    chinese: "Chinese",
    agentClients: "Agent Clients",
    models: "Models",
    sortByTokens: "Sort By Tokens",
    sortByCost: "Sort By Cost",
    sortByActive: "Sort By Active Time",
    sortBySessions: "Sort By Sessions",
    monthlyBudget: "Monthly Budget",
    budgetPromptMessage: "Enter a monthly USD budget. Use 0 to disable budget tracking.",
    invalidBudget: "Enter a valid amount of 0 or more.",
    forecast30Days: "30-Day Forecast",
    cacheHeavy: "Cache Heavy",
    deepThink: "Deep Think",
    highOutput: "High Output",
    balanced: "Balanced",
    clearCache: "Clear Cache",
    cacheClearedTitle: "Cache Cleared",
    cacheClearedMessage: "Cached widget data has been removed.",
    light: "Light",
    dark: "Dark",
    save: "Save",
    cancel: "Cancel",
    keyPromptTitle: "Change API Key",
    keyPromptMessage: "Enter a new vbu_ API key. The key is stored only in Scriptable Keychain.",
    newApiKey: "vbu_...",
    keyUpdatedTitle: "API Key Updated",
    keyUpdatedMessage: "The new API key has been saved. Refresh the widget to fetch latest usage.",
    invalidKeyInput: "Please enter a valid vbu_ API key.",
    checkingUpdates: "Checking For Updates...",
    updateAvailableTitle: "Update Available",
    updateAvailableMessage: "Version {version} is available. Current version: {current}.",
    installUpdate: "Install Update",
    later: "Later",
    updateInstalledTitle: "Update Installed",
    updateInstalledMessage: "Updated to {version}. The next run will use the new script. Backup: {backup}",
    upToDateTitle: "Already Up To Date",
    upToDateMessage: "You are running the latest version: {version}.",
    updateFailedTitle: "Update Failed",
    updateFailedMessage: "{message}",
    restoreBackupTitle: "Restore Backup",
    restoreBackupMessage: "Restore {backup}? The current script will be backed up first.",
    restoreCompleteTitle: "Backup Restored",
    restoreCompleteMessage: "Restored {backup}. The next run will use the restored script.",
    noBackupsTitle: "No Backups Found",
    noBackupsMessage: "No script backups were found for this script.",
    diagnosticsTitle: "Diagnostics",
    apiKeySaved: "API Key Saved",
    cacheStatus: "Cache",
    backupCount: "Backups",
    scriptWritable: "Script Writable",
    scriptName: "Script",
    lastUpdateCheck: "Last Update Check",
    yes: "Yes",
    no: "No",
    none: "None",
    updateAssetMissing: "Release asset is missing.",
    updateValidationFailed: "Downloaded script did not pass validation.",
    scriptFileNotFound: "Current script file was not found.",
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
    cacheShare: "缓存占比",
    dailyCost: "日均费用",
    tokenRate: "Token 速率",
    topSources: "主要来源",
    topModels: "主要模型",
    topProjects: "主要项目",
    projects: "项目",
    project: "项目",
    session: "会话",
    sessions: "会话",
    sessionShort: "次",
    streak: "连续活跃",
    lastActive: "最近活跃",
    activityPulse: "活跃脉冲",
    noActivityData: "当前时间范围没有活跃记录",
    now: "刚刚",
    avgPerSessionShort: "均值/会话",
    avgTokensPerSession: "平均 Token/会话",
    topShare: "最高占比",
    largeSummary: "大号摘要",
    done: "完成",
    lastDays: "近 {days} 天",
    updated: "{time} 更新",
    yesterday: "昨天",
    dayBeforeYesterday: "前天",
    usingCachedData: "正在使用缓存数据",
    noData: "暂无数据。先在电脑上运行 vibe-usage 同步。",
    noCache: "当前 API Key 和天数没有匹配缓存。",
    networkError: "网络请求失败。请检查连接或手动刷新。",
    noUsageToday: "今天暂无用量",
    noUsageWindow: "当前时间范围暂无用量",
    noUsageHint: "可以扩大统计天数，或先在电脑上同步 Vibe Usage。",
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
    welcomeTitle: "欢迎使用 Token 用量",
    welcomeMessage: "请选择脚本更新方式。自动更新最多每天检查一次 GitHub Release，会先备份当前脚本，再安装通过校验的新版本。",
    refreshCompleteTitle: "刷新完成",
    refreshCompleteMessage: "最新用量已拉取并缓存。",
    preview: "预览",
    small: "小号",
    medium: "中号",
    large: "大号",
    currentVersion: "版本",
    language: "语言",
    appearance: "外观",
    changeKey: "更换 API Key",
    checkUpdates: "检查更新",
    updateMode: "脚本更新",
    dataSettings: "数据设置",
    displaySettings: "显示设置",
    updateSettings: "更新设置",
    diagnostics: "诊断信息",
    restoreBackup: "恢复备份",
    autoUpdate: "自动更新",
    manualUpdate: "手动检查",
    days: "天数",
    topList: "大号列表",
    topSort: "大号排序",
    largeView: "大号视图",
    overviewView: "概览",
    activityView: "活跃",
    privacyMode: "隐私模式",
    accentColor: "强调色",
    systemBlue: "系统蓝",
    graphite: "石墨",
    mint: "薄荷",
    coral: "珊瑚",
    enabled: "已开启",
    disabled: "已关闭",
    system: "跟随系统",
    english: "English",
    chinese: "中文",
    agentClients: "Agent 客户端",
    models: "模型",
    sortByTokens: "按 Token 排序",
    sortByCost: "按费用排序",
    sortByActive: "按活跃时长排序",
    sortBySessions: "按会话数排序",
    monthlyBudget: "月度预算",
    budgetPromptMessage: "输入美元月预算，填 0 可关闭预算追踪。",
    invalidBudget: "请输入大于或等于 0 的有效金额。",
    forecast30Days: "30 天预测",
    cacheHeavy: "缓存主导",
    deepThink: "深度推理",
    highOutput: "输出偏高",
    balanced: "均衡",
    clearCache: "清除缓存",
    cacheClearedTitle: "缓存已清除",
    cacheClearedMessage: "小组件缓存数据已删除。",
    light: "浅色",
    dark: "深色",
    save: "保存",
    cancel: "取消",
    keyPromptTitle: "更换 API Key",
    keyPromptMessage: "输入新的 vbu_ API Key。Key 只会保存到 Scriptable Keychain。",
    newApiKey: "vbu_...",
    keyUpdatedTitle: "API Key 已更新",
    keyUpdatedMessage: "新的 API Key 已保存。刷新小组件即可拉取最新用量。",
    invalidKeyInput: "请输入有效的 vbu_ API Key。",
    checkingUpdates: "正在检查更新...",
    updateAvailableTitle: "发现新版本",
    updateAvailableMessage: "版本 {version} 可用。当前版本：{current}。",
    installUpdate: "安装更新",
    later: "稍后",
    updateInstalledTitle: "更新已安装",
    updateInstalledMessage: "已更新到 {version}。下次运行会使用新脚本。备份：{backup}",
    upToDateTitle: "已是最新版本",
    upToDateMessage: "当前已是最新版本：{version}。",
    updateFailedTitle: "更新失败",
    updateFailedMessage: "{message}",
    restoreBackupTitle: "恢复备份",
    restoreBackupMessage: "恢复 {backup}？当前脚本会先自动备份。",
    restoreCompleteTitle: "备份已恢复",
    restoreCompleteMessage: "已恢复 {backup}。下次运行会使用恢复后的脚本。",
    noBackupsTitle: "没有找到备份",
    noBackupsMessage: "没有找到这个脚本的备份文件。",
    diagnosticsTitle: "诊断信息",
    apiKeySaved: "API Key 已保存",
    cacheStatus: "缓存",
    backupCount: "备份数量",
    scriptWritable: "脚本可写",
    scriptName: "脚本",
    lastUpdateCheck: "上次检查更新",
    yes: "是",
    no: "否",
    none: "无",
    updateAssetMissing: "Release 资源文件不存在。",
    updateValidationFailed: "下载的脚本未通过校验。",
    scriptFileNotFound: "找不到当前脚本文件。",
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

function buildColors(theme, accent = DEFAULT_SETTINGS.accent) {
  const accents = {
    blue: "#5ca7ff",
    graphite: "#8e8e93",
    mint: "#32d583",
    coral: "#ff7f73",
  };
  const accentHex = accents[accent] || accents.blue;
  return {
    bgTop: adaptiveColor(theme, "#f7f8fc", "#101015"),
    bgBottom: adaptiveColor(theme, "#edf0f7", "#08080b"),
    card: adaptiveColor(theme, "#000000", "#ffffff", 0.055, 0.075),
    cardStrong: adaptiveColor(theme, "#000000", "#ffffff", 0.085, 0.105),
    text: adaptiveColor(theme, "#101116", "#f4f4f6"),
    muted: adaptiveColor(theme, "#555b66", "#b1b1b8"),
    faint: adaptiveColor(theme, "#8a8d98", "#777782"),
    drawFaint: makeColor("#858895"),
    accent: makeColor(accentHex),
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
  const accent = ["blue", "graphite", "mint", "coral"].includes(c.accent) ? c.accent : DEFAULT_SETTINGS.accent;
  const largeView = ["overview", "activity"].includes(c.largeView) ? c.largeView : DEFAULT_SETTINGS.largeView;
  const topList = ["source", "model", "project"].includes(c.topList) ? c.topList : DEFAULT_SETTINGS.topList;
  const validSorts = topList === "project" ? ["active", "sessions"] : ["tokens", "cost"];
  const topSort = validSorts.includes(c.topSort) ? c.topSort : validSorts[0];
  const largeSummary = normalizeLargeSummary(c.largeSummary);
  const updateMode = isUpdateMode(c.updateMode) ? c.updateMode : DEFAULT_SETTINGS.updateMode;
  const lastUpdateCheckAt = Number.isFinite(Number(c.lastUpdateCheckAt)) ? Number(c.lastUpdateCheckAt) : 0;
  return {
    ...c,
    apiUrl: normalizeApiUrl(c.apiUrl),
    days: clampDays(c.days || CONFIG.days),
    language,
    theme,
    accent,
    privacyMode: Boolean(c.privacyMode),
    largeView,
    topList,
    topSort,
    largeSummary,
    monthlyBudget: normalizeBudget(c.monthlyBudget),
    updateMode,
    oobeComplete: Boolean(c.oobeComplete),
    lastUpdateCheckAt,
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
  ACTIVE_THEME = c.theme;
  COLORS = buildColors(c.theme, c.accent);
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

function topListName(value) {
  if (value === "model") return t("models");
  if (value === "project") return t("projects");
  return t("agentClients");
}

function topSortName(value) {
  if (value === "cost") return t("sortByCost");
  if (value === "active") return t("sortByActive");
  if (value === "sessions") return t("sortBySessions");
  return t("sortByTokens");
}

function accentName(value) {
  if (value === "graphite") return t("graphite");
  if (value === "mint") return t("mint");
  if (value === "coral") return t("coral");
  return t("systemBlue");
}

function largeViewName(value) {
  return value === "activity" ? t("activityView") : t("overviewView");
}

function normalizeLargeSummary(value, fallback = DEFAULT_SETTINGS.largeSummary) {
  if (!Array.isArray(value)) return [...fallback];
  const seen = new Set();
  const out = [];
  for (const item of value) {
    if (LARGE_SUMMARY_METRICS.includes(item) && !seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}

function largeSummaryMetricName(metric) {
  if (metric === "sessions") return t("sessions");
  if (metric === "avgTokensPerSession") return t("avgTokensPerSession");
  if (metric === "topShare") return t("topShare");
  return metric;
}

function largeSummaryName(metrics) {
  const selected = normalizeLargeSummary(metrics, []);
  if (selected.length === 0) return t("none");
  return selected.map(largeSummaryMetricName).join(" / ");
}

function updateModeName(value) {
  if (value === "auto") return t("autoUpdate");
  return t("manualUpdate");
}

function isUpdateMode(value) {
  return value === "auto" || value === "manual";
}

function cacheRequest(config) {
  return {
    apiUrl: normalizeApiUrl(config?.apiUrl),
    days: clampDays(config?.days || CONFIG.days),
    apiKeyHash: hashString(config?.apiKey || ""),
  };
}

function cacheMatches(cached, widgetConfig) {
  const current = cacheRequest(widgetConfig);
  const request = cached?.request;
  if (request) {
    return request.apiUrl === current.apiUrl
      && request.days === current.days
      && request.apiKeyHash === current.apiKeyHash;
  }
  return cached?.payload?.apiUrl === current.apiUrl && cached?.payload?.days === current.days;
}

function hashString(value) {
  let hash = 5381;
  const text = String(value || "");
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
  }
  return String(hash >>> 0);
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
    const existing = loadCacheEntries();
    const entries = [payload, ...existing.filter(item => !sameCacheRequest(item?.request, payload?.request))].slice(0, 8);
    FileManager.local().writeString(cachePath(), JSON.stringify({ entries }));
  } catch {}
}

function clearCache() {
  try {
    const fm = FileManager.local();
    const path = cachePath();
    if (fm.fileExists(path)) fm.remove(path);
  } catch {}
}

function loadCacheEntries() {
  try {
    const fm = FileManager.local();
    const path = cachePath();
    if (!fm.fileExists(path)) return [];
    const raw = JSON.parse(fm.readString(path));
    if (Array.isArray(raw?.entries)) return raw.entries;
    return raw?.payload ? [raw] : [];
  } catch {
    return [];
  }
}

function loadCache(widgetConfig) {
  const entries = loadCacheEntries();
  if (!widgetConfig) return entries[0] || null;
  return entries.find(item => cacheMatches(item, widgetConfig)) || null;
}

function sameCacheRequest(a, b) {
  return a?.apiUrl === b?.apiUrl && a?.days === b?.days && a?.apiKeyHash === b?.apiKeyHash;
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
  const directKey = normalizeApiKey(trimmed);

  if (directKey) {
    return { apiKey: directKey, apiUrl: CONFIG.apiUrl, days: CONFIG.days };
  }

  try {
    const parsed = JSON.parse(trimmed);
    const apiKey = normalizeApiKey(parsed.apiKey || parsed.key || parsed.vibeUsageApiKey);
    if (apiKey) {
      return {
        apiKey,
        apiUrl: normalizeApiUrl(parsed.apiUrl),
        days: clampDays(parsed.days || CONFIG.days),
        language: parsed.language || DEFAULT_SETTINGS.language,
        theme: parsed.theme || DEFAULT_SETTINGS.theme,
        accent: parsed.accent || DEFAULT_SETTINGS.accent,
        privacyMode: Boolean(parsed.privacyMode),
        largeView: parsed.largeView || DEFAULT_SETTINGS.largeView,
        topList: parsed.topList || DEFAULT_SETTINGS.topList,
        topSort: parsed.topSort || DEFAULT_SETTINGS.topSort,
        largeSummary: normalizeLargeSummary(parsed.largeSummary),
        monthlyBudget: normalizeBudget(parsed.monthlyBudget),
        updateMode: isUpdateMode(parsed.updateMode) ? parsed.updateMode : DEFAULT_SETTINGS.updateMode,
        oobeComplete: Boolean(parsed.oobeComplete),
      };
    }
  } catch {}

  return null;
}

function normalizeApiKey(value) {
  const key = typeof value === "string" ? value.trim() : "";
  return /^vbu_[A-Za-z0-9_-]+$/.test(key) ? key : null;
}

function normalizeApiUrl(value) {
  const raw = typeof value === "string" && value.trim() ? value.trim() : CONFIG.apiUrl;
  if (!/^https?:\/\/[^/\s?#]+(?:[/?#][^\s]*)?$/i.test(raw)) return CONFIG.apiUrl;
  return raw.replace(/\/+$/, "");
}

function clampDays(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return CONFIG.days;
  return Math.min(90, Math.max(1, Math.round(n)));
}

function normalizeBudget(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(1000000, Math.round(n * 100) / 100);
}

function parseWidgetParameter(raw) {
  const out = {};
  if (typeof raw !== "string" || !raw.trim()) return out;
  for (const part of raw.split(",")) {
    const index = part.indexOf("=");
    if (index < 1) continue;
    const key = part.slice(0, index).trim().toLowerCase();
    const value = part.slice(index + 1).trim().toLowerCase();
    if (key === "days" && Number.isFinite(Number(value))) out.days = clampDays(value);
    if (key === "list" && ["source", "model", "project"].includes(value)) out.topList = value;
    if (key === "sort" && ["tokens", "cost", "active", "sessions"].includes(value)) out.topSort = value;
    if (key === "view" && ["overview", "activity"].includes(value)) out.largeView = value;
    if (key === "theme" && ["auto", "light", "dark"].includes(value)) out.theme = value;
    if (key === "accent" && ["blue", "graphite", "mint", "coral"].includes(value)) out.accent = value;
    if (key === "privacy" && ["on", "off", "true", "false"].includes(value)) out.privacyMode = value === "on" || value === "true";
    if (key === "budget" && Number.isFinite(Number(value)) && Number(value) >= 0) out.monthlyBudget = normalizeBudget(value);
  }
  return out;
}

function applyWidgetParameter(configValue, raw) {
  return normalizeConfig({ ...configValue, ...parseWidgetParameter(raw) });
}

function widgetParameterValue() {
  try {
    return String(args?.widgetParameter || args?.queryParameters?.preset || "").trim();
  } catch {
    return "";
  }
}

async function fetchUsage(widgetConfig) {
  const apiUrl = normalizeApiUrl(widgetConfig.apiUrl);
  const days = clampDays(widgetConfig.days || CONFIG.days);
  const req = new Request(`${apiUrl}/api/usage?days=${days}`);
  req.timeoutInterval = 15;
  req.headers = { Authorization: `Bearer ${widgetConfig.apiKey}` };
  const body = await req.loadString();
  const status = req.response ? req.response.statusCode : 200;
  if (status === 401) throw new Error(t("invalidKey"));
  if (status < 200 || status >= 300) throw new Error(`HTTP ${status}`);
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(t("fetchFailed"));
  }
}

async function fetchJson(url, headers = {}) {
  const body = await fetchText(url, headers);
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(t("fetchFailed"));
  }
}

async function fetchText(url, headers = {}) {
  const req = new Request(url);
  req.timeoutInterval = 20;
  req.headers = headers;
  const body = await req.loadString();
  const status = req.response ? req.response.statusCode : 200;
  if (status < 200 || status >= 300) throw new Error(`HTTP ${status}`);
  return body;
}

async function fetchLatestRelease() {
  return fetchJson(CONFIG.releaseApiUrl, {
    Accept: "application/vnd.github+json",
    "User-Agent": "vibe-usage-scriptable-widget",
  });
}

function releaseAssetUrl(release) {
  const assets = Array.isArray(release?.assets) ? release.assets : [];
  const asset = assets.find(item => item?.name === CONFIG.releaseAssetName);
  return asset?.browser_download_url || null;
}

function latestReleaseVersion(release) {
  return normalizeVersion(release?.tag_name || release?.tagName || release?.name || "");
}

function normalizeVersion(value) {
  return String(value || "").trim().replace(/^v/i, "").split(/[+-]/)[0];
}

function compareVersions(a, b) {
  const left = normalizeVersion(a).split(".").map(n => Number(n));
  const right = normalizeVersion(b).split(".").map(n => Number(n));
  const length = Math.max(left.length, right.length, 3);
  for (let i = 0; i < length; i++) {
    const av = Number.isFinite(left[i]) ? left[i] : 0;
    const bv = Number.isFinite(right[i]) ? right[i] : 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

function isVersionNewer(version, current = CONFIG.version) {
  return compareVersions(version, current) > 0;
}

function shouldCheckUpdate(lastUpdateCheckAt, now = Date.now()) {
  const last = Number(lastUpdateCheckAt) || 0;
  return now - last >= CONFIG.updateCheckHours * 3600 * 1000;
}

function validateScriptUpdate(source) {
  return typeof source === "string"
    && source.length > 20000
    && source.includes("Vibe Usage iPhone widget for Scriptable")
    && source.includes('keychainKey: "vibeusage.widget.config"')
    && source.includes(`releaseAssetName: "${CONFIG.releaseAssetName}"`)
    && source.includes("await main();");
}

function currentScriptFile() {
  const filename = `${Script.name()}.js`;
  const managers = [];
  try {
    managers.push(FileManager.iCloud());
  } catch {}
  try {
    managers.push(FileManager.local());
  } catch {}

  for (const fm of managers) {
    const path = fm.joinPath(fm.documentsDirectory(), filename);
    if (fm.fileExists(path)) return { fm, path };
  }

  return null;
}

function backupPathFor(path) {
  const stamp = updateTimestamp();
  return path.replace(/\.js$/i, `.backup-v${CONFIG.version}-${stamp}.js`);
}

function updateTimestamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}`;
}

async function installScriptUpdate(downloadUrl) {
  const source = await fetchText(downloadUrl, {
    "User-Agent": "vibe-usage-scriptable-widget",
  });
  if (!validateScriptUpdate(source)) throw new Error(t("updateValidationFailed"));

  const current = currentScriptFile();
  if (!current) throw new Error(t("scriptFileNotFound"));

  const { fm, path } = current;
  try {
    if (fm.isFileDownloaded && !fm.isFileDownloaded(path)) await fm.downloadFileFromiCloud(path);
  } catch {}

  const existing = fm.readString(path);
  const backup = backupPathFor(path);
  fm.writeString(backup, existing);
  fm.writeString(path, source);
  pruneScriptBackups(fm, path, 3);
  return backup.split(/[\\/]/).pop();
}

function listScriptBackups() {
  const current = currentScriptFile();
  if (!current) return [];
  const { fm, path } = current;
  if (!fm.listContents) return [];
  const dir = path.replace(/[\\/][^\\/]+$/, "");
  const prefix = `${Script.name()}.backup-v`;
  try {
    return fm.listContents(dir)
      .filter(name => name.startsWith(prefix) && name.endsWith(".js"))
      .sort()
      .reverse()
      .map(name => ({ fm, dir, name, path: fm.joinPath(dir, name) }));
  } catch {
    return [];
  }
}

function pruneScriptBackups(fm, scriptPath, keep) {
  if (!fm.listContents) return;
  const dir = scriptPath.replace(/[\\/][^\\/]+$/, "");
  const prefix = `${Script.name()}.backup-v`;
  try {
    const backups = fm.listContents(dir)
      .filter(name => name.startsWith(prefix) && name.endsWith(".js"))
      .sort()
      .reverse();
    backups.slice(Math.max(0, keep)).forEach(name => {
      try {
        fm.remove(fm.joinPath(dir, name));
      } catch {}
    });
  } catch {}
}

async function restoreScriptBackup(backup) {
  const current = currentScriptFile();
  if (!current) throw new Error(t("scriptFileNotFound"));
  const { fm, path } = current;
  try {
    if (fm.isFileDownloaded && !fm.isFileDownloaded(backup.path)) await fm.downloadFileFromiCloud(backup.path);
  } catch {}
  const existing = fm.readString(path);
  const backupCurrent = backupPathFor(path);
  fm.writeString(backupCurrent, existing);
  fm.writeString(path, fm.readString(backup.path));
  pruneScriptBackups(fm, path, 3);
  return backup.name;
}

async function checkForScriptUpdate(configValue, options = {}) {
  const manual = Boolean(options.manual);
  let cfg = applyRuntimeSettings(configValue);

  try {
    const release = await fetchLatestRelease();
    const version = latestReleaseVersion(release);
    cfg = applyRuntimeSettings({ ...cfg, lastUpdateCheckAt: Date.now() });
    saveConfig(cfg);

    if (!version || !isVersionNewer(version)) {
      if (manual) await presentUpdateAlert(t("upToDateTitle"), t("upToDateMessage", { version: CONFIG.version }));
      return cfg;
    }

    const downloadUrl = releaseAssetUrl(release);
    if (!downloadUrl) throw new Error(t("updateAssetMissing"));

    if (manual) {
      const shouldInstall = await confirmUpdate(version);
      if (!shouldInstall) return cfg;
    }

    const backup = await installScriptUpdate(downloadUrl);
    if (manual) await presentUpdateAlert(t("updateInstalledTitle"), t("updateInstalledMessage", { version, backup }));
    return cfg;
  } catch (err) {
    cfg = applyRuntimeSettings({ ...cfg, lastUpdateCheckAt: Date.now() });
    saveConfig(cfg);
    if (manual) {
      await presentUpdateAlert(t("updateFailedTitle"), t("updateFailedMessage", { message: err.message || t("fetchFailed") }));
    }
    return cfg;
  }
}

async function maybeAutoUpdate(configValue) {
  const cfg = applyRuntimeSettings(configValue);
  if (cfg.updateMode !== "auto") return cfg;
  if (!shouldCheckUpdate(cfg.lastUpdateCheckAt)) return cfg;
  return checkForScriptUpdate(cfg, { manual: false });
}

async function confirmUpdate(version) {
  const a = new Alert();
  a.title = t("updateAvailableTitle");
  a.message = t("updateAvailableMessage", { version, current: CONFIG.version });
  a.addAction(t("installUpdate"));
  a.addCancelAction(t("later"));
  const choice = await a.presentAlert();
  return choice === 0;
}

async function presentUpdateAlert(title, message) {
  const a = new Alert();
  a.title = title;
  a.message = message;
  a.addAction(t("ok"));
  await a.presentAlert();
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
    byProject: new Map(),
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
  for (const session of visibleSessions) {
    const project = String(session?.project || "").trim();
    if (project) {
      addTo(totals.byProject, project, {
        activeSeconds: sessionActiveSecondsInWindow(session, days),
        sessions: 1,
      });
    }
  }

  const activity = activityPulse(visibleSessions, Math.min(7, clampDays(days)));
  totals.activityDays = activity.days;
  totals.streak = activity.streak;
  totals.lastActivityAt = activity.lastActivityAt;

  totals.totalTokens = totals.input + totals.output + totals.reasoning + totals.cached;
  totals.topSources = topEntries(totals.bySource, "tokens", 4);
  totals.topSourcesByCost = topEntries(totals.bySource, "cost", 4);
  totals.topModels = topEntries(totals.byModel, "tokens", 4);
  totals.topModelsByCost = topEntries(totals.byModel, "cost", 4);
  totals.topProjects = topEntries(totals.byProject, "activeSeconds", 4);
  totals.topProjectsBySessions = topEntries(totals.byProject, "sessions", 4);
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

function sessionActiveSecondsInWindow(session, days, now = Date.now()) {
  const start = now - clampDays(days) * 86400 * 1000;
  const first = parseTimeMs(session?.firstMessageAt);
  const last = parseTimeMs(session?.lastMessageAt);
  const active = Math.max(0, number(session?.activeSeconds));
  if (first == null || last == null) return Math.min(active, clampDays(days) * 86400);
  const overlap = Math.max(0, Math.min(now, Math.max(first, last)) - Math.max(start, Math.min(first, last))) / 1000;
  return Math.min(active, Math.round(overlap));
}

function activityPulse(sessions, dayCount = 7, now = Date.now()) {
  const count = Math.max(1, Math.min(7, Math.round(number(dayCount)) || 7));
  const today = startOfLocalDay(new Date(now));
  const days = [];
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    days.push({ date: date.toISOString(), activeSeconds: 0, sessions: 0 });
  }

  let lastActivityAt = 0;
  for (const session of sessions || []) {
    const first = parseTimeMs(session?.firstMessageAt);
    const last = parseTimeMs(session?.lastMessageAt);
    const activityAt = last ?? first;
    if (activityAt == null) continue;
    lastActivityAt = Math.max(lastActivityAt, activityAt);

    const sessionStart = Math.min(first ?? activityAt, last ?? activityAt);
    const sessionEnd = Math.max(first ?? activityAt, last ?? activityAt);
    const active = Math.max(0, number(session?.activeSeconds));
    const span = Math.max(1, sessionEnd - sessionStart);

    for (const day of days) {
      const dayStart = startOfLocalDay(new Date(day.date)).getTime();
      const dayEndDate = new Date(dayStart);
      dayEndDate.setDate(dayEndDate.getDate() + 1);
      const dayEnd = dayEndDate.getTime();
      const overlap = Math.max(0, Math.min(sessionEnd, dayEnd) - Math.max(sessionStart, dayStart));
      if (overlap > 0 || (sessionStart === sessionEnd && sessionStart >= dayStart && sessionStart < dayEnd)) {
        day.activeSeconds += sessionStart === sessionEnd ? active : active * overlap / span;
      }
      if (activityAt >= dayStart && activityAt < dayEnd) day.sessions += 1;
    }
  }

  days.forEach(day => {
    day.activeSeconds = Math.round(day.activeSeconds);
  });
  let cursor = days.length - 1;
  if (cursor >= 0 && days[cursor].sessions === 0 && days[cursor].activeSeconds === 0) cursor -= 1;
  let streak = 0;
  while (cursor >= 0 && (days[cursor].sessions > 0 || days[cursor].activeSeconds > 0)) {
    streak += 1;
    cursor -= 1;
  }
  return { days, streak, lastActivityAt: lastActivityAt || null };
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
  const cur = map.get(key) || {};
  for (const name of Object.keys(delta || {})) cur[name] = number(cur[name]) + number(delta[name]);
  map.set(key, cur);
}

function topEntries(map, sortBy, limit) {
  return [...map.entries()].sort((a, b) => b[1][sortBy] - a[1][sortBy]).slice(0, limit);
}

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function projectName(value) {
  const text = String(value || "").trim().replace(/[\\/]+$/, "");
  return text ? text.split(/[\\/]/).pop() : "";
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

function formatPercent(value) {
  const n = Math.max(0, Math.min(100, number(value)));
  if (n >= 10) return `${Math.round(n)}%`;
  if (n > 0) return `${trim1(n)}%`;
  return "0%";
}

function formatSharePercent(value) {
  const n = Math.max(0, Math.min(100, number(value)));
  if (n >= 99 && n < 100) return `${trim1(Math.floor(n * 10) / 10)}%`;
  return formatPercent(n);
}

function percentOf(value, total) {
  const base = number(total);
  if (base <= 0) return 0;
  return number(value) / base * 100;
}

function formatTokenRate(tokens, seconds) {
  const hours = number(seconds) / 3600;
  if (hours <= 0) return "-/hr";
  return `${formatTokens(number(tokens) / hours)}/hr`;
}

function usageStatusKey(summary) {
  const total = number(summary?.totalTokens);
  if (percentOf(summary?.reasoning, total) >= 20) return "deepThink";
  if (percentOf(summary?.cached, total) >= 60) return "cacheHeavy";
  if (percentOf(summary?.output, total) >= 25) return "highOutput";
  return "balanced";
}

function budgetForecast(summary, days, monthlyBudget) {
  const budget = normalizeBudget(monthlyBudget);
  const dailyCost = number(summary?.cost) / Math.max(1, clampDays(days));
  const forecastCost = dailyCost * 30;
  return { budget, dailyCost, forecastCost, ratio: budget > 0 ? forecastCost / budget : 0 };
}

function formatBudgetPercent(ratio) {
  return `${Math.round(Math.max(0, number(ratio)) * 100)}%`;
}

function privateValue(value, privacyMode) {
  return privacyMode ? "••••" : value;
}

function insightSummary(summary, days, options = {}) {
  const cacheShare = formatPercent(percentOf(summary.cached, summary.totalTokens));
  const status = t(usageStatusKey(summary));
  if (options.privacyMode) {
    const sessions = Math.max(0, Math.round(number(summary.sessions)));
    return `${status} · ${t("cache")} ${cacheShare} · ${sessions} ${t(sessions === 1 ? "session" : "sessions")}`;
  }
  const forecast = budgetForecast(summary, days, options.monthlyBudget);
  if (forecast.budget > 0) return `${status} · ${t("forecast30Days")} ${formatCostShort(forecast.forecastCost)}`;
  return `${status} · ${t("cache")} ${cacheShare} · ${formatCostShort(forecast.dailyCost)}/d · ${formatTokenRate(summary.totalTokens, summary.activeSeconds)}`;
}

function topListSummary(summary, entries, metrics, options = {}) {
  const selected = normalizeLargeSummary(metrics, DEFAULT_SETTINGS.largeSummary);
  if (selected.length === 0) return "";

  const sessionCount = Math.max(0, Math.round(number(summary.sessions)));
  const sessionLabel = sessionCount === 1 ? t("session") : t("sessions");
  const avg = options.privacyMode ? "••••" : sessionCount > 0 ? formatTokens(number(summary.totalTokens) / sessionCount) : "-";
  const projectMeasure = options.sort === "sessions" ? "sessions" : "activeSeconds";
  const topValue = options.kind === "project"
    ? number(entries?.[0]?.[1]?.[projectMeasure])
    : number(entries?.[0]?.[1]?.tokens);
  const totalValue = options.kind === "project"
    ? number(options.sort === "sessions" ? summary.sessions : summary.activeSeconds)
    : number(summary.totalTokens);
  const topShare = formatSharePercent(percentOf(topValue, totalValue));
  const items = {
    sessions: `${sessionCount} ${sessionLabel}`,
    avgTokensPerSession: `${t("avgPerSessionShort")} ${avg}`,
    topShare: `${t("topShare")} ${topShare}`,
  };
  return selected.map(metric => items[metric]).filter(Boolean).join(" · ");
}

function noUsageTitle(days) {
  return clampDays(days) <= 1 ? t("noUsageToday") : t("noUsageWindow");
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

function formatDurationMetric(seconds) {
  const s = Math.max(0, Math.round(seconds));
  if (s < 3600) return formatDuration(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h < 10) return formatDuration(s);
  if (h < 100) return m > 0 ? `${trim1(h + m / 60)}h` : `${h}h`;
  if (h < 240) return `${h}h`;
  const days = Math.floor(h / 24);
  const hours = h % 24;
  const dayHour = `${days}d ${hours}h`;
  if (dayHour.length <= 7) return dayHour;
  return `${trim1(s / 86400)}d`;
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

function relativeAgeShort(ts, now = Date.now()) {
  if (!ts) return "-";
  const time = Number(new Date(ts));
  if (!Number.isFinite(time)) return "-";
  const seconds = Math.max(0, Math.round((now - time) / 1000));
  if (seconds < 60) return t("now");
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
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
  const preset = ACTIVE_WIDGET_PARAMETER ? `&preset=${encodeURIComponent(ACTIVE_WIDGET_PARAMETER)}` : "";
  try {
    if (typeof URLScheme !== "undefined" && URLScheme.forRunningScript) {
      const base = URLScheme.forRunningScript();
      return base + (base.includes("?") ? "&" : "?") + `refresh=1${preset}`;
    }
  } catch {}
  return `scriptable:///run?scriptName=${encodeURIComponent(Script.name())}&refresh=1${preset}`;
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
  if (visible.length === 0) {
    drawRoundedTrack(ctx, 0, 0, width, height);
    return ctx.getImage();
  }

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

  ctx.setFont(Font.semiboldSystemFont(7.5));
  ctx.setTextColor(COLORS.drawFaint);

  const total = parts.reduce((sum, p) => sum + Math.max(0, number(p.value)), 0);
  const labels = parts.filter(p => p.label && p.value > 0).slice(0, 4);
  const labelTexts = labels.map(part => `${part.label} ${formatPercent(percentOf(part.value, total))}`);
  const dotGap = 8;
  const itemGap = 6;
  const textWidths = fitLegendTextWidths(labelTexts, width, dotGap, itemGap);
  let labelX = 0;
  labels.forEach((part, index) => {
    const dot = new Path();
    dot.addRoundedRect(new Rect(labelX, 2.5, 5, 5), 2.5, 2.5);
    ctx.addPath(dot);
    ctx.setFillColor(part.color);
    ctx.fillPath();

    ctx.setTextColor(COLORS.drawFaint);
    ctx.drawTextInRect(labelTexts[index], new Rect(labelX + dotGap, 0, textWidths[index], 11));
    labelX += dotGap + textWidths[index] + itemGap;
  });

  const railY = Math.max(15, height - 13);
  const railH = Math.min(13, height - railY);
  return overlayRailImage(ctx, parts, width, railY, railH, 4);
}

function fitLegendTextWidths(texts, width, dotGap, itemGap) {
  if (texts.length === 0) return [];
  const minWidth = 24;
  const available = Math.max(
    minWidth * texts.length,
    width - dotGap * texts.length - itemGap * Math.max(0, texts.length - 1),
  );
  const estimates = texts.map(text => Math.max(minWidth, text.length * 5.8));
  const total = estimates.reduce((sum, value) => sum + value, 0);
  if (total <= available) return estimates;

  const flexibleTotal = estimates.reduce((sum, value) => sum + Math.max(0, value - minWidth), 0);
  if (flexibleTotal <= 0) return texts.map(() => available / texts.length);

  const overflow = total - available;
  return estimates.map(value => {
    const flexible = Math.max(0, value - minWidth);
    return Math.max(minWidth, value - overflow * flexible / flexibleTotal);
  });
}

function overlayRailImage(ctx, parts, width, y, height, gap) {
  const visible = parts.filter(p => p.value > 0);
  drawRoundedTrack(ctx, 0, y, width, height);
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
    seg.addRoundedRect(new Rect(x, y, widths[index], height), height / 2.8, height / 2.8);
    ctx.addPath(seg);
    ctx.setFillColor(part.color);
    ctx.fillPath();
    x += widths[index] + gap;
  });

  return ctx.getImage();
}

function drawRoundedTrack(ctx, x, y, width, height) {
  const track = new Path();
  track.addRoundedRect(new Rect(x, y, width, height), height / 2.8, height / 2.8);
  ctx.addPath(track);
  ctx.setFillColor(COLORS.track);
  ctx.fillPath();
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

  const progress = Math.max(0, Math.min(1, ratio));
  if (progress > 0) {
    const fillWidth = Math.max(height, width * progress);
    const fill = new Path();
    fill.addRoundedRect(new Rect(0, 0, fillWidth, height), height / 2, height / 2);
    ctx.addPath(fill);
    ctx.setFillColor(color);
    ctx.fillPath();
  }

  return ctx.getImage();
}

function weekdayShort(value) {
  const date = new Date(value);
  const en = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const zh = ["日", "一", "二", "三", "四", "五", "六"];
  return (ACTIVE_LANGUAGE === "zh" ? zh : en)[date.getDay()] || "";
}

function activityPulseImage(days, width, height, color) {
  const ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  const values = Array.isArray(days) && days.length > 0 ? days : [{ date: new Date().toISOString(), activeSeconds: 0, sessions: 0 }];
  const gap = 7;
  const columnWidth = (width - gap * (values.length - 1)) / values.length;
  const barWidth = Math.max(8, Math.min(22, columnWidth - 8));
  const chartY = 3;
  const chartHeight = Math.max(12, height - 19);
  const maxValue = Math.max(1, ...values.map(item => number(item.activeSeconds) || (number(item.sessions) > 0 ? 1 : 0)));

  ctx.setFont(Font.semiboldSystemFont(8));
  ctx.setTextColor(COLORS.drawFaint);
  values.forEach((item, index) => {
    const x = index * (columnWidth + gap);
    const barX = x + (columnWidth - barWidth) / 2;
    const track = new Path();
    track.addRoundedRect(new Rect(barX, chartY, barWidth, chartHeight), barWidth / 2.8, barWidth / 2.8);
    ctx.addPath(track);
    ctx.setFillColor(COLORS.track);
    ctx.fillPath();

    const value = number(item.activeSeconds) || (number(item.sessions) > 0 ? 1 : 0);
    if (value > 0) {
      const fillHeight = Math.max(5, chartHeight * value / maxValue);
      const fill = new Path();
      fill.addRoundedRect(new Rect(barX, chartY + chartHeight - fillHeight, barWidth, fillHeight), barWidth / 2.8, barWidth / 2.8);
      ctx.addPath(fill);
      ctx.setFillColor(color || COLORS.accent);
      ctx.fillPath();
    }
    ctx.setTextColor(COLORS.drawFaint);
    ctx.drawTextInRect(weekdayShort(item.date), new Rect(x, height - 12, columnWidth, 11));
  });
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
    refresh.tintColor = COLORS.accent;
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

function buildWidget(payload, familyOverride) {
  const widget = new ListWidget();
  if (ACTIVE_THEME === "auto") {
    widget.backgroundColor = COLORS.bgTop;
  } else {
    const gradient = new LinearGradient();
    gradient.locations = [0, 1];
    gradient.colors = [COLORS.bgTop, COLORS.bgBottom];
    widget.backgroundGradient = gradient;
  }
  widget.url = settingsUrl();

  const family = familyOverride || config.widgetFamily || "medium";
  if (family === "small") return buildSmallWidget(widget, payload);
  if (family === "large") return buildLargeWidget(widget, payload);
  return buildMediumWidget(widget, payload);
}

function scheduleRefresh(widget) {
  widget.refreshAfterDate = new Date(Date.now() + CONFIG.refreshMinutes * 60 * 1000);
  return widget;
}

async function presentPreviewWidget(payload, family) {
  const widget = scheduleRefresh(buildWidget(payload, family));
  if (family === "small") return widget.presentSmall();
  if (family === "large") return widget.presentLarge();
  return widget.presentMedium();
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
  if (payload.largeView === "activity") return buildLargeActivity(widget, payload, s);
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
  addMetric(metrics, t("token"), privateValue(formatTokens(s.totalTokens), payload.privacyMode), COLORS.text, {
    compact: true,
    width: metricWidth,
    height: metricHeight,
  });
  addMetric(metrics, t("cost"), privateValue(formatCostShort(s.cost), payload.privacyMode), COLORS.green, {
    compact: true,
    width: metricWidth,
    height: metricHeight,
  });
  addMetric(metrics, t("active"), formatDurationMetric(s.activeSeconds), COLORS.accent, {
    compact: true,
    width: metricWidth,
    height: metricHeight,
  });
  addMetric(metrics, t("cache"), privateValue(formatTokens(s.cached), payload.privacyMode), COLORS.cache, {
    compact: true,
    width: metricWidth,
    height: metricHeight,
  });
  metricRow.addSpacer();

  widget.addSpacer(7);

  if (s.totalTokens <= 0) {
    addNoUsageState(widget, payload.days, true, LAYOUT.mediumContentWidth);
    widget.addSpacer();
    return widget;
  }

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
    icon.tintColor = COLORS.accent;
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
  if (s.totalTokens <= 0) {
    addNoUsageState(widget, payload.days, true, 124);
    widget.addSpacer();
    const updated = widget.addText(t("updated", { time: agoText(payload.updatedAt) }));
    updated.font = Font.systemFont(9);
    updated.textColor = COLORS.faint;
    return widget;
  }

  const total = fitText(widget.addText(privateValue(formatTokens(s.totalTokens), payload.privacyMode)), 30, 16);
  total.textColor = COLORS.text;
  widget.addSpacer(4);

  const cost = widget.addText(privateValue(formatCostShort(s.cost), payload.privacyMode));
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
  addMetric(metrics, t("token"), privateValue(formatTokens(s.totalTokens), payload.privacyMode), COLORS.text, { width: metricWidth, height: 62 });
  addMetric(metrics, t("cost"), privateValue(formatCostShort(s.cost), payload.privacyMode), COLORS.green, { width: metricWidth, height: 62 });
  addMetric(metrics, t("active"), formatDurationMetric(s.activeSeconds), COLORS.accent, { width: metricWidth, height: 62 });
  addMetric(metrics, t("cache"), privateValue(formatTokens(s.cached), payload.privacyMode), COLORS.cache, { width: metricWidth, height: 62 });
  metricRow.addSpacer();

  if (s.totalTokens <= 0) {
    widget.addSpacer(12);
    addNoUsageState(widget, payload.days, false, LAYOUT.largeContentWidth);
    widget.addSpacer(8);
    const updated = widget.addText(t("updated", { time: agoText(payload.updatedAt) }));
    updated.font = Font.systemFont(10);
    updated.textColor = COLORS.faint;
    widget.addSpacer();
    return widget;
  }

  widget.addSpacer(10);
  addInsightStrip(widget, s, payload);
  widget.addSpacer(10);
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
  caption.spacing = 8;
  addRailCaption(caption, t("in"), COLORS.blue, s.input, s.totalTokens);
  addRailCaption(caption, t("out"), COLORS.green, s.output, s.totalTokens);
  addRailCaption(caption, t("think"), COLORS.purple, s.reasoning, s.totalTokens);
  addRailCaption(caption, t("cache"), COLORS.cache, s.cached, s.totalTokens);

  widget.addSpacer(14);
  const topList = ["source", "model", "project"].includes(payload.topList) ? payload.topList : "source";
  const topEntries = topEntriesFor(s, topList, payload.topSort);
  const sourcesTitle = widget.addText(topListTitle(topList));
  sourcesTitle.font = Font.semiboldSystemFont(11);
  sourcesTitle.textColor = COLORS.muted;
  const summaryText = topListSummary(s, topEntries, payload.largeSummary, {
    kind: topList,
    sort: payload.topSort,
    privacyMode: payload.privacyMode,
  });
  if (summaryText) {
    widget.addSpacer(2);
    const topMeta = widget.addText(summaryText);
    topMeta.font = Font.semiboldSystemFont(8.5);
    topMeta.textColor = COLORS.faint;
    topMeta.lineLimit = 1;
    topMeta.minimumScaleFactor = 0.75;
    widget.addSpacer(6);
  } else {
    widget.addSpacer(7);
  }
  addTopList(widget, topEntries, 4, topList, {
    sort: payload.topSort,
    privacyMode: payload.privacyMode,
  });
  return widget;
}

function buildLargeActivity(widget, payload, summary) {
  const metricRow = widget.addStack();
  metricRow.layoutHorizontally();
  metricRow.addSpacer();
  const metrics = metricRow.addStack();
  metrics.layoutHorizontally();
  metrics.spacing = 7;
  const metricWidth = (LAYOUT.largeContentWidth - 21) / 4;
  metrics.size = new Size(LAYOUT.largeContentWidth, 62);
  addMetric(metrics, t("active"), formatDurationMetric(summary.activeSeconds), COLORS.accent, { width: metricWidth, height: 62 });
  addMetric(metrics, t("sessions"), String(Math.max(0, Math.round(number(summary.sessions)))), COLORS.text, { width: metricWidth, height: 62 });
  addMetric(metrics, t("streak"), `${Math.max(0, Math.round(number(summary.streak)))}d`, COLORS.green, { width: metricWidth, height: 62 });
  addMetric(metrics, t("lastActive"), relativeAgeShort(summary.lastActivityAt), COLORS.cache, { width: metricWidth, height: 62 });
  metricRow.addSpacer();

  widget.addSpacer(10);
  addInsightStrip(widget, summary, payload);
  widget.addSpacer(9);

  const section = widget.addStack();
  section.layoutHorizontally();
  const title = section.addText(t("activityPulse"));
  title.font = Font.semiboldSystemFont(11);
  title.textColor = COLORS.muted;
  section.addSpacer();
  const updated = section.addText(t("updated", { time: agoText(payload.updatedAt) }));
  updated.font = Font.systemFont(10);
  updated.textColor = COLORS.faint;
  widget.addSpacer(7);

  const pulseDays = Array.isArray(summary.activityDays) ? summary.activityDays : [];
  if (pulseDays.some(day => number(day.activeSeconds) > 0 || number(day.sessions) > 0)) {
    const pulse = widget.addImage(activityPulseImage(pulseDays, LAYOUT.largeContentWidth, 50, COLORS.accent));
    pulse.imageSize = new Size(LAYOUT.largeContentWidth, 50);
  } else {
    const empty = widget.addText(t("noActivityData"));
    empty.font = Font.systemFont(10);
    empty.textColor = COLORS.faint;
  }

  widget.addSpacer(8);
  const projects = topEntriesFor(summary, "project", "active");
  const kind = projects.length > 0 ? "project" : "source";
  const entries = projects.length > 0 ? projects : topEntriesFor(summary, "source", "tokens");
  const listTitle = widget.addText(topListTitle(kind));
  listTitle.font = Font.semiboldSystemFont(11);
  listTitle.textColor = COLORS.muted;
  widget.addSpacer(6);
  addTopList(widget, entries, 4, kind, {
    sort: kind === "project" ? "active" : "tokens",
    privacyMode: payload.privacyMode,
  });
  return widget;
}

function addTopList(parent, entries, limit, kind, options = {}) {
  const visible = entries.slice(0, limit);
  if (visible.length === 0) {
    const empty = parent.addText(t("noData"));
    empty.font = Font.systemFont(11);
    empty.textColor = COLORS.muted;
    empty.lineLimit = 2;
    return;
  }
  const measure = kind === "project"
    ? (options.sort === "sessions" ? "sessions" : "activeSeconds")
    : (options.sort === "cost" ? "cost" : "tokens");
  const max = Math.max(1, ...visible.map(([, item]) => number(item?.[measure])));
  const rows = parent.addStack();
  rows.layoutVertically();
  rows.spacing = limit > 3 ? 5 : 6;
  const palette = [COLORS.accent, COLORS.green, COLORS.purple, COLORS.cache];
  visible.forEach(([name, item], idx) => {
    const rowHeight = limit > 3 ? 16 : 18;
    const label = topItemLabel(name, kind, idx, options.privacyMode);
    const image = kind === "project"
      ? projectListRowImage(label, item, max, palette[idx % palette.length], LAYOUT.largeContentWidth, rowHeight, options.sort)
      : topListRowImage(label, item, max, palette[idx % palette.length], LAYOUT.largeContentWidth, rowHeight, options.sort, options.privacyMode);
    const row = rows.addImage(image);
    row.imageSize = new Size(LAYOUT.largeContentWidth, rowHeight);
  });
}

function topEntriesFor(summary, kind, sort) {
  if (kind === "project") return sort === "sessions" ? summary.topProjectsBySessions || summary.topProjects || [] : summary.topProjects || [];
  if (kind === "model") return (sort === "cost" ? summary.topModelsByCost || summary.topModels : summary.topModels) || [];
  return (sort === "cost" ? summary.topSourcesByCost || summary.topSources : summary.topSources) || [];
}

function topListRowImage(label, item, maxValue, color, width, height, sort = "tokens", privacyMode = false) {
  const ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  const labelX = 0;
  const labelW = 100;
  const barX = 112;
  const barW = 74;
  const tokenX = 198;
  const tokenW = 50;
  const costX = 254;
  const costW = width - costX;
  const barH = 6;
  const barY = Math.round((height - barH) / 2);
  const value = sort === "cost" ? number(item.cost) : number(item.tokens);
  const pct = maxValue > 0 ? value / maxValue : 0;

  ctx.setFont(Font.semiboldSystemFont(10));
  ctx.setTextColor(COLORS.muted);
  ctx.drawTextInRect(middleEllipsize(label, 14), new Rect(labelX, 1, labelW, height - 1));

  const track = new Path();
  track.addRoundedRect(new Rect(barX, barY, barW, barH), barH / 2, barH / 2);
  ctx.addPath(track);
  ctx.setFillColor(COLORS.track);
  ctx.fillPath();

  const fill = new Path();
  fill.addRoundedRect(new Rect(barX, barY, Math.max(barH, barW * Math.max(0, Math.min(1, pct))), barH), barH / 2, barH / 2);
  ctx.addPath(fill);
  ctx.setFillColor(color);
  ctx.fillPath();

  ctx.setFont(Font.semiboldMonospacedSystemFont(10));
  ctx.setTextColor(COLORS.text);
  ctx.drawTextInRect(privateValue(formatTokens(number(item.tokens)), privacyMode), new Rect(tokenX, 1, tokenW, height - 1));
  ctx.setTextColor(COLORS.green);
  ctx.drawTextInRect(privateValue(formatCostShort(number(item.cost)), privacyMode), new Rect(costX, 1, costW, height - 1));

  return ctx.getImage();
}

function projectListRowImage(label, item, maxValue, color, width, height, sort = "active") {
  const ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  const labelW = 100;
  const barX = 112;
  const barW = 74;
  const activeX = 198;
  const sessionsX = 254;
  const barH = 6;
  const barY = Math.round((height - barH) / 2);
  const value = sort === "sessions" ? number(item.sessions) : number(item.activeSeconds);
  const pct = maxValue > 0 ? value / maxValue : 0;

  ctx.setFont(Font.semiboldSystemFont(10));
  ctx.setTextColor(COLORS.muted);
  ctx.drawTextInRect(middleEllipsize(label, 14), new Rect(0, 1, labelW, height - 1));
  const track = new Path();
  track.addRoundedRect(new Rect(barX, barY, barW, barH), barH / 2, barH / 2);
  ctx.addPath(track);
  ctx.setFillColor(COLORS.track);
  ctx.fillPath();
  const fill = new Path();
  fill.addRoundedRect(new Rect(barX, barY, Math.max(barH, barW * Math.max(0, Math.min(1, pct))), barH), barH / 2, barH / 2);
  ctx.addPath(fill);
  ctx.setFillColor(color);
  ctx.fillPath();
  ctx.setFont(Font.semiboldMonospacedSystemFont(10));
  ctx.setTextColor(COLORS.text);
  ctx.drawTextInRect(formatDurationMetric(number(item.activeSeconds)), new Rect(activeX, 1, 52, height - 1));
  ctx.setTextColor(COLORS.accent);
  ctx.drawTextInRect(`${Math.round(number(item.sessions))}${t("sessionShort")}`, new Rect(sessionsX, 1, width - sessionsX, height - 1));
  return ctx.getImage();
}

function middleEllipsize(value, maxChars) {
  const text = String(value || "Unknown");
  const limit = Math.max(1, Math.floor(number(maxChars)));
  if (text.length <= limit) return text;
  if (limit <= 2) return text.slice(0, limit);
  const keep = limit - 1;
  const head = Math.ceil(keep * 0.58);
  const tail = keep - head;
  return `${text.slice(0, head)}…${text.slice(text.length - tail)}`;
}

function addInsightStrip(parent, summary, payload) {
  const outer = parent.addStack();
  outer.layoutHorizontally();
  outer.addSpacer();
  const pill = outer.addStack();
  pill.layoutHorizontally();
  pill.centerAlignContent();
  pill.backgroundColor = COLORS.card;
  pill.cornerRadius = 8;
  pill.setPadding(6, 10, 6, 10);
  pill.size = new Size(LAYOUT.largeContentWidth, 30);
  const text = pill.addText(insightSummary(summary, payload.days, payload));
  text.font = Font.semiboldMonospacedSystemFont(9);
  text.textColor = COLORS.muted;
  text.lineLimit = 1;
  text.minimumScaleFactor = 0.65;
  const forecast = budgetForecast(summary, payload.days, payload.monthlyBudget);
  if (forecast.budget > 0) {
    pill.addSpacer(7);
    const bar = pill.addImage(progressImage(forecast.ratio, 42, 5, forecast.ratio >= 1 ? COLORS.amber : COLORS.accent));
    bar.imageSize = new Size(42, 5);
    pill.addSpacer(4);
    const percent = pill.addText(formatBudgetPercent(forecast.ratio));
    percent.font = Font.semiboldMonospacedSystemFont(8);
    percent.textColor = forecast.ratio >= 1 ? COLORS.amber : COLORS.accent;
    percent.lineLimit = 1;
  }
  outer.addSpacer();
}

function topListTitle(kind) {
  if (kind === "model") return t("topModels");
  if (kind === "project") return t("topProjects");
  return t("topSources");
}

function topItemLabel(name, kind, index = 0, privacyMode = false) {
  if (kind === "source") return sourceLabel(name);
  if (kind === "project") return privacyMode ? `${t("project")} ${index + 1}` : projectName(name);
  return modelLabel(name);
}

function modelLabel(name) {
  const raw = String(name || "Unknown").trim() || "Unknown";
  const withoutProvider = raw.replace(/^anthropic[/:]/i, "");
  if (!/^claude[-_.]/i.test(withoutProvider)) return raw;

  const body = withoutProvider
    .replace(/^claude[-_.]/i, "")
    .replace(/[-_.]\d{8}$/i, "")
    .replace(/[-_.]latest$/i, "")
    .replace(/[_.]/g, "-")
    .toLowerCase();

  const legacy = body.match(/^(\d+)-(\d+)-(opus|sonnet|haiku)(?:-.+)?$/i);
  if (legacy) return `${legacy[3].toLowerCase()}-${legacy[1]}.${legacy[2]}`;

  const legacyMajor = body.match(/^(\d+)-(opus|sonnet|haiku)(?:-.+)?$/i);
  if (legacyMajor) return `${legacyMajor[2].toLowerCase()}-${legacyMajor[1]}`;

  const family = body.match(/^(opus|sonnet|haiku)-(\d+)(?:-(\d+))?(?:-.+)?$/i);
  if (family) {
    const version = family[3] ? `${family[2]}.${family[3]}` : family[2];
    return `${family[1].toLowerCase()}-${version}`;
  }

  return body || raw;
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

function addNoUsageState(parent, days, compact, width) {
  const outer = parent.addStack();
  outer.layoutHorizontally();
  outer.addSpacer();
  const box = outer.addStack();
  box.layoutVertically();
  box.spacing = compact ? 3 : 4;
  box.backgroundColor = COLORS.card;
  box.cornerRadius = compact ? 9 : 10;
  box.setPadding(compact ? 8 : 10, 10, compact ? 8 : 10, 10);
  if (width) box.size = new Size(width, compact ? 54 : 66);

  const title = box.addText(noUsageTitle(days));
  title.font = Font.semiboldSystemFont(compact ? 12 : 13);
  title.textColor = COLORS.text;
  title.lineLimit = 1;
  title.minimumScaleFactor = 0.75;

  const hint = box.addText(t("noUsageHint"));
  hint.font = Font.systemFont(compact ? 9 : 10);
  hint.textColor = COLORS.muted;
  hint.lineLimit = compact ? 2 : 2;
  hint.minimumScaleFactor = 0.72;
  outer.addSpacer();
}

function addRailCaption(parent, label, color, value, total) {
  if (value <= 0) return;
  const item = parent.addStack();
  item.layoutHorizontally();
  item.centerAlignContent();
  item.spacing = 4;
  const dot = item.addStack();
  dot.size = new Size(5, 5);
  dot.cornerRadius = 2.5;
  dot.backgroundColor = color;
  const text = item.addText(`${label} ${formatPercent(percentOf(value, total))}`);
  text.font = Font.systemFont(8);
  text.textColor = COLORS.faint;
  text.lineLimit = 1;
  text.minimumScaleFactor = 0.7;
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

async function chooseAccent(current) {
  const a = new Alert();
  a.title = t("accentColor");
  a.addAction(t("systemBlue"));
  a.addAction(t("graphite"));
  a.addAction(t("mint"));
  a.addAction(t("coral"));
  a.addCancelAction(t("cancel"));
  const choice = await a.presentSheet();
  return ["blue", "graphite", "mint", "coral"][choice] || current;
}

async function choosePrivacyMode(current) {
  const a = new Alert();
  a.title = t("privacyMode");
  a.addAction(t("enabled"));
  a.addAction(t("disabled"));
  a.addCancelAction(t("cancel"));
  const choice = await a.presentSheet();
  if (choice === 0) return true;
  if (choice === 1) return false;
  return current;
}

async function chooseLargeView(current) {
  const a = new Alert();
  a.title = t("largeView");
  a.addAction(t("overviewView"));
  a.addAction(t("activityView"));
  a.addCancelAction(t("cancel"));
  const choice = await a.presentSheet();
  if (choice === 0) return "overview";
  if (choice === 1) return "activity";
  return current;
}

async function chooseTopList(current) {
  const a = new Alert();
  a.title = t("topList");
  a.addAction(t("agentClients"));
  a.addAction(t("models"));
  a.addAction(t("projects"));
  a.addCancelAction(t("cancel"));
  const choice = await a.presentSheet();
  if (choice === 0) return "source";
  if (choice === 1) return "model";
  if (choice === 2) return "project";
  return current;
}

async function chooseTopSort(current, kind) {
  const a = new Alert();
  a.title = t("topSort");
  if (kind === "project") {
    a.addAction(t("sortByActive"));
    a.addAction(t("sortBySessions"));
  } else {
    a.addAction(t("sortByTokens"));
    a.addAction(t("sortByCost"));
  }
  a.addCancelAction(t("cancel"));
  const choice = await a.presentSheet();
  if (choice === 0) return kind === "project" ? "active" : "tokens";
  if (choice === 1) return kind === "project" ? "sessions" : "cost";
  return current;
}

async function chooseLargeSummary(current) {
  let selected = normalizeLargeSummary(current, []);
  while (true) {
    const a = new Alert();
    a.title = t("largeSummary");
    a.message = `${t("largeSummary")}: ${largeSummaryName(selected)}`;
    LARGE_SUMMARY_METRICS.forEach(metric => {
      const enabled = selected.includes(metric);
      a.addAction(`${enabled ? "✓" : "○"} ${largeSummaryMetricName(metric)}`);
    });
    a.addCancelAction(t("done"));
    const choice = await a.presentSheet();
    if (choice < 0) return selected;

    const metric = LARGE_SUMMARY_METRICS[choice];
    if (!metric) return selected;
    selected = selected.includes(metric)
      ? selected.filter(item => item !== metric)
      : [...selected, metric];
  }
}

async function choosePreviewFamily() {
  const a = new Alert();
  a.title = t("preview");
  a.addAction(t("small"));
  a.addAction(t("medium"));
  a.addAction(t("large"));
  a.addCancelAction(t("cancel"));
  const choice = await a.presentSheet();
  if (choice === 0) return "small";
  if (choice === 2) return "large";
  if (choice === 1) return "medium";
  return null;
}

async function chooseUpdateMode(current) {
  const a = new Alert();
  a.title = t("updateMode");
  a.message = t("welcomeMessage");
  a.addAction(t("autoUpdate"));
  a.addAction(t("manualUpdate"));
  a.addCancelAction(t("cancel"));
  const choice = await a.presentSheet();
  if (choice === 0) return "auto";
  if (choice === 1) return "manual";
  return isUpdateMode(current) ? current : "manual";
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

async function chooseMonthlyBudget(current) {
  const a = new Alert();
  a.title = t("monthlyBudget");
  a.message = t("budgetPromptMessage");
  a.addTextField("0", String(current || 0));
  a.addAction(t("save"));
  a.addCancelAction(t("cancel"));
  const choice = await a.presentAlert();
  if (choice < 0) return current;
  const value = Number(a.textFieldValue(0));
  if (!Number.isFinite(value) || value < 0) {
    await presentUpdateAlert(t("monthlyBudget"), t("invalidBudget"));
    return current;
  }
  return normalizeBudget(value);
}

async function changeApiKey(current) {
  const a = new Alert();
  a.title = t("keyPromptTitle");
  a.message = t("keyPromptMessage");
  if (a.addSecureTextField) {
    a.addSecureTextField(t("newApiKey"), "");
  } else {
    a.addTextField(t("newApiKey"), "");
  }
  a.addAction(t("save"));
  a.addCancelAction(t("cancel"));
  const choice = await a.presentAlert();
  if (choice < 0) return current;

  const apiKey = normalizeApiKey(a.textFieldValue(0));
  if (!apiKey) {
    const invalid = new Alert();
    invalid.title = t("invalidKeyInput");
    invalid.addAction(t("ok"));
    await invalid.presentAlert();
    return current;
  }

  clearCache();
  const next = applyRuntimeSettings({ ...current, apiKey });
  saveConfig(next);
  const saved = new Alert();
  saved.title = t("keyUpdatedTitle");
  saved.message = t("keyUpdatedMessage");
  saved.addAction(t("ok"));
  await saved.presentAlert();
  return next;
}

async function completeOobeIfNeeded(widgetConfig) {
  if (config.runsInWidget || isRefreshRun() || !widgetConfig?.apiKey) return widgetConfig;

  const cfg = applyRuntimeSettings(widgetConfig);
  if (cfg.oobeComplete && isUpdateMode(cfg.updateMode)) return cfg;

  const a = new Alert();
  a.title = t("welcomeTitle");
  a.message = t("welcomeMessage");
  a.addAction(t("autoUpdate"));
  a.addAction(t("manualUpdate"));
  const choice = await a.presentSheet();
  const updateMode = choice === 0 ? "auto" : "manual";
  const next = applyRuntimeSettings({ ...cfg, updateMode, oobeComplete: true });
  saveConfig(next);
  return next;
}

async function presentDataSettings(cfg) {
  let next = applyRuntimeSettings(cfg);
  while (true) {
    const a = new Alert();
    a.title = t("dataSettings");
    a.message = `${t("apiKeySaved")}: ${next.apiKey ? t("yes") : t("no")}\n${t("days")}: ${next.days}\n${t("monthlyBudget")}: ${next.monthlyBudget > 0 ? formatCostShort(next.monthlyBudget) : t("disabled")}`;
    a.addAction(t("changeKey"));
    a.addAction(t("days"));
    a.addAction(t("monthlyBudget"));
    a.addAction(t("clearCache"));
    a.addCancelAction(t("cancel"));
    const choice = await a.presentSheet();
    if (choice === 0) {
      next = await changeApiKey(next);
      continue;
    }
    if (choice === 1) {
      next = applyRuntimeSettings({ ...next, days: await chooseDays(next.days) });
      saveConfig(next);
      continue;
    }
    if (choice === 2) {
      next = applyRuntimeSettings({ ...next, monthlyBudget: await chooseMonthlyBudget(next.monthlyBudget) });
      saveConfig(next);
      continue;
    }
    if (choice === 3) {
      clearCache();
      await presentUpdateAlert(t("cacheClearedTitle"), t("cacheClearedMessage"));
      continue;
    }
    return next;
  }
}

async function presentDisplaySettings(cfg) {
  let next = applyRuntimeSettings(cfg);
  while (true) {
    const a = new Alert();
    a.title = t("displaySettings");
    a.message = `${t("language")}: ${languageName(next.language)}\n${t("appearance")}: ${themeName(next.theme)}\n${t("accentColor")}: ${accentName(next.accent)}\n${t("privacyMode")}: ${next.privacyMode ? t("enabled") : t("disabled")}\n${t("largeView")}: ${largeViewName(next.largeView)}\n${t("topList")}: ${topListName(next.topList)}\n${t("topSort")}: ${topSortName(next.topSort)}\n${t("largeSummary")}: ${largeSummaryName(next.largeSummary)}`;
    a.addAction(t("language"));
    a.addAction(t("appearance"));
    a.addAction(t("accentColor"));
    a.addAction(t("privacyMode"));
    a.addAction(t("largeView"));
    a.addAction(t("topList"));
    a.addAction(t("topSort"));
    a.addAction(t("largeSummary"));
    a.addCancelAction(t("cancel"));
    const choice = await a.presentSheet();
    if (choice === 0) {
      next = applyRuntimeSettings({ ...next, language: await chooseLanguage(next.language) });
      saveConfig(next);
      continue;
    }
    if (choice === 1) {
      next = applyRuntimeSettings({ ...next, theme: await chooseTheme(next.theme) });
      saveConfig(next);
      continue;
    }
    if (choice === 2) {
      next = applyRuntimeSettings({ ...next, accent: await chooseAccent(next.accent) });
      saveConfig(next);
      continue;
    }
    if (choice === 3) {
      next = applyRuntimeSettings({ ...next, privacyMode: await choosePrivacyMode(next.privacyMode) });
      saveConfig(next);
      continue;
    }
    if (choice === 4) {
      next = applyRuntimeSettings({ ...next, largeView: await chooseLargeView(next.largeView) });
      saveConfig(next);
      continue;
    }
    if (choice === 5) {
      next = applyRuntimeSettings({ ...next, topList: await chooseTopList(next.topList) });
      saveConfig(next);
      continue;
    }
    if (choice === 6) {
      next = applyRuntimeSettings({ ...next, topSort: await chooseTopSort(next.topSort, next.topList) });
      saveConfig(next);
      continue;
    }
    if (choice === 7) {
      next = applyRuntimeSettings({ ...next, largeSummary: await chooseLargeSummary(next.largeSummary) });
      saveConfig(next);
      continue;
    }
    return next;
  }
}

async function presentUpdateSettings(cfg) {
  let next = applyRuntimeSettings(cfg);
  while (true) {
    const a = new Alert();
    a.title = t("updateSettings");
    a.message = `${t("currentVersion")}: ${CONFIG.version}\n${t("updateMode")}: ${updateModeName(next.updateMode)}\n${t("lastUpdateCheck")}: ${next.lastUpdateCheckAt ? agoText(next.lastUpdateCheckAt) : t("none")}`;
    a.addAction(t("checkUpdates"));
    a.addAction(t("updateMode"));
    a.addAction(t("restoreBackup"));
    a.addCancelAction(t("cancel"));
    const choice = await a.presentSheet();
    if (choice === 0) {
      next = await checkForScriptUpdate(next, { manual: true });
      continue;
    }
    if (choice === 1) {
      next = applyRuntimeSettings({ ...next, updateMode: await chooseUpdateMode(next.updateMode), oobeComplete: true });
      saveConfig(next);
      continue;
    }
    if (choice === 2) {
      await presentRestoreBackup();
      continue;
    }
    return next;
  }
}

async function presentRestoreBackup() {
  const backups = listScriptBackups().slice(0, 5);
  if (backups.length === 0) {
    await presentUpdateAlert(t("noBackupsTitle"), t("noBackupsMessage"));
    return;
  }

  const pick = new Alert();
  pick.title = t("restoreBackupTitle");
  backups.forEach(backup => pick.addAction(backup.name));
  pick.addCancelAction(t("cancel"));
  const choice = await pick.presentSheet();
  if (choice < 0 || !backups[choice]) return;

  const selected = backups[choice];
  const confirm = new Alert();
  confirm.title = t("restoreBackupTitle");
  confirm.message = t("restoreBackupMessage", { backup: selected.name });
  confirm.addAction(t("restoreBackup"));
  confirm.addCancelAction(t("cancel"));
  const shouldRestore = await confirm.presentAlert();
  if (shouldRestore !== 0) return;

  try {
    const name = await restoreScriptBackup(selected);
    await presentUpdateAlert(t("restoreCompleteTitle"), t("restoreCompleteMessage", { backup: name }));
  } catch (err) {
    await presentUpdateAlert(t("updateFailedTitle"), t("updateFailedMessage", { message: err.message || t("fetchFailed") }));
  }
}

async function presentDiagnostics(cfg) {
  const cache = loadCache(cfg);
  const cacheText = cache?.payload?.updatedAt
    ? t("updated", { time: agoText(cache.payload.updatedAt) })
    : t("none");
  const script = currentScriptFile();
  const a = new Alert();
  a.title = t("diagnosticsTitle");
  a.message = [
    `${t("currentVersion")}: ${CONFIG.version}`,
    `${t("scriptName")}: ${Script.name()}`,
    `${t("scriptWritable")}: ${script ? t("yes") : t("no")}`,
    `${t("backupCount")}: ${listScriptBackups().length}`,
    `${t("days")}: ${cfg.days}`,
    `${t("monthlyBudget")}: ${cfg.monthlyBudget > 0 ? formatCostShort(cfg.monthlyBudget) : t("disabled")}`,
    `${t("accentColor")}: ${accentName(cfg.accent)}`,
    `${t("privacyMode")}: ${cfg.privacyMode ? t("enabled") : t("disabled")}`,
    `${t("largeView")}: ${largeViewName(cfg.largeView)}`,
    `${t("topList")}: ${topListName(cfg.topList)}`,
    `${t("topSort")}: ${topSortName(cfg.topSort)}`,
    `${t("largeSummary")}: ${largeSummaryName(cfg.largeSummary)}`,
    `${t("updateMode")}: ${updateModeName(cfg.updateMode)}`,
    `${t("lastUpdateCheck")}: ${cfg.lastUpdateCheckAt ? agoText(cfg.lastUpdateCheckAt) : t("none")}`,
    `API URL: ${cfg.apiUrl}`,
    `${t("apiKeySaved")}: ${cfg.apiKey ? t("yes") : t("no")}`,
    `${t("cacheStatus")}: ${cacheText}`,
  ].join("\n");
  a.addAction(t("ok"));
  await a.presentAlert();
}

async function presentSettingsIfNeeded(widgetConfig) {
  if (config.runsInWidget || isRefreshRun() || !widgetConfig?.apiKey) return widgetConfig;

  let cfg = applyRuntimeSettings(widgetConfig);
  while (true) {
    const a = new Alert();
    a.title = t("settingsTitle");
    a.message = `${t("currentVersion")}: ${CONFIG.version}\n${t("days")}: ${cfg.days}\n${t("topList")}: ${topListName(cfg.topList)}\n${t("updateMode")}: ${updateModeName(cfg.updateMode)}\n\n${t("settingsMessage")}`;
    a.addAction(t("preview"));
    a.addAction(t("dataSettings"));
    a.addAction(t("displaySettings"));
    a.addAction(t("updateSettings"));
    a.addAction(t("diagnostics"));
    a.addCancelAction(t("cancel"));
    const choice = await a.presentSheet();

    if (choice === 0) {
      const family = await choosePreviewFamily();
      if (family) {
        cfg.previewFamily = family;
        return cfg;
      }
      continue;
    }
    if (choice === 1) {
      cfg = await presentDataSettings(cfg);
      continue;
    }
    if (choice === 2) {
      cfg = await presentDisplaySettings(cfg);
      continue;
    }
    if (choice === 3) {
      cfg = await presentUpdateSettings(cfg);
      continue;
    }
    if (choice === 4) {
      await presentDiagnostics(cfg);
      continue;
    }

    return cfg;
  }
}

async function main() {
  let widgetConfig = await bootstrapIfNeeded();
  widgetConfig = widgetConfig ? await completeOobeIfNeeded(widgetConfig) : widgetConfig;
  widgetConfig = widgetConfig ? await maybeAutoUpdate(widgetConfig) : widgetConfig;
  widgetConfig = widgetConfig ? await presentSettingsIfNeeded(widgetConfig) : widgetConfig;
  ACTIVE_WIDGET_PARAMETER = widgetParameterValue();
  if (widgetConfig && ACTIVE_WIDGET_PARAMETER) widgetConfig = applyWidgetParameter(widgetConfig, ACTIVE_WIDGET_PARAMETER);
  if (widgetConfig) widgetConfig = applyRuntimeSettings(widgetConfig);
  let payload = {
    configured: Boolean(widgetConfig?.apiKey),
    apiUrl: normalizeApiUrl(widgetConfig?.apiUrl),
    days: clampDays(widgetConfig?.days || CONFIG.days),
    accent: widgetConfig?.accent || DEFAULT_SETTINGS.accent,
    privacyMode: Boolean(widgetConfig?.privacyMode),
    largeView: widgetConfig?.largeView || DEFAULT_SETTINGS.largeView,
    topList: widgetConfig?.topList || DEFAULT_SETTINGS.topList,
    topSort: widgetConfig?.topSort || DEFAULT_SETTINGS.topSort,
    largeSummary: normalizeLargeSummary(widgetConfig?.largeSummary),
    monthlyBudget: normalizeBudget(widgetConfig?.monthlyBudget),
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
      saveCache({ request: cacheRequest(widgetConfig), payload });
    } catch (err) {
      const cached = loadCache(widgetConfig);
      if (cached?.payload?.summary) {
        payload = {
          ...cached.payload,
          accent: widgetConfig.accent || DEFAULT_SETTINGS.accent,
          privacyMode: Boolean(widgetConfig.privacyMode),
          largeView: widgetConfig.largeView || DEFAULT_SETTINGS.largeView,
          topList: widgetConfig.topList || DEFAULT_SETTINGS.topList,
          topSort: widgetConfig.topSort || DEFAULT_SETTINGS.topSort,
          largeSummary: normalizeLargeSummary(widgetConfig.largeSummary),
          monthlyBudget: normalizeBudget(widgetConfig.monthlyBudget),
          offline: true,
          error: err.message || t("fetchFailed"),
        };
      } else {
        const msg = err.message || t("fetchFailed");
        payload.error = msg === t("invalidKey") || /^HTTP /.test(msg) ? msg : `${t("networkError")}\n${t("noCache")}`;
      }
    }
  }

  const previewFamily = widgetConfig?.previewFamily;
  if (widgetConfig) delete widgetConfig.previewFamily;
  const widget = scheduleRefresh(buildWidget(payload));

  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else if (isRefreshRun()) {
    await presentRefreshResult(payload);
  } else {
    await presentPreviewWidget(payload, previewFamily || "medium");
  }
  Script.complete();
}

await main();
