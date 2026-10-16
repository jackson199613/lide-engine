/* 立德引擎 Lide Engine — site behaviour */
(function () {
  'use strict';

  // Mobile navigation ------------------------------------------------------
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Scroll reveal (respects reduced motion) --------------------------------
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          setTimeout(function () { el.classList.add('is-visible'); }, (i % 4) * 70);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  // Count-up on stats ------------------------------------------------------
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length && !reduced && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var prefix = el.getAttribute('data-prefix') || '';
        var decimals = (String(target).split('.')[1] || '').length;
        var start = null, dur = 1100;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(nums, function (el) { co.observe(el); });
  }

  // Current year -----------------------------------------------------------
  var y = document.querySelectorAll('[data-year]');
  Array.prototype.forEach.call(y, function (el) { el.textContent = new Date().getFullYear(); });
})();

/* Hero platform-name rotator ---------------------------------------------- */
(function () {
  var box = document.getElementById('rotator');
  if (!box) return;
  var items = box.querySelectorAll('span');
  if (items.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var i = 0;
  setInterval(function () {
    items[i].classList.remove('is-active');
    i = (i + 1) % items.length;
    items[i].classList.add('is-active');
  }, 2200);
})();

/* Cookie consent bar ------------------------------------------------------ */
(function () {
  var KEY = 'le_consent';
  var BAIDU_ID = '8c37eedbf705c47be64579f96c8256ad';

  function get(n) {
    var m = document.cookie.match('(^|;)\\s*' + n + '\\s*=\\s*([^;]+)');
    return m ? m.pop() : '';
  }
  function set(v) {
    document.cookie = KEY + '=' + v + ';path=/;max-age=' + (60 * 60 * 24 * 180) + ';SameSite=Lax';
  }

  // 统计脚本只在用户明确接受后加载。选「仅必要」或尚未选择时不加载——
  // 隐私政策里写了「统计 Cookie 你可以拒绝」，这里必须对得上。
  function loadAnalytics() {
    if (window.__leAnalytics) return;
    window.__leAnalytics = true;
    window._hmt = window._hmt || [];
    var hm = document.createElement('script');
    hm.src = 'https://hm.baidu.com/hm.js?' + BAIDU_ID;
    hm.async = true;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(hm, s);
  }

  if (get(KEY) === 'all') { loadAnalytics(); return; }
  if (get(KEY)) return;
  var bar = document.createElement('div');
  bar.className = 'cookiebar';
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', 'Cookie 同意');
  bar.innerHTML =
    '<p>本站仅使用保障功能的必要 Cookie 与匿名统计，不做广告追踪。详见'
    + '<a href="privacy.html">隐私政策</a>。</p>'
    + '<div class="btn-row"><button class="btn btn--ghost" data-c="essential">仅必要</button>'
    + '<button class="btn btn--primary" data-c="all">全部接受</button></div>';
  document.body.appendChild(bar);
  setTimeout(function () { bar.classList.add('is-on'); }, 700);
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('[data-c]');
    if (!b) return;
    var choice = b.getAttribute('data-c');
    set(choice);
    if (choice === 'all') loadAnalytics();
    bar.classList.remove('is-on');
    setTimeout(function () { bar.remove(); }, 500);
  });
})();

