/**
 * 数据模块 - 模拟股票数据获取和新闻抓取
 * 对应原 Python 版本的 data_fetcher.py 和 news_scraper.py
 */

// ==================== 配置 ====================
const CONFIG = {
    // AI 板块股票
    AI_STOCKS: {
        'NVDA': 'NVIDIA',
        'MSFT': 'Microsoft',
        'GOOGL': 'Alphabet',
        'AMD': 'AMD',
        'TSLA': 'Tesla',
        'TSM': '台积电',
    },
    // 电力板块股票
    POWER_STOCKS: {
        'CEG': 'Constellation Energy',
        'VST': 'Vistra',
    },
    // 大盘指数
    MARKET_INDICES: {
        '^GSPC': 'S&P 500',
        '^IXIC': '纳斯达克',
        '^DJI': '道琼斯',
        '^VIX': 'VIX波动率',
    },
};

// ==================== 数据获取器 ====================
class DataFetcher {
    constructor() {
        this.cache = {};
        this.cacheDuration = 5 * 60 * 1000; // 5分钟缓存
    }

    /**
     * 生成模拟股票数据
     */
    generateStockData(ticker, name) {
        // 基础价格（模拟）
        const basePrices = {
            'NVDA': 140.50,
            'MSFT': 420.80,
            'GOOGL': 175.30,
            'AMD': 165.20,
            'TSLA': 250.60,
            'TSM': 145.90,
            'CEG': 185.40,
            'VST': 95.30,
        };

        const basePrice = basePrices[ticker] || 100.0;
        
        // 生成随机涨跌幅 (-3% 到 +3%)
        const changePct = (Math.random() - 0.5) * 6;
        const change = basePrice * changePct / 100;
        const currentPrice = basePrice + change;
        const prevClose = basePrice;

        // 生成 RSI (0-100)
        const rsi = Math.round((Math.random() * 60 + 20) * 10) / 10;

        // 生成成交量
        const volume = Math.floor(Math.random() * 50000000) + 10000000;

        // 生成市值
        const marketCap = Math.floor(Math.random() * 2000000000000) + 100000000000;

        return {
            ticker: ticker,
            name: name,
            current_price: currentPrice,
            previous_close: prevClose,
            change: change,
            change_pct: changePct,
            volume: volume,
            market_cap: marketCap,
            rsi: rsi,
            timestamp: new Date(),
        };
    }

    /**
     * 生成模拟指数数据
     */
    generateIndexData(symbol, name) {
        const baseValues = {
            '^GSPC': 5800.00,
            '^IXIC': 17500.00,
            '^DJI': 42000.00,
            '^VIX': 18.50,
        };

        const baseValue = baseValues[symbol] || 1000.0;
        
        // VIX 的波动范围不同
        let changePct;
        if (symbol === '^VIX') {
            changePct = (Math.random() - 0.5) * 10; // VIX 波动更大
        } else {
            changePct = (Math.random() - 0.5) * 2; // 指数波动较小
        }
        
        const change = baseValue * changePct / 100;
        const current = baseValue + change;
        const prevClose = baseValue;

        return {
            symbol: symbol,
            name: name,
            current: current,
            previous_close: prevClose,
            change: change,
            change_pct: changePct,
            timestamp: new Date(),
        };
    }

    /**
     * 获取单个股票数据
     */
    async getStockData(ticker) {
        const cacheKey = `stock_${ticker}`;
        const cached = this._getFromCache(cacheKey);
        if (cached) return cached;

        // 模拟网络延迟
        await this._delay(100);

        const name = CONFIG.AI_STOCKS[ticker] || CONFIG.POWER_STOCKS[ticker] || ticker;
        const data = this.generateStockData(ticker, name);
        
        this._setCache(cacheKey, data);
        return data;
    }

    /**
     * 获取指数数据
     */
    async getIndexData(symbol) {
        const cacheKey = `index_${symbol}`;
        const cached = this._getFromCache(cacheKey);
        if (cached) return cached;

        await this._delay(80);

        const name = CONFIG.MARKET_INDICES[symbol] || symbol;
        const data = this.generateIndexData(symbol, name);
        
        this._setCache(cacheKey, data);
        return data;
    }

    /**
     * 获取恐惧贪婪指数
     */
    async getFearGreedIndex() {
        const cacheKey = "fear_greed";
        const cached = this._getFromCache(cacheKey);
        if (cached) return cached;

        await this._delay(150);

        // 生成 0-100 的分数
        const score = Math.round(Math.random() * 100);
        const level = this._interpretFearGreed(score);

        const data = {
            score: score,
            level: level,
            timestamp: new Date(),
        };

        this._setCache(cacheKey, data);
        return data;
    }

    /**
     * 获取 VIX 指数
     */
    async getVIX() {
        return await this.getIndexData('^VIX');
    }

    /**
     * 批量获取股票数据
     */
    async batchGetStocks(tickers) {
        const results = {};
        for (const ticker of tickers) {
            results[ticker] = await this.getStockData(ticker);
            await this._delay(50); // 模拟请求间隔
        }
        return results;
    }

    /**
     * 判断是否市场开盘
     */
    isMarketOpen() {
        const now = new Date();
        const day = now.getDay();
        // 周六日休市
        return day !== 0 && day !== 6;
    }

    // ==================== 私有方法 ====================

    _getFromCache(key) {
        if (this.cache[key] && this.cache[key].time) {
            if (Date.now() - this.cache[key].time < this.cacheDuration) {
                return this.cache[key].data;
            }
        }
        return null;
    }

    _setCache(key, value) {
        this.cache[key] = {
            data: value,
            time: Date.now(),
        };
    }

