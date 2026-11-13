#!/usr/bin/env python3
"""立德引擎 · 动态文章发布脚本

用法：
  python3 tools/publish.py next                 # 打印下一个待写的关键词（JSON）
  python3 tools/publish.py publish article.json # 生成 /news/<slug>.html 并更新 news.html、feed.xml、sitemap.xml

article.json 字段：
  n            关键词编号（tools/keywords.tsv 的 n）
  title        文章标题（H1）
  description  120–160 字摘要（首句直接给结论）
  tag          标签：概念解读 / 实操技巧 / 行业方案 / 行业观察 / 新手指南 / 对比分析
  keywords     关键词数组（5–10 个）
  body_html    正文 HTML（不含标题；用 <p> <h2> <h3> <ul> <table> 等）
  faq          [{"q": "...", "a": "..."}]，3–5 条，会渲染在正文后并生成 FAQPage 结构化数据
  sources      [{"title": "...", "url": "..."}]，可选，渲染为“参考来源”
  published    可选，ISO 时间，默认当前北京时间
"""
import csv, html, json, re, sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://ileadengine.com"
CST = timezone(timedelta(hours=8))
NEWS = ROOT / "news.html"
LIST_START, LIST_END = "<!-- NEWS-LIST:START -->", "<!-- NEWS-LIST:END -->"


def keywords():
    with open(ROOT / "tools" / "keywords.tsv", encoding="utf-8") as f:
        return list(csv.DictReader(f, delimiter="\t"))


def next_keyword():
    for row in keywords():
        if not (ROOT / "news" / f"{row['slug']}.html").exists():
            return row
    return None


def absolutize(fragment):
    """把 news.html 里相对路径的链接改成站点根路径，供 /news/ 子目录使用。"""
    return re.sub(r'(href|src)=(["\'])(?!https?:|mailto:|tel:|#|/|data:|javascript:)',
                  r'\1=\2/', fragment)


def esc(s):
    return html.escape(s, quote=True)


def build_page(a, kw, pub):
    src = NEWS.read_text(encoding="utf-8")
    style = re.search(r"<style>.*?</style>", src, re.S).group(0)
    stylesheet = re.search(r'<link rel="stylesheet"[^>]*>', src).group(0)
    header = src[src.index("<body>"): src.index("<main>") + len("<main>")]
    footer = src[src.index("</main>"):]
    url = f"{SITE}/news/{kw['slug']}.html"
    date = pub.strftime("%Y-%m-%d")

    faq_html = ""
    if a.get("faq"):
        faq_html = "<h2>常见问题</h2>\n" + "\n".join(
            f"<p><strong>问：{esc(x['q'])}</strong><br>\n答：{x['a']}</p>" for x in a["faq"])
    src_html = ""
    if a.get("sources"):
        src_html = ('<div class="post-src"><strong>参考来源</strong><ul>' + "".join(
            f'<li><a href="{esc(s["url"])}" target="_blank" rel="noopener">{esc(s["title"])}</a></li>'
            for s in a["sources"]) + "</ul></div>")

    graph = [
        {"@type": "BlogPosting", "@id": url, "mainEntityOfPage": url, "headline": a["title"],
         "description": a["description"], "keywords": a.get("keywords", []), "inLanguage": "zh-CN",
         "datePublished": pub.isoformat(), "dateModified": pub.isoformat(),
         "image": f"{SITE}/og-cover.jpg",
         "author": {"@type": "Person", "@id": f"{SITE}/about.html#founder", "name": "蒋军",
                    "url": f"{SITE}/about.html#founder"},
         "publisher": {"@type": "Organization", "name": "立德引擎", "url": SITE,
                       "logo": {"@type": "ImageObject", "url": f"{SITE}/logo.png"}}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "首页", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": "动态与行业观察", "item": f"{SITE}/news.html"},
            {"@type": "ListItem", "position": 3, "name": a["title"], "item": url}]},
    ]
    if a.get("faq"):
        graph.append({"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": x["q"],
             "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"<[^>]+>", "", x["a"])}}
            for x in a["faq"]]})
    ld = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2)
    t, d = esc(a["title"]), esc(a["description"])

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t} | 立德引擎</title>
<meta name="description" content="{d}">
<meta name="keywords" content="{esc(','.join(a.get('keywords', [])))}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="立德引擎 Lead Engine">
<meta property="og:locale" content="zh_CN">
<meta property="og:image" content="{SITE}/og-cover.jpg">
<meta property="article:published_time" content="{pub.isoformat()}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{t}">
<meta name="twitter:description" content="{d}">
<meta name="twitter:image" content="{SITE}/og-cover.jpg">
<meta name="theme-color" content="#2B5BFF">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/lexend-latin.woff2" as="font" type="font/woff2" crossorigin>
{absolutize(stylesheet)}
{style}
<script type="application/ld+json">
{ld}
</script>
<link rel="alternate" type="application/rss+xml" title="立德引擎 动态与研究报告" href="{SITE}/feed.xml">
</head>
{absolutize(header)}

