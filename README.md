# Vibe Usage iPhone 桌面小组件

当前版本：`0.1.5`

这是一个用于在 iPhone 桌面或负一屏查看 Vibe Usage 数据的 Scriptable 小组件。它不解析手机本地日志，也不上传任何用量数据，只使用你的 `vbu_...` API Key 读取 Vibe Usage 的只读接口：

```text
GET https://vibecafe.ai/api/usage?days=7
```

数据同步仍由官方 `@vibe-cafe/vibe-usage` CLI 或 Vibe Usage 桌面 app 完成；这个仓库只负责 iPhone 小组件展示、缓存、设置和脚本自更新。

## 主要功能

- 支持小号、中号、大号 Scriptable 小组件
- 展示 Token 总量、预估费用、活跃时长和缓存占比
- 展示输入、输出、推理、缓存 Token 组成
- 大号小组件展示 Top Agent 客户端或 Top 模型，并显示 Token 与预估费用
- 中号和大号支持点击刷新图标手动拉取最新数据
- 网络失败时自动回退到本地缓存，并标记离线状态
- 支持中文、英文、跟随系统语言
- 支持浅色、深色、跟随系统外观
- 支持在设置里更换 API Key、调整统计天数、切换大号列表排序
- 首次使用时选择自动更新或手动检查更新
- 更新前自动备份脚本，并可从设置页恢复最近备份

## 展示

![Medium widget in light mode](docs/showcase-medium-light.png)

![Medium widget in dark mode](docs/showcase-medium-dark.png)

![Small and large widgets in dark mode](docs/showcase-all-sizes-dark.png)

## 文件说明

- `vibe-usage-widget.js`：复制到 Scriptable 的小组件脚本
- `tests/widget-logic.test.js`：格式化、配置解析、缓存匹配和汇总逻辑的 smoke tests
- `docs/`：iPhone 实机截图

## 使用前准备

Vibe Usage 的数据来自电脑端同步。请先在 macOS、Windows 或 Linux 上完成官方同步：

```bash
npx @vibe-cafe/vibe-usage
```

按提示登录并授权后，建议开启后台同步：

```bash
npx @vibe-cafe/vibe-usage daemon install
```

如果你已经配置过，只需要手动同步一次：

```bash
npx @vibe-cafe/vibe-usage sync
```

## 获取 API Key

