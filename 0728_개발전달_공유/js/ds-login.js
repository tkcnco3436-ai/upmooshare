(function () {
  "use strict";

  function init() {
    var form = document.querySelector("[data-login-form]");
    if (!form) return;
    var email = form.querySelector("[data-login-email]");
    var pw = form.querySelector("[data-login-pw]");
    var toggle = form.querySelector("[data-login-pw-toggle]");
    var submit = form.querySelector("[data-login-submit]");

    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function sync() {
      var ok = EMAIL.test(email.value.trim()) && pw.value.length > 0;
      submit.disabled = !ok;
    }
    email.addEventListener("input", sync);
    pw.addEventListener("input", sync);

    // 비밀번호 표시/가리기
    if (toggle) {
      toggle.addEventListener("click", function () {
        var show = pw.type === "password";
        pw.type = show ? "text" : "password";
        toggle.classList.toggle("is-visible", show);
        toggle.setAttribute("aria-label", show ? "비밀번호 숨기기" : "비밀번호 표시");
        var icon = toggle.querySelector("i");
        if (icon) { icon.setAttribute("data-lucide", show ? "eye-off" : "eye"); if (window.lucide) window.lucide.createIcons(); }
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submit.disabled) return;
      // 실제 인증 연결 지점(현재는 데모: 랜딩으로 이동)
      window.location.href = "index.html";
    });

    sync();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
