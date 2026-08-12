# 立德引擎 Lide Engine — 官网

面向中国出海工厂的 GEO（生成式引擎优化）服务商官网。纯静态站点，无需构建。

## 页面结构

| 文件 | 说明 |
|---|---|
| `index.html` | 首页：定位 → 痛点 → 解决方案 → 流程 → 差异化 → 档位 → CTA |
| `method.html` | 方法论：GEO vs SEO、三项核心能力、四阶段交付、效果衡量 |
| `pricing.html` | 服务档位：三档详情 + 对照表 + 投入回报 FAQ |
| `cases.html` | 客户实证：匿名案例、量化价值、客户画像 |
| `about.html` | 关于我们：定位、行业对标、FAQ（含 FAQPage 结构化数据） |
| `contact.html` | 免费《AI 能见度诊断报告》留资表单（Netlify Forms） |
| `thanks.html` | 表单提交成功页 |
| `assets/style.css` | 设计系统（Trust & Authority：navy #1E3A5F + gold #A16207） |
| `assets/main.js` | 移动端导航、滚动揭示、数字滚动 |

## GEO / SEO 基础设施

本站自身即为交付能力的样板间：

- **JSON-LD 结构化数据**：Organization / Service / OfferCatalog / WebSite / FAQPage / ContactPage
- **`robots.txt`**：显式放行 GPTBot、ClaudeBot、PerplexityBot、Google-Extended 等 AI 爬虫
- **`llms.txt`**：为大模型准备的站点事实摘要
- **`sitemap.xml`**：全站页面索引
- 语义化 HTML、canonical、OG 标签、WCAG AA 对比度、`prefers-reduced-motion` 支持

## 部署

Netlify 直接部署，无需构建命令，发布目录为仓库根目录（见 `netlify.toml`）。

表单使用 Netlify Forms（`data-netlify="true"`），提交后跳转 `/thanks.html`，在 Netlify 后台 Forms 面板查看留资。

## 上线前待替换

- [ ] 域名：购买正式域名后，全站 `https://ileadengine.com` 替换为新域名（canonical / sitemap / llms.txt / JSON-LD），并在 Netlify 配置自定义域名 + 301 跳转
- [x] 联系方式：jiangjun199613@gmail.com、+86 189 5017 4503、+1 619-558-6563
- [ ] 案例配图：模型实测截图、工厂实景、参展照片
- [ ] 备案号与公司注册信息（页脚）
