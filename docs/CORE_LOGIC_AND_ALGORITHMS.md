# CS2 战队策略沙盘推演系统 - 核心代码逻辑与算法解析

本文档旨在梳理本项目底层的核心算法、数据流转逻辑以及概率推演引擎的运作原理，方便后续的二次开发、代码审查以及进阶功能迭代。

---

## 1. 系统架构与数据流 (System Architecture & Data Flow)

本项目采用**完全的前后端分离**架构，重点在于将重度运算（推演逻辑、博弈树展开）置于前端浏览器执行（通过 JavaScript 模块化引擎实现），而后端主要负责数据的持久化、清洗和多维切片的提供。

- **后端 (Backend)**: Python (FastAPI) + SQLite + SQLAlchemy。
  - **核心职责**：提供静态的聚合数据。爬虫层 (`scraper.py`) 通过模拟真实 HLTV 接口结构拉取多维时间跨度（全部、近 1 年、近半年、近 3 个月）的 `TeamMapStat`，并提供 `/api/teams` 等端点供前端消费。
- **前端 (Frontend)**: 原生 HTML/CSS/JS (Vanilla JS)，使用现代 Web Components 思想手动实现组件化。
  - **状态管理**：`main.js` 中的 `state` 对象作为全局单一数据源 (Single Source of Truth)。通过 `updateState(newState)` 触发单向数据流向下分发至三个核心视图组件 (`dashboard.js`, `bpSimulator.js`, `matchSandbox.js`)。

---

## 2. 核心模块一：智能 BP 博弈引擎 (BP Simulator)

BP (Ban/Pick) 引擎的核心不仅仅是胜率排序，而是基于“最小化自身劣势，最大化对方劣势”的博弈论思想。逻辑封装在 `bpEngine.js` 中。

### 2.1 行动建议打分算法 (Recommendation Score)
当轮到某一方执行 Ban (禁用地图) 或 Pick (选择地图) 操作时，引擎会遍历剩余地图池并计算“推荐指数”。

**BAN 禁图算法权重：**
我们更倾向于禁用“对手的强图”、“我方的弱图”以及“交手记录落后”的地图，并且引入了教练的“激进指数 (Aggression)”。
```javascript
// Score = (对手胜率 * 激进指数) + (我方弱点 * 稳健指数) + H2H补正
const score = (oppWinRate * aggression * 1.2) + 
              ((100 - actorWinRate) * (1 - aggression) * 1.2) + 
              ((100 - h2hWinRate) * 0.2);
```

**PICK 选图算法权重：**
选图时，主要考虑自身熟练度绝对值、双方胜率差、交手记录压制力以及近期的团队状态 (Form Index)。
```javascript
// Score = 自身胜率 + 胜率差 + H2H补正 + 状态爆发加成
const winDiff = actorWinRate - oppWinRate;
const formBonus = actor.formIndex - opponent.formIndex;
const score = (actorWinRate * 0.5) + (winDiff * 0.3) + ((h2hWinRate - 50) * 0.2) + (formBonus * 2);
```

### 2.2 What-If 多分支假设推演
- **机制**：前端通过将当前的 BP 会话 (Session) 深拷贝 (Deep Clone) 出来生成一个并行的 `whatIfSession`。
- **推演**：如果用户强行偏离了 AI 推荐路线（例如在第 3 步做了一个“怪阵” Pick），系统会用上述的推荐算法**自动替双方模拟完剩余的所有 BP 步骤**，直到决定出地图池。
- **验证**：最后使用 `predictMatchOutcome()` 函数，比较“原始预期胜率”和“What-If 路线分支胜率”，直观展示该决策是利大于弊还是作茧自缚。

---

## 3. 核心模块二：赛局蒙特卡洛沙盘 (Match Sandbox)

这是本系统的核心亮点，摒弃了“谁胜率高谁赢”的静态算命，引入了 CS2 真实的经济系统 (Economy)、连败补偿 (Loss Bonus)、战术相克 (Tactic Counters) 和动态士气 (Morale)。代码封装于 `sandboxEngine.js`。

