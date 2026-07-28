/* ==========================================================================
   landing.js — 랜딩(홈) 전용 동작
   · 히어로 AI 채팅 시퀀스 (업로드 로딩 → 타이핑 → 정지 → 삭제, 무한 반복)
   · .reveal 스태거 등장
   · 타임라인(3단계) 뷰포트 중앙 항목 활성화 + 말풍선 타이핑
   · 공지 아코디언(단일 열림)
   frontend/components/main/{hero-section,how-it-works-section,notice-section}.tsx 이식.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─────────────── .reveal 스태거 등장 ─────────────── */
  function initReveal() {
    requestAnimationFrame(function () {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
    });
  }

  /* ─────────────── 히어로 AI 채팅 시퀀스 ─────────────── */
  var STEPS = [
    {
      text: "고객님이 업로드하신 이미지를 분석하고 주제와 컨셉을 제안합니다.",
      badge: true,
      upload: true,
    },
    {
      text: "고객님이 선택한 주제와 컨셉에 따라 영상을 생성합니다.",
      badge: true,
      upload: false,
    },
    {
      text: "안녕하세요 상인월드는 대표님의 이미지 한장으로 콘텐츠를 만듭니다.",
      badge: false,
      upload: false,
    },
  ];
  var TYPE_MS = 55,
    ERASE_MS = 26,
    HOLD_MS = 2000,
    GAP_MS = 500,
    UPLOAD_MS = 2800;

  function initHero() {
    var typeEl = document.querySelector("[data-hero-type]");
    var textWrap = document.querySelector("[data-hero-text]");
    var loading = document.querySelector("[data-hero-loading]");
    var badge = document.querySelector("[data-hero-badge]");
    if (!typeEl || !textWrap) return;

    if (reduce) {
      typeEl.textContent = STEPS[0].text;
      if (badge) badge.hidden = false;
      return;
    }

    var badgeVisible = false;
    function wait(ms) {
      return new Promise(function (r) {
        setTimeout(r, ms);
      });
    }
    function showBadge(v) {
      if (!badge) return;
      if (v) {
        badge.hidden = false;
        badge.classList.remove("is-hiding");
        badgeVisible = true;
      } else if (badgeVisible) {
        badge.classList.add("is-hiding");
        setTimeout(function () {
          badge.hidden = true;
          badgeVisible = false;
        }, 420);
      }
    }

    (async function run() {
      await wait(600);
      var idx = 0;
      for (;;) {
        var step = STEPS[idx];

        if (step.upload) {
          textWrap.hidden = true;
          showBadge(false);
          if (loading) {
            loading.hidden = false;
            // 프로그레스 바를 새 노드로 교체해 CSS 애니메이션 재시작
            var bar = loading.querySelector("[data-hero-bar]");
            if (bar) bar.parentElement.innerHTML = "<span></span>";
          }
          await wait(UPLOAD_MS);
          if (loading) loading.hidden = true;
        }

        if (loading) loading.hidden = true;
        textWrap.hidden = false;
        var wasVisible = badgeVisible;
        showBadge(step.badge);
        var startDelay = !step.badge && wasVisible ? 460 : 0;
        typeEl.textContent = "";
        if (startDelay) await wait(startDelay);

        for (var i = 1; i <= step.text.length; i++) {
          typeEl.textContent = step.text.slice(0, i);
          await wait(TYPE_MS);
        }
        await wait(HOLD_MS);
        for (var j = step.text.length - 1; j >= 0; j--) {
          typeEl.textContent = step.text.slice(0, Math.max(0, j));
          await wait(ERASE_MS);
        }

        idx = (idx + 1) % STEPS.length;
        await wait(GAP_MS);
      }
    })();
  }

  /* ─────────────── 타임라인: 중앙 항목 활성화 + 타이핑 ─────────────── */
  function initTimeline() {
    var items = Array.prototype.slice.call(
      document.querySelectorAll(".timeline .tl-item")
    );
    if (!items.length) return;

    var timer = null;
    var active = -1;

    function apply(next) {
      if (next === active) return;
      active = next;
      items.forEach(function (el, i) {
        el.classList.toggle("is-active", i === active);
        var chat = el.querySelector(".tl-chat");
        if (chat) chat.classList.remove("is-typed");
      });
      if (timer) clearTimeout(timer);
      var delay = reduce ? 0 : 700;
      timer = setTimeout(function () {
        var chat = items[active] && items[active].querySelector(".tl-chat");
        if (chat) chat.classList.add("is-typed");
      }, delay);
    }

    function update() {
      var mid = window.innerHeight / 2;
      var best = 0,
        bestDist = Infinity;
      items.forEach(function (el, i) {
        var r = el.getBoundingClientRect();
        var d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      apply(best);
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ─────────────── 공지 아코디언 (단일 열림) ─────────────── */
  function initNoticeAccordion() {
    var items = document.querySelectorAll(".notice-list .notice-item");
    items.forEach(function (item) {
      var btn = item.querySelector(".notice-item__trigger");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var wasOpen = item.classList.contains("is-open");
        items.forEach(function (o) {
          o.classList.remove("is-open");
          var b = o.querySelector(".notice-item__trigger");
          if (b) b.setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initHero();
    initTimeline();
    initNoticeAccordion();
  });
})();