/* 在线客服浮窗 —— 留言提交到 Netlify Forms ------------------------------- */
(function () {
  var TOPICS = ['免费 AI 能见度诊断', '服务档位与报价', '我这个行业适不适合', '其他问题'];

  var fab = document.createElement('button');
  fab.className = 'chat-fab';
  fab.type = 'button';
  fab.setAttribute('aria-label', '在线咨询');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M21 11.5a8.4 8.4 0 01-9 8.4 8.9 8.9 0 01-4-.9L3 21l1.9-4.9A8.4 8.4 0 013 11.5a8.4 8.4 0 019-8.4 8.4 8.4 0 019 8.4z"/></svg>'
    + '<span class="badge">1</span>';
  document.body.appendChild(fab);

  var panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', '在线咨询');
  panel.innerHTML =
    '<div class="chat-head">'
    + '<button class="chat-close" type="button" aria-label="关闭">×</button>'
    + '<strong>立德引擎 · 在线咨询</strong>'
    + '<span><i class="dot"></i>工作日 9:00–18:00 · 1 个工作日内回复</span>'
    + '</div>'
    + '<div class="chat-body" id="chat-body">'
    + '<div class="chat-hello">你好，我是立德引擎的顾问。想了解 AI 能见度诊断，还是先聊聊你的品类？留个联系方式，我直接找你。</div>'
    + '<div class="chat-chips" id="chat-chips"></div>'
    + '<form id="chat-form">'
    + '<div class="field"><input type="text" name="name" placeholder="怎么称呼您？（如：张总 / 王经理）" required></div>'
    + '<div class="field"><input type="text" name="contact" placeholder="手机、微信或邮箱 *" required></div>'
    + '<div class="field"><textarea name="message" placeholder="主营产品品类，或想问的问题（选填）"></textarea></div>'
    + '<button class="btn btn--primary" type="submit">发送</button>'
    + '<p class="chat-alt">也可直接拨打 <a href="tel:+8618950174503">189 5017 4503</a></p>'
    + '</form></div>';
  document.body.appendChild(panel);

  var chips = panel.querySelector('#chat-chips');
  var picked = TOPICS[0];
  TOPICS.forEach(function (t, i) {
    var b = document.createElement('button');
    b.className = 'chat-chip' + (i === 0 ? ' is-on' : '');
    b.type = 'button';
    b.textContent = t;
    b.addEventListener('click', function () {
      picked = t;
      chips.querySelectorAll('.chat-chip').forEach(function (x) { x.classList.remove('is-on'); });
      b.classList.add('is-on');
    });
    chips.appendChild(b);
  });

  function open() { panel.classList.add('is-on'); var b = fab.querySelector('.badge'); if (b) b.remove(); }
  function close() { panel.classList.remove('is-on'); }
  fab.addEventListener('click', function () { panel.classList.contains('is-on') ? close() : open(); });
  panel.querySelector('.chat-close').addEventListener('click', close);
  var railBtn = document.getElementById('open-chat');
  if (railBtn) railBtn.addEventListener('click', open);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  panel.querySelector('#chat-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var btn = f.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = '发送中…';
    var data = {
      'form-name': 'chat',
      name: f.name.value,
      contact: f.contact.value,
      topic: picked,
      message: f.message.value,
      page: location.pathname
    };
    var body = Object.keys(data).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
    }).join('&');
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function () {
        document.getElementById('chat-body').innerHTML =
          '<div class="chat-done"><div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>'
          + '<strong style="display:block;color:var(--ink);font-size:1.05rem;margin-bottom:6px">已收到，稍后联系你</strong>'
          + '<span class="note">我们会在 1 个工作日内通过你留的方式回复。<br>着急的话直接拨 <a href="tel:+8618950174503">189 5017 4503</a>。</span></div>';
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = '发送失败，重试';
      });
  });
})();

/* 顶部滚动进度条 ---------------------------------------------------------- */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var bar = document.createElement('div');
  bar.className = 'scroll-bar';
  document.body.appendChild(bar);
  var ticking = false;
  function update() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();

/* Hero 鼠标跟随光晕 + 视差 ------------------------------------------------ */
(function () {
  var hero = document.querySelector('.hero');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  var glow = document.createElement('div');
  glow.className = 'hero-glow';
  hero.insertBefore(glow, hero.firstChild);

  var raf = null;
  hero.addEventListener('mousemove', function (e) {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      raf = null;
    });
  }, { passive: true });

  // 轻视差：aurora 背景随滚动微移
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        hero.style.setProperty('--par', (y * 0.12) + 'px');
      }
      ticking = false;
    });
  }, { passive: true });
})();