### 3.1 经济系统演算 (Economy State Machine)
- 初始资金 $800。
- 回合获胜获得 $3250。
- 失败方获得连败补偿：一败 $1400，二败 $1900... 最高叠加到五败及以上的 $3400。
- 引擎会根据预测的敌方资金，结合当前比分差距（如落后太多必须 Force Buy，经济富裕则起 AWP）来动态决定本局是 `eco`, `force`, `buy` 还是 `awp`。
- 不同级别的购买力度会被赋予不同的**枪械装备权重 (Weapon Weight)**：
  - Eco = 1，Force = 3，Buy = 5，AWP = 6。

### 3.2 战术风格相生相克 (Tactical Counters)
系统预定义了双方的偏好战术，并通过石头剪刀布般的克制链对最终胜率进行修正（Tactic Advantage）：
- **进攻方 (T) 快攻 (Rush)** 克制 **防守方 (CT) 前推 (Push)** (+12% 胜率)
- **防守方 (CT) 主动回防 (Retake)** 克制 **进攻方快攻 (Rush)** (-10% 胜率)
- **进攻方 (T) 慢节奏默认 (Default)** 惩罚 **防守方回防 (Retake)** (+10% 胜率)
- **防守方 (CT) 前推 (Push)** 打乱 **进攻方慢节奏 (Default)** (-10% 胜率)

### 3.3 单回合胜负判定算法 (Round Resolution Equation)
每一回合的胜率 `Prob(A)` 是以下多个动态因子的叠加：

1. **绝对能力基座 (Base Rate)**：队伍 A 在该图该阵营的真实胜率（结合对手同阵营胜率做相对换算）。
2. **地图机制倾向 (Map Bias)**：地图本身是警图还是匪图 (CT/T Bias) 的全局修正 (+/- 50% 均值差)。
3. **装备压制 (Weapon Differential)**：双方购买权重之差 `(WeightA - WeightB) * 12%`。比如全枪打 ECO，直接 +48% 胜率。
4. **战术克制 (Tactic Advantage)**：上方提到的克制关系修正 `[-10%, +12%]`。
5. **士气滚雪球 (Morale/Momentum)**：基于连胜/连败累积的心理势能差 `(MoraleA - MoraleB) * 1.5%`。

最终，引擎将 `Prob(A)` 限制在 `[5%, 95%]` 之间（保留爆冷可能），并掷出一个 `[0, 100)` 的随机数。若随机数 `< Prob(A)`，则 A 胜。

---

## 4. 数据多维切片逻辑 (Multidimensional Data Filtering)

- 系统引入了时间跨度（`time_range`: 3m, 6m, 1y, all）和数据类型（`data_type`: archive, live）。
- 当 UI 层触发下拉菜单切换时，调用 `fetchInitialData()`，携带 Query Params 向 FastAPI 请求对应维度的数据切片。
- 后端 SQLite 中的 `TeamMapStat` 使用复合键 (TeamID + MapID + TimeRange) 存储数据。
- 切换数据源后，前端触发强制重新渲染：不仅重新绘制雷达图、更新战队面板，**连带 BP 模拟器和沙盘引擎底层的胜率基座都会瞬间切换到该时间维度的历史状态**，实现了真正的时空穿梭分析。
- **雷达图与平面图的数据联动与缩放防御机制**：
  - **雷达图数据提取**：雷达图的绘图逻辑支持多系列选择（全局、战队 A、战队 B）。通过 `renderRadarChartSVG` 函数直接在当前选中队伍的 `mapPool` 中拉取对应的 `ctWinRate` 与 `tWinRate` 重新渲染，解决了以前只在全局维度查询导致图表静止的问题。
  - **平面图统一渲染与容错机制**：数据看板与推演沙盘统一通过 `getMapBlueprintSVG(mapId)` 解析在 `mapBlueprints.js` 中预定义的矢量图层。解析中采用了不区分大小写的键值容错逻辑，能自动适配各模块在传入 ID 时的微小偏差。此外，在 CSS 样式中为图层容器规定了 `min-height` 和 `min-width`，彻底杜绝了因 Flex/Grid 高宽自动计算引发的图层尺寸塌陷问题。
