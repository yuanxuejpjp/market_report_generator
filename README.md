# 📊 每日市场分析报告生成器

基于 **HTML/CSS/JS** 的静态网站形式市场分析报告工具，支持股票数据展示、新闻资讯和报告生成。

> 📝 **注意**: 原 Python 版本已迁移为纯前端静态网站，所有数据为模拟数据展示。

---

## 🚀 功能特点

### 数据展示
- **实时股价数据**: 模拟展示股票和指数数据
- **大盘指数**: S&P 500、纳斯达克、道琼斯、VIX
- **技术指标**: RSI、移动平均线趋势判断
- **市场情绪**: CNN 恐惧贪婪指数

### 新闻资讯
- **AI 板块新闻**: NVIDIA、Microsoft、Google 等相关资讯
- **电力板块新闻**: CEG、VST 等核能电力资讯
- **宏观市场新闻**: 美联储、市场走势等资讯

### 报告功能
- **板块分析**: AI 板块、电力板块专项分析
- **个股追踪**: NVDA、MSFT、GOOGL、AMD、TSLA、TSM、CEG、VST
- **Markdown 导出**: 一键导出报告为 Markdown 文件
- **响应式设计**: 支持桌面和移动设备

---

## 📁 项目结构

```
market_report_generator/
├── web/                      # 静态网站目录
│   ├── index.html           # 主页面
│   ├── css/
│   │   └── style.css        # 样式文件
│   └── js/
│       ├── data.js          # 数据获取模块（模拟）
│       └── app.js           # 主应用逻辑
│
├── config.py                # 原 Python 配置文件（保留参考）
├── main.py                  # 原 Python 主程序（保留参考）
├── utils/                   # 原 Python 工具模块（保留参考）
├── requirements.txt         # Python 依赖（原）
└── README.md               # 项目说明
```

---

## 🛠️ 使用方法

### 方式一：直接打开（最简单）

直接在浏览器中打开 `web/index.html` 文件：

```bash
# Windows
start web/index.html

# macOS
open web/index.html

# Linux
xdg-open web/index.html
```

### 方式二：使用本地服务器（推荐）

使用 Python 启动本地服务器：

```bash
cd web

# Python 3
python -m http.server 8080

# 或 Python 2
python -m SimpleHTTPServer 8080
```

然后访问 http://localhost:8080

### 方式三：使用 Node.js

```bash
cd web
npx serve
```

---

## 📊 报告内容

生成的报告包含以下部分：

1. **市场概览**
   - S&P 500、纳斯达克、道琼斯指数
   - CNN 恐惧贪婪指数
   - VIX 波动率指数

2. **AI 板块分析**
   - NVDA、MSFT、GOOGL、AMD、TSLA、TSM 表现
   - RSI 技术指标
   - 板块动态分析

3. **电力板块分析**
   - CEG、VST 表现
   - 数据中心电力需求相关资讯

4. **市场资讯要点**
   - AI 板块相关新闻
   - 电力板块相关新闻
   - 宏观市场相关新闻

5. **今日要点总结**
   - 市场情绪判断
   - 板块表现总结
   - 投资建议提示

---

## 🎨 界面预览

### 桌面端
- 清晰的卡片式布局
- 实时数据表格展示
- 情绪指标可视化

### 移动端
- 自适应响应式设计
- 触摸友好的交互
- 优化的阅读体验

---

## 🔧 自定义配置

编辑 `web/js/data.js` 文件可自定义：

```javascript
const CONFIG = {
    // AI 板块股票
    AI_STOCKS: {
        'NVDA': 'NVIDIA',
        'MSFT': 'Microsoft',
        // 添加更多...
    },
    
    // 电力板块股票
    POWER_STOCKS: {
        'CEG': 'Constellation Energy',
        'VST': 'Vistra',
        // 添加更多...
    },
    
    // 大盘指数
    MARKET_INDICES: {
        '^GSPC': 'S&P 500',
        '^IXIC': '纳斯达克',
        // 添加更多...
    },
};
```

---

## 📦 原 Python 版本

如需使用原 Python 版本获取真实数据：

```bash
# 安装依赖
pip install -r requirements.txt

# 生成报告
python main.py --mock
```

---

## ⚠️ 免责声明

本报告仅供参考，不构成投资建议。投资有风险，入市需谨慎。

所有展示数据均为模拟数据，仅供演示用途。

---

**最后更新**: 2026-02-22
