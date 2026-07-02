// Vibe Usage iPhone widget for Scriptable.
// Shows token/cost stats from vibecafe.ai using the same vbu_ API key as
// `npx @vibe-cafe/vibe-usage summary` and the Vibe Usage desktop app.

const CONFIG = {
  version: "0.1.1",
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
  topList: "source",
  updateMode: null,
  oobeComplete: false,
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
let ACTIVE_THEME = "auto";

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
    lastDays: "Last {days} Days",
    updated: "Updated {time}",
    yesterday: "Yesterday",
    dayBeforeYesterday: "Day Before Yesterday",
    usingCachedData: "Using Cached Data",
    noData: "No data yet. Run vibe-usage sync on your computer first.",
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
    system: "System",
    english: "English",
    chinese: "Chinese",
    agentClients: "Agent Clients",
    models: "Models",
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
    lastDays: "近 {days} 天",
    updated: "{time} 更新",
    yesterday: "昨天",
    dayBeforeYesterday: "前天",
    usingCachedData: "正在使用缓存数据",
    noData: "暂无数据。先在电脑上运行 vibe-usage 同步。",
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
    system: "跟随系统",
    english: "English",
    chinese: "中文",
    agentClients: "Agent 客户端",
    models: "模型",
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
  const topList = ["source", "model"].includes(c.topList) ? c.topList : DEFAULT_SETTINGS.topList;
  const updateMode = isUpdateMode(c.updateMode) ? c.updateMode : DEFAULT_SETTINGS.updateMode;
  const lastUpdateCheckAt = Number.isFinite(Number(c.lastUpdateCheckAt)) ? Number(c.lastUpdateCheckAt) : 0;
  return {
    ...c,
    apiUrl: normalizeApiUrl(c.apiUrl),
    days: clampDays(c.days || CONFIG.days),
    language,
    theme,
    topList,
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

function topListName(value) {
  if (value === "model") return t("models");
  return t("agentClients");
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
    FileManager.local().writeString(cachePath(), JSON.stringify(payload));
  } catch {}
}

function clearCache() {
  try {
    const fm = FileManager.local();
    const path = cachePath();
    if (fm.fileExists(path)) fm.remove(path);
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
        topList: parsed.topList || DEFAULT_SETTINGS.topList,
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

function formatPercent(value) {
  const n = Math.max(0, Math.min(100, number(value)));
  if (n >= 10) return `${Math.round(n)}%`;
  if (n > 0) return `${trim1(n)}%`;
  return "0%";
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

function insightSummary(summary, days) {
  const cacheShare = formatPercent(percentOf(summary.cached, summary.totalTokens));
  const dailyCost = formatCostShort(summary.cost / Math.max(1, clampDays(days)));
  const tokenRate = formatTokenRate(summary.totalTokens, summary.activeSeconds);
  return `${t("cache")} ${cacheShare} · ${dailyCost}/d · ${tokenRate}`;
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

  ctx.setFont(Font.semiboldSystemFont(8));
  ctx.setTextColor(COLORS.drawFaint);

  const total = parts.reduce((sum, p) => sum + Math.max(0, number(p.value)), 0);
  const labels = parts.filter(p => p.label && p.value > 0).slice(0, 4);
  let labelX = 0;
  labels.forEach((part) => {
    const label = `${part.label} ${formatPercent(percentOf(part.value, total))}`;
    const textWidth = Math.min(82, Math.max(26, label.length * 5.5));
    const dot = new Path();
    dot.addRoundedRect(new Rect(labelX, 2.5, 5, 5), 2.5, 2.5);
    ctx.addPath(dot);
    ctx.setFillColor(part.color);
    ctx.fillPath();

    ctx.setTextColor(COLORS.drawFaint);
    ctx.drawTextInRect(label, new Rect(labelX + 8, 0, textWidth, 11));
    labelX += 8 + textWidth + 9;
  });

  const railY = Math.max(15, height - 13);
  const railH = Math.min(13, height - railY);
  return overlayRailImage(ctx, parts, width, railY, railH, 4);
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
  row.spacing = 6;

  const name = row.addText(label);
  name.font = Font.semiboldSystemFont(10);
  name.textColor = COLORS.muted;
  name.lineLimit = 1;
  name.minimumScaleFactor = 0.7;
  name.size = new Size(58, 0);

  const pct = maxTokens > 0 ? item.tokens / maxTokens : 0;
  const img = row.addImage(progressImage(pct, 82, 6, color));
  img.imageSize = new Size(82, 6);

  row.addSpacer();

  const value = row.addText(formatTokens(item.tokens));
  value.font = Font.semiboldMonospacedSystemFont(10);
  value.textColor = COLORS.text;
  value.lineLimit = 1;
  value.size = new Size(46, 0);

  const cost = row.addText(formatCostShort(item.cost));
  cost.font = Font.semiboldMonospacedSystemFont(10);
  cost.textColor = COLORS.green;
  cost.lineLimit = 1;
  cost.minimumScaleFactor = 0.7;
  cost.size = new Size(50, 0);
}

function buildWidget(payload) {
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
  addMetric(metrics, t("active"), formatDurationMetric(s.activeSeconds), COLORS.blue, {
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
  if (s.totalTokens <= 0) {
    addNoUsageState(widget, payload.days, true, 124);
    widget.addSpacer();
    const updated = widget.addText(t("updated", { time: agoText(payload.updatedAt) }));
    updated.font = Font.systemFont(9);
    updated.textColor = COLORS.faint;
    return widget;
  }

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
  addMetric(metrics, t("active"), formatDurationMetric(s.activeSeconds), COLORS.blue, { width: metricWidth, height: 62 });
  addMetric(metrics, t("cache"), formatTokens(s.cached), COLORS.cache, { width: metricWidth, height: 62 });
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
  addInsightStrip(widget, s, payload.days);
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
  const topList = payload.topList === "model" ? "model" : "source";
  const sourcesTitle = widget.addText(topList === "model" ? t("topModels") : t("topSources"));
  sourcesTitle.font = Font.semiboldSystemFont(11);
  sourcesTitle.textColor = COLORS.muted;
  widget.addSpacer(7);
  addTopList(widget, topList === "model" ? s.topModels : s.topSources, 4, topList);
  return widget;
}

function addTopList(parent, entries, limit, kind) {
  const visible = entries.slice(0, limit);
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
  visible.forEach(([name, item], idx) => addSourceRow(rows, topItemLabel(name, kind), item, max, palette[idx % palette.length]));
}

function addInsightStrip(parent, summary, days) {
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
  const text = pill.addText(insightSummary(summary, days));
  text.font = Font.semiboldMonospacedSystemFont(10);
  text.textColor = COLORS.muted;
  text.lineLimit = 1;
  text.minimumScaleFactor = 0.65;
  outer.addSpacer();
}

function topItemLabel(name, kind) {
  if (kind === "source") return sourceLabel(name);
  return name || "Unknown";
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

async function chooseTopList(current) {
  const a = new Alert();
  a.title = t("topList");
  a.addAction(t("agentClients"));
  a.addAction(t("models"));
  a.addCancelAction(t("cancel"));
  const choice = await a.presentSheet();
  if (choice === 0) return "source";
  if (choice === 1) return "model";
  return current;
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
    a.message = `${t("apiKeySaved")}: ${next.apiKey ? t("yes") : t("no")}\n${t("days")}: ${next.days}`;
    a.addAction(t("changeKey"));
    a.addAction(t("days"));
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
    return next;
  }
}

async function presentDisplaySettings(cfg) {
  let next = applyRuntimeSettings(cfg);
  while (true) {
    const a = new Alert();
    a.title = t("displaySettings");
    a.message = `${t("language")}: ${languageName(next.language)}\n${t("appearance")}: ${themeName(next.theme)}\n${t("topList")}: ${topListName(next.topList)}`;
    a.addAction(t("language"));
    a.addAction(t("appearance"));
    a.addAction(t("topList"));
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
      next = applyRuntimeSettings({ ...next, topList: await chooseTopList(next.topList) });
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
  const cache = loadCache();
  const cacheText = cache?.payload?.updatedAt
    ? t("updated", { time: agoText(cache.payload.updatedAt) })
    : t("none");
  const a = new Alert();
  a.title = t("diagnosticsTitle");
  a.message = [
    `${t("currentVersion")}: ${CONFIG.version}`,
    `${t("scriptName")}: ${Script.name()}`,
    `${t("days")}: ${cfg.days}`,
    `${t("topList")}: ${topListName(cfg.topList)}`,
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
  if (widgetConfig) widgetConfig = applyRuntimeSettings(widgetConfig);
  let payload = {
    configured: Boolean(widgetConfig?.apiKey),
    apiUrl: normalizeApiUrl(widgetConfig?.apiUrl),
    days: clampDays(widgetConfig?.days || CONFIG.days),
    topList: widgetConfig?.topList || DEFAULT_SETTINGS.topList,
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
      const cached = loadCache();
      if (cached?.payload?.summary && cacheMatches(cached, widgetConfig)) {
        payload = {
          ...cached.payload,
          topList: widgetConfig.topList || DEFAULT_SETTINGS.topList,
          offline: true,
          error: err.message || t("fetchFailed"),
        };
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