/* 首屏科技场景：粒子网络 + 标题逐字入场 --------------------------------- */
(function () {
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- 装饰层 --- */
  if (!reduced) {
    var floor = document.createElement('div');
    floor.className = 'hero-floor';
    hero.insertBefore(floor, hero.firstChild);

    var beams = document.createElement('div');
    beams.className = 'hero-beams';
    beams.innerHTML = '<i></i><i></i><i></i><i></i>';
    hero.insertBefore(beams, hero.firstChild);

    var ghost = document.createElement('div');
    ghost.className = 'hero-ghost';
    ghost.textContent = 'AI VISIBILITY';
    ghost.setAttribute('aria-hidden', 'true');
    hero.insertBefore(ghost, hero.firstChild);
  }

  /* --- 标题逐字入场 --- */
  var h1 = hero.querySelector('h1');
  if (h1 && !reduced) {
    var walk = function (node) {
      var out = [];
      node.childNodes.forEach(function (n) {
        if (n.nodeType === 3) {
          n.textContent.split('').forEach(function (ch) {
            if (ch === ' ') { out.push(document.createTextNode(' ')); return; }
            var s = document.createElement('span');
            s.className = 'h-char'; s.textContent = ch;
            out.push(s);
          });
        } else { out.push(n); }
      });
      return out;
    };
    var frag = document.createDocumentFragment();
    walk(h1).forEach(function (n) { frag.appendChild(n); });
    h1.innerHTML = ''; h1.appendChild(frag);
    var chars = h1.querySelectorAll('.h-char');
    Array.prototype.forEach.call(chars, function (c, i) {
      c.style.animationDelay = (i * 0.032 + 0.15) + 's';
      c.classList.add('in');
    });
  }

  /* --- 粒子网络 --- */
  if (reduced) return;
  var cv = document.createElement('canvas');
  cv.className = 'hero-canvas';
  cv.setAttribute('aria-hidden', 'true');
  hero.insertBefore(cv, hero.firstChild);
  var ctx = cv.getContext('2d');

  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var pts = [], LINK = 132, running = true, mouse = { x: -9999, y: -9999 };

  function size() {
    var r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var target = Math.min(88, Math.round(W * H / 15000));
    pts = [];
    for (var i = 0; i < target; i++) {
      pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
        r: Math.random() * 1.7 + .8
      });
    }
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      var dxm = p.x - mouse.x, dym = p.y - mouse.y;
      var dm = Math.sqrt(dxm * dxm + dym * dym);
      if (dm < 150) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = 'rgba(124,92,255,' + (0.22 * (1 - dm / 150)) + ')';
        ctx.lineWidth = 1; ctx.stroke();
      }

      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], dx = p.x - q.x, dy = p.y - q.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = 'rgba(43,91,255,' + (0.16 * (1 - d / LINK)) + ')';
          ctx.lineWidth = 1; ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(43,91,255,.45)';
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  hero.addEventListener('mousemove', function (e) {
    var r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  }, { passive: true });
  hero.addEventListener('mouseleave', function () { mouse.x = mouse.y = -9999; });

  var ro = new ResizeObserver(size);
  ro.observe(hero);
  size(); draw();

  // 滚出视口暂停，省电
  new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      running = e.isIntersecting;
      if (running) draw();
    });
  }, { threshold: 0 }).observe(hero);
})();

/* 开场页 Splash · 玻璃地球球体，点击进入 ----------------------------------
   主图：splash-orb.webp（玻璃球 + 发光地球 + 光带）；备用图：splash-orb-alt.webp（玻璃球 + 液体浪）。
   换图只需改下面 ORB 一行。图片背景已预处理为纯白，用正片叠底融进页面。
   第一幕：数据粒子从四周汇聚，球体由虚到实浮现，一道光扫过球面；
   第二幕（3.4s）：AI 平台在轨道上环绕（前后分层，有纵深），市场行亮起。 */
