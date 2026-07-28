/* ==========================================================================
   mesh.js — WebGL 메시 그라디언트 캔버스
   frontend/components/main/mesh-canvas.tsx 이식 (GLSL·렌더 루프 동일).
   대상: canvas.mesh-canvas (히어로 .flexhero__mesh, 푸터 .sw-footer .mesh-canvas)
   WebGL 미지원·reduced-motion 대응 포함.
   ========================================================================== */
(function () {
  "use strict";

  var VERT =
    "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";
  var FRAG = [
    "precision highp float;",
    "uniform vec2 u_res; uniform float u_time; uniform float u_speed; uniform float u_intensity; uniform float u_grain;",
    "const vec3 C_PRIMARY = vec3(1.000,1.000,1.000);",
    "const vec3 C_ACCENT  = vec3(1.000,0.396,0.376);",
    "const vec3 C_PINK    = vec3(1.000,1.000,1.000);",
    "const vec3 C_MAGENTA = vec3(1.000,1.000,1.000);",
    "const vec3 C_DEEP    = vec3(1.000,1.000,1.000);",
    "float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }",
    "float grain(vec2 uv){ return hash(uv*vec2(1031.0,1973.0)+fract(u_time)); }",
    "void main(){",
    "  vec2 uv = gl_FragCoord.xy/u_res.xy;",
    "  float t = u_time*0.16*u_speed;",
    "  vec2 p0=vec2(0.24+0.18*sin(t*1.1), 0.30+0.14*cos(t*0.9));",
    "  vec2 p1=vec2(0.80+0.14*cos(t*0.8), 0.26+0.16*sin(t*1.2));",
    "  vec2 p2=vec2(0.56+0.20*sin(t*0.7), 0.76+0.12*cos(t*0.85));",
    "  vec2 p3=vec2(0.16+0.15*cos(t*1.3), 0.70+0.13*sin(t*0.75));",
    "  float e=1.9;",
    "  float w0=pow(1.0/(distance(uv,p0)+0.05),e);",
    "  float w1=pow(1.0/(distance(uv,p1)+0.05),e);",
    "  float w2=pow(1.0/(distance(uv,p2)+0.05),e);",
    "  float w3=pow(1.0/(distance(uv,p3)+0.05),e);",
    "  float ws=w0+w1+w2+w3;",
    "  vec3 col=(C_ACCENT*w0 + C_PINK*w1 + C_PRIMARY*w2 + C_MAGENTA*w3)/ws;",
    "  col = mix(col, vec3(1.000,0.396,0.376), 0.10*u_intensity*sin(t+uv.x*3.0));",
    "  col = mix(col, C_DEEP, smoothstep(0.45,1.15,uv.y)*0.16);",
    "  col += (grain(uv)-0.5)*0.04*u_grain;",
    "  gl_FragColor=vec4(col,1.0);",
    "}",
  ].join("\n");

  function initMesh(canvas) {
    var opts = { speed: 10, intensity: 2, grain: 0.75 };
    var gl = null;
    try {
      gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    } catch (e) {
      gl = null;
    }
    if (!gl) {
      // WebGL 미지원 폴백 — 정적 그라디언트
      canvas.style.background =
        "radial-gradient(60% 60% at 24% 30%, #ff6560 0%, transparent 70%)," +
        "radial-gradient(55% 55% at 80% 26%, #ffffff 0%, transparent 72%)," +
        "radial-gradient(65% 65% at 56% 76%, #ffe5d4 0%, transparent 74%), #fff";
      return;
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    var aLoc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, "u_res");
    var uTime = gl.getUniformLocation(prog, "u_time");
    var uSpeed = gl.getUniformLocation(prog, "u_speed");
    var uInt = gl.getUniformLocation(prog, "u_intensity");
    var uGrain = gl.getUniformLocation(prog, "u_grain");

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      var h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    function draw(time) {
      resize();
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform2f(uRes, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uSpeed, opts.speed);
      gl.uniform1f(uInt, opts.intensity);
      gl.uniform1f(uGrain, opts.grain);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(0);
      window.addEventListener("resize", function () {
        draw(0);
      });
      return;
    }

    var t0 = performance.now();
    (function frame() {
      draw((performance.now() - t0) / 1000);
      requestAnimationFrame(frame);
    })();
    window.addEventListener("resize", resize);
  }

  /* ────────────────────────────────────────────────────────────────
     커버 문구 타이핑 루프
     mesh-gradient-cover.tsx:149-191 의 useEffect 를 그대로 옮긴 것.
     한 글자 입력(130ms) → 완성 후 멈춤(1400ms) → 한 글자 삭제(70ms)
     → 다음 문구 전 멈춤(400ms). 최초 시작도 400ms 지연.

     문구는 `.phrase[data-phrases]` 에 콤마로 나열한다.
     캐럿은 CSS `::after` 라 textContent 를 바꿔도 살아남는다.
     prefers-reduced-motion 이면 마지막 문구를 정적으로 표시한다.
     ──────────────────────────────────────────────────────────────── */
  function initPhrase(el) {
    var list = (el.getAttribute("data-phrases") || "")
      .split(",")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    if (!list.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = list[list.length - 1];
      return;
    }

    var idx = 0;
    var ch = 0;
    var deleting = false;

    function tick() {
      var word = list[idx];
      if (!deleting) {
        ch += 1;
        el.textContent = word.slice(0, ch);
        if (ch >= word.length) {
          deleting = true;
          setTimeout(tick, 1400); // 완성 후 멈춤
          return;
        }
        setTimeout(tick, 130);
      } else {
        ch -= 1;
        el.textContent = word.slice(0, ch);
        if (ch <= 0) {
          deleting = false;
          idx = (idx + 1) % list.length;
          setTimeout(tick, 400); // 다음 문구 전 멈춤
          return;
        }
        setTimeout(tick, 70);
      }
    }

    el.textContent = "";
    setTimeout(tick, 400);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("canvas.mesh-canvas").forEach(initMesh);
    document.querySelectorAll(".phrase[data-phrases]").forEach(initPhrase);
  });
})();
