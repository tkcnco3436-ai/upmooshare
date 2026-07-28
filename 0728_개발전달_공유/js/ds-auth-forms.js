/* ==========================================================================
   ds-auth-forms.js — DS 스플릿 인증 부속 화면 동작
   · 비밀번호 찾기   (sanginworld-ds/js/password-reset.js 이식)
   · 아이디 찾기     (features/public/auth/components/find-id-form.tsx 규칙)
   · 비밀번호 변경   (features/public/auth/components/password-reset-confirm-form.tsx 규칙)

   로그인은 ds-login.js · 회원가입은 ds-signup.js 가 담당한다.
   ========================================================================== */
(function () {
  "use strict";

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE = /^\d{3}-\d{3,4}-\d{4}$/;
  var SPECIAL = /[!@#]/;

  function icons() {
    if (window.lucide) window.lucide.createIcons();
  }

  /* 비밀번호 표시 토글 (DS login.js 와 동일 동작) */
  function bindPwToggle(toggle, input) {
    if (!toggle || !input) return;
    toggle.addEventListener("click", function () {
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      toggle.classList.toggle("is-visible", show);
      toggle.setAttribute(
        "aria-label",
        show ? "비밀번호 숨기기" : "비밀번호 표시"
      );
      var icon = toggle.querySelector("i, svg");
      if (icon) {
        icon.setAttribute("data-lucide", show ? "eye-off" : "eye");
        icons();
      }
    });
  }

  /* ─────────────── 비밀번호 찾기 ─────────────── */
  function initReset() {
    var form = document.querySelector("[data-reset-form]");
    if (!form) return;
    var email = form.querySelector("[data-reset-email]");
    var submit = form.querySelector("[data-reset-submit]");
    var sent = document.querySelector("[data-reset-sent]");

    function sync() {
      submit.disabled = !EMAIL.test(email.value.trim());
    }
    email.addEventListener("input", function () {
      sync();
      if (sent) sent.hidden = true;
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submit.disabled) return;
      // 실제 발송 연결 지점(현재는 데모: 발송 완료 안내 표시)
      submit.textContent = "재발송";
      if (sent) {
        sent.hidden = false;
        icons();
      }
    });

    sync();
  }

  /* ─────────────── 아이디 찾기 ─────────────── */
  function initFindId() {
    var form = document.querySelector("[data-findid-form]");
    if (!form) return;
    var name = form.querySelector("[data-findid-name]");
    var phone = form.querySelector("[data-findid-phone]");
    var msg = form.querySelector("[data-findid-msg]");
    var submit = form.querySelector("[data-findid-submit]");
    var alertBox = document.querySelector("[data-findid-alert]");

    // 010-1234-5678 형태로 자동 하이픈 (lib/format.ts formatPhone 규칙)
    function formatPhone(v) {
      var d = v.replace(/\D/g, "").slice(0, 11);
      if (d.length < 4) return d;
      if (d.length < 8) return d.slice(0, 3) + "-" + d.slice(3);
      if (d.length === 10)
        return d.slice(0, 3) + "-" + d.slice(3, 6) + "-" + d.slice(6);
      return d.slice(0, 3) + "-" + d.slice(3, 7) + "-" + d.slice(7);
    }

    function sync() {
      var okName = name.value.trim().length > 0;
      var okPhone = PHONE.test(phone.value.trim());
      submit.disabled = !(okName && okPhone);
      if (msg) {
        var show = phone.value.trim().length > 0 && !okPhone;
        msg.hidden = !show;
        if (show)
          msg.textContent =
            "휴대폰 번호 형식이 올바르지 않습니다 (예: 010-1234-5678)";
      }
    }

    name.addEventListener("input", sync);
    phone.addEventListener("input", function () {
      phone.value = formatPhone(phone.value);
      sync();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submit.disabled) return;
      // 실서비스도 미구현 — root 에러로 "준비 중" 안내를 띄운다
      if (alertBox) {
        alertBox.hidden = false;
        icons();
      }
    });

    sync();
  }

  /* ─────────────── 비밀번호 변경 ─────────────── */
  function initPwConfirm() {
    var form = document.querySelector("[data-pwc-form]");
    if (!form) return;
    var pw = form.querySelector("[data-pwc-pw]");
    var pw2 = form.querySelector("[data-pwc-pw2]");
    var rules = form.querySelector("[data-pwc-rules]");
    var submit = form.querySelector("[data-pwc-submit]");
    var modal = document.querySelector("[data-pwc-modal]");

    bindPwToggle(form.querySelector("[data-pwc-pw-toggle]"), pw);
    bindPwToggle(form.querySelector("[data-pwc-pw2-toggle]"), pw2);

    function mark(key, ok) {
      if (!rules) return;
      var li = rules.querySelector('[data-rule="' + key + '"]');
      if (li) li.classList.toggle("is-met", ok);
    }

    function sync() {
      var v = pw.value;
      var okSpecial = SPECIAL.test(v);
      var okLength = v.length >= 8;
      var okMatch = v.length > 0 && v === pw2.value;
      mark("special", okSpecial);
      mark("length", okLength);
      mark("match", okMatch);
      submit.disabled = !(okSpecial && okLength && okMatch);
    }

    pw.addEventListener("input", sync);
    pw2.addEventListener("input", sync);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submit.disabled) return;
      // 실제 변경 연결 지점(현재는 데모: 완료 모달 표시)
      if (modal) {
        modal.classList.add("is-open");
        document.body.style.overflow = "hidden";
        icons();
      }
    });

    sync();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReset();
    initFindId();
    initPwConfirm();
  });
})();