    _interpretFearGreed(score) {
        if (score < 25) return "极度恐惧";
        if (score < 45) return "恐惧";
        if (score <= 55) return "中性";
        if (score <= 75) return "贪婪";
        return "极度贪婪";
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ==================== 新闻抓取器 ====================
class NewsScraper {
    constructor() {
        this.mockNews = {
            ai: [
                {
                    title: 'NVIDIA股价创新高，AI芯片需求持续强劲',
                    summary: 'NVIDIA第四季度营收超预期，数据中心业务增长强劲。分析师普遍上调目标价，认为AI基础设施建设仍处于早期阶段。CEO黄仁勋表示，生成式AI正在推动计算需求的结构性转变。',
                    source: 'Yahoo Finance',
                    link: '#'
                },
                {
                    title: 'Microsoft AI业务增长迅速，Copilot用户突破新高',
                    summary: 'Microsoft最新财报显示，AI相关收入已成为增长主要驱动力。Copilot for Microsoft 365订阅数持续攀升，Azure AI服务使用量同比翻倍。公司预计下一季度AI业务将继续保持高速增长。',
                    source: 'Seeking Alpha',
                    link: '#'
                },
                {
                    title: 'Google发布新一代Gemini模型，挑战OpenAI领先地位',
                    summary: 'Google DeepMind发布Gemini Ultra版本，在多项基准测试中超越GPT-4。分析师认为这是Google在AI竞赛中的重要里程碑，有助于提升其云业务竞争力。股价盘后上涨2%。',
                    source: 'CNBC',
                    link: '#'
                },
            ],
            power: [
                {
                    title: '数据中心电力需求激增，核能股受追捧',
                    summary: '随着AI数据中心建设加速，电力需求预测大幅上调。Constellation Energy和Vistra等核能及电力供应商股价近期表现亮眼。分析师预计这一趋势将持续到2030年。',
                    source: 'MarketWatch',
                    link: '#'
                },
                {
                    title: 'CEG获大型数据中心供电合同，订单积压创新高',
                    summary: 'Constellation Energy宣布与多家科技巨头签署长期供电协议，为公司核电机组提供稳定收入。CEO表示这是公司历史上最大的订单增长期，预计未来将加大在核电重启方面的投资。',
                    source: 'Bloomberg',
                    link: '#'
                },
            ],
            market: [
                {
                    title: '美联储暗示年内可能降息，市场情绪回暖',
                    summary: '最新美联储会议纪要显示，多数委员认为如果通胀继续回落，年内启动降息是合适的。市场对此反应积极，科技股领涨，标普500指数逼近历史高点。',
                    source: 'Financial Times',
                    link: '#'
                },
                {
                    title: '纳斯达克突破关键阻力位，技术分析师看好后市',
                    summary: '纳斯达克指数突破17000点关口，成交量配合放大。技术分析师指出，AI热潮和流动性改善是主要推动力，建议关注半导体和软件板块的配置机会。',
                    source: 'Barron\'s',
                    link: '#'
                },
            ]
        };
    }

    /**
     * 获取所有新闻
     */
    async fetchAllNews(useMock = false) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (useMock) {
            return this.mockNews;
        }

        // 实际应用中这里会抓取 RSS
        // 由于浏览器 CORS 限制，这里返回模拟数据
        return this.mockNews;
    }

    /**
     * 生成随机新闻（用于刷新时变化）
     */
    async generateRandomNews() {
        const titles = {
            ai: [
                'AI芯片出货量超预期，供应链紧张持续',
                '大型科技公司加大AI基础设施投资',
                '生成式AI应用场景快速扩展',
                'AI模型训练成本大幅下降，效率提升',
                '边缘AI芯片市场迎来爆发期',
            ],
            power: [
                '可再生能源并网速度加快',
                '电网升级投资计划获批',
                '储能技术成本持续下降',
                '智能电网建设提速',
                '电力市场化改革深化',
            ],
            market: [
                '通胀数据符合预期，市场反应平淡',
                '就业数据强劲，经济软着陆预期升温',
                '企业盈利普遍超预期',
                '全球股市同步上涨',
                '债券收益率曲线趋陡',
            ]
        };

        const summaries = {
            ai: [
                'AI行业继续保持高速增长态势，多家头部企业财报显示AI业务贡献显著提升。',
                '技术突破推动AI应用落地加速，各行各业数字化转型需求旺盛。',
                '资本持续涌入AI赛道，初创公司估值屡创新高。',
            ],
            power: [
                '能源转型政策支持下，清洁能源占比持续提升。',
                '电力需求结构发生变化，数据中心用电占比快速上升。',
                '传统能源企业积极转型，加大新能源领域投资。',
            ],
            market: [
                '宏观经济数据释放积极信号，市场风险偏好回升。',
                '货币政策预期趋于稳定，流动性环境友好。',
                '地缘政治风险缓解，全球贸易活动回暖。',
            ]
        };

        const sources = ['Yahoo Finance', 'Bloomberg', 'Reuters', 'CNBC', 'MarketWatch', 'Financial Times'];

        const generateRandomItem = (category) => ({
            title: titles[category][Math.floor(Math.random() * titles[category].length)],
            summary: summaries[category][Math.floor(Math.random() * summaries[category].length)],
            source: sources[Math.floor(Math.random() * sources.length)],
            link: '#'
        });

        return {
            ai: [generateRandomItem('ai'), generateRandomItem('ai'), generateRandomItem('ai')],
            power: [generateRandomItem('power'), generateRandomItem('power')],
            market: [generateRandomItem('market'), generateRandomItem('market')],
        };
    }
}

// ==================== 导出实例 ====================
const dataFetcher = new DataFetcher();
const newsScraper = new NewsScraper();
