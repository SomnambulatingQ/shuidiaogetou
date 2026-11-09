/* =========================================================
   水调歌头 · 课后自主学习 — 交互
   1. 模块切换（tab + 键盘 + 深链接）
   2. 进场动画
   3. 字音卡翻转
   4. 注释手风琴
   5. 阅读进度 / 回到顶部
   ========================================================= */

(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- 1. 模块切换 ---------- */
  var tabs = $$('.tab');
  var panels = $$('.panel');
  var stage = $('#stage');

  function activate(id, options) {
    options = options || {};
    var panel = $('#panel-' + id);
    if (!panel) { return false; }

    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-panel') === id;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
    });

    panels.forEach(function (item) {
      item.classList.toggle('is-active', item === panel);
    });

    // 面板内元素补一次进场
    window.setTimeout(function () {
      $$('.reveal', panel).forEach(function (el) { el.classList.add('in'); });
    }, 40);

    if (options.updateHash !== false) {
      try { history.replaceState(null, '', '#' + id); } catch (e) { /* file:// 下也可用 */ }
    }

    if (options.scroll) {
      var top = stage.getBoundingClientRect().top + window.pageYOffset - 72;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    }
    return true;
  }

  function activateFromControl(id) {
    // 切换模块时把内容顶端带到视口，避免停在装饰性首屏
    activate(id, { scroll: true });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activateFromControl(tab.getAttribute('data-panel'));
    });
  });

  // tab 键盘操作
  var tabList = $('.tabs');
  tabList.addEventListener('keydown', function (event) {
    var keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (keys.indexOf(event.key) === -1) { return; }
    event.preventDefault();

    var current = tabs.indexOf(document.activeElement);
    if (current === -1) { current = 0; }
    var next = current;
    if (event.key === 'ArrowRight') { next = (current + 1) % tabs.length; }
    if (event.key === 'ArrowLeft') { next = (current - 1 + tabs.length) % tabs.length; }
    if (event.key === 'Home') { next = 0; }
    if (event.key === 'End') { next = tabs.length - 1; }

    tabs[next].focus();
    activate(tabs[next].getAttribute('data-panel'));
  });

  // 底部“下一节”与品牌链接
  $$('[data-goto]').forEach(function (el) {
    el.addEventListener('click', function (event) {
      event.preventDefault();
      activate(el.getAttribute('data-goto'), { scroll: true });
    });
  });

  // 深链接：/index.html#chars
  function idFromHash() {
    var id = (location.hash || '').replace('#', '');
    return $('#panel-' + id) ? id : null;
  }
  var initial = idFromHash();
  activate(initial || 'poem', { updateHash: false, scroll: false });

  window.addEventListener('hashchange', function () {
    var id = idFromHash();
    if (id) { activate(id, { updateHash: false }); }
  });

  /* ---------- 2. 进场动画 ---------- */
  var reveals = $$('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 3. 字音卡翻转 ---------- */
  var flips = $$('.flip');

  flips.forEach(function (card) {
    card.addEventListener('click', function () {
      var flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    });
  });

  $$('[data-flip]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.getAttribute('data-flip');
      flips.forEach(function (card) {
        var flipped = mode === 'all' || (mode === 'toggle' && !card.classList.contains('is-flipped'));
        card.classList.toggle('is-flipped', flipped);
        card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
      });
    });
  });

  /* ---------- 4. 注释手风琴 ---------- */
  $$('.acc-head').forEach(function (head) {
    head.addEventListener('click', function () {
      var item = head.parentNode;
      var open = item.classList.toggle('is-open');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  $$('[data-acc]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('data-acc') === 'open';
      $$('.acc').forEach(function (item) {
        item.classList.toggle('is-open', open);
        var head = $('.acc-head', item);
        if (head) { head.setAttribute('aria-expanded', open ? 'true' : 'false'); }
      });
    });
  });

  /* ---------- 5. 阅读进度 / 回到顶部 ---------- */
  var bar = $('#progressBar');
  var toTop = $('#toTop');
  var ticking = false;

  function onScroll() {
    if (ticking) { return; }
    ticking = true;
    window.requestAnimationFrame(function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var progress = max > 0 ? (window.pageYOffset / max) * 100 : 0;
      if (bar) { bar.style.width = Math.min(progress, 100) + '%'; }
      if (toTop) { toTop.classList.toggle('show', window.pageYOffset > 560); }
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