(function () {
  if (!document.body || document.body.dataset.intro !== 'on') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try { if (sessionStorage.getItem('le_splash')) return; } catch (e) {}

  var ORBS = {
    globe: { src: 'splash-orb', cx: 0.4988, cy: 0.4884, r: 0.3525 },
    wave:  { src: 'splash-orb-alt', cx: 0.4996, cy: 0.4860, r: 0.3373 }
  };
  var ORB = ORBS[document.body.dataset.introOrb] || ORBS.globe;

  var chars = '立德引擎'.split('').map(function (c, i) {
    return '<span style="animation-delay:' + (0.72 + i * 0.12) + 's">' + c + '</span>';
  }).join('');

  var el = document.createElement('div');
  el.className = 'splash';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', '立德引擎 · 进入官网');
  el.innerHTML =
      '<div class="sp-halo" aria-hidden="true"></div>'
    + '<div class="sp-shadow" aria-hidden="true"><i></i></div>'
    + '<canvas class="sp-fx sp-fx--back" aria-hidden="true"></canvas>'
    + '<div class="sp-orb" aria-hidden="true"><img alt="" decoding="async" fetchpriority="high"></div>'
    + '<div class="sp-gloss" aria-hidden="true"><i></i></div>'
    + '<canvas class="sp-fx sp-fx--front" aria-hidden="true"></canvas>'
    + '<div class="sp-veil"></div>'
    + '<button class="sp-skip" type="button">跳过 →</button>'
    + '<div class="sp-inner">'
    +   '<div class="sp-logo">'
    +     '<svg viewBox="0 0 40 40"><defs><linearGradient id="spg" x1="0" y1="0" x2="1" y2="1">'
    +     '<stop offset="0" stop-color="#2B5BFF"/><stop offset=".52" stop-color="#7C5CFF"/><stop offset="1" stop-color="#22D3EE"/>'
    +     '</linearGradient></defs><rect width="40" height="40" rx="11" fill="url(#spg)"/>'
    +     '<path d="M11 27V13h3.4v11.1H23V27H11z" fill="#fff"/><circle cx="27.5" cy="15" r="3.4" fill="#fff" opacity=".9"/></svg>'
    +   '</div>'
    +   '<h1 class="sp-name">' + chars + '</h1>'
    +   '<p class="sp-en">Lead Engine · GEO</p>'
    +   '<p class="sp-slogan">给出海工厂装一条<b>持续出询盘的产线</b></p>'
    +   '<div class="sp-markets"><i>欧美</i><i>东南亚</i><i>中东</i><i>南美</i></div>'
    +   '<div class="sp-plat"><i>ChatGPT</i><i>Perplexity</i><i>Claude</i><i>Gemini</i><i>Grok</i><i>DeepSeek</i></div>'
    +   '<button class="sp-enter" type="button">进入官网'
    +     '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'
    +   '</button>'
    + '</div>'
    + '<div class="sp-dots"><i class="on"></i><i></i></div>'
    + '<p class="sp-hint">点击任意位置进入</p>';

  document.body.appendChild(el);
  document.body.classList.add('splash-on');

  var t0 = performance.now();
  var orb = el.querySelector('.sp-orb'), img = orb.querySelector('img');
  var gloss = el.querySelector('.sp-gloss'), halo = el.querySelector('.sp-halo'), shadow = el.querySelector('.sp-shadow');
  var cvB = el.querySelector('.sp-fx--back'), cvF = el.querySelector('.sp-fx--front');
  var cB = cvB.getContext('2d'), cF = cvF.getContext('2d');
  var mono = getComputedStyle(document.body).getPropertyValue('--mono') || 'monospace';

  /* ---------- 布局：球心与半径（CSS 像素） ---------- */
  var W = 0, H = 0, CX = 0, CY = 0, R = 0, mobile = false;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  function place(node, size, cx, cy) {
    node.style.width = node.style.height = size + 'px';
    node.style.left = (cx - size / 2) + 'px';
    node.style.top = (cy - size / 2) + 'px';
  }
  function layout() {
    W = el.clientWidth; H = el.clientHeight; mobile = W < 900;
    if (mobile) { CX = W / 2; CY = H * 0.23; R = Math.min(W * 0.3, H * 0.15); }
    else { CX = W / 2 + Math.min(W * 0.2, 330); CY = H * 0.48; R = Math.min(H * 0.3, W * 0.18, 310); }
    [cvB, cvF].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    // 图片按球半径缩放，使图中球心落在 (CX, CY)
    var S = R / ORB.r;
    orb.style.width = orb.style.height = S + 'px';
    orb.style.left = (CX - ORB.cx * S) + 'px';
    orb.style.top = (CY - ORB.cy * S) + 'px';
    place(gloss, R * 2, CX, CY);
    place(halo, R * 3.4, CX, CY);
    shadow.style.width = R * 1.9 + 'px'; shadow.style.height = R * 0.42 + 'px';
    shadow.style.left = (CX - R * 0.95) + 'px'; shadow.style.top = (CY + R * 0.98) + 'px';
  }
  // 图片加载完成后才开始浮现，慢网速下也不会突然蹦出来
  var orbAt = null;
  img.onload = function () { orbAt = (performance.now() - t0) / 1000; };
  img.src = ORB.src + (window.innerWidth < 900 ? '-m' : '') + '.webp';
  layout();
  window.addEventListener('resize', layout);

  /* ---------- 粒子：从四周汇聚到球面后被吸收 ---------- */
  var N = mobile ? 360 : 700, P = [], GA = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - y * y), th = GA * i;
    var u = Math.random() * 2 - 1, ph = Math.random() * 6.283, s = 2.6 + Math.random() * 3.4, su = Math.sqrt(1 - u * u);
    P.push({ tx: Math.cos(th) * rr, ty: y, tz: Math.sin(th) * rr,
      sx: Math.cos(ph) * su * s, sy: u * s, sz: Math.sin(ph) * su * s,
      dl: Math.random() * 0.8, du: 1.0 + Math.random() * 0.7, px: null, py: null });
  }

  /* ---------- 轨道：AI 平台 ---------- */
  var RINGS = [
    { r: 1.26, tx: 1.18, tz: 0.28, sp: 0.36, names: ['ChatGPT', 'Claude'] },
    { r: 1.42, tx: 1.3, tz: -0.5, sp: -0.26, names: ['Perplexity', 'Gemini'] },
    { r: 1.58, tx: 1.06, tz: 0.85, sp: 0.2, names: ['Grok', 'DeepSeek'] }
  ];
  function ringPt(rg, ang) {
    var x = Math.cos(ang) * rg.r, z = Math.sin(ang) * rg.r;
    var c = Math.cos(rg.tx), s = Math.sin(rg.tx), y1 = -z * s, z1 = z * c;
    var c2 = Math.cos(rg.tz), s2 = Math.sin(rg.tz);
    return [x * c2 - y1 * s2, x * s2 + y1 * c2, z1];
  }

  var spin = 0, tiltX = 0, tiltY = 0, mX = 0, mY = 0, CAM = 6;
  function proj(v, sc) {
    var c = Math.cos(spin), s = Math.sin(spin);
    var x1 = v[0] * c + v[2] * s, z1 = -v[0] * s + v[2] * c;
    var c2 = Math.cos(tiltY), s2 = Math.sin(tiltY);
    var y2 = v[1] * c2 - z1 * s2, z2 = v[1] * s2 + z1 * c2;
    var k = CAM / (CAM - z2) * sc * 0.985;
    return [CX + x1 * k * R, CY - y2 * k * R, z2];
  }
  el.addEventListener('pointermove', function (e) { mX = (e.clientX / W - 0.5) * 2; mY = (e.clientY / H - 0.5) * 2; });

  function ease(x) { return x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3); }
  var last = t0, raf = 0, outAt = 0, alive = true, sweepAt = 2.1;

  function frame(now) {
    if (!alive) return;
    var t = (now - t0) / 1000, dt = Math.min((now - last) / 1000, 0.05); last = now;
    var ex = outAt ? ease((now - outAt) / 900) : 0;
    tiltX += (mX - tiltX) * 0.05; tiltY += (mY * 0.18 + 0.2 - tiltY) * 0.05;
    spin += dt * 0.25;

    // 球体：由虚到实浮现 → 轻微漂浮 + 随鼠标转动视角
    var rev = orbAt === null ? 0 : ease((t - Math.max(0.5, orbAt)) / 1.6), bob = Math.sin(t * 1.1) * R * 0.025 * rev;
    var sc = (0.6 + 0.4 * rev) * (1 + ex * 0.25);
    var rx = (-mY * 6).toFixed(2), ry = (mX * 8).toFixed(2);
    var tf = 'translate3d(' + (mX * R * 0.03) + 'px,' + (bob + mY * R * 0.02) + 'px,0) perspective(1200px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale(' + sc + ')';
    orb.style.transform = gloss.style.transform = tf;
    orb.style.opacity = rev * (1 - ex);
    orb.style.filter = rev < 1 ? 'blur(' + (22 * (1 - rev)).toFixed(1) + 'px)' : 'none';
    gloss.style.opacity = rev * (1 - ex);
    halo.style.opacity = (0.7 + 0.3 * Math.sin(t * 0.9)) * rev * (1 - ex);
    shadow.style.opacity = rev * (1 - ex);
    shadow.style.transform = 'scale(' + (1 - bob / R * 1.2) + ')';
    // 高光随鼠标游走；光带每 6 秒扫过一次球面
    gloss.style.setProperty('--gx', (35 - mX * 14) + '%');
    gloss.style.setProperty('--gy', (28 - mY * 12) + '%');
    var sw = (t - sweepAt) / 1.3;
    if (sw > 1) { sweepAt += 6; sw = 0; }
    gloss.style.setProperty('--sw', (sw <= 0 ? -60 : -60 + ease(sw) * 220) + '%');

    [cB, cF].forEach(function (c) { c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H); });

    // 粒子（前景层）
    for (var i = 0; i < N; i++) {
      var p = P[i], k = ease((t - p.dl) / p.du);
      var land = Math.max(0, t - p.dl - p.du), absorb = Math.max(0, 1 - land * 2.2);
      var b = 1 + ex * (1.5 + (i % 7) * 0.25);
      var q = proj([(p.sx + (p.tx - p.sx) * k) * b, (p.sy + (p.ty - p.sy) * k) * b, (p.sz + (p.tz - p.sz) * k) * b], 1);
      var al = Math.min(1, t / 0.4) * absorb * (q[2] > 0 ? 1 : 0.3) * (1 - ex);
      if (al < 0.01) { p.px = null; continue; }
      var fly = 1 - k;
      if (fly > 0.02 && p.px !== null) {
        cF.strokeStyle = 'rgba(124,92,255,' + (al * fly * 0.55) + ')'; cF.lineWidth = 1;
        cF.beginPath(); cF.moveTo(p.px, p.py); cF.lineTo(q[0], q[1]); cF.stroke();
      }
      cF.fillStyle = 'rgba(43,91,255,' + al * 0.85 + ')';
      cF.fillRect(q[0] - 0.9, q[1] - 0.9, 1.8, 1.8);
      p.px = q[0]; p.py = q[1];
    }

    // 轨道 + AI 平台节点：背面画在球后，正面画在球前
    var ra = ease((t - 2.2) / 1.2) * (1 - ex);
    if (ra > 0) {
      RINGS.forEach(function (rg, ri) {
        var prev = null;
        for (var j = 0; j <= 120; j++) {
          var q = proj(ringPt(rg, j / 120 * 6.283), 1);
          if (prev) {
            var c = (q[2] + prev[2]) > 0 ? cF : cB;
            c.strokeStyle = 'rgba(43,91,255,' + (0.2 * ra) + ')'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(prev[0], prev[1]); c.lineTo(q[0], q[1]); c.stroke();
          }
          prev = q;
        }
        rg.names.forEach(function (nm, ni) {
          var q = proj(ringPt(rg, t * rg.sp + ni * Math.PI + ri * 2.09), 1);
          var c = q[2] > 0 ? cF : cB, fa = (q[2] > 0 ? 1 : 0.5) * ra;
          var g = c.createRadialGradient(q[0], q[1], 0, q[0], q[1], 10);
          g.addColorStop(0, 'rgba(43,91,255,' + fa + ')'); g.addColorStop(1, 'rgba(124,92,255,0)');
          c.fillStyle = g; c.beginPath(); c.arc(q[0], q[1], 10, 0, 6.283); c.fill();
          c.fillStyle = 'rgba(255,255,255,' + fa + ')'; c.beginPath(); c.arc(q[0], q[1], 2, 0, 6.283); c.fill();
          if (!mobile) {
            c.font = '500 11px ' + mono; c.fillStyle = 'rgba(30,45,90,' + 0.75 * fa + ')';
            c.fillText(nm, q[0] + 12, q[1] + 4);
          }
        });
      });
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  // 第二幕：3.4 秒后点亮市场行
  var dots = el.querySelectorAll('.sp-dots i');
  var t2 = setTimeout(function () {
    el.classList.add('act2');
    dots[0].classList.remove('on');
    dots[1].classList.add('on');
  }, 3400);

  var gone = false;
  function enter() {
    if (gone) return;
    gone = true;
    clearTimeout(t2);
    outAt = performance.now();
    el.classList.add('is-out');
    document.body.classList.remove('splash-on');
    try { sessionStorage.setItem('le_splash', '1'); } catch (e) {}
    setTimeout(function () {
      alive = false; cancelAnimationFrame(raf);
      window.removeEventListener('resize', layout);
      el.remove();
    }, 1100);
  }

  el.addEventListener('click', enter);
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { enter(); document.removeEventListener('keydown', onKey); }
  });
  window.addEventListener('wheel', enter, { once: true, passive: true });
})();