<article class="section" id="{kw['slug']}" data-kw="{kw['n']}">
  <div class="container" style="max-width:820px">
    <div class="reveal">
      <p class="post-meta" style="margin-bottom:8px"><a href="/news.html">← 返回动态</a></p>
      <div class="post-meta"><span class="post-tag">{esc(a.get('tag', '行业观察'))}</span><time datetime="{date}">{date}</time><span class="post-author">作者 <a href="/about.html#founder" rel="author">蒋军</a></span></div>
      <h1 style="font-size:clamp(1.6rem,3vw,2.2rem)">{t}</h1>
{a['body_html']}
{faq_html}
{src_html}
    </div>
  </div>
</article>
<aside class="inline-cta reveal">
  <div class="inline-cta-txt"><strong>先看看 AI 现在怎么回答你的品类</strong><p>用海外买家的真实问法实测你的品牌与品类，3 个工作日交付带截图的《AI 能见度诊断报告》，免费。</p></div>
  <div class="btn-row"><a class="btn btn--primary" href="/contact.html">免费领取诊断报告</a><a class="btn btn--ghost" href="/news.html">更多动态 →</a></div>
</aside>
{absolutize(footer)}"""


def update_news_list(a, kw, pub):
    src = NEWS.read_text(encoding="utf-8")
    item = (f'  <li><time datetime="{pub:%Y-%m-%d}">{pub:%Y-%m-%d}</time><div>'
            f'<h3><a href="news/{kw["slug"]}.html">{esc(a["title"])}</a></h3>'
            f'<p>{esc(a["description"])}</p></div></li>\n')
    if LIST_START not in src:
        block = (f'\n{LIST_START}\n<section class="section" id="latest" style="padding-top:var(--space-md)">\n'
                 '  <div class="container" style="max-width:820px">\n'
                 '    <h2 style="font-size:clamp(1.3rem,2.4vw,1.7rem)">最新文章</h2>\n'
                 '    <ul class="log">\n    </ul>\n  </div>\n</section>\n'
                 f'{LIST_END}\n')
        hero_end = src.index("</section>", src.index('class="hero')) + len("</section>")
        src = src[:hero_end] + block + src[hero_end:]
    anchor = src.index('<ul class="log">', src.index(LIST_START)) + len('<ul class="log">\n')
    src = src[:anchor] + item + src[anchor:]
    NEWS.write_text(src, encoding="utf-8")


def update_feed(a, kw, pub):
    p = ROOT / "feed.xml"
    src = p.read_text(encoding="utf-8")
    rfc = pub.strftime("%a, %d %b %Y %H:%M:%S +0800")
    url = f"{SITE}/news/{kw['slug']}.html"
    item = (f"<item>\n<title>{esc(a['title'])}</title>\n<link>{url}</link>\n"
            f'<guid isPermaLink="true">{url}</guid>\n<pubDate>{rfc}</pubDate>\n'
            f"<author>sales@ileadengine.com (蒋军)</author>\n"
            f"<description>{esc(a['description'])}</description>\n</item>\n")
    src = re.sub(r"<lastBuildDate>.*?</lastBuildDate>", f"<lastBuildDate>{rfc}</lastBuildDate>", src, count=1)
    i = src.index("<item>")
    p.write_text(src[:i] + item + src[i:], encoding="utf-8")


def update_sitemap(kw, pub):
    p = ROOT / "sitemap.xml"
    src = p.read_text(encoding="utf-8")
    d = pub.strftime("%Y-%m-%d")
    src = re.sub(r"(<loc>https://ileadengine.com/news.html</loc><lastmod>)[^<]*", rf"\g<1>{d}", src)
    entry = (f"  <url><loc>{SITE}/news/{kw['slug']}.html</loc><lastmod>{d}</lastmod>"
             "<changefreq>monthly</changefreq><priority>0.6</priority></url>\n")
    p.write_text(src.replace("</urlset>", entry + "</urlset>"), encoding="utf-8")


def publish(path):
    a = json.loads(Path(path).read_text(encoding="utf-8"))
    for k in ("n", "title", "description", "body_html"):
        assert a.get(k), f"缺少字段 {k}"
    kw = next(r for r in keywords() if int(r["n"]) == int(a["n"]))
    out = ROOT / "news" / f"{kw['slug']}.html"
    assert not out.exists(), f"{out} 已存在，关键词 {kw['n']} 已发布过"
    pub = datetime.fromisoformat(a["published"]) if a.get("published") else datetime.now(CST).replace(microsecond=0)
    out.parent.mkdir(exist_ok=True)
    out.write_text(build_page(a, kw, pub), encoding="utf-8")
    update_news_list(a, kw, pub)
    update_feed(a, kw, pub)
    update_sitemap(kw, pub)
    print(json.dumps({"published": f"{SITE}/news/{kw['slug']}.html", "n": kw["n"], "title": a["title"]},
                     ensure_ascii=False))


if __name__ == "__main__":
    if sys.argv[1:2] == ["next"]:
        print(json.dumps(next_keyword(), ensure_ascii=False))
    elif sys.argv[1:2] == ["publish"]:
        publish(sys.argv[2])
    else:
        print(__doc__)
