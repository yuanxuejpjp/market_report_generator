/**
 * 主应用逻辑 - 报告生成器
 * 对应原 Python 版本的 report_generator.py
 */

class ReportApp {
    constructor() {
        this.fetcher = dataFetcher;
        this.scraper = newsScraper;
        this.currentData = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDate();
        this.loadReport();
    }

    bindEvents() {
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadReport();
        });

        document.getElementById('mock-btn').addEventListener('click', () => {
            this.loadReport(true);
        });

        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportMarkdown();
        });
    }

    /**
     * 更新日期显示
     */
    updateDate() {
        const now = new Date();
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const dateStr = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日 ${weekdays[now.getDay()]}`;
        document.getElementById('report-date').textContent = dateStr;

        // 更新页脚时间
        document.getElementById('footer-time').textContent = 
            `报告生成时间: ${now.toLocaleString('zh-CN')}`;

        // 更新市场状态
        const isOpen = this.fetcher.isMarketOpen();
        const statusEl = document.getElementById('market-status');
        statusEl.textContent = isOpen ? '🟢 交易中' : '⚪ 休市';
        statusEl.className = `market-status ${isOpen ? 'open' : 'closed'}`;
    }

    /**
     * 加载报告
     */
    async loadReport(useMock = false) {
        this.showLoading(true);

        try {
            // 获取所有数据
            const [
                marketData,
                aiData,
                powerData,
                fearGreed,
                vix,
                news
            ] = await Promise.all([
                this.getMarketData(),
                this.getSectorData(CONFIG.AI_STOCKS),
                this.getSectorData(CONFIG.POWER_STOCKS),
                this.fetcher.getFearGreedIndex(),
                this.fetcher.getVIX(),
                useMock ? this.scraper.fetchAllNews(true) : this.scraper.generateRandomNews()
            ]);

            // 保存当前数据
            this.currentData = {
                marketData,
                aiData,
                powerData,
                fearGreed,
                vix,
                news,
                timestamp: new Date()
            };

            // 渲染报告
            this.renderReport(this.currentData);
            this.updateDate();

        } catch (error) {
            console.error('加载报告失败:', error);
            alert('加载数据失败，请重试');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * 获取市场数据
     */
    async getMarketData() {
        const data = {};
        for (const [symbol, name] of Object.entries(CONFIG.MARKET_INDICES)) {
            data[symbol] = await this.fetcher.getIndexData(symbol);
        }
        return data;
    }

    /**
     * 获取板块数据
     */
    async getSectorData(stocks) {
        return await this.fetcher.batchGetStocks(Object.keys(stocks));
    }

    /**
     * 渲染报告
     */
    renderReport(data) {
        this.renderMarketTable(data.marketData);
        this.renderIndicators(data.fearGreed, data.vix);
        this.renderStockTable('ai-table', data.aiData, ['NVDA', 'MSFT', 'GOOGL', 'AMD', 'TSLA', 'TSM']);
        this.renderStockTable('power-table', data.powerData, ['CEG', 'VST']);
        this.renderAnalysis('ai-analysis', data.aiData);
        this.renderAnalysis('power-analysis', data.powerData);
        this.renderNews(data.news);
        this.renderSummary(data);
    }

    /**
     * 渲染市场指数表格
     */
    renderMarketTable(marketData) {
        const tbody = document.querySelector('#market-table tbody');
        tbody.innerHTML = '';

        const indexOrder = ['^GSPC', '^IXIC', '^DJI', '^VIX'];
        
        for (const symbol of indexOrder) {
            const data = marketData[symbol];
            if (!data) continue;

            const row = document.createElement('tr');
            const changeClass = data.change > 0 ? 'positive' : data.change < 0 ? 'negative' : 'neutral';
            const emoji = data.change > 0 ? '🟢' : data.change < 0 ? '🔴' : '⚪';
            
            row.innerHTML = `
                <td>${data.name}</td>
                <td>${this.formatNumber(data.current)}</td>
                <td class="${changeClass}">${emoji} ${data.change > 0 ? '+' : ''}${data.change.toFixed(2)}</td>
                <td class="${changeClass}">${data.change_pct > 0 ? '+' : ''}${data.change_pct.toFixed(2)}%</td>
            `;
            tbody.appendChild(row);
        }
    }

    /**
     * 渲染情绪指标
     */
    renderIndicators(fearGreed, vix) {
        if (fearGreed) {
            document.getElementById('fear-greed').textContent = fearGreed.score;
            const levelEl = document.getElementById('fear-greed-level');
            levelEl.textContent = fearGreed.level;
            levelEl.className = 'indicator-level ' + this.getFearGreedClass(fearGreed.score);
        }

        if (vix) {
            document.getElementById('vix-value').textContent = this.formatNumber(vix.current);
        }
    }

    /**
     * 获取恐惧贪婪指数样式类
     */
    getFearGreedClass(score) {
        if (score < 25) return 'level-extreme-fear';
        if (score < 45) return 'level-fear';
        if (score <= 55) return 'level-neutral';
        if (score <= 75) return 'level-greed';
        return 'level-extreme-greed';
    }

    /**
     * 渲染股票表格
     */
    renderStockTable(tableId, stockData, tickers) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        tbody.innerHTML = '';

        for (const ticker of tickers) {
            const data = stockData[ticker];
            if (!data) continue;

            const row = document.createElement('tr');
            const changeClass = data.change_pct > 0 ? 'positive' : data.change_pct < 0 ? 'negative' : 'neutral';
            const trend = this.getTrend(data.rsi);

            row.innerHTML = `
                <td><strong>${ticker}</strong></td>
                <td>${data.name}</td>
                <td>$${data.current_price.toFixed(2)}</td>
                <td class="${changeClass}">${data.change_pct > 0 ? '+' : ''}${data.change_pct.toFixed(2)}%</td>
                <td>${data.rsi.toFixed(1)}</td>
                <td>${trend}</td>
            `;
            tbody.appendChild(row);
        }
    }

    /**
     * 获取趋势判断
     */
    getTrend(rsi) {
        if (rsi > 70) return '超买';
        if (rsi < 30) return '超卖';
        return '中性';
    }

    /**
     * 渲染板块分析
     */
    renderAnalysis(elementId, sectorData) {
        const container = document.getElementById(elementId);
        container.innerHTML = '';

        // 计算平均涨跌幅
        const changes = Object.values(sectorData)
            .map(d => d.change_pct)
            .filter(c => c !== null);

        if (changes.length > 0) {
            const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
            const li = document.createElement('li');
            li.innerHTML = `板块今日平均涨跌幅: <strong>${avgChange > 0 ? '+' : ''}${avgChange.toFixed(2)}%</strong>`;
            container.appendChild(li);
        }

        // 找出最强和最弱
        const entries = Object.entries(sectorData).filter(([_, d]) => d && d.change_pct !== null);
        if (entries.length > 0) {
            const best = entries.reduce((a, b) => a[1].change_pct > b[1].change_pct ? a : b);
            const worst = entries.reduce((a, b) => a[1].change_pct < b[1].change_pct ? a : b);

            const bestLi = document.createElement('li');
            bestLi.innerHTML = `板块最强: <strong>${best[0]}</strong> (${best[1].change_pct > 0 ? '+' : ''}${best[1].change_pct.toFixed(2)}%)`;
            container.appendChild(bestLi);

            const worstLi = document.createElement('li');
            worstLi.innerHTML = `板块最弱: <strong>${worst[0]}</strong> (${worst[1].change_pct > 0 ? '+' : ''}${worst[1].change_pct.toFixed(2)}%)`;
            container.appendChild(worstLi);
        }
    }

    /**
     * 渲染新闻
     */
    renderNews(news) {
        this.renderNewsSection('ai-news', news.ai);
        this.renderNewsSection('power-news', news.power);
        this.renderNewsSection('market-news', news.market);
    }

    renderNewsSection(elementId, articles) {
        const container = document.getElementById(elementId);
        container.innerHTML = '';

        if (!articles || articles.length === 0) {
            container.innerHTML = '<p class="text-secondary">暂无相关资讯</p>';
            return;
        }

        articles.forEach((article, index) => {
            const div = document.createElement('div');
            div.className = 'news-item';
            div.innerHTML = `
                <div class="news-title">${index + 1}. ${article.title}</div>
                <div class="news-summary">${article.summary || article.title}</div>
                <div class="news-source">来源: ${article.source}</div>
            `;
            container.appendChild(div);
        });
    }

    /**
     * 渲染总结
     */
    renderSummary(data) {
        const container = document.getElementById('summary');
        container.innerHTML = '';

        // 市场情绪
        if (data.fearGreed) {
            const li = document.createElement('li');
            const level = data.fearGreed.level;
            const score = data.fearGreed.score;
            let sentimentText = '';
            
            if (score > 75) sentimentText = `极度贪婪 (${score})，需警惕短期回调风险`;
            else if (score > 55) sentimentText = `贪婪 (${score})，市场乐观情绪高涨`;
            else if (score > 45) sentimentText = `中性 (${score})，建议观望或逢低布局`;
            else if (score > 25) sentimentText = `恐惧 (${score})，可能存在超跌机会`;
            else sentimentText = `极度恐惧 (${score})，反向操作窗口期`;
            
            li.innerHTML = `<strong>市场情绪</strong>: ${sentimentText}`;
            container.appendChild(li);
        }

        // 大盘走势
        const spx = data.marketData['^GSPC'];
        const nasdaq = data.marketData['^IXIC'];
        if (spx && nasdaq) {
            const li = document.createElement('li');
            const spxChange = spx.change_pct;
            const nasdaqChange = nasdaq.change_pct;
            
            let trendText = '';
            if (spxChange > 0 && nasdaqChange > 0) {
                trendText = `美股全线上涨，S&P 500 (${spxChange > 0 ? '+' : ''}${spxChange.toFixed(2)}%) 与纳斯达克 (${nasdaqChange > 0 ? '+' : ''}${nasdaqChange.toFixed(2)}%) 同步走高`;
            } else if (spxChange < 0 && nasdaqChange < 0) {
                trendText = `美股全线下跌，S&P 500 (${spxChange.toFixed(2)}%) 与纳斯达克 (${nasdaqChange.toFixed(2)}%) 同步走低`;
            } else {
                trendText = `美股分化，S&P 500 (${spxChange > 0 ? '+' : ''}${spxChange.toFixed(2)}%) vs 纳斯达克 (${nasdaqChange > 0 ? '+' : ''}${nasdaqChange.toFixed(2)}%)`;
            }
            
            li.innerHTML = `<strong>大盘走势</strong>: ${trendText}`;
            container.appendChild(li);
        }

        // AI板块
        const aiChanges = Object.values(data.aiData)
            .map(d => d.change_pct)
            .filter(c => c !== null);
        if (aiChanges.length > 0) {
            const avgChange = aiChanges.reduce((a, b) => a + b, 0) / aiChanges.length;
            const li = document.createElement('li');
            let aiText = '';
            
            if (avgChange > 1) {
                aiText = `表现强势，平均涨幅 ${avgChange.toFixed(2)}%，AI基础设施建设需求持续驱动`;
            } else if (avgChange < -1) {
                aiText = `出现调整，平均跌幅 ${avgChange.toFixed(2)}%，关注支撑位的承接力度`;
            } else {
                aiText = `窄幅震荡，平均涨跌幅 ${avgChange.toFixed(2)}%，等待方向选择`;
            }
            
            li.innerHTML = `<strong>AI板块</strong>: ${aiText}`;
            container.appendChild(li);
        }

        // 电力板块
        const powerChanges = Object.values(data.powerData)
            .map(d => d.change_pct)
            .filter(c => c !== null);
        if (powerChanges.length > 0) {
            const avgChange = powerChanges.reduce((a, b) => a + b, 0) / powerChanges.length;
            const li = document.createElement('li');
            let powerText = '';
            
            if (avgChange > 1) {
                powerText = `表现活跃，平均涨幅 ${avgChange.toFixed(2)}%，受益于数据中心电力需求预期`;
            } else if (avgChange < -1) {
                powerText = `出现回调，平均跌幅 ${avgChange.toFixed(2)}%`;
            } else {
                powerText = `走势平稳，平均涨跌幅 ${avgChange.toFixed(2)}%`;
            }
            
            li.innerHTML = `<strong>电力板块</strong>: ${powerText}`;
            container.appendChild(li);
        }
    }

    /**
     * 导出 Markdown
     */
    exportMarkdown() {
        if (!this.currentData) {
            alert('请先生成报告');
            return;
        }

        const report = this.generateMarkdown(this.currentData);
        const blob = new Blob([report], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily_report_${this.formatDateFile()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 生成 Markdown 报告
     */
    generateMarkdown(data) {
        const now = new Date();
        const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const dateStr = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日 ${weekdays[now.getDay() - 1]}`;
        const isOpen = this.fetcher.isMarketOpen();

        let md = `# 📊 每日市场分析报告\n\n`;
        md += `**报告日期**: ${dateStr}  \n`;
        md += `**生成时间**: ${now.toLocaleTimeString('zh-CN')}  \n`;
        md += `**市场状态**: ${isOpen ? '🟢 交易中' : '⚪ 休市'}\n\n`;
        md += `---\n\n`;

        // 市场概览
        md += `## 📈 市场概览\n\n`;
        md += `### 大盘指数\n\n`;
        md += `| 指数 | 当前点位 | 日涨跌 | 涨跌幅 |\n`;
        md += `|------|----------|--------|--------|\n`;
        
        const indexOrder = ['^GSPC', '^IXIC', '^DJI', '^VIX'];
        for (const symbol of indexOrder) {
            const d = data.marketData[symbol];
            if (d) {
                const emoji = d.change > 0 ? '🟢' : d.change < 0 ? '🔴' : '⚪';
                md += `| ${d.name} | ${this.formatNumber(d.current)} | ${emoji} ${d.change > 0 ? '+' : ''}${d.change.toFixed(2)} | ${d.change_pct > 0 ? '+' : ''}${d.change_pct.toFixed(2)}% |\n`;
            }
        }

        md += `\n### 市场情绪指标\n\n`;
        if (data.fearGreed) {
            md += `- **CNN 恐惧贪婪指数**: ${data.fearGreed.score} (${data.fearGreed.level})\n`;
        }
        if (data.vix) {
            md += `- **VIX 波动率指数**: ${this.formatNumber(data.vix.current)}\n`;
        }

        // AI板块
        md += `\n---\n\n## 🤖 AI 板块分析\n\n`;
        md += `### 重点股票表现\n\n`;
        md += `| 股票 | 公司名称 | 当前价格 | 日涨跌 | RSI | 趋势 |\n`;
        md += `|------|----------|----------|--------|-----|------|\n`;
        
        for (const ticker of ['NVDA', 'MSFT', 'GOOGL', 'AMD', 'TSLA', 'TSM']) {
            const d = data.aiData[ticker];
            if (d) {
                const trend = this.getTrend(d.rsi);
                md += `| ${ticker} | ${d.name} | $${d.current_price.toFixed(2)} | ${d.change_pct > 0 ? '+' : ''}${d.change_pct.toFixed(2)}% | ${d.rsi.toFixed(1)} | ${trend} |\n`;
            }
        }

        // 电力板块
        md += `\n---\n\n## ⚡ 电力板块分析\n\n`;
        md += `### 重点股票表现\n\n`;
        md += `| 股票 | 公司名称 | 当前价格 | 日涨跌 | RSI | 趋势 |\n`;
        md += `|------|----------|----------|--------|-----|------|\n`;
        
        for (const ticker of ['CEG', 'VST']) {
            const d = data.powerData[ticker];
            if (d) {
                const trend = this.getTrend(d.rsi);
                md += `| ${ticker} | ${d.name} | $${d.current_price.toFixed(2)} | ${d.change_pct > 0 ? '+' : ''}${d.change_pct.toFixed(2)}% | ${d.rsi.toFixed(1)} | ${trend} |\n`;
            }
        }

        // 新闻资讯
        md += `\n---\n\n## 📰 市场资讯要点\n\n`;
        
        if (data.news.ai && data.news.ai.length > 0) {
            md += `### AI 板块相关\n\n`;
            data.news.ai.forEach((article, i) => {
                md += `**${i + 1}. ${article.title}**\n\n`;
                md += `> ${article.summary || article.title}\n`;
                md += `> \n`;
                md += `> *来源: ${article.source}*\n\n`;
            });
        }

        // 总结
        md += `\n---\n\n## 💡 今日要点总结\n\n`;
        const summaryList = document.querySelectorAll('#summary li');
        summaryList.forEach(li => {
            md += `- ${li.innerHTML.replace(/<[^>]+>/g, '')}\n`;
        });

        // 免责声明
        md += `\n---\n\n`;
        md += `*免责声明：本报告仅供参考，不构成投资建议。投资有风险，入市需谨慎。*\n`;
        md += `*数据来源：Yahoo Finance, CNN Fear & Greed Index, 各大财经媒体*\n`;
        md += `*报告生成时间: ${now.toLocaleString('zh-CN')}*\n`;

        return md;
    }

    /**
     * 显示/隐藏加载状态
     */
    showLoading(show) {
        const loading = document.getElementById('loading');
        const content = document.getElementById('report-content');
        
        if (show) {
            loading.classList.remove('hidden');
            content.style.opacity = '0.5';
        } else {
            loading.classList.add('hidden');
            content.style.opacity = '1';
        }
    }

    /**
     * 格式化数字
     */
    formatNumber(num) {
        if (num === null || num === undefined) return 'N/A';
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    /**
     * 格式化日期（文件名）
     */
    formatDateFile() {
        const now = new Date();
        return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    new ReportApp();
});
