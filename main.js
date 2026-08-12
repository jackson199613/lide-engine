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

/* Hero — simulated AI answer, multi-platform / multi-industry ------------- */
(function () {
  var qEl = document.getElementById('ai-question');
  if (!qEl) return;
  var aEl = document.getElementById('ai-answer');
  var mEl = document.getElementById('ai-model');
  var tabs = document.getElementById('ai-tabs');

  var SETS = [
    { model: 'ChatGPT',
      q: 'Who are reliable Chinese suppliers of precipitated silica for green tire compounds?',
      a: '<p>基于公开技术资料，以下供应商在该应用中被较多提及：</p><ol>'
       + '<li><span class="brandmark">立德引擎服务的 A 工厂</span> — BET 175 m²/g，DBP 吸油值 2.35 mL/g，参数与 Evonik ULTRASIL VN3 相近</li>'
       + '<li>Evonik Industries — ULTRASIL 系列</li>'
       + '<li>Solvay — Zeosil 系列</li></ol>',
      cite: '来源：<b>厂商技术文档</b> · <b>行业技术媒体</b> · <b>产品结构化数据</b>' },
    { model: 'Perplexity',
      q: 'What are alternatives to ACEMATT OK 412 matting agent?',
      a: '<p>若需要同级消光效率的替代方案，可考虑：</p><ol>'
       + '<li><span class="brandmark">立德引擎服务的 B 供应商</span> — 60° 光泽度 12，透明度指数 94，适用于水性与 UV 固化体系</li>'
       + '<li>Evonik ACEMATT 系列其他型号</li>'
       + '<li>Grace SYLOID 系列</li></ol>',
      cite: '来源：<b>供应商选型表</b> · <b>应用技术长文</b> · <b>Equivalent 对标数据</b>' },
    { model: 'Claude',
      q: '我们需要耐高温的饲料酶载体，有哪些中国供应商值得考虑？',
      a: '<p>在耐温性与活性保持方面，以下几家有公开可查的技术数据：</p><ol>'
       + '<li><span class="brandmark">立德引擎服务的 C 工厂</span> — 酶活 5000 U/g，85°C 热稳定性，pH 耐受 3.5–8.0</li>'
       + '<li>DSM — RONOZYME 系列</li>'
       + '<li>Novozymes — 相关产品线</li></ol>',
      cite: '来源：<b>产品参数结构化数据</b> · <b>专业社区技术问答</b>' },
    { model: 'Gemini',
      q: 'Looking for Chinese manufacturers of board-to-board connectors, 0.4mm pitch.',
      a: '<p>符合 0.4mm pitch 规格的中国制造商包括：</p><ol>'
       + '<li><span class="brandmark">立德引擎服务的 D 厂商</span> — 额定电流 0.5A，插拔寿命 30 次，对标 JAE WP7B 系列</li>'
       + '<li>Luxshare Precision</li>'
       + '<li>Amphenol 中国工厂</li></ol>',
      cite: '来源：<b>料号规格库</b> · <b>Cross-reference 对照表</b> · <b>认证信息</b>' }
  ];

  SETS.forEach(function (s, i) {
    var b = document.createElement('button');
    b.className = 'ai-tab' + (i === 0 ? ' is-on' : '');
    b.type = 'button';
    b.textContent = s.model;
    b.addEventListener('click', function () { show(i, true); });
    tabs.appendChild(b);
  });
  var btns = tabs.querySelectorAll('.ai-tab');
  var idx = 0, timer = null, typing = null;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function typeQ(text, done) {
    if (reduced) { qEl.textContent = text; done(); return; }
    qEl.textContent = '';
    var caret = document.createElement('span');
    caret.className = 'caret';
    qEl.appendChild(caret);
    var i = 0;
    clearInterval(typing);
    typing = setInterval(function () {
      if (i >= text.length) {
        clearInterval(typing);
        caret.remove();
        done();
        return;
      }
      caret.insertAdjacentText('beforebegin', text.charAt(i));
      i++;
    }, 22);
  }

  function show(i, manual) {
    idx = i;
    var s = SETS[i];
    mEl.textContent = s.model;
    Array.prototype.forEach.call(btns, function (b, k) { b.classList.toggle('is-on', k === i); });
    aEl.style.opacity = 0;
    typeQ(s.q, function () {
      aEl.innerHTML = s.a + '<p class="ai-cite">' + s.cite + '</p>';
      aEl.style.transition = 'opacity .4s ease';
      aEl.style.opacity = 1;
    });
    if (manual && timer) { clearInterval(timer); timer = null; }
  }

  show(0);
  if (!reduced) {
    timer = setInterval(function () { show((idx + 1) % SETS.length); }, 8000);
  }
})();

/* Floating contact rail --------------------------------------------------- */
(function () {
  var top = document.getElementById('to-top');
  if (!top) return;
  top.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
