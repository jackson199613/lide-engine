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

/* Hero terminal — multi-category schema rotator ---------------------------- */
(function () {
  var code = document.getElementById('term-code');
  if (!code) return;
  var title = document.getElementById('term-title');
  var note = document.getElementById('term-note');
  var tabs = document.getElementById('term-tabs');

  var P = function (s) { return '<span class="c-p">"' + s + '"</span>'; };
  var S = function (s) { return '<span class="c-s">"' + s + '"</span>'; };
  var N = function (s) { return '<span class="c-n">' + s + '</span>'; };

  function build(type, name, props, similar) {
    var out = P('@type') + ': ' + S(type) + ',\n' + P('name') + ': ' + S(name) + ',\n'
            + P('additionalProperty') + ': [\n';
    out += props.map(function (p) {
      return '  { ' + P('name') + ': ' + S(p[0]) + ',\n    '
           + P('value') + ': ' + N(p[1]) + ', ' + P('unitCode') + ': ' + S(p[2]) + ' }';
    }).join(',\n');
    out += '\n],\n' + P('isSimilarTo') + ': ' + S(similar);
    return out;
  }

  var SETS = [
    { tab: '二氧化硅', file: 'silica-schema.json',
      note: 'TDS 里的比表面积与孔隙参数，变成 AI 能比对的字段',
      html: build('Product', 'Precipitated Silica LD-200', [
        ['BET Surface Area', 175, 'M2/G'],
        ['Oil Absorption', 2.35, 'ML/G'],
        ['Pore Volume', 1.82, 'CM3/G']
      ], 'Evonik ULTRASIL® VN3') },
    { tab: '涂料消光粉', file: 'matting-agent-schema.json',
      note: '消光效率与透明度，决定买家选不选你',
      html: build('Product', 'Matting Agent LD-412', [
        ['Gloss at 60°', 12, 'P1'],
        ['Mean Particle Size', 6.8, 'MMT'],
        ['Transparency Index', 94, 'P1']
      ], 'Evonik ACEMATT® OK 412') },
    { tab: '饲料酶制剂', file: 'feed-enzyme-schema.json',
      note: '耐温性与活性单位，海外买家的第一道筛选',
      html: build('Product', 'Thermostable Phytase LD-5000', [
        ['Enzyme Activity', 5000, 'U/G'],
        ['Thermal Stability', 85, 'CEL'],
        ['pH Tolerance Range', 3.5, 'C62']
      ], 'DSM RONOZYME® HiPhos') },
    { tab: '精密零件', file: 'precision-part-schema.json',
      note: '公差与材质，让 AI 能把你的能力匹配到需求',
      html: build('Product', 'CNC Precision Shaft LD-A17', [
        ['Dimensional Tolerance', 0.005, 'MMT'],
        ['Surface Roughness Ra', 0.4, 'D33'],
        ['Hardness HRC', 58, 'A97']
      ], 'DIN 7160 IT5 Class') },
    { tab: '电子元器件', file: 'connector-schema.json',
      note: '料号与规格上了 Schema，买家按 Part Number 也能找到你',
      html: build('Product', 'Board-to-Board Connector LD-BTB040', [
        ['Pitch', 0.4, 'MMT'],
        ['Current Rating', 0.5, 'AMP'],
        ['Mating Cycles', 30, 'C62']
      ], 'JAE WP7B Series') },
    { tab: '消费品', file: 'consumer-product-schema.json',
      note: '消费品拼的是品牌实体与场景，同样要让 AI 读得懂',
      html: build('Product', 'Ergonomic Office Chair LD-C9', [
        ['Weight Capacity', 150, 'KGM'],
        ['Recline Range', 135, 'DD'],
        ['Warranty Period', 5, 'ANN']
      ], 'Herman Miller Aeron 同级') }
  ];

  SETS.forEach(function (s, i) {
    var b = document.createElement('button');
    b.className = 'term-tab' + (i === 0 ? ' is-on' : '');
    b.textContent = s.tab;
    b.type = 'button';
    b.addEventListener('click', function () { show(i, true); });
    tabs.appendChild(b);
  });
  var btns = tabs.querySelectorAll('.term-tab');
  var idx = 0, timer = null;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(i, manual) {
    idx = i;
    var s = SETS[i];
    code.style.opacity = 0;
    setTimeout(function () {
      code.innerHTML = s.html;
      title.textContent = s.file;
      note.textContent = s.note;
      code.style.opacity = 1;
    }, reduced ? 0 : 200);
    Array.prototype.forEach.call(btns, function (b, k) {
      b.classList.toggle('is-on', k === i);
    });
    if (manual && timer) { clearInterval(timer); timer = null; }
  }

  code.style.transition = 'opacity .25s ease';
  show(0);
  if (!reduced) {
    timer = setInterval(function () { show((idx + 1) % SETS.length); }, 4200);
  }
})();
