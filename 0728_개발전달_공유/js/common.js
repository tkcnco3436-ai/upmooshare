/* ==========================================================================
   common.js — 사용자/관리자 공용 UI 동작
   · 사용자: 모바일 드로어, 프로필 드롭다운, 알림 벨
   · 관리자: 사이드바 접힘 토글, 하위메뉴 아코디언, 활성 메뉴 자동 표시
   · 공용: 탭, 세그먼트, 모달, 아코디언, 비밀번호 표시, Lucide 재생성
   프레임워크·번들러 의존 없음. Lucide 는 CDN 스크립트로 로드한다.
   ========================================================================== */
(function () {
  "use strict";

  /* ─────────────── Lucide 아이콘 (동적 DOM 이후 재호출) ─────────────── */
  function icons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }
  window.swIcons = icons;

  /* ─────────────── 사용자: 모바일 드로어 ─────────────── */
  function initDrawer() {
    var drawer = document.querySelector("[data-drawer]");
    var backdrop = document.querySelector("[data-drawer-backdrop]");
    var openBtns = document.querySelectorAll("[data-drawer-open]");
    var closeBtn = document.querySelector("[data-drawer-close]");
    if (!drawer || !backdrop || !openBtns.length) return;

    function open() {
      drawer.classList.add("open");
      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";
      openBtns.forEach(function (b) {
        b.setAttribute("aria-expanded", "true");
      });
    }
    function close() {
      drawer.classList.remove("open");
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
      openBtns.forEach(function (b) {
        b.setAttribute("aria-expanded", "false");
      });
    }
    openBtns.forEach(function (b) {
      b.addEventListener("click", open);
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ─────────────── 사용자: 헤더 프로필 드롭다운 ─────────────── */
  function initDropdowns() {
    document.querySelectorAll("[data-dropdown]").forEach(function (wrap) {
      var btn = wrap.querySelector("[data-dropdown-btn]");
      var menu = wrap.querySelector("[data-dropdown-menu]");
      if (!btn || !menu) return;

      function open() {
        menu.hidden = false;
        btn.setAttribute("aria-expanded", "true");
      }
      function close() {
        menu.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      }
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (menu.hidden) open();
        else close();
      });
      document.addEventListener("click", function (e) {
        if (!wrap.contains(e.target)) close();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") close();
      });
    });
  }

  /* ─────────────── 관리자: 사이드바 토글 + 아코디언 ─────────────── */
  function initAdminShell() {
    var shell = document.querySelector("[data-admin-shell]");
    if (!shell) return;

    // 데스크톱 기본 펼침 / 모바일 기본 접힘
    if (window.matchMedia("(max-width: 1023px)").matches) {
      shell.classList.add("collapsed");
    }

    var toggle = shell.querySelector("[data-sidebar-toggle]");
    if (toggle) {
      toggle.addEventListener("click", function () {
        shell.classList.toggle("collapsed");
      });
    }
    var overlay = shell.querySelector("[data-admin-overlay]");
    if (overlay) {
      overlay.addEventListener("click", function () {
        shell.classList.add("collapsed");
      });
    }

    // 하위메뉴 아코디언 — 한 번에 하나만 펼침
    var parents = shell.querySelectorAll("[data-nav-parent]");
    parents.forEach(function (p) {
      p.addEventListener("click", function () {
        var sub = p.parentElement.querySelector(".nav-sub");
        var isOpen = sub && sub.classList.contains("open");
        parents.forEach(function (q) {
          var s = q.parentElement.querySelector(".nav-sub");
          if (s) s.classList.remove("open");
          q.setAttribute("aria-expanded", "false");
        });
        if (sub && !isOpen) {
          sub.classList.add("open");
          p.setAttribute("aria-expanded", "true");
        }
      });
    });

    // 현재 파일명과 일치하는 nav 링크를 활성 표시하고 부모를 펼친다
    var file = location.pathname.split("/").pop() || "dashboard.html";
    shell.querySelectorAll(".admin-nav a[href]").forEach(function (a) {
      if (a.getAttribute("href") === file) {
        a.classList.add("active");
        var sub = a.closest(".nav-sub");
        if (sub) {
          sub.classList.add("open");
          var head = sub.parentElement.querySelector("[data-nav-parent]");
          if (head) head.setAttribute("aria-expanded", "true");
        }
      }
    });
  }

  /* ─────────────── 공용: 탭 / 세그먼트 ─────────────── */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var btns = group.querySelectorAll("[role='tab'],[data-tab]");
      btns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          btns.forEach(function (b) {
            b.setAttribute("aria-selected", "false");
          });
          btn.setAttribute("aria-selected", "true");
          var target = btn.getAttribute("data-tab-target");
          if (!target) return;
          var scope = group.getAttribute("data-tabs-scope");
          var root = scope ? document.querySelector(scope) : document;
          root.querySelectorAll("[data-tab-panel]").forEach(function (p) {
            p.hidden = p.getAttribute("data-tab-panel") !== target;
          });
          icons();
        });
      });
    });
  }

  /* ─────────────── 공용: 모달 ─────────────── */
  function initModals() {
    document.querySelectorAll("[data-modal-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-modal-open");
        var m = document.getElementById(id);
        if (!m) return;
        m.hidden = false;
        document.body.style.overflow = "hidden";
        icons();
      });
    });
    document.querySelectorAll("[data-modal]").forEach(function (m) {
      function close() {
        m.hidden = true;
        document.body.style.overflow = "";
      }
      m.querySelectorAll("[data-modal-close]").forEach(function (b) {
        b.addEventListener("click", close);
      });
      // 배경 클릭 닫기 — 파괴적 액션 모달은 data-modal-strict 로 차단
      m.addEventListener("click", function (e) {
        if (e.target === m && !m.hasAttribute("data-modal-strict")) close();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !m.hidden) close();
      });
    });
  }

  /* ─────────────── 공용: 아코디언 ─────────────── */
  function initAccordion() {
    document.querySelectorAll("[data-accordion-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = btn.nextElementSibling;
        if (!panel) return;
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        panel.hidden = open;
        icons();
      });
    });
  }

  /* ─────────────── 공용: 비밀번호 표시 토글 ─────────────── */
  function initPwToggle() {
    document.querySelectorAll("[data-pw-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var input = document.getElementById(
          btn.getAttribute("data-pw-toggle")
        );
        if (!input) return;
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.innerHTML =
          '<i data-lucide="' + (show ? "eye-off" : "eye") + '"></i>';
        icons();
      });
    });
  }

  /* ─────────────── 알림함: 푸시 켜기 토글 ─────────────── */
  function initPushToggle() {
    document.querySelectorAll("[data-push-toggle]").forEach(function (wrap) {
      var input = wrap.querySelector("[data-push-input]");
      if (!input) return;
      var text = wrap.querySelector("[data-push-text]");
      var state = wrap.querySelector("[data-push-state]");

      function render() {
        var on = input.checked;
        wrap.classList.toggle("on", on);
        if (text) {
          text.textContent = on
            ? "이 기기에서 새 알림을 실시간으로 받고 있어요."
            : "이 기기에서 새 알림을 실시간으로 받아보세요.";
        }
        if (state) state.textContent = on ? "켜짐" : "꺼짐";
      }

      input.addEventListener("change", render);
      render();
    });
  }

  /* ─────────────── 공용: 전체 선택 체크박스 ─────────────── */
  function initCheckAll() {
    document.querySelectorAll("[data-check-all]").forEach(function (master) {
      var scope = master.closest("table") || document;
      master.addEventListener("change", function () {
        scope
          .querySelectorAll("[data-check-row]")
          .forEach(function (c) {
            c.checked = master.checked;
          });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initDrawer();
    initDropdowns();
    initAdminShell();
    initTabs();
    initModals();
    initAccordion();
    initPwToggle();
    initPushToggle();
    initCheckAll();
    icons();
  });
})();
