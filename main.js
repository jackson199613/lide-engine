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
  function get(n) {
    var m = document.cookie.match('(^|;)\\s*' + n + '\\s*=\\s*([^;]+)');
    return m ? m.pop() : '';
  }
  function set(v) {
    document.cookie = KEY + '=' + v + ';path=/;max-age=' + (60 * 60 * 24 * 180) + ';SameSite=Lax';
  }
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
    set(b.getAttribute('data-c'));
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

/* 开场加载动画 ------------------------------------------------------------ */
(function () {
  if (!document.body || document.body.dataset.intro !== 'on') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try { if (sessionStorage.getItem('le_intro')) return; } catch (e) {}

  var el = document.createElement('div');
  el.className = 'intro';
  el.innerHTML =
    '<div class="intro-inner">'
    + '<div class="intro-brand">立德引擎<small>Lide Engine · GEO</small></div>'
    + '<p class="intro-tag">让出海工厂被全球 AI 优先推荐</p>'
    + '</div>'
    + '<div class="intro-pct">0%</div>'
    + '<div class="intro-bar"><i></i></div>';
  document.body.appendChild(el);
  document.body.style.overflow = 'hidden';

  var bar = el.querySelector('.intro-bar i');
  var pct = el.querySelector('.intro-pct');
  var v = 0;
  var t = setInterval(function () {
    v += Math.random() * 18 + 8;
    if (v >= 100) {
      v = 100; clearInterval(t);
      setTimeout(function () {
        el.classList.add('is-done');
        document.body.style.overflow = '';
        try { sessionStorage.setItem('le_intro', '1'); } catch (e) {}
        setTimeout(function () { el.remove(); }, 800);
      }, 320);
    }
    bar.style.width = v + '%';
    pct.textContent = Math.round(v) + '%';
  }, 130);
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