打开 [Vibe Usage 设置页](https://vibecafe.ai/usage/setup)，生成或复制 `vbu_` 开头的 API Key。

也可以从电脑上的配置文件里查看：

```bash
cat ~/.vibe-usage/config.json
```

其中的 `apiKey` 就是小组件需要的 Key。

## 安装到 iPhone

1. 在 iPhone 安装 [Scriptable](https://scriptable.app/)。
2. 下载或打开本仓库的 `vibe-usage-widget.js`。
3. 在 Scriptable 新建脚本，把 `vibe-usage-widget.js` 的全部内容粘贴进去。
4. 把 `vbu_...` API Key 复制到 iPhone 剪贴板。
5. 在 Scriptable 里手动运行一次脚本。
6. 脚本会读取剪贴板里的 Key，保存到 Scriptable Keychain。
7. 首次配置完成后，按提示选择脚本更新方式：自动更新或手动检查。
8. 回到桌面长按空白处，添加 Scriptable 小组件，并选择这个脚本。

可选：如果不想通过剪贴板导入 Key，可以把下面内容保存为 `vibeusage-widget.json`，放到 Scriptable 的 iCloud 文件夹，然后手动运行一次脚本：

```json
{
  "apiKey": "vbu_xxxxxxxxxxxx",
  "apiUrl": "https://vibecafe.ai",
  "days": 7,
  "language": "auto",
  "theme": "auto",
  "topList": "source",
  "updateMode": "manual"
}
```

导入成功后，`vibeusage-widget.json` 会被脚本自动删除，避免旧配置反复覆盖 Keychain。

## 小组件内容

小号小组件适合快速看总量、费用、活跃时长和更新时间。

中号小组件展示更完整的概览：Token 总量、费用、活跃时长、缓存、Token 组成和组成百分比。

大号小组件在概览之外还会展示：

- 缓存占比、日均费用、Token 速率
- Top Agent 客户端或 Top 模型
- 每一项的 Token 数和预估费用

当所选统计窗口没有用量时，小组件会显示空状态提示。把天数设为 `1` 可以查看今天；可设置范围为 `1` 到 `90` 天。

## 设置入口

在 Scriptable 里直接运行脚本，或点击中号/大号小组件主体，会进入设置页。

设置页包含这些入口：

- 预览：用当前配置预览中号小组件
- 数据设置：更换 API Key、调整统计天数
- 显示设置：切换语言、外观、大号列表类型
- 更新设置：检查更新、切换自动/手动更新、恢复脚本备份
- 诊断信息：查看版本、脚本名、API URL、缓存状态、上次检查更新时间等

大号列表类型有两种：

- Agent 客户端：按 Codex、Claude、Cursor、Gemini 等客户端来源统计
- 模型：按模型名统计

## 刷新机制

脚本会向 iOS 请求大约每 5 分钟刷新一次：

```js
widget.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000)
```

实际刷新频率由 iOS 和 Scriptable 调度决定，可能会因为省电、网络、系统负载或桌面活跃度被合并或延后。

中号和大号小组件右上角有刷新图标。点击后会通过 Scriptable URL scheme 打开并运行当前脚本，完成一次手动拉取并更新缓存。小号小组件受 iOS/Scriptable 点击区域限制，可能只能保留一个点击目标。

## 脚本更新

首次配置时会出现 OOBE 提示，让你选择更新方式：

- 自动更新：脚本运行时最多每 24 小时检查一次 GitHub Release。发现新版后，会先备份当前脚本，再安装通过校验的新版本。
- 手动检查：不会自动拉取新版，只在设置页点击“检查更新”时检查，并在确认后安装。

自动更新只会覆盖 Scriptable 脚本文件本身，不会修改你的 API Key。API Key 始终保存在 iPhone 的 Scriptable Keychain。

每次安装新版前，脚本会把当前脚本备份为类似下面的文件：

```text
脚本名.backup-v0.1.5-20260704-1810.js
```

如果新版本不符合预期，可以进入“更新设置”里的“恢复备份”恢复最近的脚本备份。恢复也会先备份当前脚本，方便继续回退。

## 缓存与离线

每次成功拉取数据后，脚本会把结果缓存到 Scriptable 本地文件：

```text
vibeusage-widget-cache.json
```

当网络失败、接口临时不可用或 GitHub 检查更新失败时，小组件会优先展示与当前 API Key、API URL、统计天数匹配的缓存数据，并显示离线提示。

## 安全边界

- API Key 只保存在 iPhone 的 Scriptable Keychain。
- 小组件只请求只读接口：`GET /api/usage?days=...`。
- 小组件不会读取电脑本地日志。
- 小组件不会上传你的本地数据。
- 真实的数据同步仍由官方 CLI 或桌面 app 完成。
- 脚本自更新只从本仓库 GitHub Release 下载名为 `vibe-usage-widget.js` 的资源，并会做基础校验。

## 常见问题

### 小组件不刷新？

iOS 小组件刷新不是严格定时器。可以先点击中号或大号右上角刷新图标手动刷新；如果仍然没有数据，请在电脑上运行：

```bash
npx @vibe-cafe/vibe-usage sync
```

### 显示需要 API Key？

把 `vbu_...` Key 复制到 iPhone 剪贴板，然后在 Scriptable 里手动运行一次脚本。也可以用 `vibeusage-widget.json` 导入。

### 设置天数为 1 没有数据？

`days: 1` 表示今天这个窗口。如果今天没有用量，小组件会显示“今天暂无用量”。可以在数据设置里把天数调大，例如 `7` 或 `30`。

### 更换 API Key 后旧数据还在？

脚本会按 API Key、API URL 和统计天数匹配缓存。更换 Key 后刷新一次即可拉取新账号的数据；如果网络失败且没有匹配缓存，会显示错误或空状态。

## 开发

本仓库保持一个可直接复制到 Scriptable 的单文件脚本。修改核心逻辑后建议运行：

```bash
node --check vibe-usage-widget.js
node tests/widget-logic.test.js
git diff --check
```

测试覆盖配置解析、版本比较、更新判断、格式化、用量汇总、缓存匹配和空状态文案等基础逻辑。
